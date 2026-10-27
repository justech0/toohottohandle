import mysql, { type Pool, type RowDataPacket } from "mysql2/promise";
import { dbUri, getPool } from "@/lib/db/client";
import {
  StatsCounterBuffer,
  emptyStatsBatch,
  statsBucket,
  type StatsBatch,
} from "./core";

type CountRow = RowDataPacket & { date: string; count: string | number };
type HourRow = RowDataPacket & { hour: number; count: string | number };
type ProductRow = RowDataPacket & { productId: number; name: string; views: string | number };

export interface StatsReport {
  enabled: boolean;
  opens: { today: number; last7: number; last30: number };
  topProducts: Array<{ productId: number; name: string; views: number }>;
  hourly: number[];
}

/** Sayaçları genel havuzdan bağımsız, multi-statement açık tek kullanımlık bağlantıda tek çağrıyla yazar. */
export async function writeStatsBatch(batch: StatsBatch, databaseUrl = process.env.DATABASE_URL): Promise<void> {
  if (!databaseUrl || batch.total === 0) return;
  const connection = await mysql.createConnection({
    uri: dbUri(databaseUrl),
    charset: "utf8mb4",
    timezone: "Z",
    multipleStatements: true,
  });
  const statements = ["START TRANSACTION"];
  const values: Array<string | number> = [];

  if (batch.daily.length) {
    statements.push(
      `INSERT INTO stats_daily (date, menu_opens) VALUES ${batch.daily.map(() => "(?, ?)").join(", ")}
       ON DUPLICATE KEY UPDATE menu_opens = menu_opens + VALUES(menu_opens)`,
    );
    for (const row of batch.daily) values.push(row.date, row.count);
  }
  if (batch.hourly.length) {
    statements.push(
      `INSERT INTO stats_hourly (date, hour, opens) VALUES ${batch.hourly.map(() => "(?, ?, ?)").join(", ")}
       ON DUPLICATE KEY UPDATE opens = opens + VALUES(opens)`,
    );
    for (const row of batch.hourly) values.push(row.date, row.hour, row.count);
  }
  if (batch.products.length) {
    statements.push(
      `INSERT INTO stats_product (date, product_id, views) VALUES ${batch.products.map(() => "(?, ?, ?)").join(", ")}
       ON DUPLICATE KEY UPDATE views = views + VALUES(views)`,
    );
    for (const row of batch.products) values.push(row.date, row.productId, row.count);
  }
  statements.push("COMMIT");

  try {
    await connection.query(`${statements.join(";\n")};`, values);
  } finally {
    await connection.end();
  }
}

const globalStats = globalThis as typeof globalThis & { __ththStatsBuffer?: StatsCounterBuffer };

export function getStatsBuffer(): StatsCounterBuffer {
  globalStats.__ththStatsBuffer ??= new StatsCounterBuffer(
    (batch) => writeStatsBatch(batch),
    undefined,
    undefined,
    () => console.error("[stats] sayaçlar veritabanına yazılamadı"),
  );
  return globalStats.__ththStatsBuffer;
}

function moveDate(date: string, days: number): string {
  const value = new Date(`${date}T12:00:00.000Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

const inRange = (date: string, start: string, end: string) => date >= start && date <= end;

export async function readStatsReport(pool: Pool, now = new Date(), pending = emptyStatsBatch()): Promise<StatsReport> {
  const today = statsBucket(now).date;
  const start7 = moveDate(today, -6);
  const start30 = moveDate(today, -29);
  const [dailyResult, hourlyResult, productResult, settingsResult] = await Promise.all([
    pool.query<CountRow[]>(
      "SELECT DATE_FORMAT(date, '%Y-%m-%d') AS date, menu_opens AS count FROM stats_daily WHERE date BETWEEN ? AND ?",
      [start30, today],
    ),
    pool.query<HourRow[]>(
      "SELECT hour, SUM(opens) AS count FROM stats_hourly WHERE date BETWEEN ? AND ? GROUP BY hour",
      [start30, today],
    ),
    pool.query<ProductRow[]>(
      `SELECT sp.product_id AS productId, p.name AS name, SUM(sp.views) AS views
       FROM stats_product sp INNER JOIN products p ON p.id = sp.product_id
       WHERE sp.date BETWEEN ? AND ? GROUP BY sp.product_id, p.name`,
      [start30, today],
    ),
    pool.query<(RowDataPacket & { stats_enabled: number })[]>("SELECT stats_enabled FROM settings WHERE id = 1"),
  ]);

  const daily = new Map<string, number>();
  for (const row of dailyResult[0]) daily.set(row.date, Number(row.count));
  for (const row of pending.daily) {
    if (inRange(row.date, start30, today)) daily.set(row.date, (daily.get(row.date) ?? 0) + row.count);
  }

  const hourly = Array.from({ length: 24 }, () => 0);
  for (const row of hourlyResult[0]) hourly[Number(row.hour)] += Number(row.count);
  for (const row of pending.hourly) {
    if (inRange(row.date, start30, today) && row.hour >= 0 && row.hour < 24) hourly[row.hour] += row.count;
  }

  const products = new Map<number, { productId: number; name: string; views: number }>();
  for (const row of productResult[0]) products.set(Number(row.productId), { productId: Number(row.productId), name: row.name, views: Number(row.views) });
  if (pending.products.length) {
    const ids = [...new Set(pending.products.filter((row) => inRange(row.date, start30, today)).map((row) => row.productId))];
    if (ids.length) {
      const [names] = await pool.query<(RowDataPacket & { id: number; name: string })[]>(
        `SELECT id, name FROM products WHERE id IN (${ids.map(() => "?").join(",")})`,
        ids,
      );
      const nameById = new Map(names.map((row) => [Number(row.id), row.name]));
      for (const row of pending.products) {
        if (!inRange(row.date, start30, today)) continue;
        const current = products.get(row.productId);
        const name = current?.name ?? nameById.get(row.productId);
        if (name) products.set(row.productId, { productId: row.productId, name, views: (current?.views ?? 0) + row.count });
      }
    }
  }

  const total = (start: string) => [...daily].reduce((sum, [date, count]) => sum + (date >= start && date <= today ? count : 0), 0);
  return {
    enabled: Boolean(settingsResult[0][0]?.stats_enabled),
    opens: { today: daily.get(today) ?? 0, last7: total(start7), last30: total(start30) },
    topProducts: [...products.values()].sort((a, b) => b.views - a.views || a.name.localeCompare(b.name, "tr")).slice(0, 10),
    hourly,
  };
}

export async function getStatsReport(now = new Date()): Promise<StatsReport> {
  const buffer = getStatsBuffer();
  return buffer.withStableSnapshot((pending) => readStatsReport(getPool(), now, pending));
}

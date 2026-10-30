import { afterAll, beforeAll, describe, expect, it } from "vitest";
import mysql, { type Pool } from "mysql2/promise";
import { migrate, seedIfEmpty } from "@/lib/db/setup";
import { emptyStatsBatch } from "@/lib/stats/core";
import { readStatsReport, writeStatsBatch } from "@/lib/stats/server";

const url = process.env.TEST_DATABASE_URL;

describe.skipIf(!url)("istatistik (MariaDB)", () => {
  let pool: Pool;

  beforeAll(async () => {
    pool = mysql.createPool({ uri: url!, connectionLimit: 3, timezone: "Z" });
    for (const table of [
      "hero_slides", "feedbacks", "stats_product", "stats_hourly", "stats_daily", "audit_undo_secrets", "storage_objects", "product_tags", "tags", "audit_log",
      "sessions", "login_attempts", "admins", "menu_snapshots", "extra_categories", "extras", "product_variants", "products",
      "categories", "menu_groups", "settings", "schema_migrations",
    ]) await pool.query(`DROP TABLE IF EXISTS ${table}`);
    await migrate(pool);
    await seedIfEmpty(pool);
  });

  afterAll(async () => pool?.end());

  it("007_stats tablolarını oluşturur ve sayaçları tek çağrıda artırır", async () => {
    const [tables] = await pool.query("SELECT TABLE_NAME name FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME LIKE 'stats_%'") as unknown as [[{ name: string }]];
    expect(tables.map((row) => row.name).sort()).toEqual(["stats_daily", "stats_hourly", "stats_product"]);

    await writeStatsBatch({
      total: 7,
      daily: [{ date: "2026-10-27", count: 3 }],
      hourly: [{ date: "2026-10-27", hour: 11, count: 3 }],
      products: [{ date: "2026-10-27", productId: 1, count: 4 }],
    }, url!);
    await writeStatsBatch({
      total: 3,
      daily: [{ date: "2026-10-27", count: 1 }],
      hourly: [{ date: "2026-10-27", hour: 11, count: 1 }],
      products: [{ date: "2026-10-27", productId: 1, count: 1 }],
    }, url!);
    const [[daily]] = await pool.query("SELECT menu_opens FROM stats_daily WHERE date = '2026-10-27'") as unknown as [[{ menu_opens: number }]];
    const [[hourly]] = await pool.query("SELECT opens FROM stats_hourly WHERE date = '2026-10-27' AND hour = 11") as unknown as [[{ opens: number }]];
    const [[product]] = await pool.query("SELECT views FROM stats_product WHERE date = '2026-10-27' AND product_id = 1") as unknown as [[{ views: number }]];
    expect([daily.menu_opens, hourly.opens, product.views]).toEqual([4, 4, 5]);
  });

  it("bugün, 7/30 gün, ilk 10 ürün ve 24 saat raporunu üretir", async () => {
    await pool.query("INSERT INTO stats_daily (date, menu_opens) VALUES ('2026-10-26', 2), ('2026-10-01', 4)");
    await pool.query("INSERT INTO stats_hourly (date, hour, opens) VALUES ('2026-10-26', 8, 2)");
    await pool.query("INSERT INTO stats_product (date, product_id, views) VALUES ('2026-10-26', 2, 8)");
    const pending = emptyStatsBatch();
    pending.total = 3;
    pending.daily.push({ date: "2026-10-27", count: 1 });
    pending.hourly.push({ date: "2026-10-27", hour: 8, count: 1 });
    pending.products.push({ date: "2026-10-27", productId: 2, count: 1 });

    const report = await readStatsReport(pool, new Date("2026-10-27T12:00:00.000Z"), pending);
    expect(report.opens).toEqual({ today: 5, last7: 7, last30: 11 });
    expect(report.topProducts[0]).toMatchObject({ productId: 2, views: 9 });
    expect(report.hourly).toHaveLength(24);
    expect(report.hourly[8]).toBe(3);
  });
});


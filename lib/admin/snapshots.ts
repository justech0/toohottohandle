import type { Pool, PoolConnection, RowDataPacket } from "mysql2/promise";
import { refreshObjectUsage } from "@/lib/storage/images";

type Rows = RowDataPacket[];
type SnapshotData = Record<string, Record<string, unknown>[]>;

const TABLES = {
  groups: { table: "menu_groups", columns: ["id", "slug", "name_tr", "name_en", "name_ar", "color", "sort_order", "image_key", "image_focus_x", "image_focus_y"] },
  categories: { table: "categories", columns: ["id", "slug", "group_id", "name_tr", "name_en", "name_ar", "sort_order", "is_visible", "default_in_suggest", "default_temp", "image_key", "image_focus_x", "image_focus_y"] },
  products: { table: "products", columns: ["id", "slug", "category_id", "name", "name_en", "name_ar", "desc_tr", "desc_en", "desc_ar", "ingredients_tr", "ingredients_en", "ingredients_ar", "kcal", "allergens", "allergens_entered", "temp", "in_suggest", "image_key", "image_focus_x", "image_focus_y", "is_new", "is_featured", "is_visible", "sold_out_until", "sort_order", "updated_at"] },
  variants: { table: "product_variants", columns: ["id", "product_id", "label_key", "price_kurus", "sort_order"] },
  extras: { table: "extras", columns: ["id", "slug", "name_tr", "name_en", "name_ar", "price_kurus", "sort_order"] },
  extraCategories: { table: "extra_categories", columns: ["extra_id", "category_id"] },
  tags: { table: "tags", columns: ["id", "slug", "name_tr", "sort_order"] },
  productTags: { table: "product_tags", columns: ["product_id", "tag_id"] },
} as const;

const snapshotData = async (connection: PoolConnection): Promise<SnapshotData> => {
  const query = async (sql: string) => (await connection.query<Rows>(sql))[0] as Record<string, unknown>[];
  const [groups, categories, products, variants, extras, extraCategories, tags, productTags, settings] = await Promise.all([
    query("SELECT * FROM menu_groups"), query("SELECT * FROM categories"), query("SELECT * FROM products"),
    query("SELECT * FROM product_variants"), query("SELECT * FROM extras"), query("SELECT * FROM extra_categories"),
    query("SELECT * FROM tags"), query("SELECT * FROM product_tags"),
    query("SELECT id, opening_time, footer_note_tr, footer_note_en, footer_note_ar, stats_enabled, menu_updated_at FROM settings WHERE id = 1"),
  ]);
  return { groups, categories, products, variants, extras, extraCategories, tags, productTags, settings };
};

export async function takeMenuSnapshot(connection: PoolConnection, reason: string): Promise<number> {
  const safeReason = [...reason.trim()].slice(0, 120).join("") || "menü kopyası";
  const [result] = await connection.query("INSERT INTO menu_snapshots (reason, data) VALUES (?, ?)", [safeReason, JSON.stringify(await snapshotData(connection))]);
  await connection.query("DELETE FROM menu_snapshots WHERE id NOT IN (SELECT id FROM (SELECT id FROM menu_snapshots ORDER BY id DESC LIMIT 25) AS kept)");
  return (result as { insertId: number }).insertId;
}

export async function createMenuSnapshot(pool: Pool, reason: string): Promise<number> {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const id = await takeMenuSnapshot(connection, reason);
    await connection.commit();
    return id;
  } catch (error) {
    await connection.rollback().catch(() => {});
    throw error;
  } finally {
    connection.release();
  }
}

export interface MenuSnapshotListItem { id: number; at: string; reason: string }

export async function listMenuSnapshots(pool: Pool): Promise<MenuSnapshotListItem[]> {
  const [rows] = await pool.query<Rows>("SELECT id, at, reason FROM menu_snapshots ORDER BY id DESC LIMIT 25");
  return rows.map((row) => ({ id: row.id, at: new Date(row.at).toISOString(), reason: row.reason }));
}

export interface HistoryItem { id: number; at: string; summary: string; entity: string; action: string }

export async function listHistory(pool: Pool): Promise<HistoryItem[]> {
  const [rows] = await pool.query<Rows>("SELECT id, at, summary, entity, action FROM audit_log ORDER BY id DESC LIMIT 100");
  return rows.map((row) => ({ id: row.id, at: new Date(row.at).toISOString(), summary: row.summary, entity: row.entity, action: row.action }));
}

function parseSnapshot(raw: string): SnapshotData {
  const value = JSON.parse(raw) as unknown;
  if (!value || typeof value !== "object") throw new Error("Menü kopyası bozuk.");
  const data = value as SnapshotData;
  for (const key of [...Object.keys(TABLES), "settings"]) {
    if (!Array.isArray(data[key])) throw new Error("Menü kopyası bozuk.");
  }
  for (const [key, spec] of Object.entries(TABLES)) {
    for (const row of data[key]) {
      if (!row || typeof row !== "object" || spec.columns.some((column) => !Object.prototype.hasOwnProperty.call(row, column))) {
        throw new Error("Menü kopyası bozuk.");
      }
    }
  }
  if (!data.settings[0] || !["opening_time", "footer_note_tr", "footer_note_en", "footer_note_ar", "stats_enabled"].every((key) => Object.prototype.hasOwnProperty.call(data.settings[0], key))) {
    throw new Error("Menü kopyası bozuk.");
  }
  return data;
}

const dbValue = (column: string, value: unknown) => column.endsWith("_at") && typeof value === "string" ? new Date(value) : value;

async function insertRows(connection: PoolConnection, key: keyof typeof TABLES, rows: Record<string, unknown>[]): Promise<void> {
  if (!rows.length) return;
  const { table, columns } = TABLES[key];
  await connection.query(`INSERT INTO ${table} (${columns.join(", ")}) VALUES ?`, [
    rows.map((row) => columns.map((column) => dbValue(column, row[column]))),
  ]);
}

const activeImageKeys = async (connection: PoolConnection) => {
  const [rows] = await connection.query<Rows>(
    "SELECT image_key FROM products WHERE image_key IS NOT NULL UNION SELECT image_key FROM menu_groups WHERE image_key IS NOT NULL UNION SELECT image_key FROM categories WHERE image_key IS NOT NULL",
  );
  return rows.map((row) => String(row.image_key));
};

export async function restoreMenuSnapshot(pool: Pool, adminId: number, snapshotId: number): Promise<void> {
  if (!Number.isInteger(snapshotId) || snapshotId < 1) throw new Error("Menü kopyası bulunamadı.");
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [[snapshot]] = await connection.query<Rows>("SELECT id, data FROM menu_snapshots WHERE id = ? FOR UPDATE", [snapshotId]);
    if (!snapshot) throw new Error("Menü kopyası bulunamadı.");
    const data = parseSnapshot(String(snapshot.data));
    const oldImageKeys = await activeImageKeys(connection);
    const currentSnapshotId = await takeMenuSnapshot(connection, "kopyaya dönüş öncesi");

    for (const table of ["product_tags", "product_variants", "products", "extra_categories", "extras", "categories", "menu_groups", "tags"]) {
      await connection.query(`DELETE FROM ${table}`);
    }
    await insertRows(connection, "groups", data.groups);
    await insertRows(connection, "categories", data.categories);
    await insertRows(connection, "products", data.products);
    await insertRows(connection, "variants", data.variants);
    await insertRows(connection, "extras", data.extras);
    await insertRows(connection, "extraCategories", data.extraCategories);
    await insertRows(connection, "tags", data.tags);
    await insertRows(connection, "productTags", data.productTags);

    const settings = data.settings[0];
    await connection.query(
      "UPDATE settings SET opening_time = ?, footer_note_tr = ?, footer_note_en = ?, footer_note_ar = ?, stats_enabled = ?, menu_updated_at = CURRENT_TIMESTAMP(3) WHERE id = 1",
      [settings.opening_time, settings.footer_note_tr, settings.footer_note_en, settings.footer_note_ar, settings.stats_enabled],
    );
    await refreshObjectUsage(connection, [...oldImageKeys, ...await activeImageKeys(connection)]);
    await connection.query("DELETE FROM audit_undo_secrets");
    await connection.query(
      "INSERT INTO audit_log (admin_id, entity, entity_id, action, summary, before_json, after_json) VALUES (?, 'menu_snapshot', ?, 'restore', 'Menü kopyasına dönüldü', ?, ?)",
      [adminId, snapshotId, JSON.stringify({ snapshotId: currentSnapshotId }), JSON.stringify({ snapshotId })],
    );
    await connection.commit();
  } catch (error) {
    await connection.rollback().catch(() => {});
    throw error;
  } finally {
    connection.release();
  }
}

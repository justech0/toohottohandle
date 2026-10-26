import type { Pool, PoolConnection, RowDataPacket } from "mysql2/promise";
import { MIGRATIONS, type Migration } from "@/db/migrations";
import seed from "@/db/seed/menu.json";
import photos from "@/db/seed/photos.json";
import type { MenuRows } from "./rows";
import { seedRows } from "./seedRows";

/** Uygulanmamış şema adımlarını sırayla uygular. Aynı anda iki süreç çalışırsa MySQL adlı kilidi korur. */
export async function migrate(pool: Pool, list: Migration[] = MIGRATIONS): Promise<string[]> {
  const conn = await pool.getConnection();
  try {
    await conn.query("SELECT GET_LOCK('thth_migrate', 30)");
    await conn.query(
      "CREATE TABLE IF NOT EXISTS schema_migrations (id VARCHAR(64) PRIMARY KEY, applied_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",
    );
    const [done] = await conn.query<RowDataPacket[]>("SELECT id FROM schema_migrations");
    const applied = new Set(done.map((r) => r.id as string));
    const ran: string[] = [];
    for (const m of list) {
      if (applied.has(m.id)) continue;
      // MySQL'de CREATE TABLE işlem içinde geri alınamaz; adım yarıda kalırsa hata görünür ve elle düzeltilir.
      for (const sql of m.statements) await conn.query(sql);
      await conn.query("INSERT INTO schema_migrations (id) VALUES (?)", [m.id]);
      ran.push(m.id);
    }
    return ran;
  } finally {
    await conn.query("SELECT RELEASE_LOCK('thth_migrate')").catch(() => {});
    conn.release();
  }
}

async function insertAll(conn: PoolConnection, table: string, rows: object[]): Promise<void> {
  if (rows.length === 0) return;
  const cols = Object.keys(rows[0]);
  const values = rows.map((r) => cols.map((c) => (r as Record<string, unknown>)[c]));
  await conn.query(`INSERT INTO ${table} (${cols.join(", ")}) VALUES ?`, [values]);
}

/** Menü tabloları boşsa seed dosyasını tek işlemde yükler. Doluysa dokunmaz. */
export async function seedIfEmpty(pool: Pool, rows: MenuRows = seedRows(seed, photos)): Promise<boolean> {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [[{ n }]] = await conn.query<RowDataPacket[]>("SELECT COUNT(*) AS n FROM menu_groups FOR UPDATE");
    if (Number(n) > 0) {
      await conn.rollback();
      return false;
    }
    await insertAll(conn, "menu_groups", rows.groups);
    await insertAll(conn, "categories", rows.categories);
    await insertAll(conn, "products", rows.products);
    await insertAll(conn, "product_variants", rows.variants);
    await insertAll(conn, "extras", rows.extras);
    await insertAll(conn, "extra_categories", rows.extraCategories);
    if (rows.tags.length) {
      const values = rows.tags.map((tag) => [tag.id, tag.slug, tag.name_tr, tag.sort_order]);
      await conn.query("INSERT IGNORE INTO tags (id, slug, name_tr, sort_order) VALUES ?", [values]);
    }
    await insertAll(conn, "product_tags", rows.productTags);
    await insertAll(conn, "settings", rows.settings);
    await conn.commit();
    return true;
  } catch (e) {
    await conn.rollback().catch(() => {});
    throw e;
  } finally {
    conn.release();
  }
}

/** Menüyü oluşturan bütün satırlar. */
export async function readMenuRows(pool: Pool): Promise<MenuRows> {
  const q = async <T>(sql: string) => (await pool.query<RowDataPacket[]>(sql))[0] as unknown as T[];
  const [groups, categories, products, variants, extras, extraCategories, tags, productTags, settings] = await Promise.all([
    q<MenuRows["groups"][number]>("SELECT * FROM menu_groups"),
    q<MenuRows["categories"][number]>("SELECT * FROM categories"),
    q<MenuRows["products"][number]>("SELECT * FROM products"),
    q<MenuRows["variants"][number]>("SELECT * FROM product_variants"),
    q<MenuRows["extras"][number]>("SELECT * FROM extras"),
    q<MenuRows["extraCategories"][number]>("SELECT * FROM extra_categories"),
    q<MenuRows["tags"][number]>("SELECT * FROM tags"),
    q<MenuRows["productTags"][number]>("SELECT * FROM product_tags"),
    q<MenuRows["settings"][number]>("SELECT * FROM settings WHERE id = 1"),
  ]);
  return { groups, categories, products, variants, extras, extraCategories, tags, productTags, settings };
}

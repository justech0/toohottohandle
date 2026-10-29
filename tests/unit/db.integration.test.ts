import { describe, it, expect, beforeAll, afterAll } from "vitest";
import mysql, { type Pool } from "mysql2/promise";
import { migrate, readMenuRows, seedIfEmpty } from "@/lib/db/setup";
import { rowsToMenu } from "@/lib/menu/fromRows";
import { seedMenu } from "@/lib/menu/seedMenu";

/** Yalnızca TEST_DATABASE_URL verilince çalışır (sandbox'taki yerel MariaDB). Her koşuda tabloları sıfırdan kurar. */
const url = process.env.TEST_DATABASE_URL;

describe.skipIf(!url)("veritabanı (MariaDB/MySQL)", () => {
  let pool: Pool;

  beforeAll(async () => {
    pool = mysql.createPool({ uri: url!, connectionLimit: 3, timezone: "Z", multipleStatements: false });
    for (const t of ["hero_slides", "feedbacks", "stats_product", "stats_hourly", "stats_daily", "audit_undo_secrets", "storage_objects", "audit_log", "menu_snapshots", "sessions", "login_attempts", "admins", "extra_categories", "extras", "product_tags", "tags", "product_variants", "products", "categories", "menu_groups", "settings", "schema_migrations"]) {
      await pool.query(`DROP TABLE IF EXISTS ${t}`);
    }
  });
  afterAll(async () => pool?.end());

  it("applies the schema once", async () => {
    expect(await migrate(pool)).toEqual(["001_menu", "002_auth", "003_audit", "004_snapshots", "005_catalog", "006_photos", "007_stats", "008_feedback", "009_admin_revision"]);
    expect(await migrate(pool)).toEqual([]);
  });

  it("seeds an empty menu once", async () => {
    expect(await seedIfEmpty(pool)).toBe(true);
    expect(await seedIfEmpty(pool)).toBe(false);
  });

  it("reads back exactly the seed menu", async () => {
    const m = rowsToMenu(await readMenuRows(pool));
    expect(m).toEqual(seedMenu({}));
  });

  it("keeps Turkish characters and the ₺-free names intact", async () => {
    const m = rowsToMenu(await readMenuRows(pool));
    expect(m.categories.find((c) => c.slug === "sicak-kahveler")!.nameTr).toBe("Sıcak Kahveler");
  });

  it("refuses a second settings row", async () => {
    await expect(pool.query("INSERT INTO settings (id, wifi_ssid, wifi_username, wifi_password, wifi_note_tr, opening_time, footer_note_tr, menu_updated_at) VALUES (2,'a','b','c','d','08:00','e',NOW())")).rejects.toThrow();
  });

  it("creates the menu snapshot archive", async () => {
    await pool.query("INSERT INTO menu_snapshots (reason, data) VALUES ('silme öncesi', '{}')");
    const [rows] = await pool.query("SELECT reason, data FROM menu_snapshots");
    expect(rows).toEqual([{ reason: "silme öncesi", data: "{}" }]);
  });

  it("creates storage metadata and poster focus columns", async () => {
    await pool.query("INSERT INTO storage_objects (`key`, size, orphaned_at) VALUES (?, 123, NOW())", ["a".repeat(64)]);
    const [[stored]] = (await pool.query("SELECT size, orphaned_at FROM storage_objects WHERE `key` = ?", ["a".repeat(64)])) as unknown as [[{ size: number; orphaned_at: Date }]];
    expect(stored.size).toBe(123);
    const [[group]] = (await pool.query("SELECT image_key, image_focus_x, image_focus_y FROM menu_groups LIMIT 1")) as unknown as [[{ image_key: null; image_focus_x: number; image_focus_y: number }]];
    expect(group).toEqual({ image_key: null, image_focus_x: 0.5, image_focus_y: 0.5 });
  });
});

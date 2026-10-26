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
    for (const t of ["extra_categories", "extras", "product_variants", "products", "categories", "menu_groups", "settings", "schema_migrations"]) {
      await pool.query(`DROP TABLE IF EXISTS ${t}`);
    }
  });
  afterAll(async () => pool?.end());

  it("applies the schema once", async () => {
    expect(await migrate(pool)).toEqual(["001_menu"]);
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
});

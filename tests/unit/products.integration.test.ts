import { describe, it, expect, beforeAll, afterAll } from "vitest";
import mysql, { type Pool } from "mysql2/promise";
import { migrate, readMenuRows, seedIfEmpty } from "@/lib/db/setup";
import { rowsToMenu } from "@/lib/menu/fromRows";
import { adminProductList, lastChange, loadProductForm, saveProduct, undoLast } from "@/lib/admin/products";
import { parseProductInput } from "@/lib/admin/productInput";

const url = process.env.TEST_DATABASE_URL;

describe.skipIf(!url)("ürün düzenleme (MariaDB)", () => {
  let pool: Pool;
  let adminId: number;
  const id = async (slug: string) => ((await pool.query("SELECT id FROM products WHERE slug = ?", [slug])) as unknown as [[{ id: number }]])[0][0].id;
  const menuProduct = async (slug: string) => rowsToMenu(await readMenuRows(pool)).products.find((p) => p.slug === slug)!;
  const input = (o: Record<string, string>) => {
    const r = parseProductInput({ name: "Cortado", categoryId: "1", sizes: "none", price0: "170", isVisible: "on", ...o });
    if (!r.ok) throw new Error(r.error);
    return r.value;
  };

  beforeAll(async () => {
    pool = mysql.createPool({ uri: url!, connectionLimit: 3, timezone: "Z" });
    for (const t of ["audit_log", "menu_snapshots", "sessions", "login_attempts", "admins", "extra_categories", "extras", "product_variants", "products", "categories", "menu_groups", "settings", "schema_migrations"]) {
      await pool.query(`DROP TABLE IF EXISTS ${t}`);
    }
    await migrate(pool);
    await seedIfEmpty(pool);
    const [r] = await pool.query("INSERT INTO admins (email, password_hash) VALUES ('a@b.c', 'x')");
    adminId = (r as { insertId: number }).insertId;
  });
  afterAll(async () => pool?.end());

  it("lists every product with its category and prices for the admin", async () => {
    const list = await adminProductList(pool);
    expect(list.categories).toHaveLength(19);
    expect(list.products).toHaveLength(129);
    expect(list.products.find((p) => p.name === "Espresso")!.variants).toEqual([{ key: "tek", priceKurus: 11000 }, { key: "duble", priceKurus: 15000 }]);
  });

  it("loads a product into the form", async () => {
    const f = await loadProductForm(pool, await id("caramel-macchiato"));
    expect(f).toMatchObject({ name: "Caramel Macchiato", sizes: "normal-buyuk", price0: "210", price1: "230", isVisible: "on" });
  });

  it("saves name, price and text; the menu shows it; history has one line", async () => {
    const pid = await id("cortado");
    const r = await saveProduct(pool, adminId, pid, input({ name: "Cortado", price0: "180", descTr: "Espresso ve az süt" }));
    expect(r.summary).toBe("Cortado: 170 ₺ → 180 ₺");
    const p = await menuProduct("cortado");
    expect(p.variants).toEqual([{ key: null, priceKurus: 18000 }]);
    expect(p.descTr).toBe("Espresso ve az süt");
    expect(await lastChange(pool)).toMatchObject({ summary: "Cortado: 170 ₺ → 180 ₺", canUndo: true });
  });

  it("undoes only the last change, once", async () => {
    await undoLast(pool, adminId);
    const p = await menuProduct("cortado");
    expect(p.variants).toEqual([{ key: null, priceKurus: 17000 }]);
    expect(p.descTr).toBeNull();
    expect(await lastChange(pool)).toMatchObject({ canUndo: false });
    await expect(undoLast(pool, adminId)).rejects.toThrow("Geri alınacak işlem yok");
  });

  it("a newer change takes the undo button; the older one can't be undone", async () => {
    await saveProduct(pool, adminId, await id("cortado"), input({ price0: "190" }));
    await saveProduct(pool, adminId, await id("espresso"), input({ name: "Espresso", sizes: "tek-duble", price0: "120", price1: "160" }));
    await undoLast(pool, adminId);
    expect((await menuProduct("espresso")).variants).toEqual([{ key: "tek", priceKurus: 11000 }, { key: "duble", priceKurus: 15000 }]);
    expect((await menuProduct("cortado")).variants).toEqual([{ key: null, priceKurus: 19000 }]);
    await expect(undoLast(pool, adminId)).rejects.toThrow();
  });

  it("refuses an unknown category and leaves the product as it was", async () => {
    await expect(saveProduct(pool, adminId, await id("cortado"), input({ categoryId: "999" }))).rejects.toThrow("Kategori bulunamadı");
    expect((await menuProduct("cortado")).variants).toEqual([{ key: null, priceKurus: 19000 }]);
  });

  it("moves the menu's last-updated time", async () => {
    const before = rowsToMenu(await readMenuRows(pool)).settings.menuUpdatedAt;
    await saveProduct(pool, adminId, await id("cortado"), input({ price0: "200" }));
    expect(rowsToMenu(await readMenuRows(pool)).settings.menuUpdatedAt > before).toBe(true);
  });
});

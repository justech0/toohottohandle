import { describe, it, expect, beforeAll, afterAll } from "vitest";
import mysql, { type Pool } from "mysql2/promise";
import { migrate, readMenuRows, seedIfEmpty } from "@/lib/db/setup";
import { rowsToMenu } from "@/lib/menu/fromRows";
import {
  adminProductList,
  createProduct,
  deleteProduct,
  duplicateProduct,
  lastChange,
  loadProductForm,
  moveProduct,
  saveProduct,
  setProductSoldOut,
  setProductVisibility,
  undoLast,
} from "@/lib/admin/products";
import { parseProductInput } from "@/lib/admin/productInput";

const url = process.env.TEST_DATABASE_URL;

describe.skipIf(!url)("ürün düzenleme (MariaDB)", () => {
  let pool: Pool;
  let adminId: number;
  const id = async (slug: string) => ((await pool.query("SELECT id FROM products WHERE slug = ?", [slug])) as unknown as [[{ id: number }]])[0][0].id;
  const menuProduct = async (slug: string) => rowsToMenu(await readMenuRows(pool)).products.find((p) => p.slug === slug)!;
  const auditCount = async () => Number(((await pool.query("SELECT COUNT(*) AS n FROM audit_log")) as unknown as [[{ n: number }]])[0][0].n);
  const markMenuOld = () => pool.query("UPDATE settings SET menu_updated_at = '2000-01-01 00:00:00.000' WHERE id = 1");
  const expectMenuTouched = async () => {
    const [[row]] = (await pool.query("SELECT menu_updated_at FROM settings WHERE id = 1")) as unknown as [[{ menu_updated_at: Date }]];
    expect(new Date(row.menu_updated_at).getUTCFullYear()).toBeGreaterThan(2000);
  };
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

  it("sets a sold-out deadline with one audit row and undo restores availability", async () => {
    const pid = await id("cortado");
    const beforeAudit = await auditCount();
    await markMenuOld();
    await setProductSoldOut(pool, adminId, pid, "2026-10-28T05:00:00.000Z");
    expect((await adminProductList(pool)).products.find((p) => p.id === pid)?.soldOutUntil).toBe("2026-10-28T05:00:00.000Z");
    expect(await auditCount()).toBe(beforeAudit + 1);
    expect(await lastChange(pool)).toMatchObject({ summary: "Cortado: tükendi", canUndo: true });
    await expectMenuTouched();
    await undoLast(pool, adminId);
    expect((await adminProductList(pool)).products.find((p) => p.id === pid)?.soldOutUntil).toBeNull();
  });

  it("changes visibility with one audit row and undo restores it", async () => {
    const pid = await id("cortado");
    const beforeAudit = await auditCount();
    await markMenuOld();
    await setProductVisibility(pool, adminId, pid, false);
    expect((await adminProductList(pool)).products.find((p) => p.id === pid)?.isVisible).toBe(false);
    expect(await auditCount()).toBe(beforeAudit + 1);
    await expectMenuTouched();
    await undoLast(pool, adminId);
    expect((await adminProductList(pool)).products.find((p) => p.id === pid)?.isVisible).toBe(true);
  });

  it("adds a product with variants and undo removes it", async () => {
    const beforeAudit = await auditCount();
    await markMenuOld();
    const created = await createProduct(pool, adminId, input({ name: "Test Kakaosu", price0: "175" }));
    const product = await menuProduct(created.slug);
    expect(product).toMatchObject({ name: "Test Kakaosu", variants: [{ key: null, priceKurus: 17500 }] });
    expect(await auditCount()).toBe(beforeAudit + 1);
    await expectMenuTouched();
    await undoLast(pool, adminId);
    expect(rowsToMenu(await readMenuRows(pool)).products.some((p) => p.slug === created.slug)).toBe(false);
  });

  it("duplicates the full product with Kopya suffix and the same image key; undo removes the copy", async () => {
    const sourceId = await id("espresso");
    await pool.query("UPDATE products SET image_key = 'shared-test-photo' WHERE id = ?", [sourceId]);
    const [beforeOrder] = (await pool.query("SELECT id, sort_order FROM products WHERE category_id = 1 ORDER BY sort_order, id")) as unknown as [[{ id: number; sort_order: number }]];
    const beforeAudit = await auditCount();
    const copy = await duplicateProduct(pool, adminId, sourceId);
    const [[row]] = (await pool.query("SELECT name, image_key FROM products WHERE id = ?", [copy.id])) as unknown as [[{ name: string; image_key: string }]];
    const [variants] = (await pool.query("SELECT label_key, price_kurus FROM product_variants WHERE product_id = ? ORDER BY sort_order", [copy.id])) as unknown as [[{ label_key: string; price_kurus: number }]];
    expect(row).toEqual({ name: "Espresso Kopya", image_key: "shared-test-photo" });
    expect(variants).toEqual([{ label_key: "tek", price_kurus: 11000 }, { label_key: "duble", price_kurus: 15000 }]);
    expect(await auditCount()).toBe(beforeAudit + 1);
    await undoLast(pool, adminId);
    expect(((await pool.query("SELECT id FROM products WHERE id = ?", [copy.id])) as unknown as [unknown[]])[0]).toHaveLength(0);
    const [restoredOrder] = (await pool.query("SELECT id, sort_order FROM products WHERE category_id = 1 ORDER BY sort_order, id")) as unknown as [[{ id: number; sort_order: number }]];
    expect(restoredOrder).toEqual(beforeOrder);
  });

  it("keeps the Kopya suffix when a maximum-length product name is duplicated", async () => {
    const created = await createProduct(pool, adminId, input({ name: "A".repeat(160), price0: "175" }));
    const copy = await duplicateProduct(pool, adminId, created.id);
    const [[row]] = (await pool.query("SELECT name FROM products WHERE id = ?", [copy.id])) as unknown as [[{ name: string }]];
    expect(row.name).toHaveLength(160);
    expect(row.name.endsWith(" Kopya")).toBe(true);
  });

  it("deletes after a complete menu snapshot, keeps 25 snapshots, and undo restores variants", async () => {
    const pid = await id("espresso");
    const beforeAudit = await auditCount();
    for (let n = 0; n < 30; n++) await pool.query("INSERT INTO menu_snapshots (reason, data) VALUES (?, '{}')", [`eski ${n}`]);
    await markMenuOld();
    await deleteProduct(pool, adminId, pid);
    expect(((await pool.query("SELECT id FROM products WHERE id = ?", [pid])) as unknown as [unknown[]])[0]).toHaveLength(0);
    expect(await auditCount()).toBe(beforeAudit + 1);
    const [[snapshotCount]] = (await pool.query("SELECT COUNT(*) AS n FROM menu_snapshots")) as unknown as [[{ n: number }]];
    expect(Number(snapshotCount.n)).toBe(25);
    const [[latest]] = (await pool.query("SELECT reason, data FROM menu_snapshots ORDER BY id DESC LIMIT 1")) as unknown as [[{ reason: string; data: string }]];
    expect(latest.reason).toBe("Espresso silme öncesi");
    expect((JSON.parse(latest.data).products as { id: number }[]).some((p) => p.id === pid)).toBe(true);
    await expectMenuTouched();
    await undoLast(pool, adminId);
    expect((await menuProduct("espresso")).variants).toEqual([{ key: "tek", priceKurus: 11000 }, { key: "duble", priceKurus: 15000 }]);
  });

  it("deletes a maximum-length product while keeping the snapshot reason within its column", async () => {
    const created = await createProduct(pool, adminId, input({ name: "B".repeat(160), price0: "175" }));
    await deleteProduct(pool, adminId, created.id);
    const [[latest]] = (await pool.query("SELECT reason FROM menu_snapshots ORDER BY id DESC LIMIT 1")) as unknown as [[{ reason: string }]];
    expect(latest.reason.length).toBeLessThanOrEqual(120);
    expect(latest.reason.endsWith(" silme öncesi")).toBe(true);
  });

  it("moves only inside the category with one audit row and undo restores the order", async () => {
    const [pair] = (await pool.query("SELECT id, category_id, sort_order FROM products WHERE category_id = 1 ORDER BY sort_order, id LIMIT 2")) as unknown as [[{ id: number; category_id: number; sort_order: number }, { id: number; category_id: number; sort_order: number }]];
    const [first, second] = pair;
    const beforeAudit = await auditCount();
    await moveProduct(pool, adminId, first.id, "down");
    const [after] = (await pool.query("SELECT id FROM products WHERE category_id = ? ORDER BY sort_order, id LIMIT 2", [first.category_id])) as unknown as [[{ id: number }, { id: number }]];
    expect(after.map((p) => p.id)).toEqual([second.id, first.id]);
    expect(await auditCount()).toBe(beforeAudit + 1);
    await undoLast(pool, adminId);
    const [restored] = (await pool.query("SELECT id FROM products WHERE category_id = ? ORDER BY sort_order, id LIMIT 2", [first.category_id])) as unknown as [[{ id: number }, { id: number }]];
    expect(restored.map((p) => p.id)).toEqual([first.id, second.id]);
  });
});

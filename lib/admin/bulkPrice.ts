import type { Pool, PoolConnection, RowDataPacket } from "mysql2/promise";
import type { VariantKey } from "@/lib/menu/types";
import { takeMenuSnapshot } from "./snapshots";

type Rows = RowDataPacket[];
export type BulkScope = "group" | "category";
export type BulkMode = "percent" | "fixed";
export type BulkRounding = "none" | "5" | "10";
export interface BulkFormInput { scope: BulkScope; scopeId: number; mode: BulkMode; amount: string; rounding: BulkRounding }
export interface BulkRule { mode: BulkMode; amount: number; rounding: 0 | 500 | 1000 }
export interface BulkSourceProduct {
  id: number; name: string;
  variants: { id: number; labelKey: VariantKey; priceKurus: number }[];
}
export interface BulkPreviewProduct {
  id: number; name: string;
  variants: { id: number; labelKey: VariantKey; oldPriceKurus: number; newPriceKurus: number }[];
}

export function calculateBulkPrice(priceKurus: number, rule: BulkRule): number {
  const changed = rule.mode === "percent"
    ? Math.round(priceKurus * (10_000 + rule.amount) / 10_000)
    : priceKurus + rule.amount;
  const rounded = rule.rounding ? Math.round(changed / rule.rounding) * rule.rounding : changed;
  if (!Number.isSafeInteger(rounded) || rounded < 100 || rounded > 1_000_000) throw new Error("Yeni fiyatlar 1 ₺ ile 10.000 ₺ arasında olmalı.");
  return rounded;
}

export function previewBulkPrices(products: BulkSourceProduct[], rule: BulkRule): BulkPreviewProduct[] {
  return products.map((product) => ({
    id: product.id,
    name: product.name,
    variants: product.variants.map((variant) => ({
      id: variant.id,
      labelKey: variant.labelKey,
      oldPriceKurus: variant.priceKurus,
      newPriceKurus: calculateBulkPrice(variant.priceKurus, rule),
    })),
  }));
}

const decimal = (raw: string) => raw.trim().replace(",", ".");

export function parseBulkInput(input: BulkFormInput): { scope: BulkScope; scopeId: number; rule: BulkRule } {
  if ((input.scope !== "group" && input.scope !== "category") || !Number.isInteger(input.scopeId) || input.scopeId < 1) throw new Error("Grup ya da kategori seç.");
  if (input.mode !== "percent" && input.mode !== "fixed") throw new Error("Değişim türünü seç.");
  if (input.rounding !== "none" && input.rounding !== "5" && input.rounding !== "10") throw new Error("Yuvarlama seçimi geçersiz.");
  const value = decimal(input.amount);
  if (!/^-?\d{1,5}(?:\.\d{1,2})?$/.test(value)) throw new Error("Geçerli bir değişim tutarı yaz.");
  const number = Number(value);
  if (number === 0) throw new Error("Değişim tutarı sıfır olamaz.");
  const amount = Math.round(number * 100);
  if (input.mode === "percent" && (amount <= -10_000 || amount > 100_000)) throw new Error("Yüzde -100 ile 1.000 arasında olmalı.");
  if (input.mode === "fixed" && Math.abs(amount) > 1_000_000) throw new Error("Sabit tutar en fazla 10.000 ₺ olabilir.");
  return {
    scope: input.scope,
    scopeId: input.scopeId,
    rule: { mode: input.mode, amount, rounding: input.rounding === "5" ? 500 : input.rounding === "10" ? 1000 : 0 },
  };
}

export async function bulkPriceOptions(pool: Pool) {
  const [groups, categories] = await Promise.all([
    pool.query<Rows>("SELECT id, name_tr FROM menu_groups ORDER BY sort_order, id").then(([rows]) => rows),
    pool.query<Rows>("SELECT c.id, c.name_tr, g.name_tr AS group_name FROM categories c JOIN menu_groups g ON g.id = c.group_id ORDER BY g.sort_order, c.sort_order, c.id").then(([rows]) => rows),
  ]);
  return {
    groups: groups.map((row) => ({ id: row.id, name: String(row.name_tr) })),
    categories: categories.map((row) => ({ id: row.id, name: String(row.name_tr), groupName: String(row.group_name) })),
  };
}

async function sourceProducts(db: Pool | PoolConnection, scope: BulkScope, scopeId: number, lock = false): Promise<BulkSourceProduct[]> {
  const where = scope === "group" ? "g.id = ?" : "c.id = ?";
  const [rows] = await db.query<Rows>(
    `SELECT p.id, p.name, v.id AS variant_id, v.label_key, v.price_kurus
     FROM products p JOIN categories c ON c.id = p.category_id JOIN menu_groups g ON g.id = c.group_id
     JOIN product_variants v ON v.product_id = p.id WHERE ${where}
     ORDER BY g.sort_order, c.sort_order, p.sort_order, p.id, v.sort_order, v.id${lock ? " FOR UPDATE" : ""}`,
    [scopeId],
  );
  const products = new Map<number, BulkSourceProduct>();
  for (const row of rows) {
    const product: BulkSourceProduct = products.get(row.id) ?? { id: row.id, name: String(row.name), variants: [] };
    product.variants.push({ id: row.variant_id, labelKey: row.label_key as VariantKey, priceKurus: row.price_kurus });
    products.set(row.id, product);
  }
  return [...products.values()];
}

const expectedOf = (items: BulkPreviewProduct[]) => JSON.stringify(items.flatMap((item) => item.variants.map((variant) => ({ id: variant.id, old: variant.oldPriceKurus, next: variant.newPriceKurus }))));

export async function previewBulkPrice(pool: Pool, input: BulkFormInput): Promise<{ items: BulkPreviewProduct[]; expected: string }> {
  const parsed = parseBulkInput(input);
  const items = previewBulkPrices(await sourceProducts(pool, parsed.scope, parsed.scopeId), parsed.rule);
  if (!items.length) throw new Error("Bu seçimde ürün bulunamadı.");
  if (!items.some((item) => item.variants.some((variant) => variant.oldPriceKurus !== variant.newPriceKurus))) throw new Error("Bu ayarlarla fiyat değişikliği oluşmadı.");
  return { items, expected: expectedOf(items) };
}

export async function applyBulkPrice(pool: Pool, adminId: number, input: BulkFormInput, expected: string): Promise<number> {
  const parsed = parseBulkInput(input);
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const items = previewBulkPrices(await sourceProducts(connection, parsed.scope, parsed.scopeId, true), parsed.rule);
    if (!items.length) throw new Error("Bu seçimde ürün bulunamadı.");
    if (expectedOf(items) !== expected) throw new Error("Fiyatlar değişti. Yeniden önizle.");
    const changes = items.flatMap((item) => item.variants.filter((variant) => variant.oldPriceKurus !== variant.newPriceKurus).map((variant) => ({
      productId: item.id, productName: item.name, variantId: variant.id, labelKey: variant.labelKey,
      oldPriceKurus: variant.oldPriceKurus, newPriceKurus: variant.newPriceKurus,
    })));
    if (!changes.length) throw new Error("Bu ayarlarla fiyat değişikliği oluşmadı.");
    await takeMenuSnapshot(connection, "toplu fiyat öncesi");
    for (const change of changes) await connection.query("UPDATE product_variants SET price_kurus = ? WHERE id = ? AND product_id = ?", [change.newPriceKurus, change.variantId, change.productId]);
    const before = changes.map(({ oldPriceKurus, newPriceKurus: _new, ...change }) => ({ ...change, priceKurus: oldPriceKurus }));
    const after = changes.map(({ oldPriceKurus: _old, newPriceKurus, ...change }) => ({ ...change, priceKurus: newPriceKurus }));
    await connection.query("DELETE FROM audit_undo_secrets");
    await connection.query(
      "INSERT INTO audit_log (admin_id, entity, action, summary, before_json, after_json) VALUES (?, 'bulk_price', 'update', ?, ?, ?)",
      [adminId, `${items.length} ürünün fiyatı toplu güncellendi`, JSON.stringify(before), JSON.stringify(after)],
    );
    await connection.query("UPDATE settings SET menu_updated_at = CURRENT_TIMESTAMP(3) WHERE id = 1");
    await connection.commit();
    return items.length;
  } catch (error) {
    await connection.rollback().catch(() => {});
    throw error;
  } finally {
    connection.release();
  }
}

export async function undoBulkPrice(connection: PoolConnection, row: RowDataPacket): Promise<void> {
  const before = JSON.parse(String(row.before_json)) as unknown;
  if (!Array.isArray(before) || !before.length) throw new Error("Toplu fiyat geçmişi bozuk.");
  for (const item of before) {
    if (!item || !Number.isInteger(item.productId) || !Number.isInteger(item.variantId) || !Number.isInteger(item.priceKurus)) throw new Error("Toplu fiyat geçmişi bozuk.");
    const [result] = await connection.query("UPDATE product_variants SET price_kurus = ? WHERE id = ? AND product_id = ?", [item.priceKurus, item.variantId, item.productId]);
    if ((result as { affectedRows: number }).affectedRows !== 1) throw new Error("Toplu fiyat geri alınamadı.");
  }
}

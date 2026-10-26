import type { Pool, PoolConnection, RowDataPacket } from "mysql2/promise";
import { formatPrice } from "@/lib/format/price";
import type { MenuVariant, VariantKey } from "@/lib/menu/types";
import type { ProductRow, VariantRow } from "@/lib/db/rows";
import { priceChanges, sizeSetOf, type ProductInput } from "./productInput";

/** Ürünün geçmişe yazılan tam hali: satır + boylar (spec 4.4: geri alınan ürün eksik dönmez). */
interface ProductSnapshot { product: Omit<ProductRow, "sold_out_until"> & { sold_out_until: string | null }; variants: Omit<VariantRow, "id">[] }

export interface AdminProduct { id: number; name: string; categoryId: number; isVisible: boolean; soldOutUntil: string | null; variants: MenuVariant[] }
export interface AdminCategory { id: number; name: string; groupName: string }

type Rows = RowDataPacket[];

export async function adminProductList(pool: Pool): Promise<{ categories: AdminCategory[]; products: AdminProduct[] }> {
  const [cats] = await pool.query<Rows>(
    "SELECT c.id, c.name_tr, g.name_tr AS group_name FROM categories c JOIN menu_groups g ON g.id = c.group_id ORDER BY g.sort_order, c.sort_order, c.id",
  );
  const [prods] = await pool.query<Rows>("SELECT id, name, category_id, is_visible, sold_out_until FROM products ORDER BY sort_order, id");
  const [vars] = await pool.query<Rows>("SELECT product_id, label_key, price_kurus FROM product_variants ORDER BY sort_order, id");
  const byProduct = new Map<number, MenuVariant[]>();
  for (const v of vars) byProduct.set(v.product_id, [...(byProduct.get(v.product_id) ?? []), { key: v.label_key as VariantKey, priceKurus: v.price_kurus }]);
  return {
    categories: cats.map((c) => ({ id: c.id, name: c.name_tr, groupName: c.group_name })),
    products: prods.map((p) => ({
      id: p.id, name: p.name, categoryId: p.category_id, isVisible: Boolean(p.is_visible),
      soldOutUntil: p.sold_out_until ? new Date(p.sold_out_until).toISOString() : null, variants: byProduct.get(p.id) ?? [],
    })),
  };
}

const lira = (k: number) => formatPrice(k).replace(" ₺", "");

/** Formun ilk değerleri (string olarak, form alan adlarıyla). */
export async function loadProductForm(pool: Pool, id: number): Promise<Record<string, string> | null> {
  const snap = await snapshot(pool, id);
  if (!snap) return null;
  const p = snap.product;
  const tri = (v: number | null) => (v === null ? "" : v ? "yes" : "no");
  const vs = snap.variants;
  return {
    id: String(p.id), name: p.name, categoryId: String(p.category_id), descTr: p.desc_tr ?? "", ingredientsTr: p.ingredients_tr ?? "",
    temp: p.temp ?? "", inSuggest: tri(p.in_suggest), isNew: p.is_new ? "on" : "", isFeatured: p.is_featured ? "on" : "", isVisible: p.is_visible ? "on" : "",
    sizes: sizeSetOf(vs.map((v) => ({ key: v.label_key }))), price0: vs[0] ? lira(vs[0].price_kurus) : "", price1: vs[1] ? lira(vs[1].price_kurus) : "",
  };
}

async function snapshot(db: Pool | PoolConnection, id: number, lock = false): Promise<ProductSnapshot | null> {
  const [[p]] = await db.query<Rows>(`SELECT * FROM products WHERE id = ?${lock ? " FOR UPDATE" : ""}`, [id]);
  if (!p) return null;
  const [vs] = await db.query<Rows>("SELECT product_id, label_key, price_kurus, sort_order FROM product_variants WHERE product_id = ? ORDER BY sort_order, id", [id]);
  const { updated_at: _u, ...rest } = p;
  return {
    product: { ...(rest as ProductRow), sold_out_until: p.sold_out_until ? new Date(p.sold_out_until).toISOString() : null },
    variants: vs as Omit<VariantRow, "id">[],
  };
}

async function writeProduct(conn: PoolConnection, id: number, cols: Record<string, unknown>, variants: Omit<VariantRow, "id" | "product_id">[]): Promise<void> {
  const keys = Object.keys(cols);
  await conn.query(`UPDATE products SET ${keys.map((k) => `${k} = ?`).join(", ")} WHERE id = ?`, [...keys.map((k) => cols[k]), id]);
  await conn.query("DELETE FROM product_variants WHERE product_id = ?", [id]);
  await conn.query("INSERT INTO product_variants (product_id, label_key, price_kurus, sort_order) VALUES ?", [
    variants.map((v) => [id, v.label_key, v.price_kurus, v.sort_order]),
  ]);
}

async function inTx<T>(pool: Pool, fn: (c: PoolConnection) => Promise<T>): Promise<T> {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const r = await fn(conn);
    await conn.commit();
    return r;
  } catch (e) {
    await conn.rollback().catch(() => {});
    throw e;
  } finally {
    conn.release();
  }
}

const touchMenu = (c: PoolConnection) => c.query("UPDATE settings SET menu_updated_at = CURRENT_TIMESTAMP(3) WHERE id = 1");

function summarize(before: ProductSnapshot, input: ProductInput): string {
  const changes = priceChanges(
    before.variants.map((v) => ({ key: v.label_key, priceKurus: v.price_kurus })),
    input.variants,
  );
  const renamed = before.product.name !== input.name ? ` (eski adı: ${before.product.name})` : "";
  const what = changes.length ? changes.join(", ") : "düzenlendi";
  return `${input.name}${renamed}: ${what}`.slice(0, 255);
}

/** Ürünü kaydeder: tek işlemde ürün + boylar + geçmiş + menü zamanı. */
export async function saveProduct(pool: Pool, adminId: number, id: number, input: ProductInput): Promise<{ summary: string }> {
  return inTx(pool, async (c) => {
    const before = await snapshot(c, id, true);
    if (!before) throw new Error("Ürün bulunamadı.");
    const [[cat]] = await c.query<Rows>("SELECT id FROM categories WHERE id = ?", [input.categoryId]);
    if (!cat) throw new Error("Kategori bulunamadı.");
    const b = (v: boolean | null) => (v === null ? null : v ? 1 : 0);
    await writeProduct(
      c, id,
      {
        name: input.name, category_id: input.categoryId, desc_tr: input.descTr, ingredients_tr: input.ingredientsTr, temp: input.temp,
        in_suggest: b(input.inSuggest), is_new: b(input.isNew), is_featured: b(input.isFeatured), is_visible: b(input.isVisible),
      },
      input.variants.map((v, i) => ({ label_key: v.key, price_kurus: v.priceKurus, sort_order: i })),
    );
    const after = await snapshot(c, id);
    const summary = summarize(before, input);
    await c.query("INSERT INTO audit_log (admin_id, entity, entity_id, action, summary, before_json, after_json) VALUES (?, 'product', ?, 'update', ?, ?, ?)", [
      adminId, id, summary, JSON.stringify(before), JSON.stringify(after),
    ]);
    await touchMenu(c);
    return { summary };
  });
}

export interface LastChange { id: number; summary: string; at: string; canUndo: boolean }

export async function lastChange(pool: Pool): Promise<LastChange | null> {
  const [[r]] = await pool.query<Rows>("SELECT id, summary, at, action, undone_by FROM audit_log ORDER BY id DESC LIMIT 1");
  if (!r) return null;
  return { id: r.id, summary: r.summary, at: new Date(r.at).toISOString(), canUndo: r.action !== "undo" && r.undone_by === null };
}

/** Yalnızca geçmişin en üstündeki işlem geri alınır (spec 4.4). Geri alma kendisi geri alınamaz. */
export async function undoLast(pool: Pool, adminId: number): Promise<{ summary: string }> {
  return inTx(pool, async (c) => {
    const [[top]] = await c.query<Rows>("SELECT * FROM audit_log ORDER BY id DESC LIMIT 1 FOR UPDATE");
    if (!top || top.action === "undo" || top.undone_by !== null) throw new Error("Geri alınacak işlem yok.");
    if (top.entity !== "product" || top.action !== "update") throw new Error("Bu işlem geri alınamıyor.");
    const before = JSON.parse(top.before_json) as ProductSnapshot;
    const { id, slug: _s, image_key: _i, image_focus_x: _x, image_focus_y: _y, sort_order: _o, ...cols } = before.product;
    await writeProduct(
      c, id,
      { ...cols, sold_out_until: cols.sold_out_until ? new Date(cols.sold_out_until) : null },
      before.variants.map(({ product_id: _p, ...v }) => v),
    );
    const summary = `Geri alındı: ${top.summary}`.slice(0, 255);
    const [res] = await c.query("INSERT INTO audit_log (admin_id, entity, entity_id, action, summary) VALUES (?, 'product', ?, 'undo', ?)", [adminId, id, summary]);
    await c.query("UPDATE audit_log SET undone_by = ? WHERE id = ?", [(res as { insertId: number }).insertId, top.id]);
    await touchMenu(c);
    return { summary };
  });
}

import type { Pool, PoolConnection, RowDataPacket } from "mysql2/promise";
import { formatPrice } from "@/lib/format/price";
import type { MenuVariant, VariantKey } from "@/lib/menu/types";
import type { ProductRow, VariantRow } from "@/lib/db/rows";
import { normalizeForSearch } from "@/lib/text/normalize";
import { IMAGE_KEY, refreshObjectUsage } from "@/lib/storage/images";
import { priceChanges, sizeSetOf, type ProductInput } from "./productInput";
import { undoCatalogChange } from "./catalog";
import { undoPosterPhoto } from "./photos";

/** Ürünün geçmişe yazılan tam hali: satır + boylar (spec 4.4: geri alınan ürün eksik dönmez). */
interface ProductSnapshot {
  product: Omit<ProductRow, "sold_out_until"> & { sold_out_until: string | null };
  variants: Omit<VariantRow, "id">[];
  tagIds: number[];
}
interface OrderSnapshot { products: { id: number; sortOrder: number }[] }

export interface AdminProduct { id: number; name: string; categoryId: number; isVisible: boolean; soldOutUntil: string | null; variants: MenuVariant[] }
export interface AdminCategory { id: number; name: string; groupName: string }
export interface AdminTag { id: number; name: string }

type Rows = RowDataPacket[];

export async function adminProductList(pool: Pool): Promise<{ categories: AdminCategory[]; products: AdminProduct[]; openingTime: string }> {
  const [cats] = await pool.query<Rows>(
    "SELECT c.id, c.name_tr, g.name_tr AS group_name FROM categories c JOIN menu_groups g ON g.id = c.group_id ORDER BY g.sort_order, c.sort_order, c.id",
  );
  const [prods] = await pool.query<Rows>("SELECT id, name, category_id, is_visible, sold_out_until FROM products ORDER BY sort_order, id");
  const [vars] = await pool.query<Rows>("SELECT product_id, label_key, price_kurus FROM product_variants ORDER BY sort_order, id");
  const [[settings]] = await pool.query<Rows>("SELECT opening_time FROM settings WHERE id = 1");
  const byProduct = new Map<number, MenuVariant[]>();
  for (const v of vars) byProduct.set(v.product_id, [...(byProduct.get(v.product_id) ?? []), { key: v.label_key as VariantKey, priceKurus: v.price_kurus }]);
  return {
    categories: cats.map((c) => ({ id: c.id, name: c.name_tr, groupName: c.group_name })),
    products: prods.map((p) => ({
      id: p.id, name: p.name, categoryId: p.category_id, isVisible: Boolean(p.is_visible),
      soldOutUntil: p.sold_out_until ? new Date(p.sold_out_until).toISOString() : null, variants: byProduct.get(p.id) ?? [],
    })),
    openingTime: String(settings.opening_time),
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
    imageKey: p.image_key ?? "", imageFocusX: String(p.image_focus_x), imageFocusY: String(p.image_focus_y),
    sizes: sizeSetOf(vs.map((v) => ({ key: v.label_key }))), price0: vs[0] ? lira(vs[0].price_kurus) : "", price1: vs[1] ? lira(vs[1].price_kurus) : "",
    tagIds: snap.tagIds.join(","),
  };
}

export async function adminTags(pool: Pool): Promise<AdminTag[]> {
  const [rows] = await pool.query<Rows>("SELECT id, name_tr FROM tags ORDER BY sort_order, id");
  return rows.map((row) => ({ id: row.id, name: row.name_tr }));
}

async function snapshot(db: Pool | PoolConnection, id: number, lock = false): Promise<ProductSnapshot | null> {
  const [[p]] = await db.query<Rows>(`SELECT * FROM products WHERE id = ?${lock ? " FOR UPDATE" : ""}`, [id]);
  if (!p) return null;
  const [vs] = await db.query<Rows>("SELECT product_id, label_key, price_kurus, sort_order FROM product_variants WHERE product_id = ? ORDER BY sort_order, id", [id]);
  const [tags] = await db.query<Rows>("SELECT tag_id FROM product_tags WHERE product_id = ? ORDER BY tag_id", [id]);
  const { updated_at: _u, ...rest } = p;
  return {
    product: { ...(rest as ProductRow), sold_out_until: p.sold_out_until ? new Date(p.sold_out_until).toISOString() : null },
    variants: vs as Omit<VariantRow, "id">[],
    tagIds: tags.map((row) => row.tag_id),
  };
}

async function writeProduct(
  conn: PoolConnection,
  id: number,
  cols: Record<string, unknown>,
  variants: Omit<VariantRow, "id" | "product_id">[],
  tagIds: number[],
): Promise<void> {
  const keys = Object.keys(cols);
  await conn.query(`UPDATE products SET ${keys.map((k) => `${k} = ?`).join(", ")} WHERE id = ?`, [...keys.map((k) => cols[k]), id]);
  await conn.query("DELETE FROM product_variants WHERE product_id = ?", [id]);
  await conn.query("INSERT INTO product_variants (product_id, label_key, price_kurus, sort_order) VALUES ?", [
    variants.map((v) => [id, v.label_key, v.price_kurus, v.sort_order]),
  ]);
  await conn.query("DELETE FROM product_tags WHERE product_id = ?", [id]);
  if (tagIds.length) await conn.query("INSERT INTO product_tags (product_id, tag_id) VALUES ?", [tagIds.map((tagId) => [id, tagId])]);
}

async function restoreProduct(conn: PoolConnection, value: ProductSnapshot): Promise<void> {
  const product = { ...value.product, sold_out_until: value.product.sold_out_until ? new Date(value.product.sold_out_until) : null };
  const keys = Object.keys(product);
  await conn.query(`INSERT INTO products (${keys.join(", ")}) VALUES (${keys.map(() => "?").join(", ")})`, keys.map((key) => product[key as keyof typeof product]));
  if (value.variants.length) {
    await conn.query("INSERT INTO product_variants (product_id, label_key, price_kurus, sort_order) VALUES ?", [
      value.variants.map((variant) => [product.id, variant.label_key, variant.price_kurus, variant.sort_order]),
    ]);
  }
  if (value.tagIds?.length) await conn.query("INSERT INTO product_tags (product_id, tag_id) VALUES ?", [value.tagIds.map((tagId) => [product.id, tagId])]);
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

async function audit(
  c: PoolConnection,
  adminId: number,
  entityId: number,
  action: string,
  summary: string,
  before: unknown,
  after: unknown,
): Promise<void> {
  await c.query("DELETE FROM audit_undo_secrets");
  await c.query("INSERT INTO audit_log (admin_id, entity, entity_id, action, summary, before_json, after_json) VALUES (?, 'product', ?, ?, ?, ?, ?)", [
    adminId, entityId, action, summary.slice(0, 255), before === null ? null : JSON.stringify(before), after === null ? null : JSON.stringify(after),
  ]);
}

async function validateTags(c: PoolConnection, tagIds: number[]): Promise<void> {
  if (!tagIds.length) return;
  const [tags] = await c.query<Rows>("SELECT id FROM tags WHERE id IN (?)", [tagIds]);
  if (tags.length !== tagIds.length) throw new Error("Etiket bulunamadı.");
}

const bool = (value: boolean | null) => (value === null ? null : value ? 1 : 0);

function inputColumns(input: ProductInput): Record<string, unknown> {
  return {
    name: input.name, category_id: input.categoryId, desc_tr: input.descTr, ingredients_tr: input.ingredientsTr, temp: input.temp,
    in_suggest: bool(input.inSuggest), is_new: bool(input.isNew), is_featured: bool(input.isFeatured), is_visible: bool(input.isVisible),
    image_key: input.imageKey, image_focus_x: input.imageFocusX, image_focus_y: input.imageFocusY,
  };
}

async function validateImageKey(c: PoolConnection, key: string | null): Promise<void> {
  if (!key || !IMAGE_KEY.test(key)) return;
  const [[row]] = await c.query<Rows>("SELECT `key` FROM storage_objects WHERE `key` = ?", [key]);
  if (!row) throw new Error("Fotoğraf bulunamadı. Tekrar yükle.");
}

async function uniqueSlug(c: PoolConnection, name: string): Promise<string> {
  const stem = normalizeForSearch(name).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 88) || "urun";
  const [rows] = await c.query<Rows>("SELECT slug FROM products WHERE slug = ? OR slug LIKE ?", [stem, `${stem}-%`]);
  const used = new Set(rows.map((row) => String(row.slug)));
  if (!used.has(stem)) return stem;
  for (let suffix = 2; suffix < 10000; suffix++) {
    const candidate = `${stem}-${suffix}`;
    if (!used.has(candidate)) return candidate;
  }
  throw new Error("Ürün adı için benzersiz adres oluşturulamadı.");
}

async function menuSnapshotData(c: PoolConnection): Promise<Record<string, unknown[]>> {
  const query = async (sql: string) => (await c.query<Rows>(sql))[0];
  const [groups, categories, products, variants, extras, extraCategories, tags, productTags, settings] = await Promise.all([
    query("SELECT * FROM menu_groups"), query("SELECT * FROM categories"), query("SELECT * FROM products"),
    query("SELECT * FROM product_variants"), query("SELECT * FROM extras"), query("SELECT * FROM extra_categories"),
    query("SELECT * FROM tags"), query("SELECT * FROM product_tags"),
    query("SELECT id, wifi_ssid, wifi_username, wifi_note_tr, wifi_note_en, wifi_note_ar, opening_time, footer_note_tr, footer_note_en, footer_note_ar, stats_enabled, menu_updated_at, last_backup_at FROM settings WHERE id = 1"),
  ]);
  return { groups, categories, products, variants, extras, extraCategories, tags, productTags, settings };
}

function withBoundedSuffix(value: string, suffix: string, maxLength: number): string {
  const suffixCharacters = [...suffix];
  return [...value].slice(0, maxLength - suffixCharacters.length).join("") + suffix;
}

async function snapshotMenuBeforeDelete(c: PoolConnection, productName: string): Promise<void> {
  const reason = withBoundedSuffix(productName, " silme öncesi", 120);
  await c.query("INSERT INTO menu_snapshots (reason, data) VALUES (?, ?)", [reason, JSON.stringify(await menuSnapshotData(c))]);
  await c.query("DELETE FROM menu_snapshots WHERE id NOT IN (SELECT id FROM (SELECT id FROM menu_snapshots ORDER BY id DESC LIMIT 25) AS kept)");
}

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
    await validateTags(c, input.tagIds);
    await validateImageKey(c, input.imageKey);
    await writeProduct(
      c, id,
      inputColumns(input),
      input.variants.map((v, i) => ({ label_key: v.key, price_kurus: v.priceKurus, sort_order: i })),
      input.tagIds,
    );
    const after = await snapshot(c, id);
    await refreshObjectUsage(c, [before.product.image_key, input.imageKey]);
    const summary = summarize(before, input);
    await audit(c, adminId, id, "update", summary, before, after);
    await touchMenu(c);
    return { summary };
  });
}

/** Ürünü kategori sonuna ekler. */
export async function createProduct(pool: Pool, adminId: number, input: ProductInput): Promise<{ id: number; slug: string }> {
  return inTx(pool, async (c) => {
    const [[category]] = await c.query<Rows>("SELECT id FROM categories WHERE id = ? FOR UPDATE", [input.categoryId]);
    if (!category) throw new Error("Kategori bulunamadı.");
    await validateTags(c, input.tagIds);
    await validateImageKey(c, input.imageKey);
    const slug = await uniqueSlug(c, input.name);
    const [[order]] = await c.query<Rows>("SELECT COALESCE(MAX(sort_order), -1) + 1 AS next_order FROM products WHERE category_id = ?", [input.categoryId]);
    const columns = { slug, ...inputColumns(input), sort_order: Number(order.next_order) };
    const keys = Object.keys(columns);
    const [result] = await c.query(`INSERT INTO products (${keys.join(", ")}) VALUES (${keys.map(() => "?").join(", ")})`, keys.map((key) => columns[key as keyof typeof columns]));
    const id = (result as { insertId: number }).insertId;
    await c.query("INSERT INTO product_variants (product_id, label_key, price_kurus, sort_order) VALUES ?", [
      input.variants.map((variant, index) => [id, variant.key, variant.priceKurus, index]),
    ]);
    if (input.tagIds.length) await c.query("INSERT INTO product_tags (product_id, tag_id) VALUES ?", [input.tagIds.map((tagId) => [id, tagId])]);
    const after = await snapshot(c, id);
    await refreshObjectUsage(c, [input.imageKey]);
    await audit(c, adminId, id, "create", `${input.name}: eklendi`, null, after);
    await touchMenu(c);
    return { id, slug };
  });
}

/** Ürünü tüm alanları, boyları ve fotoğraf anahtarıyla çoğaltır. */
export async function duplicateProduct(pool: Pool, adminId: number, id: number): Promise<{ id: number }> {
  return inTx(pool, async (c) => {
    const source = await snapshot(c, id, true);
    if (!source) throw new Error("Ürün bulunamadı.");
    const name = withBoundedSuffix(source.product.name, " Kopya", 160);
    const slug = await uniqueSlug(c, name);
    await c.query("UPDATE products SET sort_order = sort_order + 1 WHERE category_id = ? AND sort_order > ?", [source.product.category_id, source.product.sort_order]);
    const product = { ...source.product, id: undefined, slug, name, sort_order: source.product.sort_order + 1, sold_out_until: source.product.sold_out_until ? new Date(source.product.sold_out_until) : null };
    const keys = Object.keys(product).filter((key) => key !== "id");
    const [result] = await c.query(`INSERT INTO products (${keys.join(", ")}) VALUES (${keys.map(() => "?").join(", ")})`, keys.map((key) => product[key as keyof typeof product]));
    const copyId = (result as { insertId: number }).insertId;
    await c.query("INSERT INTO product_variants (product_id, label_key, price_kurus, sort_order) VALUES ?", [
      source.variants.map((variant) => [copyId, variant.label_key, variant.price_kurus, variant.sort_order]),
    ]);
    if (source.tagIds.length) await c.query("INSERT INTO product_tags (product_id, tag_id) VALUES ?", [source.tagIds.map((tagId) => [copyId, tagId])]);
    const after = await snapshot(c, copyId);
    await audit(c, adminId, copyId, "duplicate", `${name}: çoğaltıldı`, null, after);
    await touchMenu(c);
    return { id: copyId };
  });
}

export async function setProductSoldOut(pool: Pool, adminId: number, id: number, until: string | null): Promise<void> {
  await inTx(pool, async (c) => {
    const before = await snapshot(c, id, true);
    if (!before) throw new Error("Ürün bulunamadı.");
    const target = until === null ? null : new Date(until);
    if (target && Number.isNaN(target.getTime())) throw new Error("Tükendi süresi geçersiz.");
    await c.query("UPDATE products SET sold_out_until = ? WHERE id = ?", [target, id]);
    const after = await snapshot(c, id);
    await audit(c, adminId, id, "sold_out", `${before.product.name}: ${target ? "tükendi" : "tekrar satışta"}`, before, after);
    await touchMenu(c);
  });
}

export async function setProductVisibility(pool: Pool, adminId: number, id: number, visible: boolean): Promise<void> {
  await inTx(pool, async (c) => {
    const before = await snapshot(c, id, true);
    if (!before) throw new Error("Ürün bulunamadı.");
    await c.query("UPDATE products SET is_visible = ? WHERE id = ?", [visible ? 1 : 0, id]);
    const after = await snapshot(c, id);
    await audit(c, adminId, id, "visibility", `${before.product.name}: ${visible ? "görünür" : "gizli"}`, before, after);
    await touchMenu(c);
  });
}

export async function deleteProduct(pool: Pool, adminId: number, id: number): Promise<void> {
  await inTx(pool, async (c) => {
    const before = await snapshot(c, id, true);
    if (!before) throw new Error("Ürün bulunamadı.");
    await snapshotMenuBeforeDelete(c, before.product.name);
    await c.query("DELETE FROM products WHERE id = ?", [id]);
    await c.query("UPDATE products SET sort_order = sort_order - 1 WHERE category_id = ? AND sort_order > ?", [
      before.product.category_id,
      before.product.sort_order,
    ]);
    await audit(c, adminId, id, "delete", `${before.product.name}: silindi`, before, null);
    await refreshObjectUsage(c, [before.product.image_key]);
    await touchMenu(c);
  });
}

export async function moveProduct(pool: Pool, adminId: number, id: number, direction: "up" | "down"): Promise<void> {
  await inTx(pool, async (c) => {
    const beforeProduct = await snapshot(c, id, true);
    if (!beforeProduct) throw new Error("Ürün bulunamadı.");
    const operator = direction === "up" ? "<" : ">";
    const order = direction === "up" ? "DESC" : "ASC";
    const [[neighbor]] = await c.query<Rows>(
      `SELECT id, sort_order FROM products WHERE category_id = ? AND (sort_order ${operator} ? OR (sort_order = ? AND id ${operator} ?)) ORDER BY sort_order ${order}, id ${order} LIMIT 1 FOR UPDATE`,
      [beforeProduct.product.category_id, beforeProduct.product.sort_order, beforeProduct.product.sort_order, id],
    );
    if (!neighbor) throw new Error(direction === "up" ? "Ürün zaten ilk sırada." : "Ürün zaten son sırada.");
    const before: OrderSnapshot = { products: [{ id, sortOrder: beforeProduct.product.sort_order }, { id: neighbor.id, sortOrder: neighbor.sort_order }] };
    await c.query("UPDATE products SET sort_order = ? WHERE id = ?", [neighbor.sort_order, id]);
    await c.query("UPDATE products SET sort_order = ? WHERE id = ?", [beforeProduct.product.sort_order, neighbor.id]);
    const after: OrderSnapshot = { products: [{ id, sortOrder: neighbor.sort_order }, { id: neighbor.id, sortOrder: beforeProduct.product.sort_order }] };
    await audit(c, adminId, id, "reorder", `${beforeProduct.product.name}: ${direction === "up" ? "yukarı" : "aşağı"} taşındı`, before, after);
    await touchMenu(c);
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
    const current = top.entity === "product" && top.entity_id ? await snapshot(c, top.entity_id, true) : null;
    if (top.entity === "product") {
      if (["update", "sold_out", "visibility"].includes(top.action)) {
        const before = JSON.parse(top.before_json) as ProductSnapshot;
        const { id, ...cols } = before.product;
        await writeProduct(
          c,
          id,
          { ...cols, sold_out_until: cols.sold_out_until ? new Date(cols.sold_out_until) : null },
          before.variants.map(({ product_id: _p, ...variant }) => variant),
          before.tagIds ?? [],
        );
      } else if (top.action === "create") {
        await c.query("DELETE FROM products WHERE id = ?", [top.entity_id]);
      } else if (top.action === "duplicate") {
        const after = JSON.parse(top.after_json) as ProductSnapshot;
        await c.query("DELETE FROM products WHERE id = ?", [top.entity_id]);
        await c.query("UPDATE products SET sort_order = sort_order - 1 WHERE category_id = ? AND sort_order > ?", [after.product.category_id, after.product.sort_order]);
      } else if (top.action === "delete") {
        const before = JSON.parse(top.before_json) as ProductSnapshot;
        await c.query("UPDATE products SET sort_order = sort_order + 1 WHERE category_id = ? AND sort_order >= ?", [
          before.product.category_id,
          before.product.sort_order,
        ]);
        await restoreProduct(c, before);
      } else if (top.action === "reorder") {
        const before = JSON.parse(top.before_json) as OrderSnapshot;
        for (const product of before.products) await c.query("UPDATE products SET sort_order = ? WHERE id = ?", [product.sortOrder, product.id]);
      } else {
        throw new Error("Bu işlem geri alınamıyor.");
      }
    } else if ((top.entity === "group" || top.entity === "category") && top.action === "image") {
      await undoPosterPhoto(c, top);
    } else {
      await undoCatalogChange(c, top);
    }
    const restored = top.entity === "product" && top.entity_id ? await snapshot(c, top.entity_id) : null;
    if (top.entity === "product") await refreshObjectUsage(c, [current?.product.image_key, restored?.product.image_key]);
    const summary = `Geri alındı: ${top.summary}`.slice(0, 255);
    const [res] = await c.query("INSERT INTO audit_log (admin_id, entity, entity_id, action, summary) VALUES (?, ?, ?, 'undo', ?)", [adminId, top.entity, top.entity_id, summary]);
    await c.query("UPDATE audit_log SET undone_by = ? WHERE id = ?", [(res as { insertId: number }).insertId, top.id]);
    await touchMenu(c);
    return { summary };
  });
}

import type { Pool, PoolConnection, RowDataPacket } from "mysql2/promise";
import { normalizeForSearch } from "@/lib/text/normalize";
import { IMAGE_KEY, refreshObjectUsage } from "@/lib/storage/images";
import { takeMenuSnapshot } from "./snapshots";

type Rows = RowDataPacket[];

export interface RawImportRow {
  categoryName: string;
  productName: string;
  description: string;
  price: string;
  imageUrl: string;
  sortOrder: string;
}

export interface ValidImportRow {
  categoryName: string;
  productName: string;
  description: string;
  priceKurus: number;
  imageKey: string | null;
  sortOrder: number | null;
}

export interface BulkImportReport {
  read: number;
  inserted: number;
  skipped: string[];
  createdCategories: string[];
}

export interface BulkImportOptionGroup {
  id: number;
  name: string;
}

const MAX_KURUS = 1_000_000;

function parseCsvRecords(content: string, delimiter: string): string[][] {
  const records: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < content.length; i++) {
    const ch = content[i];
    if (inQuotes) {
      if (ch === '"') {
        if (content[i + 1] === '"') {
          cell += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cell += ch;
      }
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
    } else if (ch === delimiter) {
      row.push(cell);
      cell = "";
    } else if (ch === "\r" || ch === "\n") {
      if (ch === "\r" && content[i + 1] === "\n") i++;
      row.push(cell);
      records.push(row);
      row = [];
      cell = "";
    } else {
      cell += ch;
    }
  }

  if (cell !== "" || row.length > 0) {
    row.push(cell);
    records.push(row);
  }

  return records;
}

function isHeaderRow(cells: string[]): boolean {
  const c0 = (cells[0] ?? "").trim().toLowerCase();
  const c1 = (cells[1] ?? "").trim().toLowerCase();
  const c3 = (cells[3] ?? "").trim().toLowerCase();
  return (
    ["category_name", "category", "categories", "kategori", "kategori_adi"].includes(c0) ||
    ["product_name", "product", "products", "urun_adi", "ürün_adı", "name"].includes(c1) ||
    ["price", "fiyat"].includes(c3)
  );
}

export function parseImportFile(fileName: string, rawContent: string): RawImportRow[] {
  const cleanName = fileName.trim().toLowerCase();
  const isCsv = cleanName.endsWith(".csv");
  const isJson = cleanName.endsWith(".json");
  if (!isCsv && !isJson) {
    throw new Error("Yalnızca CSV veya JSON yükleyebilirsiniz.");
  }

  const content = rawContent.replace(/^\uFEFF/, "");

  if (isCsv) {
    const firstLine = content.split(/\r?\n/).find((line) => line.trim() !== "") ?? "";
    const delimiter = !firstLine.includes(",") && firstLine.includes(";") ? ";" : ",";
    const records = parseCsvRecords(content, delimiter).filter(
      (cells) => !(cells.length === 1 && cells[0].trim() === "") && !cells.every((c) => c.trim() === ""),
    );

    const startIndex = records.length > 0 && isHeaderRow(records[0]) ? 1 : 0;
    return records.slice(startIndex).map((cells) => ({
      categoryName: cells[0] ?? "",
      productName: cells[1] ?? "",
      description: cells[2] ?? "",
      price: cells[3] ?? "",
      imageUrl: cells[4] ?? "",
      sortOrder: cells[5] ?? "",
    }));
  }

  let decoded: unknown;
  try {
    decoded = JSON.parse(content);
  } catch {
    throw new Error("Geçersiz JSON dosyası.");
  }

  if (!Array.isArray(decoded)) {
    throw new Error("Geçersiz JSON dosyası.");
  }

  return decoded.map((item) => {
    const row = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
    return {
      categoryName: String(row.category_name ?? row.categoryName ?? row.category ?? ""),
      productName: String(row.product_name ?? row.productName ?? row.name ?? ""),
      description: String(row.description ?? row.desc_tr ?? row.descTr ?? ""),
      price: row.price === undefined || row.price === null ? "" : String(row.price),
      imageUrl: String(row.image_url ?? row.imageUrl ?? row.image_key ?? row.imageKey ?? ""),
      sortOrder: row.sort_order === undefined || row.sort_order === null ? "" : String(row.sort_order),
    };
  });
}

export function validateImportRows(rows: RawImportRow[]): {
  read: number;
  valid: ValidImportRow[];
  skipped: string[];
} {
  const valid: ValidImportRow[] = [];
  const skipped: string[] = [];

  rows.forEach((row, index) => {
    const lineNo = index + 1;
    const rawCat = String(row.categoryName ?? "").trim().replace(/\s+/g, " ");
    const rawProd = String(row.productName ?? "").trim().replace(/\s+/g, " ");
    const rawDesc = String(row.description ?? "").trim();

    if (!rawCat || !rawProd) {
      skipped.push(`Satır ${lineNo}: kategori veya ürün adı eksik.`);
      return;
    }

    const cleanPrice = String(row.price ?? "")
      .trim()
      .replace(/[\s₺TLtl]/g, "")
      .replace(",", ".");

    if (!cleanPrice || !/^-?\d+(?:\.\d{1,2})?$/.test(cleanPrice)) {
      skipped.push(`Satır ${lineNo}: fiyat sayısal değil.`);
      return;
    }

    const priceKurus = Math.round(Number(cleanPrice) * 100);
    if (!Number.isSafeInteger(priceKurus) || priceKurus < 100 || priceKurus > MAX_KURUS) {
      skipped.push(`Satır ${lineNo}: fiyat 1 ₺ ile 10.000 ₺ arasında olmalı.`);
      return;
    }

    const cleanSort = String(row.sortOrder ?? "").trim();
    let sortOrder: number | null = null;
    if (cleanSort !== "") {
      if (!/^-?\d+$/.test(cleanSort)) {
        skipped.push(`Satır ${lineNo}: sıra sayısal değil.`);
        return;
      }
      sortOrder = Math.max(0, parseInt(cleanSort, 10));
    }

    const categoryName = [...rawCat].slice(0, 120).join("");
    const productName = [...rawProd].slice(0, 160).join("");
    const description = [...rawDesc].slice(0, 1000).join("");
    const rawImg = String(row.imageUrl ?? "").trim();
    const imageKey = /^(?:[a-f0-9]{64}|(?:urun|ornek)-[a-z0-9-]+)$/.test(rawImg) ? rawImg : null;

    valid.push({
      categoryName,
      productName,
      description,
      priceKurus,
      imageKey,
      sortOrder,
    });
  });

  return {
    read: rows.length,
    valid,
    skipped,
  };
}

export async function bulkImportOptions(pool: Pool): Promise<{ groups: BulkImportOptionGroup[] }> {
  const [rows] = await pool.query<Rows>("SELECT id, name_tr FROM menu_groups ORDER BY sort_order, id");
  return {
    groups: rows.map((row) => ({ id: Number(row.id), name: String(row.name_tr) })),
  };
}

async function uniqueCategorySlug(c: PoolConnection, name: string): Promise<string> {
  const stem = normalizeForSearch(name).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48) || "kategori";
  for (let suffix = 0; suffix < 1000; suffix++) {
    const slug = suffix ? `${stem}-${suffix + 1}` : stem;
    const [[row]] = await c.query<Rows>("SELECT id FROM categories WHERE slug = ?", [slug]);
    if (!row) return slug;
  }
  throw new Error("Kategori için benzersiz kısa ad üretilemedi.");
}

async function uniqueProductSlug(c: PoolConnection, name: string): Promise<string> {
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

async function resolveGroupId(c: PoolConnection, preferredGroupId?: number): Promise<number> {
  if (preferredGroupId && Number.isInteger(preferredGroupId) && preferredGroupId > 0) {
    const [[found]] = await c.query<Rows>("SELECT id FROM menu_groups WHERE id = ?", [preferredGroupId]);
    if (found) return Number(found.id);
  }
  const [[first]] = await c.query<Rows>("SELECT id FROM menu_groups ORDER BY sort_order, id LIMIT 1");
  if (first) return Number(first.id);
  const [res] = await c.query(
    "INSERT INTO menu_groups (slug, name_tr, color, sort_order) VALUES ('genel', 'Genel', 'red', 0)",
  );
  return (res as { insertId: number }).insertId;
}

export async function importProductsFromContent(
  pool: Pool,
  adminId: number,
  input: { fileName: string; content: string; groupId?: number },
): Promise<BulkImportReport> {
  const rawRows = parseImportFile(input.fileName, input.content);
  const { read, valid, skipped } = validateImportRows(rawRows);

  if (valid.length === 0) {
    return { read, inserted: 0, skipped, createdCategories: [] };
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await takeMenuSnapshot(connection, "toplu ürün yükleme öncesi");

    const targetGroupId = await resolveGroupId(connection, input.groupId);
    const [existingCats] = await connection.query<Rows>("SELECT id, name_tr FROM categories FOR UPDATE");
    const categoryByKey = new Map<string, number>();
    for (const cat of existingCats) {
      categoryByKey.set(String(cat.name_tr).trim().toLocaleLowerCase("tr"), Number(cat.id));
    }

    const createdCategories: string[] = [];
    const createdCategoryIds: number[] = [];
    const createdProductIds: number[] = [];
    const usedImageKeys: (string | null)[] = [];

    for (const row of valid) {
      const catKey = row.categoryName.toLocaleLowerCase("tr");
      let categoryId = categoryByKey.get(catKey);

      if (!categoryId) {
        const catSlug = await uniqueCategorySlug(connection, row.categoryName);
        const [[catOrder]] = await connection.query<Rows>(
          "SELECT COALESCE(MAX(sort_order), -1) + 1 AS next_order FROM categories WHERE group_id = ?",
          [targetGroupId],
        );
        const [catRes] = await connection.query(
          "INSERT INTO categories (slug, group_id, name_tr, sort_order, is_visible, default_in_suggest, default_temp) VALUES (?, ?, ?, ?, 1, 0, NULL)",
          [catSlug, targetGroupId, row.categoryName, Number(catOrder.next_order)],
        );
        categoryId = (catRes as { insertId: number }).insertId;
        categoryByKey.set(catKey, categoryId);
        createdCategories.push(row.categoryName);
        createdCategoryIds.push(categoryId);
      }

      let imageKey = row.imageKey;
      if (imageKey && IMAGE_KEY.test(imageKey)) {
        const [[obj]] = await connection.query<Rows>("SELECT `key` FROM storage_objects WHERE `key` = ?", [imageKey]);
        if (!obj) imageKey = null;
      }

      const prodSlug = await uniqueProductSlug(connection, row.productName);
      let sortOrder = row.sortOrder;
      if (sortOrder === null) {
        const [[prodOrder]] = await connection.query<Rows>(
          "SELECT COALESCE(MAX(sort_order), -1) + 1 AS next_order FROM products WHERE category_id = ?",
          [categoryId],
        );
        sortOrder = Number(prodOrder.next_order);
      }

      const [prodRes] = await connection.query(
        "INSERT INTO products (slug, category_id, name, desc_tr, image_key, is_visible, sort_order) VALUES (?, ?, ?, ?, ?, 1, ?)",
        [prodSlug, categoryId, row.productName, row.description || null, imageKey, sortOrder],
      );
      const productId = (prodRes as { insertId: number }).insertId;
      await connection.query(
        "INSERT INTO product_variants (product_id, label_key, price_kurus, sort_order) VALUES (?, NULL, ?, 0)",
        [productId, row.priceKurus],
      );

      createdProductIds.push(productId);
      if (imageKey) usedImageKeys.push(imageKey);
    }

    if (usedImageKeys.length > 0) {
      await refreshObjectUsage(connection, usedImageKeys);
    }

    const summary = createdCategories.length > 0
      ? `${createdProductIds.length} ürün toplu yüklendi (${createdCategories.length} yeni kategori)`
      : `${createdProductIds.length} ürün toplu yüklendi`;

    await connection.query("DELETE FROM audit_undo_secrets");
    await connection.query(
      "INSERT INTO audit_log (admin_email, admin_id, entity, action, summary, before_json, after_json) VALUES ((SELECT email FROM admins WHERE id = ?), ?, 'bulk_import', 'create', ?, NULL, ?)",
      [
        adminId,
        adminId,
        summary.slice(0, 255),
        JSON.stringify({ productIds: createdProductIds, categoryIds: createdCategoryIds }),
      ],
    );
    await connection.query("UPDATE settings SET menu_updated_at = CURRENT_TIMESTAMP(3) WHERE id = 1");
    await connection.commit();

    return {
      read,
      inserted: createdProductIds.length,
      skipped,
      createdCategories,
    };
  } catch (error) {
    await connection.rollback().catch(() => {});
    throw error;
  } finally {
    connection.release();
  }
}

export async function undoBulkImport(connection: PoolConnection, row: RowDataPacket): Promise<void> {
  const after = JSON.parse(String(row.after_json)) as { productIds?: unknown; categoryIds?: unknown } | null;
  if (!after || !Array.isArray(after.productIds) || after.productIds.length === 0) {
    throw new Error("Toplu ürün geçmişi bozuk.");
  }
  const productIds = after.productIds.filter((id): id is number => Number.isInteger(id) && id > 0);
  if (productIds.length !== after.productIds.length) {
    throw new Error("Toplu ürün geçmişi bozuk.");
  }
  await connection.query("DELETE FROM products WHERE id IN (?)", [productIds]);

  if (Array.isArray(after.categoryIds) && after.categoryIds.length > 0) {
    const categoryIds = after.categoryIds.filter((id): id is number => Number.isInteger(id) && id > 0);
    for (const catId of categoryIds) {
      const [[hasProd]] = await connection.query<Rows>("SELECT id FROM products WHERE category_id = ? LIMIT 1", [catId]);
      if (!hasProd) {
        await connection.query("DELETE FROM categories WHERE id = ?", [catId]);
      }
    }
  }
}


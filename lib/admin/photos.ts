import type { Pool, PoolConnection, RowDataPacket } from "mysql2/promise";
import { IMAGE_KEY, refreshObjectUsage } from "@/lib/storage/images";

type Rows = RowDataPacket[];
export type PhotoTarget = "group" | "category";
export interface PosterPhoto {
  target: PhotoTarget; id: number; name: string; slug: string; imageKey: string | null; focusX: number; focusY: number;
}

const tableOf = (target: PhotoTarget) => target === "group" ? "menu_groups" : "categories";

export async function posterPhotos(pool: Pool): Promise<{ groups: PosterPhoto[]; categories: PosterPhoto[] }> {
  const [groups, categories] = await Promise.all([
    pool.query<Rows>("SELECT id, slug, name_tr, image_key, image_focus_x, image_focus_y FROM menu_groups ORDER BY sort_order, id"),
    pool.query<Rows>("SELECT id, slug, name_tr, image_key, image_focus_x, image_focus_y FROM categories ORDER BY sort_order, id"),
  ]);
  const map = (target: PhotoTarget, rows: Rows): PosterPhoto[] => rows.map((row) => ({
    target, id: row.id, name: row.name_tr, slug: row.slug, imageKey: row.image_key,
    focusX: Number(row.image_focus_x), focusY: Number(row.image_focus_y),
  }));
  return { groups: map("group", groups[0]), categories: map("category", categories[0]) };
}

export async function savePosterPhoto(
  pool: Pool,
  adminId: number,
  target: PhotoTarget,
  id: number,
  rawKey: string,
  focusX: number,
  focusY: number,
): Promise<void> {
  if (!Number.isInteger(id) || id < 1) throw new Error("Afiş bulunamadı.");
  if (![focusX, focusY].every((value) => Number.isFinite(value) && value >= 0 && value <= 1)) throw new Error("Fotoğraf odağı geçersiz.");
  if (rawKey !== "__default__" && rawKey !== "" && !IMAGE_KEY.test(rawKey)) throw new Error("Fotoğraf anahtarı geçersiz.");
  const table = tableOf(target);
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [[before]] = await conn.query<Rows>(`SELECT name_tr, image_key, image_focus_x, image_focus_y FROM ${table} WHERE id = ? FOR UPDATE`, [id]);
    if (!before) throw new Error("Afiş bulunamadı.");
    const key = rawKey === "__default__" ? null : rawKey;
    if (IMAGE_KEY.test(key ?? "")) {
      const [[stored]] = await conn.query<Rows>("SELECT `key` FROM storage_objects WHERE `key` = ?", [key]);
      if (!stored) throw new Error("Fotoğraf bulunamadı. Tekrar yükle.");
    }
    await conn.query(`UPDATE ${table} SET image_key = ?, image_focus_x = ?, image_focus_y = ? WHERE id = ?`, [key, focusX, focusY, id]);
    const after = { image_key: key, image_focus_x: focusX, image_focus_y: focusY };
    await conn.query("INSERT INTO audit_log (admin_id, entity, entity_id, action, summary, before_json, after_json) VALUES (?, ?, ?, 'image', ?, ?, ?)", [
      adminId, target, id, `${before.name_tr}: fotoğraf güncellendi`, JSON.stringify(before), JSON.stringify(after),
    ]);
    await refreshObjectUsage(conn, [before.image_key, key]);
    await conn.query("UPDATE settings SET menu_updated_at = CURRENT_TIMESTAMP(3) WHERE id = 1");
    await conn.commit();
  } catch (error) {
    await conn.rollback().catch(() => {});
    throw error;
  } finally {
    conn.release();
  }
}

export async function undoPosterPhoto(conn: PoolConnection, row: RowDataPacket): Promise<void> {
  if ((row.entity !== "group" && row.entity !== "category") || row.action !== "image") throw new Error("Bu işlem geri alınamıyor.");
  const table = tableOf(row.entity);
  const before = JSON.parse(String(row.before_json)) as { image_key: string | null; image_focus_x: number; image_focus_y: number };
  const [[current]] = await conn.query<Rows>(`SELECT image_key FROM ${table} WHERE id = ? FOR UPDATE`, [row.entity_id]);
  if (!current) throw new Error("Afiş bulunamadı.");
  await conn.query(`UPDATE ${table} SET image_key = ?, image_focus_x = ?, image_focus_y = ? WHERE id = ?`, [
    before.image_key, before.image_focus_x, before.image_focus_y, row.entity_id,
  ]);
  await refreshObjectUsage(conn, [current.image_key, before.image_key]);
}

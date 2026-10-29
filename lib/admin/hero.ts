import type { Pool, RowDataPacket } from "mysql2/promise";
import { IMAGE_KEY, refreshObjectUsage } from "@/lib/storage/images";
import { auditChange, inTransaction } from "./write";
import { imageSrc } from "@/lib/menu/image";
import type { HeroSlide } from "@/lib/brand/hero";

export interface AdminSlide extends HeroSlide { id: number; imageKey: string | null; sortOrder: number; isVisible: boolean }
export async function listSlides(pool: Pool): Promise<AdminSlide[]> {
  const [rows] = await pool.query<RowDataPacket[]>("SELECT * FROM hero_slides ORDER BY sort_order, id");
  return rows.map(row => ({ id: row.id, key: row.slide_key ?? String(row.id), title: row.title, imageKey: row.image_key, image: row.image_key ? imageSrc(row.image_key, 1280) : row.default_image, color: row.color, icon: row.icon, sortOrder: row.sort_order, isVisible: Boolean(row.is_visible), focusX: row.image_focus_x, focusY: row.image_focus_y }));
}
export async function saveSlide(pool: Pool, actor: number, id: number | null, input: { title: string; imageKey: string | null; color: string; icon: string; sortOrder: number; isVisible: boolean; focusX?: number; focusY?: number }): Promise<number> {
  const title = input.title.trim(), focusX = input.focusX ?? 0.5, focusY = input.focusY ?? 0.5;
  if (!title || title.length > 120 || !["red", "yellow", "pink", "blue", "green", "gray"].includes(input.color) || !["lips", "rabbit", "star"].includes(input.icon) || !Number.isInteger(input.sortOrder) || input.sortOrder < 0 || input.sortOrder > 10000 || ![focusX, focusY].every(n => Number.isFinite(n) && n >= 0 && n <= 1) || (input.imageKey !== null && input.imageKey !== "" && !IMAGE_KEY.test(input.imageKey))) throw new Error("Slayt bilgilerini kontrol et.");
  if (id !== null && (!Number.isSafeInteger(id) || id < 1)) throw new Error("Slayt bulunamadı.");
  return inTransaction(pool, async conn => {
    const [[before]] = id ? await conn.query<RowDataPacket[]>("SELECT * FROM hero_slides WHERE id = ? FOR UPDATE", [id]) : [[]];
    if (id && !before) throw new Error("Slayt bulunamadı.");
    const key = input.imageKey || null;
    if (key) { const [[stored]] = await conn.query<RowDataPacket[]>("SELECT `key` FROM storage_objects WHERE `key` = ?", [key]); if (!stored) throw new Error("Fotoğraf bulunamadı. Tekrar yükle."); }
    const values = [title, key, input.color, input.icon, input.sortOrder, input.isVisible ? 1 : 0, focusX, focusY];
    if (id) await conn.query("UPDATE hero_slides SET title=?, image_key=?, color=?, icon=?, sort_order=?, is_visible=?, image_focus_x=?, image_focus_y=? WHERE id=?", [...values, id]);
    else { const [result] = await conn.query("INSERT INTO hero_slides (title, image_key, color, icon, sort_order, is_visible, image_focus_x, image_focus_y) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", values); id = (result as { insertId: number }).insertId; }
    // Boş anahtar fotoğrafı kaldırır; varsayılan yalnız mevcut fotoğraf korununca kalır.
    if (input.imageKey === "") await conn.query("UPDATE hero_slides SET default_image = '' WHERE id = ?", [id]);
    await auditChange(conn, actor, "hero", id, before ? "update" : "create", `${title}: vitrin ${before ? "güncellendi" : "eklendi"}`, before ?? null, input);
    await refreshObjectUsage(conn, [before?.image_key, key]);
    await conn.query("UPDATE settings SET menu_updated_at = CURRENT_TIMESTAMP(3) WHERE id = 1");
    return id!;
  });
}
export async function deleteSlide(pool: Pool, actor: number, id: number) {
  if (!Number.isSafeInteger(id) || id < 1) throw new Error("Slayt bulunamadı.");
  return inTransaction(pool, async conn => {
    const [[before]] = await conn.query<RowDataPacket[]>("SELECT * FROM hero_slides WHERE id = ? FOR UPDATE", [id]);
    if (!before) throw new Error("Slayt bulunamadı.");
    await conn.query("DELETE FROM hero_slides WHERE id = ?", [id]);
    await auditChange(conn, actor, "hero", id, "delete", `${before.title}: vitrin silindi`, before, null);
    await refreshObjectUsage(conn, [before.image_key]);
    await conn.query("UPDATE settings SET menu_updated_at = CURRENT_TIMESTAMP(3) WHERE id = 1");
  });
}

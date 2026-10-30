import type { Pool, RowDataPacket } from "mysql2/promise";
import { auditChange, inTransaction } from "./write";

export async function saveSuggestSettings(pool: Pool, actor: number, input: { mode: string; preferPhotos: boolean; productIds: number[] }) {
  if (!["random", "selected"].includes(input.mode) || input.productIds.length > 5000 || !input.productIds.every(id => Number.isSafeInteger(id) && id > 0)) throw new Error("Öneri ayarlarını kontrol et.");
  return inTransaction(pool, async conn => {
    const [[settings]] = await conn.query<RowDataPacket[]>("SELECT suggest_mode, suggest_prefer_photos FROM settings WHERE id = 1 FOR UPDATE");
    const [products] = await conn.query<RowDataPacket[]>("SELECT id, in_suggest FROM products ORDER BY id FOR UPDATE");
    const ids = new Set(products.map(p => Number(p.id)));
    if (input.productIds.some(id => !ids.has(id))) throw new Error("Ürün bulunamadı.");
    const selected = new Set(input.productIds);
    for (const p of products) await conn.query("UPDATE products SET in_suggest = ? WHERE id = ?", [selected.has(p.id) ? 1 : 0, p.id]);
    await conn.query("UPDATE settings SET suggest_mode = ?, suggest_prefer_photos = ?, menu_updated_at = CURRENT_TIMESTAMP(3) WHERE id = 1", [input.mode, input.preferPhotos ? 1 : 0]);
    await auditChange(conn, actor, "suggestions", 1, "update", "Ne içsem ayarları güncellendi", { ...settings, products }, input);
  });
}

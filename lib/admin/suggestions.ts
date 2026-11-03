import type { Pool, RowDataPacket } from "mysql2/promise";
import { SUGGEST_WEIGHTS } from "@/lib/menu/suggest";
import { auditChange, inTransaction } from "./write";

export async function saveSuggestSettings(pool: Pool, actor: number, input: { mode: string; preferPhotos: boolean; productIds: number[]; weights?: Record<number, number> }) {
  const weights = Object.entries(input.weights ?? {}).map(([id, weight]) => [Number(id), weight] as const);
  if (!["random", "selected"].includes(input.mode) || input.productIds.length > 5000 || !input.productIds.every(id => Number.isSafeInteger(id) && id > 0)) throw new Error("Öneri ayarlarını kontrol et.");
  if (weights.length > 5000 || !weights.every(([id, weight]) => Number.isSafeInteger(id) && id > 0 && (SUGGEST_WEIGHTS as readonly number[]).includes(weight))) throw new Error("Öneri ayarlarını kontrol et.");
  return inTransaction(pool, async conn => {
    const [[settings]] = await conn.query<RowDataPacket[]>("SELECT suggest_mode, suggest_prefer_photos FROM settings WHERE id = 1 FOR UPDATE");
    const [products] = await conn.query<RowDataPacket[]>("SELECT id, in_suggest, suggest_weight FROM products ORDER BY id FOR UPDATE");
    const ids = new Set(products.map(p => Number(p.id)));
    if (input.productIds.some(id => !ids.has(id)) || weights.some(([id]) => !ids.has(id))) throw new Error("Ürün bulunamadı.");
    const selected = new Set(input.productIds);
    const weightOf = new Map(weights);
    for (const p of products) await conn.query("UPDATE products SET in_suggest = ?, suggest_weight = ? WHERE id = ?", [selected.has(p.id) ? 1 : 0, weightOf.get(p.id) ?? (input.weights ? 1 : p.suggest_weight), p.id]);
    await conn.query("UPDATE settings SET suggest_mode = ?, suggest_prefer_photos = ?, menu_updated_at = CURRENT_TIMESTAMP(3) WHERE id = 1", [input.mode, input.preferPhotos ? 1 : 0]);
    await auditChange(conn, actor, "suggestions", 1, "update", "Ne içsem ayarları güncellendi", { ...settings, products }, input);
  });
}

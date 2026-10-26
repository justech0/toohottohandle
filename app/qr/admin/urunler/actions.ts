"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { getPool } from "@/lib/db/client";
import { requireAdmin } from "@/lib/auth/session";
import { parseProductInput } from "@/lib/admin/productInput";
import { saveProduct, undoLast } from "@/lib/admin/products";

export type SaveState = { error: string | null };

const FIELDS = ["name", "categoryId", "descTr", "ingredientsTr", "temp", "inSuggest", "isNew", "isFeatured", "isVisible", "sizes", "price0", "price1"];

/** Kayıt doğrudan yayına çıkar; menü önbelleği aynı işlemde boşalır (spec 4.4, 5.2). */
export async function saveProductAction(_: SaveState, f: FormData): Promise<SaveState> {
  const admin = await requireAdmin();
  const id = Number(f.get("id"));
  if (!Number.isInteger(id) || id < 1) return { error: "Ürün bulunamadı." };
  const raw = Object.fromEntries(FIELDS.map((k) => [k, f.get(k) === null ? undefined : String(f.get(k))]));
  const parsed = parseProductInput(raw);
  if (!parsed.ok) return { error: parsed.error };
  try {
    await saveProduct(getPool(), admin.adminId, id, parsed.value);
  } catch (e) {
    return { error: (e as Error).message || "Kaydedilemedi. Tekrar dene." };
  }
  updateTag("menu");
  redirect(`/qr/admin/urunler?kaydedildi=${id}#p-${id}`);
}

export async function undoLastAction(): Promise<void> {
  const admin = await requireAdmin();
  try {
    await undoLast(getPool(), admin.adminId);
  } catch {
    // Düğme pasifken gelen istek: sessizce sayfaya dön, son durum zaten ekranda.
  }
  updateTag("menu");
  redirect("/qr/admin?geri=1");
}

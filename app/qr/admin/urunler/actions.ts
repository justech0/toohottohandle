"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import type { RowDataPacket } from "mysql2/promise";
import { getPool } from "@/lib/db/client";
import { requireAdmin } from "@/lib/auth/session";
import { parseProductInput } from "@/lib/admin/productInput";
import { soldOutOptions } from "@/lib/admin/soldOut";
import {
  createProduct,
  deleteProduct,
  duplicateProduct,
  moveProduct,
  saveProduct,
  setProductSoldOut,
  setProductVisibility,
  undoLast,
} from "@/lib/admin/products";

export type SaveState = { error: string | null };
export type OperationState = { error: string | null };

const FIELDS = [
  "name", "categoryId", "descTr", "ingredientsTr", "temp", "inSuggest", "isNew", "isFeatured", "isVisible", "sizes", "price0", "price1",
  "imageKey", "imageFocusX", "imageFocusY",
];
const USER_ERRORS = new Set([
  "Ürün bulunamadı.",
  "Kategori bulunamadı.",
  "Ürün adı için benzersiz adres oluşturulamadı.",
  "Fotoğraf bulunamadı. Tekrar yükle.",
  "Tükendi süresi geçersiz.",
  "Ürün zaten ilk sırada.",
  "Ürün zaten son sırada.",
]);

const safeError = (error: unknown, fallback: string) =>
  error instanceof Error && USER_ERRORS.has(error.message) ? error.message : fallback;

/** Kayıt doğrudan yayına çıkar; menü önbelleği aynı işlemde boşalır (spec 4.4, 5.2). */
export async function saveProductAction(_: SaveState, f: FormData): Promise<SaveState> {
  const admin = await requireAdmin();
  const rawId = String(f.get("id") ?? "");
  const id = Number(rawId);
  const creating = rawId === "";
  if (!creating && (!Number.isInteger(id) || id < 1)) return { error: "Ürün bulunamadı." };
  const raw = {
    ...Object.fromEntries(FIELDS.map((k) => [k, f.get(k) === null ? undefined : String(f.get(k))])),
    tagIds: f.getAll("tagIds").map(String).join(","),
  };
  const parsed = parseProductInput(raw);
  if (!parsed.ok) return { error: parsed.error };
  let savedId = id;
  try {
    if (creating) savedId = (await createProduct(getPool(), admin.adminId, parsed.value)).id;
    else await saveProduct(getPool(), admin.adminId, id, parsed.value);
  } catch (e) {
    return { error: safeError(e, "Kaydedilemedi. Tekrar dene.") };
  }
  updateTag("menu");
  redirect(`/qr/admin/urunler?kaydedildi=${savedId}${creating ? "&islem=eklendi" : ""}#p-${savedId}`);
}

const positiveId = (value: FormDataEntryValue | null) => {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
};

/** Satır işlemleri: kimlik doğrulama, işlem ve menü önbelleğini tek Server Action sınırında tutar. */
export async function productOperationAction(_: OperationState, f: FormData): Promise<OperationState> {
  const admin = await requireAdmin();
  const id = positiveId(f.get("id"));
  if (!id) return { error: "Ürün bulunamadı." };
  const operation = String(f.get("operation") ?? "");
  let result = "guncellendi";
  let targetId = id;
  try {
    if (operation === "visibility") {
      const visible = String(f.get("visible")) === "true";
      await setProductVisibility(getPool(), admin.adminId, id, visible);
      result = visible ? "gorunur" : "gizlendi";
    } else if (operation === "sold-out") {
      const rawUntil = String(f.get("until") ?? "");
      if (rawUntil) {
        const [settingsRows] = await getPool().query<RowDataPacket[]>("SELECT opening_time FROM settings WHERE id = 1");
        const openingTime = String(settingsRows[0].opening_time);
        const valid = soldOutOptions(new Date(), openingTime).some((option) => option.until === rawUntil);
        if (!valid) return { error: "Tükendi seçeneğinin süresi geçti. Tekrar seç." };
      }
      await setProductSoldOut(getPool(), admin.adminId, id, rawUntil || null);
      result = rawUntil ? "tukendi" : "satista";
    } else if (operation === "duplicate") {
      targetId = (await duplicateProduct(getPool(), admin.adminId, id)).id;
      result = "cogaltildi";
    } else if (operation === "delete") {
      await deleteProduct(getPool(), admin.adminId, id);
      result = "silindi";
    } else if (operation === "move") {
      const direction = String(f.get("direction"));
      if (direction !== "up" && direction !== "down") return { error: "Sıralama yönü geçersiz." };
      await moveProduct(getPool(), admin.adminId, id, direction);
      result = "siralandi";
    } else {
      return { error: "İşlem geçersiz." };
    }
  } catch (error) {
    return { error: safeError(error, "İşlem tamamlanamadı. Tekrar dene.") };
  }
  updateTag("menu");
  redirect(`/qr/admin/urunler?islem=${result}#p-${targetId}`);
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

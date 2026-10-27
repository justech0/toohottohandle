"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";
import { getPool } from "@/lib/db/client";
import { applyBulkPrice, previewBulkPrice, type BulkFormInput, type BulkPreviewProduct } from "@/lib/admin/bulkPrice";

export type PreviewState = { error: string | null; input?: BulkFormInput; items?: BulkPreviewProduct[]; expected?: string };
export type ApplyState = { error: string | null };

const inputOf = (form: FormData): BulkFormInput => ({
  scope: String(form.get("scope")) as BulkFormInput["scope"],
  scopeId: Number(form.get("scopeId")),
  mode: String(form.get("mode")) as BulkFormInput["mode"],
  amount: String(form.get("amount") ?? ""),
  rounding: String(form.get("rounding")) as BulkFormInput["rounding"],
});

const USER_ERRORS = new Set([
  "Grup ya da kategori seç.", "Değişim türünü seç.", "Yuvarlama seçimi geçersiz.", "Geçerli bir değişim tutarı yaz.",
  "Değişim tutarı sıfır olamaz.", "Yüzde -100 ile 1.000 arasında olmalı.", "Sabit tutar en fazla 10.000 ₺ olabilir.",
  "Yeni fiyatlar 1 ₺ ile 10.000 ₺ arasında olmalı.", "Bu seçimde ürün bulunamadı.", "Bu ayarlarla fiyat değişikliği oluşmadı.",
  "Fiyatlar değişti. Yeniden önizle.",
]);
const safeError = (error: unknown, fallback: string) => error instanceof Error && USER_ERRORS.has(error.message) ? error.message : fallback;

export async function previewBulkAction(_: PreviewState, form: FormData): Promise<PreviewState> {
  await requireAdmin();
  const input = inputOf(form);
  try {
    return { error: null, input, ...await previewBulkPrice(getPool(), input) };
  } catch (error) {
    return { error: safeError(error, "Önizleme hazırlanamadı. Tekrar dene."), input };
  }
}

export async function applyBulkAction(_: ApplyState, form: FormData): Promise<ApplyState> {
  const admin = await requireAdmin();
  const expected = String(form.get("expected") ?? "");
  if (!expected || expected.length > 200_000) return { error: "Yeniden önizle." };
  try {
    await applyBulkPrice(getPool(), admin.adminId, inputOf(form), expected);
  } catch (error) {
    return { error: safeError(error, "Fiyatlar uygulanamadı. Tekrar dene.") };
  }
  updateTag("menu");
  revalidatePath("/qr");
  redirect("/qr/admin?toplu=uygulandi");
}

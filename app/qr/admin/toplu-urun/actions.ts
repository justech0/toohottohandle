"use server";

import { revalidatePath, updateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth/session";
import { getPool } from "@/lib/db/client";
import { importProductsFromContent, type BulkImportReport } from "@/lib/admin/bulkImport";

export interface ImportState {
  error: string | null;
  report: BulkImportReport | null;
}

const USER_ERRORS = new Set([
  "Lütfen bir CSV veya JSON dosyası seçin.",
  "Yalnızca CSV veya JSON yükleyebilirsiniz.",
  "Geçersiz JSON dosyası.",
  "Dosya boyutu en fazla 5 MB olabilir.",
  "Kategori için benzersiz kısa ad üretilemedi.",
  "Ürün adı için benzersiz adres oluşturulamadı.",
]);

const safeError = (error: unknown, fallback: string) =>
  error instanceof Error && USER_ERRORS.has(error.message) ? error.message : fallback;

export async function importProductsAction(_: ImportState, form: FormData): Promise<ImportState> {
  const admin = await requireAdmin();
  const file = form.get("file");

  if (!(file instanceof File) || !file.name || file.size === 0) {
    return { error: "Lütfen bir CSV veya JSON dosyası seçin.", report: null };
  }

  if (file.size > 5 * 1024 * 1024) {
    return { error: "Dosya boyutu en fazla 5 MB olabilir.", report: null };
  }

  const groupId = Number(form.get("groupId"));
  try {
    const content = await file.text();
    const report = await importProductsFromContent(getPool(), admin.adminId, {
      fileName: file.name,
      content,
      groupId: Number.isInteger(groupId) && groupId > 0 ? groupId : undefined,
    });
    if (report.inserted > 0) {
      updateTag("menu");
      revalidatePath("/qr");
      revalidatePath("/qr/admin");
      revalidatePath("/qr/admin/urunler");
    }
    return { error: null, report };
  } catch (error) {
    return { error: safeError(error, "İçe aktarma yapılamadı. Dosyayı kontrol edip tekrar dene."), report: null };
  }
}


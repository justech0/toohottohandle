"use server";

import { revalidatePath, updateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth/session";
import { getPool } from "@/lib/db/client";
import { markBackupDownloaded, restoreBackup } from "@/lib/admin/backups";
import { MAX_BACKUP_JSON_BYTES } from "@/lib/admin/backupSchema";

export type BackupActionResult = { ok: boolean; error?: string };

export async function markBackupDownloadedAction(): Promise<BackupActionResult> {
  await requireAdmin();
  try {
    await markBackupDownloaded(getPool());
    return { ok: true };
  } catch {
    return { ok: false, error: "Yedek indirildi ancak tarih kaydedilemedi." };
  }
}

export async function restoreBackupAction(raw: string): Promise<BackupActionResult> {
  const admin = await requireAdmin();
  if (new TextEncoder().encode(raw).length > MAX_BACKUP_JSON_BYTES) return { ok: false, error: "Menü verisi çok büyük." };
  let value: unknown;
  try { value = JSON.parse(raw); } catch { return { ok: false, error: "menu.json okunamadı." }; }
  try {
    await restoreBackup(getPool(), admin.adminId, value);
  } catch (error) {
    const message = error instanceof Error && [
      "Yedek sürümü desteklenmiyor.", "Yedek dosyası geçersiz.", "Yedekte bir fotoğraf eksik.",
      "Yedekte WiFi bilgisi bulunamaz.", "Yedek fotoğrafları yüklenmedi.",
    ].includes(error.message) ? error.message : "Yedek geri yüklenemedi. Menü değiştirilmedi.";
    return { ok: false, error: message };
  }
  updateTag("menu");
  revalidatePath("/qr");
  revalidatePath("/qr/admin");
  return { ok: true };
}

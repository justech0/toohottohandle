import { rm, stat } from "node:fs/promises";
import path from "node:path";
import { uploadDir } from "@/lib/storage/disk";

/**
 * Şifre sıfırlama isteği: foto klasörüne (THTH_UPLOAD_DIR) "admin-sifirla" adlı boş dosya konup uygulama
 * yeniden başlatılınca sunucu kaydına sıfırlama kodu yazılır. hPanel Dosya Yöneticisi yeterlidir, SSH gerekmez.
 */
const FILE = "admin-sifirla";

export async function resetRequested(): Promise<boolean> {
  const dir = uploadDir();
  if (!dir) return false;
  return stat(path.join(dir, FILE)).then(() => true, () => false);
}

export async function clearResetRequest(): Promise<void> {
  const dir = uploadDir();
  if (dir) await rm(path.join(dir, FILE), { force: true });
}

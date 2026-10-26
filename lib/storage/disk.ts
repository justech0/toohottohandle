import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * Yüklenen fotoğraflar THTH_UPLOAD_DIR klasöründe durur (Hostinger'de deploy dışında, alan adı klasöründe).
 * İşaret dosyası klasörün ilk hazırlandığı anı tutar: deploy'dan sonra eski tarih görünüyorsa klasör kalıcıdır.
 */
const MARK = ".thth-storage";

export const uploadDir = (): string | null => process.env.THTH_UPLOAD_DIR || null;

export async function prepareStorage(): Promise<void> {
  const dir = uploadDir();
  if (!dir) return;
  await mkdir(dir, { recursive: true, mode: 0o750 });
  const mark = path.join(dir, MARK);
  try {
    await readFile(mark, "utf8");
  } catch {
    await writeFile(mark, new Date().toISOString(), { flag: "wx" }).catch(() => {});
  }
}

/** Klasörün ilk hazırlandığı zaman; klasör yoksa ya da ayarlı değilse null. */
export async function storageSince(): Promise<string | null> {
  const dir = uploadDir();
  if (!dir) return null;
  try {
    return (await readFile(path.join(dir, MARK), "utf8")).trim();
  } catch {
    return null;
  }
}

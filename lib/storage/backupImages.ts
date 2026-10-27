import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { HASH_KEY, MAX_BACKUP_IMAGE_BYTES, SOURCE_IMAGE_KEY } from "@/lib/admin/backupSchema";
import { IMAGE_WIDTHS, imagePath, readImage, sha256Key } from "./images";
import { bounded1280Webp } from "./processImage";

const publicImagePath = (key: string): string => {
  if (!/^(?:urun|ornek)-[a-z0-9-]{1,80}$/.test(key)) throw new Error("Fotoğraf anahtarı geçersiz.");
  const root = path.resolve(process.cwd(), "public", "qr", "img");
  const resolved = path.resolve(root, `${key}-1280.webp`);
  if (!resolved.startsWith(`${root}${path.sep}`)) throw new Error("Fotoğraf anahtarı geçersiz.");
  return resolved;
};

export async function readBackupSourceImage(key: string): Promise<Buffer> {
  if (!SOURCE_IMAGE_KEY.test(key)) throw new Error("Fotoğraf anahtarı geçersiz.");
  return HASH_KEY.test(key) ? readImage(key, 1280) : bounded1280Webp(await readFile(publicImagePath(key)));
}

export async function backupSourceInfo(sourceKey: string): Promise<{ key: string; sourceKey: string; size: number }> {
  if (HASH_KEY.test(sourceKey)) {
    const info = await stat(imagePath(sourceKey, 1280));
    if (info.size < 1 || info.size > MAX_BACKUP_IMAGE_BYTES) throw new Error("Yedek fotoğrafı boyutu geçersiz.");
    return { key: sourceKey, sourceKey, size: info.size };
  }
  const bytes = await readBackupSourceImage(sourceKey);
  if (bytes.length < 1 || bytes.length > MAX_BACKUP_IMAGE_BYTES) throw new Error("Yedek fotoğrafı boyutu geçersiz.");
  return { key: sha256Key(bytes), sourceKey, size: bytes.length };
}

export async function storedImageExists(key: string): Promise<boolean> {
  if (!HASH_KEY.test(key)) return false;
  try {
    await Promise.all(IMAGE_WIDTHS.map((width) => stat(imagePath(key, width))));
    return true;
  } catch {
    return false;
  }
}

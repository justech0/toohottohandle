import { strFromU8, strToU8, Unzip, Zip, ZipPassThrough } from "fflate";
import {
  MAX_BACKUP_BYTES, MAX_BACKUP_FILES, MAX_BACKUP_IMAGE_BYTES, MAX_BACKUP_JSON_BYTES,
  parseBackupFile, type BackupFile,
} from "./backupSchema";

const arrayBufferOf = (bytes: Uint8Array): ArrayBuffer => {
  const copy = new Uint8Array(bytes.length);
  copy.set(bytes);
  return copy.buffer;
};

const sha256 = async (bytes: Uint8Array): Promise<string> => {
  const digest = await crypto.subtle.digest("SHA-256", arrayBufferOf(bytes));
  return [...new Uint8Array(digest)].map((value) => value.toString(16).padStart(2, "0")).join("");
};

export async function createStoredBackupZip(
  backup: BackupFile,
  getPhoto: (key: string) => Promise<Uint8Array>,
  onProgress: (done: number, total: number) => void,
  signal?: AbortSignal,
): Promise<Blob> {
  const chunks: ArrayBuffer[] = [];
  let settle: { resolve: () => void; reject: (error: Error) => void } | null = null;
  const completed = new Promise<void>((resolve, reject) => { settle = { resolve, reject }; });
  const zip = new Zip((error, chunk, final) => {
    if (error) settle?.reject(error);
    else {
      chunks.push(arrayBufferOf(chunk));
      if (final) settle?.resolve();
    }
  });
  const add = (name: string, bytes: Uint8Array) => {
    const file = new ZipPassThrough(name);
    zip.add(file);
    file.push(bytes, true);
  };

  try {
    signal?.throwIfAborted();
    add("menu.json", strToU8(JSON.stringify(backup)));
    onProgress(0, backup.images.length);
    for (let index = 0; index < backup.images.length; index++) {
      signal?.throwIfAborted();
      const image = backup.images[index];
      const bytes = await getPhoto(image.key);
      if (bytes.length !== image.size || bytes.length > MAX_BACKUP_IMAGE_BYTES || await sha256(bytes) !== image.key) {
        throw new Error("Fotoğraf doğrulanamadı. Yedek hazırlanmadı.");
      }
      add(image.path, bytes);
      onProgress(index + 1, backup.images.length);
    }
    zip.end();
    await completed;
    signal?.throwIfAborted();
    return new Blob(chunks, { type: "application/zip" });
  } catch (error) {
    zip.terminate();
    throw error;
  }
}

type Extracted = { name: string; bytes: Uint8Array };

function extractStoredZip(input: Uint8Array): Promise<Extracted[]> {
  if (input.length < 1 || input.length > MAX_BACKUP_BYTES) return Promise.reject(new Error("ZIP en fazla 100 MB olabilir."));
  return new Promise((resolve, reject) => {
    const files: Extracted[] = [];
    const names = new Set<string>();
    let fileCount = 0;
    let pending = 0;
    let sourceFinished = false;
    let failed = false;
    const fail = (error: unknown) => {
      if (failed) return;
      failed = true;
      reject(error instanceof Error ? error : new Error("ZIP açılamadı."));
    };
    const finish = () => {
      if (!failed && sourceFinished && pending === 0) resolve(files);
    };
    const unzip = new Unzip((file) => {
      if (failed) return;
      if (++fileCount > MAX_BACKUP_FILES || names.has(file.name)) return fail(new Error("ZIP içinde izin verilmeyen dosya var."));
      pending++;
      names.add(file.name);
      const isMenu = file.name === "menu.json";
      const isPhoto = /^photos\/[a-f0-9]{64}-1280\.webp$/.test(file.name);
      if ((!isMenu && !isPhoto) || file.compression !== 0) return fail(new Error("ZIP içinde izin verilmeyen dosya var."));
      const limit = isMenu ? MAX_BACKUP_JSON_BYTES : MAX_BACKUP_IMAGE_BYTES;
      if (file.originalSize !== undefined && file.originalSize > limit) return fail(new Error(isMenu ? "Menü verisi çok büyük." : "Yedek fotoğrafı çok büyük."));
      const chunks: Uint8Array[] = [];
      let size = 0;
      file.ondata = (error, chunk, final) => {
        if (error) return fail(error);
        size += chunk.length;
        if (size > limit) return fail(new Error(isMenu ? "Menü verisi çok büyük." : "Yedek fotoğrafı çok büyük."));
        chunks.push(new Uint8Array(chunk));
        if (final) {
          const bytes = new Uint8Array(size);
          let offset = 0;
          for (const part of chunks) { bytes.set(part, offset); offset += part.length; }
          files.push({ name: file.name, bytes });
          pending--;
          finish();
        }
      };
      try { file.start(); } catch (error) { fail(error); }
    });
    try {
      unzip.push(input, true);
      sourceFinished = true;
      finish();
    } catch (error) {
      fail(error);
    }
  });
}

export async function readStoredBackupZip(input: Uint8Array): Promise<{ backup: BackupFile; photos: Map<string, Uint8Array> }> {
  const files = await extractStoredZip(input);
  const menu = files.find((file) => file.name === "menu.json");
  if (!menu) throw new Error("ZIP içinde menu.json bulunamadı.");
  let raw: unknown;
  try { raw = JSON.parse(strFromU8(menu.bytes)); } catch { throw new Error("menu.json okunamadı."); }
  const backup = parseBackupFile(raw);
  const photos = new Map<string, Uint8Array>();
  for (const file of files) {
    const match = /^photos\/([a-f0-9]{64})-1280\.webp$/.exec(file.name);
    if (match) photos.set(match[1], file.bytes);
  }
  if (photos.size !== backup.images.length) throw new Error("Yedekte bir fotoğraf eksik.");
  for (const image of backup.images) {
    const bytes = photos.get(image.key);
    if (!bytes || bytes.length !== image.size || await sha256(bytes) !== image.key) throw new Error("Yedekte bir fotoğraf bozuk.");
  }
  return { backup, photos };
}

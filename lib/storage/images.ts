import { createHash } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Pool, PoolConnection, RowDataPacket } from "mysql2/promise";
import { uploadDir } from "./disk";

export const IMAGE_KEY = /^[a-f0-9]{64}$/;
export const IMAGE_WIDTHS = [320, 720, 1280] as const;
export type ImageWidth = (typeof IMAGE_WIDTHS)[number];

export const sha256Key = (bytes: Uint8Array): string => createHash("sha256").update(bytes).digest("hex");

export function imageContentType(bytes: Uint8Array): "jpeg" | "png" | "webp" | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "jpeg";
  if (bytes.length >= 8 && Buffer.from(bytes.subarray(0, 8)).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
  if (bytes.length >= 12 && Buffer.from(bytes.subarray(0, 4)).toString("ascii") === "RIFF" && Buffer.from(bytes.subarray(8, 12)).toString("ascii") === "WEBP") return "webp";
  return null;
}

export function uploadDirectory(): string {
  const configured = uploadDir();
  if (!configured) throw new Error("Fotoğraf deposu ayarlı değil.");
  return path.resolve(configured);
}

export function imagePath(key: string, width: ImageWidth): string {
  if (!IMAGE_KEY.test(key) || !IMAGE_WIDTHS.includes(width)) throw new Error("Geçersiz fotoğraf yolu.");
  const root = uploadDirectory();
  const resolved = path.resolve(root, `${key}-${width}.webp`);
  if (!resolved.startsWith(`${root}${path.sep}`)) throw new Error("Geçersiz fotoğraf yolu.");
  return resolved;
}

export async function writeImageOnce(key: string, width: ImageWidth, bytes: Uint8Array): Promise<void> {
  await mkdir(uploadDirectory(), { recursive: true, mode: 0o750 });
  try {
    await writeFile(imagePath(key, width), bytes, { flag: "wx", mode: 0o600 });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
  }
}

export const readImage = (key: string, width: ImageWidth) => readFile(imagePath(key, width));

type OrphanRow = { key: string; orphanedAt: string | Date | null };

export function deletableObjectKeys(rows: OrphanRow[], active: Set<string>, snapshots: Set<string>, now = new Date()): string[] {
  const cutoff = now.getTime() - 30 * 24 * 60 * 60 * 1000;
  return rows
    .filter((row) => row.orphanedAt && new Date(row.orphanedAt).getTime() < cutoff && !active.has(row.key) && !snapshots.has(row.key))
    .map((row) => row.key);
}

const imageKeysIn = (value: unknown, found = new Set<string>()): Set<string> => {
  if (typeof value === "string") {
    if (IMAGE_KEY.test(value)) found.add(value);
  } else if (Array.isArray(value)) {
    for (const item of value) imageKeysIn(item, found);
  } else if (value && typeof value === "object") {
    for (const item of Object.values(value)) imageKeysIn(item, found);
  }
  return found;
};

export async function refreshObjectUsage(conn: PoolConnection, keys: Array<string | null | undefined>): Promise<void> {
  for (const key of new Set(keys.filter((value): value is string => Boolean(value && IMAGE_KEY.test(value))))) {
    const [[usage]] = await conn.query<RowDataPacket[]>(
      "SELECT (SELECT COUNT(*) FROM products WHERE image_key = ?) + (SELECT COUNT(*) FROM menu_groups WHERE image_key = ?) + (SELECT COUNT(*) FROM categories WHERE image_key = ?) AS n",
      [key, key, key],
    );
    await conn.query("UPDATE storage_objects SET orphaned_at = ? WHERE `key` = ?", [Number(usage.n) > 0 ? null : new Date(), key]);
  }
}

export async function cleanupOrphanedImages(pool: Pool, now = new Date()): Promise<number> {
  if (!uploadDir()) return 0;
  const [rows] = await pool.query<RowDataPacket[]>("SELECT `key`, orphaned_at FROM storage_objects WHERE orphaned_at IS NOT NULL");
  const [activeRows] = await pool.query<RowDataPacket[]>(
    "SELECT image_key FROM products WHERE image_key IS NOT NULL UNION SELECT image_key FROM menu_groups WHERE image_key IS NOT NULL UNION SELECT image_key FROM categories WHERE image_key IS NOT NULL",
  );
  const [snapshotRows] = await pool.query<RowDataPacket[]>("SELECT data FROM menu_snapshots ORDER BY id DESC LIMIT 25");
  const active = new Set(activeRows.map((row) => String(row.image_key)).filter((key) => IMAGE_KEY.test(key)));
  const snapshots = new Set<string>();
  for (const row of snapshotRows) {
    try { imageKeysIn(JSON.parse(String(row.data)), snapshots); } catch { /* Bozuk eski kopya temizliği durdurmaz. */ }
  }
  const keys = deletableObjectKeys(
    rows.map((row) => ({ key: String(row.key), orphanedAt: row.orphaned_at as Date | null })),
    active,
    snapshots,
    now,
  );
  let deleted = 0;
  for (const key of keys) {
    const conn = await pool.getConnection();
    let remove = false;
    try {
      await conn.beginTransaction();
      const [[object]] = await conn.query<RowDataPacket[]>("SELECT orphaned_at FROM storage_objects WHERE `key` = ? FOR UPDATE", [key]);
      if (object?.orphaned_at && new Date(object.orphaned_at).getTime() < now.getTime() - 30 * 24 * 60 * 60 * 1000) {
        const [[usage]] = await conn.query<RowDataPacket[]>(
          "SELECT (SELECT COUNT(*) FROM products WHERE image_key = ?) + (SELECT COUNT(*) FROM menu_groups WHERE image_key = ?) + (SELECT COUNT(*) FROM categories WHERE image_key = ?) AS n",
          [key, key, key],
        );
        const [latest] = await conn.query<RowDataPacket[]>("SELECT data FROM menu_snapshots ORDER BY id DESC LIMIT 25");
        const protectedBySnapshot = latest.some((row) => {
          try { return imageKeysIn(JSON.parse(String(row.data))).has(key); } catch { return false; }
        });
        if (Number(usage.n) === 0 && !protectedBySnapshot) {
          await conn.query("DELETE FROM storage_objects WHERE `key` = ?", [key]);
          remove = true;
        }
      }
      await conn.commit();
    } catch (error) {
      await conn.rollback().catch(() => {});
      throw error;
    } finally {
      conn.release();
    }
    if (remove) {
      await Promise.all(IMAGE_WIDTHS.map((width) => unlink(imagePath(key, width)).catch((error: NodeJS.ErrnoException) => {
        if (error.code !== "ENOENT") throw error;
      })));
      deleted++;
    }
  }
  return deleted;
}

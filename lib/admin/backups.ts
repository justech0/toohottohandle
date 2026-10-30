import type { Pool, RowDataPacket } from "mysql2/promise";
import { backupAge, parseBackupFile, type BackupBundle, type BackupData, type BackupFile } from "./backupSchema";
import { activeImageKeys, readMenuSnapshotData, replaceMenuData, takeMenuSnapshot, type SnapshotData } from "./snapshots";
import { backupSourceInfo, storedImageExists } from "@/lib/storage/backupImages";
import { refreshObjectUsage } from "@/lib/storage/images";

type Rows = RowDataPacket[];

const serializedData = (value: SnapshotData): BackupData => JSON.parse(JSON.stringify(value)) as BackupData;

export async function createBackupBundle(pool: Pool): Promise<BackupBundle> {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const data = serializedData(await readMenuSnapshotData(connection));
    const rows = [...data.groups, ...data.categories, ...data.products, ...(data.heroSlides ?? [])];
    const sourceKeys = [...new Set(rows.map((row) => row.image_key).filter((key): key is string => Boolean(key)))];
    const sourceInfo = await Promise.all(sourceKeys.map(backupSourceInfo));
    const replacement = new Map(sourceInfo.map((item) => [item.sourceKey, item.key]));
    for (const row of rows) if (row.image_key) row.image_key = replacement.get(row.image_key) ?? null;
    const unique = new Map(sourceInfo.map((item) => [item.key, item]));
    const images = [...unique.values()].sort((a, b) => a.key.localeCompare(b.key)).map((item) => ({
      key: item.key, path: `photos/${item.key}-1280.webp`, size: item.size,
    }));
    const sources = [...unique.values()].sort((a, b) => a.key.localeCompare(b.key)).map(({ key, sourceKey }) => ({ key, sourceKey }));
    const backup = parseBackupFile({ version: 1, createdAt: new Date().toISOString(), data, images });
    await connection.commit();
    return { backup, sources };
  } catch (error) {
    await connection.rollback().catch(() => {});
    throw error;
  } finally {
    connection.release();
  }
}

export async function markBackupDownloaded(pool: Pool): Promise<void> {
  await pool.query("UPDATE settings SET last_backup_at = CURRENT_TIMESTAMP(3) WHERE id = 1");
}

export async function getBackupStatus(pool: Pool, now = new Date()) {
  const [[row]] = await pool.query<Rows>("SELECT last_backup_at FROM settings WHERE id = 1");
  return backupAge(row?.last_backup_at ? new Date(row.last_backup_at) : null, now);
}

export async function restoreBackup(pool: Pool, adminId: number, raw: unknown): Promise<void> {
  const backup = parseBackupFile(raw);
  for (const image of backup.images) if (!await storedImageExists(image.key)) throw new Error("Yedek fotoğrafları yüklenmedi.");

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query("SELECT id FROM settings WHERE id = 1 FOR UPDATE");
    const oldImageKeys = await activeImageKeys(connection);
    const snapshotId = await takeMenuSnapshot(connection, "yedekten dönüş öncesi");
    if (backup.images.length) {
      const [objects] = await connection.query<Rows>("SELECT `key` FROM storage_objects WHERE `key` IN (?) FOR UPDATE", [backup.images.map((image) => image.key)]);
      if (objects.length !== backup.images.length) throw new Error("Yedek fotoğrafları yüklenmedi.");
    }
    await replaceMenuData(connection, backup.data as unknown as SnapshotData);
    await refreshObjectUsage(connection, [...oldImageKeys, ...await activeImageKeys(connection)]);
    await connection.query("DELETE FROM audit_undo_secrets");
    await connection.query(
      "INSERT INTO audit_log (admin_email, admin_id, entity, action, summary, before_json, after_json) VALUES ((SELECT email FROM admins WHERE id = ?), ?, 'backup', 'restore', 'ZIP yedeği geri yüklendi', ?, ?)",
      [adminId, adminId, JSON.stringify({ snapshotId }), JSON.stringify({ createdAt: backup.createdAt })],
    );
    await connection.commit();
  } catch (error) {
    await connection.rollback().catch(() => {});
    throw error;
  } finally {
    connection.release();
  }
}

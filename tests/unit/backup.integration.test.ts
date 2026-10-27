import { afterAll, beforeAll, describe, expect, it } from "vitest";
import mysql, { type Pool } from "mysql2/promise";
import { createBackupBundle, markBackupDownloaded, restoreBackup } from "@/lib/admin/backups";
import { migrate, seedIfEmpty } from "@/lib/db/setup";

const url = process.env.TEST_DATABASE_URL;

describe.skipIf(!url)("ZIP yedek ve geri yükleme (MariaDB)", () => {
  let pool: Pool;
  let adminId: number;

  beforeAll(async () => {
    pool = mysql.createPool({ uri: url!, connectionLimit: 3, timezone: "Z" });
    for (const table of [
      "audit_undo_secrets", "storage_objects", "product_tags", "tags", "audit_log", "sessions", "login_attempts", "admins",
      "menu_snapshots", "extra_categories", "extras", "product_variants", "products", "categories", "menu_groups", "settings", "schema_migrations",
    ]) await pool.query(`DROP TABLE IF EXISTS ${table}`);
    await migrate(pool);
    await seedIfEmpty(pool);
    const [result] = await pool.query("INSERT INTO admins (email, password_hash) VALUES ('backup@test.local', 'x')");
    adminId = (result as { insertId: number }).insertId;
  });

  afterAll(async () => pool?.end());

  it("WiFi ve admin verisini dışarı çıkarmaz; fotoğraf anahtarlarını taşınabilir yapar", async () => {
    const bundle = await createBackupBundle(pool);
    const text = JSON.stringify(bundle.backup);
    expect(bundle.backup.version).toBe(1);
    expect(bundle.sources.length).toBe(bundle.backup.images.length);
    expect(bundle.backup.images.length).toBeGreaterThan(0);
    expect(bundle.backup.images.every((image) => /^[a-f0-9]{64}$/.test(image.key))).toBe(true);
    expect(text).not.toContain("test1234");
    expect(text).not.toContain("wifi_password");
    expect(text).not.toContain("admins");
  });

  it("fotoğraflar yüklenmeden başlamaz; sonra kopya alıp tek işlemde döner ve WiFi'ı korur", async () => {
    await pool.query("UPDATE products SET sold_out_until = '2026-10-28 08:00:00.000' WHERE id = 1");
    const bundle = await createBackupBundle(pool);
    await pool.query("UPDATE product_variants SET price_kurus = 22200 WHERE id = 1");
    await pool.query("UPDATE products SET sold_out_until = NULL WHERE id = 1");
    await expect(restoreBackup(pool, adminId, bundle.backup)).rejects.toThrow("Yedek fotoğrafları yüklenmedi.");
    const [[unchanged]] = await pool.query("SELECT price_kurus FROM product_variants WHERE id = 1") as unknown as [[{ price_kurus: number }]];
    expect(unchanged.price_kurus).toBe(22_200);

    const noPhotos = structuredClone(bundle.backup);
    for (const row of [...noPhotos.data.groups, ...noPhotos.data.categories, ...noPhotos.data.products]) row.image_key = null;
    noPhotos.images = [];
    await pool.query("UPDATE settings SET wifi_ssid = 'CURRENT', wifi_username = 'current-user', wifi_password = 'current-pass', wifi_note_tr = 'current-note', last_backup_at = '2026-10-01 09:00:00.000' WHERE id = 1");
    await restoreBackup(pool, adminId, noPhotos);

    const [[variant]] = await pool.query("SELECT price_kurus FROM product_variants WHERE id = 1") as unknown as [[{ price_kurus: number }]];
    const [[settings]] = await pool.query("SELECT wifi_ssid, wifi_username, wifi_password, wifi_note_tr, last_backup_at FROM settings WHERE id = 1") as unknown as [[Record<string, string | Date>]];
    expect(variant.price_kurus).toBe(11_000);
    const [[product]] = await pool.query("SELECT sold_out_until FROM products WHERE id = 1") as unknown as [[{ sold_out_until: Date | null }]];
    expect(new Date(product.sold_out_until!).toISOString()).toBe("2026-10-28T08:00:00.000Z");
    expect(settings.wifi_ssid).toBe("CURRENT");
    expect(settings.wifi_username).toBe("current-user");
    expect(settings.wifi_password).toBe("current-pass");
    expect(settings.wifi_note_tr).toBe("current-note");
    expect(new Date(settings.last_backup_at).toISOString()).toBe("2026-10-01T09:00:00.000Z");
    const [[snapshot]] = await pool.query("SELECT reason FROM menu_snapshots ORDER BY id DESC LIMIT 1") as unknown as [[{ reason: string }]];
    const [[audit]] = await pool.query("SELECT entity, action FROM audit_log ORDER BY id DESC LIMIT 1") as unknown as [[{ entity: string; action: string }]];
    expect(snapshot.reason).toBe("yedekten dönüş öncesi");
    expect(audit).toEqual({ entity: "backup", action: "restore" });
  });

  it("başarılı indirme zamanını kaydeder", async () => {
    await markBackupDownloaded(pool);
    const [[settings]] = await pool.query("SELECT last_backup_at FROM settings WHERE id = 1") as unknown as [[{ last_backup_at: Date }]];
    expect(new Date(settings.last_backup_at).getTime()).toBeGreaterThan(Date.now() - 10_000);
  });

  it("mevcut menünün kopyası alınamazsa geri yüklemeyi başlatmaz", async () => {
    const bundle = await createBackupBundle(pool);
    const noPhotos = structuredClone(bundle.backup);
    for (const row of [...noPhotos.data.groups, ...noPhotos.data.categories, ...noPhotos.data.products]) row.image_key = null;
    noPhotos.images = [];
    await pool.query("UPDATE product_variants SET price_kurus = 33300 WHERE id = 1");
    await pool.query("RENAME TABLE menu_snapshots TO menu_snapshots_unavailable");
    try {
      await expect(restoreBackup(pool, adminId, noPhotos)).rejects.toThrow("menu_snapshots");
    } finally {
      await pool.query("RENAME TABLE menu_snapshots_unavailable TO menu_snapshots");
    }
    const [[variant]] = await pool.query("SELECT price_kurus FROM product_variants WHERE id = 1") as unknown as [[{ price_kurus: number }]];
    expect(variant.price_kurus).toBe(33_300);
  });
});

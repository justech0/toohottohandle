import { afterAll, beforeAll, describe, expect, it } from "vitest";
import mysql, { type Pool } from "mysql2/promise";
import { migrate, seedIfEmpty } from "@/lib/db/setup";
import { applyBulkPrice, previewBulkPrice } from "@/lib/admin/bulkPrice";
import { createMenuSnapshot, listMenuSnapshots, restoreMenuSnapshot } from "@/lib/admin/snapshots";
import { undoLast } from "@/lib/admin/products";

const url = process.env.TEST_DATABASE_URL;

describe.skipIf(!url)("toplu fiyat ve kopyalar (MariaDB)", () => {
  let pool: Pool;
  let adminId: number;

  beforeAll(async () => {
    pool = mysql.createPool({ uri: url!, connectionLimit: 3, timezone: "Z" });
    for (const table of [
      "feedbacks", "stats_product", "stats_hourly", "stats_daily",
      "audit_undo_secrets", "storage_objects", "product_tags", "tags", "audit_log", "sessions", "login_attempts", "admins",
      "hero_slides", "menu_snapshots", "extra_categories", "extras", "product_variants", "products", "categories", "menu_groups", "settings", "schema_migrations",
    ]) await pool.query(`DROP TABLE IF EXISTS ${table}`);
    await migrate(pool);
    await seedIfEmpty(pool);
    const [result] = await pool.query("INSERT INTO admins (email, password_hash) VALUES ('bulk@test.local', 'x')");
    adminId = (result as { insertId: number }).insertId;
  });

  afterAll(async () => pool?.end());

  it("previews and applies every size in one audit row, snapshots first, and undoes once", async () => {
    const input = { scope: "category" as const, scopeId: 1, mode: "percent" as const, amount: "10", rounding: "none" as const };
    const preview = await previewBulkPrice(pool, input);
    const espresso = preview.items.find((item) => item.name === "Espresso")!;
    expect(espresso.variants.map((variant) => [variant.oldPriceKurus, variant.newPriceKurus])).toEqual([[11_000, 12_100], [15_000, 16_500]]);

    await applyBulkPrice(pool, adminId, input, preview.expected);
    const [prices] = await pool.query("SELECT price_kurus FROM product_variants WHERE product_id = ? ORDER BY sort_order", [espresso.id]) as unknown as [[{ price_kurus: number }, { price_kurus: number }]];
    expect(prices.map((row) => row.price_kurus)).toEqual([12_100, 16_500]);
    const [[audit]] = await pool.query("SELECT entity, before_json, after_json FROM audit_log ORDER BY id DESC LIMIT 1") as unknown as [[{ entity: string; before_json: string; after_json: string }]];
    expect(audit.entity).toBe("bulk_price");
    const before = JSON.parse(audit.before_json) as { variantId: number; priceKurus: number }[];
    const after = JSON.parse(audit.after_json) as { variantId: number; priceKurus: number }[];
    expect(before).toHaveLength(after.length);
    expect(before.filter((item) => espresso.variants.some((variant) => variant.id === item.variantId)).map((item) => item.priceKurus)).toEqual([11_000, 15_000]);
    expect(after.filter((item) => espresso.variants.some((variant) => variant.id === item.variantId)).map((item) => item.priceKurus)).toEqual([12_100, 16_500]);
    const [[count]] = await pool.query("SELECT COUNT(*) AS n FROM audit_log") as unknown as [[{ n: number }]];
    expect(Number(count.n)).toBe(1);
    expect((await listMenuSnapshots(pool))[0].reason).toBe("toplu fiyat öncesi");

    await undoLast(pool, adminId);
    const [restored] = await pool.query("SELECT price_kurus FROM product_variants WHERE product_id = ? ORDER BY sort_order", [espresso.id]) as unknown as [[{ price_kurus: number }, { price_kurus: number }]];
    expect(restored.map((row) => row.price_kurus)).toEqual([11_000, 15_000]);
  });

  it("restores a copy after snapshotting current state and preserves every WiFi field", async () => {
    await pool.query("UPDATE product_variants SET price_kurus = 11100 WHERE id = 1");
    const snapshotId = await createMenuSnapshot(pool, "elle alınan kopya");
    await pool.query("UPDATE product_variants SET price_kurus = 22200 WHERE id = 1");
    await pool.query("UPDATE settings SET wifi_ssid = 'CURRENT', wifi_username = 'current-user', wifi_password = 'current-pass', wifi_note_tr = 'current-note' WHERE id = 1");

    await restoreMenuSnapshot(pool, adminId, snapshotId);
    const [[variant]] = await pool.query("SELECT price_kurus FROM product_variants WHERE id = 1") as unknown as [[{ price_kurus: number }]];
    const [[settings]] = await pool.query("SELECT wifi_ssid, wifi_username, wifi_password, wifi_note_tr FROM settings WHERE id = 1") as unknown as [[Record<string, string>]];
    expect(variant.price_kurus).toBe(11_100);
    expect(settings).toEqual({ wifi_ssid: "CURRENT", wifi_username: "current-user", wifi_password: "current-pass", wifi_note_tr: "current-note" });
    expect((await listMenuSnapshots(pool))[0].reason).toBe("kopyaya dönüş öncesi");
    const [[audit]] = await pool.query("SELECT entity, action FROM audit_log ORDER BY id DESC LIMIT 1") as unknown as [[{ entity: string; action: string }]];
    expect(audit).toEqual({ entity: "menu_snapshot", action: "restore" });
  });
});

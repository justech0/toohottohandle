import { afterAll, beforeAll, describe, expect, it } from "vitest";
import mysql, { type Pool } from "mysql2/promise";
import { migrate, readMenuRows, seedIfEmpty } from "@/lib/db/setup";
import { rowsToMenu } from "@/lib/menu/fromRows";
import {
  addTag,
  catalogData,
  deleteCategory,
  deleteExtra,
  deleteGroup,
  saveCategory,
  saveExtra,
  saveGroup,
  saveSettings,
} from "@/lib/admin/catalog";
import { saveProduct, loadProductForm, undoLast } from "@/lib/admin/products";
import { parseProductInput } from "@/lib/admin/productInput";

const url = process.env.TEST_DATABASE_URL;

describe.skipIf(!url)("catalog management (MariaDB)", () => {
  let pool: Pool;
  let adminId: number;

  beforeAll(async () => {
    pool = mysql.createPool({ uri: url!, connectionLimit: 3, timezone: "Z" });
    for (const table of [
      "feedbacks", "stats_product", "stats_hourly", "stats_daily",
      "audit_undo_secrets", "storage_objects", "product_tags", "tags", "audit_log", "sessions", "login_attempts", "admins",
      "menu_snapshots", "extra_categories", "extras", "product_variants", "products", "categories", "menu_groups", "settings", "schema_migrations",
    ]) await pool.query(`DROP TABLE IF EXISTS ${table}`);
    await migrate(pool);
    await seedIfEmpty(pool);
    const [result] = await pool.query("INSERT INTO admins (email, password_hash) VALUES ('catalog@test.local', 'x')");
    adminId = (result as { insertId: number }).insertId;
  });

  afterAll(async () => pool?.end());

  it("seeds the six ready tags and reports the test WiFi warning", async () => {
    const data = await catalogData(pool);
    expect(data.tags.map((tag) => tag.name)).toEqual(["VEGAN", "ŞEKERSİZ", "BİTKİSEL SÜT SEÇENEKLİ", "SICAK", "SOĞUK", "ACILI"]);
    expect(data.usesTestWifi).toBe(true);
  });

  it("updates a group, audits it, and undoes it", async () => {
    await saveGroup(pool, adminId, 1, { name: "Kahveler", color: "yellow", sortOrder: 2 });
    expect((await catalogData(pool)).groups.find((group) => group.id === 1)).toMatchObject({ name: "Kahveler", color: "yellow", sortOrder: 2 });
    await undoLast(pool, adminId);
    expect((await catalogData(pool)).groups.find((group) => group.id === 1)).toMatchObject({ name: "Kahve", color: "red", sortOrder: 0 });
  });

  it("refuses to delete a group or category that still has children", async () => {
    await expect(deleteGroup(pool, adminId, 1)).rejects.toThrow("Bu grupta kategori var");
    await expect(deleteCategory(pool, adminId, 1)).rejects.toThrow("Bu kategoride ürün var");
  });

  it("updates category defaults and exposes them through menu rows, then undoes", async () => {
    await saveCategory(pool, adminId, 1, {
      name: "Sıcaklar", groupId: 2, sortOrder: 8, isVisible: false, defaultInSuggest: false, defaultTemp: "cold",
    });
    expect(rowsToMenu(await readMenuRows(pool)).categories.find((category) => category.slug === "sicak-kahveler")).toMatchObject({
      nameTr: "Sıcaklar", group: "spesiyal", isVisible: false, defaultInSuggest: false, defaultTemp: "cold", sortOrder: 8,
    });
    await undoLast(pool, adminId);
  });

  it("updates an extra and category links as one undoable change", async () => {
    await saveExtra(pool, adminId, 1, { name: "Yumurta XL", priceKurus: 4500, categoryIds: [1, 2] });
    expect(rowsToMenu(await readMenuRows(pool)).extras.find((extra) => extra.slug === "yumurta")).toMatchObject({
      nameTr: "Yumurta XL", priceKurus: 4500, categories: ["sicak-kahveler", "soguk-kahveler"],
    });
    await undoLast(pool, adminId);
    expect(rowsToMenu(await readMenuRows(pool)).extras.find((extra) => extra.slug === "yumurta")).toMatchObject({
      nameTr: "Yumurta", priceKurus: 3000, categories: ["ekmek-ustu"],
    });
  });

  it("deletes an extra and restores it with its category links", async () => {
    const extraId = await saveExtra(pool, adminId, null, { name: "Şurup", priceKurus: 2500, categoryIds: [1, 2] });
    await deleteExtra(pool, adminId, extraId);
    expect((await catalogData(pool)).extras.some((extra) => extra.id === extraId)).toBe(false);
    await undoLast(pool, adminId);
    expect((await catalogData(pool)).extras.find((extra) => extra.id === extraId)).toMatchObject({ name: "Şurup", priceKurus: 2500, categoryIds: [1, 2] });
  });

  it("restores extra links when an empty category deletion is undone", async () => {
    const categoryId = await saveCategory(pool, adminId, null, {
      name: "Boş Kategori", groupId: 1, sortOrder: 99, isVisible: true, defaultInSuggest: false, defaultTemp: null,
    });
    await saveExtra(pool, adminId, 1, { name: "Yumurta", priceKurus: 3000, categoryIds: [categoryId] });
    await deleteCategory(pool, adminId, categoryId);
    await undoLast(pool, adminId);
    expect((await catalogData(pool)).extras.find((extra) => extra.id === 1)?.categoryIds).toContain(categoryId);
  });

  it("adds a tag and saves product tag choices", async () => {
    const tagId = await addTag(pool, adminId, { name: "FAVORİ" });
    const [[product]] = await pool.query("SELECT id FROM products WHERE slug = 'cortado'") as unknown as [[{ id: number }]];
    const parsed = parseProductInput({
      name: "Cortado", categoryId: "1", sizes: "none", price0: "170", isVisible: "on", tagIds: `${tagId},1`,
    });
    if (!parsed.ok) throw new Error(parsed.error);
    await saveProduct(pool, adminId, product.id, parsed.value);
    expect((await loadProductForm(pool, product.id))?.tagIds).toBe(`1,${tagId}`);
    expect(rowsToMenu(await readMenuRows(pool)).products.find((item) => item.slug === "cortado")?.tags).toEqual(["VEGAN", "FAVORİ"]);
    await undoLast(pool, adminId);
    expect(rowsToMenu(await readMenuRows(pool)).products.find((item) => item.slug === "cortado")?.tags).toEqual([]);
  });

  it("never writes the old or new WiFi password to audit_log and can undo the change", async () => {
    await saveSettings(pool, adminId, {
      wifiSsid: "Gerçek Ağ", wifiUsername: "kafe", wifiPassword: "yeni-gizli-987", wifiNoteTr: "Ağa bağlanın.",
      openingTime: "09:15", footerNoteTr: "Masaya servis yoktur", statsEnabled: false,
    });
    const [[audit]] = await pool.query("SELECT summary, before_json, after_json FROM audit_log ORDER BY id DESC LIMIT 1") as unknown as [[Record<string, string>]];
    const auditText = JSON.stringify(audit);
    expect(audit.summary).toContain("WiFi şifresi değiştirildi");
    expect(auditText).toContain("[değiştirildi]");
    expect(auditText).not.toContain("test1234");
    expect(auditText).not.toContain("yeni-gizli-987");
    expect((await catalogData(pool)).usesTestWifi).toBe(false);
    await undoLast(pool, adminId);
    const [[settings]] = await pool.query("SELECT wifi_ssid, wifi_username, wifi_password, opening_time, stats_enabled FROM settings WHERE id = 1") as unknown as [[Record<string, unknown>]];
    expect(settings).toMatchObject({ wifi_ssid: "HOT | WIFI", wifi_username: "test", wifi_password: "test1234", opening_time: "08:00", stats_enabled: 1 });
  });
});

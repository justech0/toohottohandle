import type { Pool, PoolConnection, RowDataPacket } from "mysql2/promise";
import { refreshObjectUsage } from "@/lib/storage/images";
import type { CategoryInput, ExtraInput, GroupInput, SettingsInput, TagInput } from "./catalogInput";

type Rows = RowDataPacket[];
type Db = Pool | PoolConnection;

export interface CatalogData {
  groups: { id: number; name: string; color: GroupInput["color"]; sortOrder: number }[];
  categories: { id: number; name: string; groupId: number; sortOrder: number; isVisible: boolean; defaultInSuggest: boolean; defaultTemp: "hot" | "cold" | null }[];
  extras: { id: number; name: string; priceKurus: number; categoryIds: number[] }[];
  tags: { id: number; name: string }[];
  settings: Omit<SettingsInput, "wifiPassword">;
  usesTestWifi: boolean;
}

const TEST_WIFI = { wifi_ssid: "HOT | WIFI", wifi_username: "test", wifi_password: "test1234" };

async function inTx<T>(pool: Pool, fn: (connection: PoolConnection) => Promise<T>): Promise<T> {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const value = await fn(connection);
    await connection.commit();
    return value;
  } catch (error) {
    await connection.rollback().catch(() => {});
    throw error;
  } finally {
    connection.release();
  }
}

const touchMenu = (connection: PoolConnection) => connection.query("UPDATE settings SET menu_updated_at = CURRENT_TIMESTAMP(3) WHERE id = 1");
const json = (value: unknown) => value === null ? null : JSON.stringify(value);
const bool = (value: boolean) => value ? 1 : 0;

async function audit(
  connection: PoolConnection,
  adminId: number,
  entity: string,
  entityId: number | null,
  action: "create" | "update" | "delete",
  summary: string,
  before: unknown,
  after: unknown,
): Promise<number> {
  await connection.query("DELETE FROM audit_undo_secrets");
  const [result] = await connection.query(
    "INSERT INTO audit_log (admin_id, entity, entity_id, action, summary, before_json, after_json) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [adminId, entity, entityId, action, summary.slice(0, 255), json(before), json(after)],
  );
  return (result as { insertId: number }).insertId;
}

const trMap: Record<string, string> = { ı: "i", İ: "i", ş: "s", Ş: "s", ç: "c", Ç: "c", ğ: "g", Ğ: "g", ö: "o", Ö: "o", ü: "u", Ü: "u" };
const slugBase = (name: string) => name.replace(/[ıİşŞçÇğĞöÖüÜ]/g, (char) => trMap[char]).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48) || "kayit";
async function uniqueSlug(connection: PoolConnection, table: "menu_groups" | "categories" | "extras" | "tags", name: string): Promise<string> {
  const base = slugBase(name);
  for (let suffix = 0; suffix < 1000; suffix++) {
    const slug = suffix ? `${base}-${suffix + 1}` : base;
    const [[row]] = await connection.query<Rows>(`SELECT id FROM ${table} WHERE slug = ?`, [slug]);
    if (!row) return slug;
  }
  throw new Error("Benzersiz kısa ad üretilemedi.");
}

export async function catalogData(pool: Pool): Promise<CatalogData> {
  const [groups, categories, extras, links, tags, [settings]] = await Promise.all([
    pool.query<Rows>("SELECT id, name_tr, color, sort_order FROM menu_groups ORDER BY sort_order, id").then(([rows]) => rows),
    pool.query<Rows>("SELECT id, name_tr, group_id, sort_order, is_visible, default_in_suggest, default_temp FROM categories ORDER BY sort_order, id").then(([rows]) => rows),
    pool.query<Rows>("SELECT id, name_tr, price_kurus FROM extras ORDER BY sort_order, id").then(([rows]) => rows),
    pool.query<Rows>("SELECT extra_id, category_id FROM extra_categories ORDER BY category_id").then(([rows]) => rows),
    pool.query<Rows>("SELECT id, name_tr FROM tags ORDER BY sort_order, id").then(([rows]) => rows),
    pool.query<Rows>("SELECT * FROM settings WHERE id = 1").then(([rows]) => rows),
  ]);
  if (!settings) throw new Error("Ayarlar bulunamadı.");
  return {
    groups: groups.map((row) => ({ id: row.id, name: row.name_tr, color: row.color, sortOrder: row.sort_order })),
    categories: categories.map((row) => ({
      id: row.id, name: row.name_tr, groupId: row.group_id, sortOrder: row.sort_order,
      isVisible: Boolean(row.is_visible), defaultInSuggest: Boolean(row.default_in_suggest), defaultTemp: row.default_temp,
    })),
    extras: extras.map((row) => ({
      id: row.id, name: row.name_tr, priceKurus: row.price_kurus,
      categoryIds: links.filter((link) => link.extra_id === row.id).map((link) => link.category_id),
    })),
    tags: tags.map((row) => ({ id: row.id, name: row.name_tr })),
    settings: {
      wifiSsid: settings.wifi_ssid, wifiUsername: settings.wifi_username, wifiNoteTr: settings.wifi_note_tr,
      openingTime: settings.opening_time, footerNoteTr: settings.footer_note_tr, statsEnabled: Boolean(settings.stats_enabled),
    },
    usesTestWifi: settings.wifi_ssid === TEST_WIFI.wifi_ssid && settings.wifi_username === TEST_WIFI.wifi_username && settings.wifi_password === TEST_WIFI.wifi_password,
  };
}

export async function saveGroup(pool: Pool, adminId: number, id: number | null, input: GroupInput): Promise<number> {
  return inTx(pool, async (connection) => {
    let entityId = id;
    let before: unknown = null;
    let action: "create" | "update" = "create";
    if (id) {
      const [[row]] = await connection.query<Rows>("SELECT * FROM menu_groups WHERE id = ? FOR UPDATE", [id]);
      if (!row) throw new Error("Grup bulunamadı.");
      before = row;
      action = "update";
      await connection.query("UPDATE menu_groups SET name_tr = ?, color = ?, sort_order = ? WHERE id = ?", [input.name, input.color, input.sortOrder, id]);
    } else {
      const slug = await uniqueSlug(connection, "menu_groups", input.name);
      const [result] = await connection.query("INSERT INTO menu_groups (slug, name_tr, color, sort_order) VALUES (?, ?, ?, ?)", [slug, input.name, input.color, input.sortOrder]);
      entityId = (result as { insertId: number }).insertId;
    }
    const [[after]] = await connection.query<Rows>("SELECT * FROM menu_groups WHERE id = ?", [entityId]);
    await audit(connection, adminId, "group", entityId, action, `${input.name} grubu ${action === "create" ? "eklendi" : "güncellendi"}`, before, after);
    await touchMenu(connection);
    return entityId!;
  });
}

export async function deleteGroup(pool: Pool, adminId: number, id: number): Promise<void> {
  return inTx(pool, async (connection) => {
    const [[row]] = await connection.query<Rows>("SELECT * FROM menu_groups WHERE id = ? FOR UPDATE", [id]);
    if (!row) throw new Error("Grup bulunamadı.");
    const [[child]] = await connection.query<Rows>("SELECT id FROM categories WHERE group_id = ? LIMIT 1", [id]);
    if (child) throw new Error("Bu grupta kategori var. Önce kategorileri taşıyın veya silin.");
    await connection.query("DELETE FROM menu_groups WHERE id = ?", [id]);
    await refreshObjectUsage(connection, [row.image_key]);
    await audit(connection, adminId, "group", id, "delete", `${row.name_tr} grubu silindi`, row, null);
    await touchMenu(connection);
  });
}

export async function saveCategory(pool: Pool, adminId: number, id: number | null, input: CategoryInput): Promise<number> {
  return inTx(pool, async (connection) => {
    const [[group]] = await connection.query<Rows>("SELECT id FROM menu_groups WHERE id = ?", [input.groupId]);
    if (!group) throw new Error("Grup bulunamadı.");
    let entityId = id;
    let before: unknown = null;
    let action: "create" | "update" = "create";
    if (id) {
      const [[row]] = await connection.query<Rows>("SELECT * FROM categories WHERE id = ? FOR UPDATE", [id]);
      if (!row) throw new Error("Kategori bulunamadı.");
      before = row;
      action = "update";
      await connection.query(
        "UPDATE categories SET name_tr = ?, group_id = ?, sort_order = ?, is_visible = ?, default_in_suggest = ?, default_temp = ? WHERE id = ?",
        [input.name, input.groupId, input.sortOrder, bool(input.isVisible), bool(input.defaultInSuggest), input.defaultTemp, id],
      );
    } else {
      const slug = await uniqueSlug(connection, "categories", input.name);
      const [result] = await connection.query(
        "INSERT INTO categories (slug, group_id, name_tr, sort_order, is_visible, default_in_suggest, default_temp) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [slug, input.groupId, input.name, input.sortOrder, bool(input.isVisible), bool(input.defaultInSuggest), input.defaultTemp],
      );
      entityId = (result as { insertId: number }).insertId;
    }
    const [[after]] = await connection.query<Rows>("SELECT * FROM categories WHERE id = ?", [entityId]);
    await audit(connection, adminId, "category", entityId, action, `${input.name} kategorisi ${action === "create" ? "eklendi" : "güncellendi"}`, before, after);
    await touchMenu(connection);
    return entityId!;
  });
}

export async function deleteCategory(pool: Pool, adminId: number, id: number): Promise<void> {
  return inTx(pool, async (connection) => {
    const [[row]] = await connection.query<Rows>("SELECT * FROM categories WHERE id = ? FOR UPDATE", [id]);
    if (!row) throw new Error("Kategori bulunamadı.");
    const [[product]] = await connection.query<Rows>("SELECT id FROM products WHERE category_id = ? LIMIT 1", [id]);
    if (product) throw new Error("Bu kategoride ürün var. Önce ürünleri taşıyın veya silin.");
    const [extraLinks] = await connection.query<Rows>("SELECT extra_id FROM extra_categories WHERE category_id = ? ORDER BY extra_id", [id]);
    await connection.query("DELETE FROM categories WHERE id = ?", [id]);
    await refreshObjectUsage(connection, [row.image_key]);
    await audit(connection, adminId, "category", id, "delete", `${row.name_tr} kategorisi silindi`, {
      category: row,
      extraIds: extraLinks.map((link) => link.extra_id),
    }, null);
    await touchMenu(connection);
  });
}

const extraSnapshot = async (db: Db, id: number, lock = false) => {
  const [[extra]] = await db.query<Rows>(`SELECT * FROM extras WHERE id = ?${lock ? " FOR UPDATE" : ""}`, [id]);
  if (!extra) return null;
  const [links] = await db.query<Rows>("SELECT category_id FROM extra_categories WHERE extra_id = ? ORDER BY category_id", [id]);
  return { extra, categoryIds: links.map((row) => row.category_id) };
};

export async function saveExtra(pool: Pool, adminId: number, id: number | null, input: ExtraInput): Promise<number> {
  return inTx(pool, async (connection) => {
    if (input.categoryIds.length) {
      const [rows] = await connection.query<Rows>("SELECT id FROM categories WHERE id IN (?)", [input.categoryIds]);
      if (rows.length !== input.categoryIds.length) throw new Error("Kategori bulunamadı.");
    }
    let entityId = id;
    let before: unknown = null;
    let action: "create" | "update" = "create";
    if (id) {
      before = await extraSnapshot(connection, id, true);
      if (!before) throw new Error("Ekstra bulunamadı.");
      action = "update";
      await connection.query("UPDATE extras SET name_tr = ?, price_kurus = ? WHERE id = ?", [input.name, input.priceKurus, id]);
    } else {
      const slug = await uniqueSlug(connection, "extras", input.name);
      const [[order]] = await connection.query<Rows>("SELECT COALESCE(MAX(sort_order), -1) + 1 AS n FROM extras");
      const [result] = await connection.query("INSERT INTO extras (slug, name_tr, price_kurus, sort_order) VALUES (?, ?, ?, ?)", [slug, input.name, input.priceKurus, order.n]);
      entityId = (result as { insertId: number }).insertId;
    }
    await connection.query("DELETE FROM extra_categories WHERE extra_id = ?", [entityId]);
    if (input.categoryIds.length) await connection.query("INSERT INTO extra_categories (extra_id, category_id) VALUES ?", [input.categoryIds.map((categoryId) => [entityId, categoryId])]);
    const after = await extraSnapshot(connection, entityId!);
    await audit(connection, adminId, "extra", entityId, action, `${input.name} ekstrası ${action === "create" ? "eklendi" : "güncellendi"}`, before, after);
    await touchMenu(connection);
    return entityId!;
  });
}

export async function deleteExtra(pool: Pool, adminId: number, id: number): Promise<void> {
  return inTx(pool, async (connection) => {
    const before = await extraSnapshot(connection, id, true);
    if (!before) throw new Error("Ekstra bulunamadı.");
    await connection.query("DELETE FROM extras WHERE id = ?", [id]);
    await audit(connection, adminId, "extra", id, "delete", `${before.extra.name_tr} ekstrası silindi`, before, null);
    await touchMenu(connection);
  });
}

export async function addTag(pool: Pool, adminId: number, input: TagInput): Promise<number> {
  return inTx(pool, async (connection) => {
    const slug = await uniqueSlug(connection, "tags", input.name);
    const [[order]] = await connection.query<Rows>("SELECT COALESCE(MAX(sort_order), -1) + 1 AS n FROM tags");
    let id: number;
    try {
      const [result] = await connection.query("INSERT INTO tags (slug, name_tr, sort_order) VALUES (?, ?, ?)", [slug, input.name, order.n]);
      id = (result as { insertId: number }).insertId;
    } catch (error) {
      if ((error as { code?: string }).code === "ER_DUP_ENTRY") throw new Error("Bu etiket zaten var.");
      throw error;
    }
    const [[after]] = await connection.query<Rows>("SELECT * FROM tags WHERE id = ?", [id]);
    await audit(connection, adminId, "tag", id, "create", `${input.name} etiketi eklendi`, null, after);
    await touchMenu(connection);
    return id;
  });
}

export async function saveSettings(pool: Pool, adminId: number, input: SettingsInput): Promise<void> {
  return inTx(pool, async (connection) => {
    const [[before]] = await connection.query<Rows>("SELECT * FROM settings WHERE id = 1 FOR UPDATE");
    if (!before) throw new Error("Ayarlar bulunamadı.");
    const passwordChanged = input.wifiPassword !== null && input.wifiPassword !== before.wifi_password;
    const password = input.wifiPassword ?? before.wifi_password;
    await connection.query(
      "UPDATE settings SET wifi_ssid = ?, wifi_username = ?, wifi_password = ?, wifi_note_tr = ?, opening_time = ?, footer_note_tr = ?, stats_enabled = ? WHERE id = 1",
      [input.wifiSsid, input.wifiUsername, password, input.wifiNoteTr, input.openingTime, input.footerNoteTr, bool(input.statsEnabled)],
    );
    const [[after]] = await connection.query<Rows>("SELECT * FROM settings WHERE id = 1");
    const safe = (row: Record<string, unknown>) => {
      const { wifi_password: _password, ...rest } = row;
      return passwordChanged ? { ...rest, wifi_password: "[değiştirildi]" } : rest;
    };
    const summary = passwordChanged ? "Ayarlar güncellendi · WiFi şifresi değiştirildi" : "Ayarlar güncellendi";
    const auditId = await audit(connection, adminId, "settings", 1, "update", summary, safe(before), safe(after));
    if (passwordChanged) await connection.query("INSERT INTO audit_undo_secrets (audit_id, wifi_password) VALUES (?, ?)", [auditId, before.wifi_password]);
    await touchMenu(connection);
  });
}

const setRow = async (connection: PoolConnection, table: string, row: Record<string, unknown>) => {
  const keys = Object.keys(row);
  const values = keys.map((key) => key.endsWith("_at") && typeof row[key] === "string" ? new Date(row[key] as string) : row[key]);
  const updates = keys.filter((key) => key !== "id").map((key) => `${key} = VALUES(${key})`).join(", ");
  await connection.query(
    `INSERT INTO ${table} (${keys.join(", ")}) VALUES (${keys.map(() => "?").join(", ")}) ON DUPLICATE KEY UPDATE ${updates}`,
    values,
  );
};

/** products.ts içindeki tek-son-işlem kuralının katalog tarafı. */
export async function undoCatalogChange(connection: PoolConnection, top: RowDataPacket): Promise<void> {
  const before = top.before_json ? JSON.parse(top.before_json) : null;
  if (top.entity === "group") {
    if (top.action === "create") await connection.query("DELETE FROM menu_groups WHERE id = ?", [top.entity_id]);
    else {
      await setRow(connection, "menu_groups", before);
      await refreshObjectUsage(connection, [before.image_key]);
    }
    return;
  }
  if (top.entity === "category") {
    if (top.action === "create") await connection.query("DELETE FROM categories WHERE id = ?", [top.entity_id]);
    else if (top.action === "delete") {
      await setRow(connection, "categories", before.category);
      if (before.extraIds.length) await connection.query("INSERT INTO extra_categories (extra_id, category_id) VALUES ?", [before.extraIds.map((id: number) => [id, top.entity_id])]);
      await refreshObjectUsage(connection, [before.category.image_key]);
    } else await setRow(connection, "categories", before);
    return;
  }
  if (top.entity === "extra") {
    await connection.query("DELETE FROM extra_categories WHERE extra_id = ?", [top.entity_id]);
    if (top.action === "create") await connection.query("DELETE FROM extras WHERE id = ?", [top.entity_id]);
    else {
      await setRow(connection, "extras", before.extra);
      if (before.categoryIds.length) await connection.query("INSERT INTO extra_categories (extra_id, category_id) VALUES ?", [before.categoryIds.map((id: number) => [top.entity_id, id])]);
    }
    return;
  }
  if (top.entity === "tag" && top.action === "create") {
    await connection.query("DELETE FROM tags WHERE id = ?", [top.entity_id]);
    return;
  }
  if (top.entity === "settings" && top.action === "update") {
    const [[secret]] = await connection.query<Rows>("SELECT wifi_password FROM audit_undo_secrets WHERE audit_id = ?", [top.id]);
    const { wifi_password: marker, ...columns } = before;
    if (marker === "[değiştirildi]" && !secret) throw new Error("WiFi şifresi güvenli geri alma verisi bulunamadı.");
    const restored = marker === "[değiştirildi]" ? { ...columns, wifi_password: secret.wifi_password } : columns;
    await setRow(connection, "settings", restored);
    await connection.query("DELETE FROM audit_undo_secrets WHERE audit_id = ?", [top.id]);
    return;
  }
  throw new Error("Bu işlem geri alınamıyor.");
}

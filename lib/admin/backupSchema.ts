import type {
  CategoryRow, ExtraCategoryRow, ExtraRow, GroupRow, ProductRow, ProductTagRow, TagRow, VariantRow,
} from "@/lib/db/rows";

export const BACKUP_VERSION = 1 as const;
export const MAX_BACKUP_BYTES = 100_000_000;
export const MAX_BACKUP_JSON_BYTES = 5_000_000;
export const MAX_BACKUP_IMAGE_BYTES = 400_000;
export const MAX_BACKUP_FILES = 1_000;
export const HASH_KEY = /^[a-f0-9]{64}$/;
export const SOURCE_IMAGE_KEY = /^(?:[a-f0-9]{64}|(?:urun|ornek)-[a-z0-9-]{1,80})$/;

export type BackupProductRow = Omit<ProductRow, "sold_out_until"> & { sold_out_until: string | null; updated_at: string };
export interface BackupSettingsRow {
  id: 1;
  opening_time: string;
  footer_note_tr: string;
  footer_note_en: string | null;
  footer_note_ar: string | null;
  stats_enabled: 0 | 1;
  menu_updated_at: string;
}
export interface BackupData {
  groups: GroupRow[];
  categories: CategoryRow[];
  products: BackupProductRow[];
  variants: VariantRow[];
  extras: ExtraRow[];
  extraCategories: ExtraCategoryRow[];
  tags: TagRow[];
  productTags: ProductTagRow[];
  settings: [BackupSettingsRow];
}
export interface BackupImage { key: string; path: string; size: number }
export interface BackupFile { version: 1; createdAt: string; data: BackupData; images: BackupImage[] }
export interface BackupSource { key: string; sourceKey: string }
export interface BackupBundle { backup: BackupFile; sources: BackupSource[] }

const fail = (message = "Yedek dosyası geçersiz."): never => { throw new Error(message); };
const object = (value: unknown): Record<string, unknown> => value !== null && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : fail();
const list = (value: unknown, max: number) => Array.isArray(value) && value.length <= max ? value.map(object) : fail();
const integer = (value: unknown, min = 0, max = Number.MAX_SAFE_INTEGER) => Number.isSafeInteger(value) && Number(value) >= min && Number(value) <= max ? Number(value) : fail();
const number = (value: unknown, min: number, max: number) => typeof value === "number" && Number.isFinite(value) && value >= min && value <= max ? value : fail();
const string = (value: unknown, max: number, allowEmpty = true) => typeof value === "string" && [...value].length <= max && (allowEmpty || value.length > 0) ? value : fail();
const nullableString = (value: unknown, max: number) => value === null ? null : string(value, max);
const oneOf = <T extends readonly unknown[]>(value: unknown, choices: T): T[number] => choices.includes(value) ? value as T[number] : fail();
const dateString = (value: unknown, nullable = false): string | null => {
  if (nullable && value === null) return null;
  if (typeof value !== "string" || !Number.isFinite(Date.parse(value))) return fail();
  return value;
};
const imageKey = (value: unknown): string | null => value === null ? null : typeof value === "string" && HASH_KEY.test(value) ? value : fail();
const slug = (value: unknown, max: number) => typeof value === "string" && value.length <= max && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) ? value : fail();
const bool = (value: unknown) => oneOf(value, [0, 1] as const);
const idSet = (rows: { id: number }[]) => {
  const ids = new Set(rows.map((row) => row.id));
  if (ids.size !== rows.length) fail();
  return ids;
};

function parseGroup(value: unknown): GroupRow {
  const row = object(value);
  return {
    id: integer(row.id, 1), slug: slug(row.slug, 64), name_tr: string(row.name_tr, 120, false), name_en: nullableString(row.name_en, 120),
    name_ar: nullableString(row.name_ar, 120), color: oneOf(row.color, ["red", "yellow", "pink", "blue", "green", "gray"] as const),
    sort_order: integer(row.sort_order, -100_000, 100_000), image_key: imageKey(row.image_key),
    image_focus_x: number(row.image_focus_x, 0, 1), image_focus_y: number(row.image_focus_y, 0, 1),
  };
}

function parseCategory(value: unknown): CategoryRow {
  const row = object(value);
  return {
    id: integer(row.id, 1), slug: slug(row.slug, 64), group_id: integer(row.group_id, 1), name_tr: string(row.name_tr, 120, false),
    name_en: nullableString(row.name_en, 120), name_ar: nullableString(row.name_ar, 120), sort_order: integer(row.sort_order, -100_000, 100_000),
    is_visible: bool(row.is_visible), default_in_suggest: bool(row.default_in_suggest), default_temp: oneOf(row.default_temp, ["hot", "cold", null] as const),
    image_key: imageKey(row.image_key), image_focus_x: number(row.image_focus_x, 0, 1), image_focus_y: number(row.image_focus_y, 0, 1),
  };
}

function parseProduct(value: unknown): BackupProductRow {
  const row = object(value);
  return {
    id: integer(row.id, 1), slug: slug(row.slug, 96), category_id: integer(row.category_id, 1), name: string(row.name, 160, false),
    name_en: nullableString(row.name_en, 160), name_ar: nullableString(row.name_ar, 160), desc_tr: nullableString(row.desc_tr, 20_000),
    desc_en: nullableString(row.desc_en, 20_000), desc_ar: nullableString(row.desc_ar, 20_000), ingredients_tr: nullableString(row.ingredients_tr, 20_000),
    ingredients_en: nullableString(row.ingredients_en, 20_000), ingredients_ar: nullableString(row.ingredients_ar, 20_000),
    kcal: row.kcal === null ? null : integer(row.kcal, 0, 100_000), allergens: string(row.allergens, 255), allergens_entered: bool(row.allergens_entered),
    temp: oneOf(row.temp, ["hot", "cold", null] as const), in_suggest: oneOf(row.in_suggest, [0, 1, null] as const), image_key: imageKey(row.image_key),
    image_focus_x: number(row.image_focus_x, 0, 1), image_focus_y: number(row.image_focus_y, 0, 1), is_new: bool(row.is_new),
    is_featured: bool(row.is_featured), is_visible: bool(row.is_visible), sold_out_until: dateString(row.sold_out_until, true),
    sort_order: integer(row.sort_order, -100_000, 100_000), updated_at: dateString(row.updated_at)!,
  };
}

function parseVariant(value: unknown): VariantRow {
  const row = object(value);
  return {
    id: integer(row.id, 1), product_id: integer(row.product_id, 1), label_key: oneOf(row.label_key, ["normal", "buyuk", "tek", "duble", null] as const),
    price_kurus: integer(row.price_kurus, 100, 1_000_000), sort_order: integer(row.sort_order, -100_000, 100_000),
  };
}

function parseExtra(value: unknown): ExtraRow {
  const row = object(value);
  return { id: integer(row.id, 1), slug: slug(row.slug, 64), name_tr: string(row.name_tr, 120, false), name_en: nullableString(row.name_en, 120), name_ar: nullableString(row.name_ar, 120), price_kurus: integer(row.price_kurus, 0, 1_000_000), sort_order: integer(row.sort_order, -100_000, 100_000) };
}

function parseTag(value: unknown): TagRow {
  const row = object(value);
  return { id: integer(row.id, 1), slug: slug(row.slug, 64), name_tr: string(row.name_tr, 80, false), sort_order: integer(row.sort_order, -100_000, 100_000) };
}

const unique = (values: string[]) => {
  if (new Set(values).size !== values.length) fail();
};

export function parseBackupFile(value: unknown): BackupFile {
  const root = object(value);
  if (root.version !== BACKUP_VERSION) fail("Yedek sürümü desteklenmiyor.");
  const createdAt = dateString(root.createdAt)!;
  const rawData = object(root.data);
  const forbidden = ["wifi_ssid", "wifi_username", "wifi_password", "wifi_note_tr", "wifi_note_en", "wifi_note_ar"];
  if (forbidden.some((key) => key in rawData || list(rawData.settings, 1).some((row) => key in row))) fail("Yedekte WiFi bilgisi bulunamaz.");

  const groups = list(rawData.groups, 100).map(parseGroup);
  const categories = list(rawData.categories, 500).map(parseCategory);
  const products = list(rawData.products, 5_000).map(parseProduct);
  const variants = list(rawData.variants, 10_000).map(parseVariant);
  const extras = list(rawData.extras, 500).map(parseExtra);
  const extraCategories = list(rawData.extraCategories, 5_000).map((value) => ({ extra_id: integer(value.extra_id, 1), category_id: integer(value.category_id, 1) }));
  const tags = list(rawData.tags, 500).map(parseTag);
  const productTags = list(rawData.productTags, 20_000).map((value) => ({ product_id: integer(value.product_id, 1), tag_id: integer(value.tag_id, 1) }));
  const [rawSettings] = list(rawData.settings, 1);
  if (!rawSettings || Number(rawSettings.id) !== 1) fail();
  const settings: BackupSettingsRow = {
    id: 1, opening_time: typeof rawSettings.opening_time === "string" && /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(rawSettings.opening_time) ? rawSettings.opening_time : fail(),
    footer_note_tr: string(rawSettings.footer_note_tr, 255), footer_note_en: nullableString(rawSettings.footer_note_en, 255), footer_note_ar: nullableString(rawSettings.footer_note_ar, 255),
    stats_enabled: bool(rawSettings.stats_enabled), menu_updated_at: dateString(rawSettings.menu_updated_at)!,
  };

  const groupIds = idSet(groups); const categoryIds = idSet(categories); const productIds = idSet(products); const extraIds = idSet(extras); const tagIds = idSet(tags);
  idSet(variants);
  unique(groups.map((row) => row.slug)); unique(categories.map((row) => row.slug)); unique(products.map((row) => row.slug)); unique(extras.map((row) => row.slug)); unique(tags.map((row) => row.slug));
  if (categories.some((row) => !groupIds.has(row.group_id)) || products.some((row) => !categoryIds.has(row.category_id))) fail();
  if (variants.some((row) => !productIds.has(row.product_id)) || products.some((row) => !variants.some((variant) => variant.product_id === row.id))) fail();
  if (extraCategories.some((row) => !extraIds.has(row.extra_id) || !categoryIds.has(row.category_id))) fail();
  if (productTags.some((row) => !productIds.has(row.product_id) || !tagIds.has(row.tag_id))) fail();
  unique(extraCategories.map((row) => `${row.extra_id}:${row.category_id}`));
  unique(productTags.map((row) => `${row.product_id}:${row.tag_id}`));

  const images = list(root.images, MAX_BACKUP_FILES - 1).map((value): BackupImage => {
    const key = typeof value.key === "string" && HASH_KEY.test(value.key) ? value.key : fail();
    const path = string(value.path, 128, false);
    if (path !== `photos/${key}-1280.webp`) fail();
    return { key, path, size: integer(value.size, 1, MAX_BACKUP_IMAGE_BYTES) };
  });
  unique(images.map((item) => item.key));
  if (images.reduce((total, image) => total + image.size, 0) > MAX_BACKUP_BYTES - MAX_BACKUP_JSON_BYTES) fail("Yedek dosyası çok büyük.");
  const referenced = new Set([...groups, ...categories, ...products].map((row) => row.image_key).filter((key): key is string => Boolean(key)));
  const listed = new Set(images.map((image) => image.key));
  if ([...referenced].some((key) => !listed.has(key))) fail("Yedekte bir fotoğraf eksik.");
  if ([...listed].some((key) => !referenced.has(key))) fail();

  return { version: BACKUP_VERSION, createdAt, data: { groups, categories, products, variants, extras, extraCategories, tags, productTags, settings: [settings] }, images };
}

export function backupAge(lastBackupAt: string | Date | null, now = new Date()): { days: number | null; label: string; stale: boolean } {
  if (!lastBackupAt) return { days: null, label: "Henüz yedek alınmadı", stale: true };
  const days = Math.max(0, Math.floor((now.getTime() - new Date(lastBackupAt).getTime()) / 86_400_000));
  return { days, label: `Son yedek: ${days} gün önce`, stale: days > 30 };
}

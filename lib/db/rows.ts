/** Veritabanı satır tipleri (MySQL/MariaDB). Sütun adları tablodakiyle aynıdır. */
import type { GroupColor, VariantKey } from "@/lib/menu/types";

type Bool = 0 | 1;

export interface GroupRow {
  id: number; slug: string; name_tr: string; name_en: string | null; name_ar: string | null; color: GroupColor; sort_order: number;
  image_key: string | null; image_focus_x: number; image_focus_y: number;
}
export interface CategoryRow {
  id: number; slug: string; group_id: number; name_tr: string; name_en: string | null; name_ar: string | null;
  sort_order: number; is_visible: Bool; default_in_suggest: Bool; default_temp: "hot" | "cold" | null;
  image_key: string | null; image_focus_x: number; image_focus_y: number;
}
export interface ProductRow {
  id: number; slug: string; category_id: number; name: string; name_en: string | null; name_ar: string | null;
  desc_tr: string | null; desc_en: string | null; desc_ar: string | null;
  ingredients_tr: string | null; ingredients_en: string | null; ingredients_ar: string | null;
  kcal: number | null; allergens: string; allergens_entered: Bool;
  temp: "hot" | "cold" | null; in_suggest: Bool | null;
  image_key: string | null; image_focus_x: number; image_focus_y: number;
  is_new: Bool; is_featured: Bool; is_visible: Bool; sold_out_until: Date | null; sort_order: number;
}
export interface VariantRow { id: number; product_id: number; label_key: Exclude<VariantKey, null> | null; price_kurus: number; sort_order: number }
export interface ExtraRow { id: number; slug: string; name_tr: string; name_en: string | null; name_ar: string | null; price_kurus: number; sort_order: number }
export interface ExtraCategoryRow { extra_id: number; category_id: number }
export interface TagRow { id: number; slug: string; name_tr: string; sort_order: number }
export interface ProductTagRow { product_id: number; tag_id: number }
export interface SettingsRow {
  id: 1; wifi_ssid: string; wifi_username: string; wifi_password: string;
  wifi_note_tr: string; wifi_note_en: string | null; wifi_note_ar: string | null;
  opening_time: string; footer_note_tr: string; footer_note_en: string | null; footer_note_ar: string | null;
  suggest_mode?: "random" | "selected"; suggest_prefer_photos?: Bool;
  stats_enabled: Bool; menu_updated_at: Date; last_backup_at: Date | null;
}

export interface MenuRows {
  groups: GroupRow[];
  categories: CategoryRow[];
  products: ProductRow[];
  variants: VariantRow[];
  extras: ExtraRow[];
  extraCategories: ExtraCategoryRow[];
  tags: TagRow[];
  productTags: ProductTagRow[];
  settings: SettingsRow[];
}

export interface HeroRow {
  id: number; slide_key: string | null; title: string; default_image: string; image_key: string | null;
  color: GroupColor; icon: "lips" | "rabbit" | "star"; sort_order: number; is_visible: Bool;
  image_focus_x: number; image_focus_y: number;
}

import type { MenuData, MenuProduct } from "@/lib/menu/types";
import type { MenuRows, ProductRow } from "./rows";
import { READY_TAGS } from "@/lib/menu/tags";

type SeedProduct = Pick<MenuProduct, "slug" | "name" | "category" | "temp" | "variants">;
export interface SeedFile {
  groups: { slug: string; nameTr: string; color: string }[];
  categories: { slug: string; nameTr: string; group: string; defaultTemp: string | null; defaultInSuggest: boolean }[];
  products: SeedProduct[] | { slug: string; name: string; category: string; temp: string | null; variants: { key: string | null; priceKurus: number }[] }[];
  extras: { slug: string; nameTr: string; priceKurus: number; categories: string[] }[];
  settings: { wifiSsid: string; wifiUsername: string; wifiPassword: string; wifiNoteTr: string; openingTime: string; footerNoteTr: string; statsEnabled: boolean; menuUpdatedAt: string };
}

/** menu.json + photos.json → tablo satırları. Kimlikler liste sırasından gelir (1'den başlar). */
export function seedRows(seed: SeedFile, photos: Record<string, string>): MenuRows {
  const groupId = new Map(seed.groups.map((g, i) => [g.slug, i + 1]));
  const catId = new Map(seed.categories.map((c, i) => [c.slug, i + 1]));
  const need = <T>(m: Map<string, T>, k: string, what: string): T => {
    const v = m.get(k);
    if (v === undefined) throw new Error(`seed: bilinmeyen ${what} "${k}"`);
    return v;
  };

  const products: ProductRow[] = (seed.products as SeedProduct[]).map((p, i) => ({
    id: i + 1, slug: p.slug, category_id: need(catId, p.category, "kategori"),
    name: p.name,
    name_en: (p as any).nameEn ?? (p as any).name_en ?? null,
    name_ar: (p as any).nameAr ?? (p as any).name_ar ?? null,
    desc_tr: (p as any).descTr ?? (p as any).desc_tr ?? null,
    desc_en: (p as any).descEn ?? (p as any).desc_en ?? null,
    desc_ar: (p as any).descAr ?? (p as any).desc_ar ?? null,
    ingredients_tr: null, ingredients_en: null, ingredients_ar: null,
    kcal: null, allergens: "", allergens_entered: 0, temp: p.temp, in_suggest: null,
    image_key: photos[p.slug] ?? null, image_focus_x: 0.5, image_focus_y: 0.5,
    is_new: 0, is_featured: 0, is_visible: 1, sold_out_until: null, sort_order: i,
  }));

  let vid = 0;
  const variants = (seed.products as SeedProduct[]).flatMap((p, i) =>
    p.variants.map((v, j) => ({ id: ++vid, product_id: i + 1, label_key: v.key, price_kurus: v.priceKurus, sort_order: j })),
  );

  const s = seed.settings;
  return {
    groups: seed.groups.map((g, i) => ({
      id: i + 1, slug: g.slug, name_tr: g.nameTr, name_en: null, name_ar: null, color: g.color as never, sort_order: i,
      image_key: null, image_focus_x: 0.5, image_focus_y: 0.5,
    })),
    categories: seed.categories.map((c, i) => ({
      id: i + 1, slug: c.slug, group_id: need(groupId, c.group, "grup"), name_tr: c.nameTr, name_en: null, name_ar: null,
      sort_order: i, is_visible: 1, default_in_suggest: c.defaultInSuggest ? 1 : 0, default_temp: c.defaultTemp as "hot" | "cold" | null,
      image_key: null, image_focus_x: 0.5, image_focus_y: 0.5,
    })),
    products,
    variants,
    extras: seed.extras.map((e, i) => ({ id: i + 1, slug: e.slug, name_tr: e.nameTr, name_en: null, name_ar: null, price_kurus: e.priceKurus, sort_order: i })),
    extraCategories: seed.extras.flatMap((e, i) => e.categories.map((c) => ({ extra_id: i + 1, category_id: need(catId, c, "kategori") }))),
    tags: READY_TAGS.map((name, i) => ({
      id: i + 1,
      slug: ["vegan", "sekersiz", "bitkisel-sut-secenekli", "sicak", "soguk", "acili"][i],
      name_tr: name,
      sort_order: i,
    })),
    productTags: [],
    settings: [{
      id: 1, wifi_ssid: s.wifiSsid, wifi_username: s.wifiUsername, wifi_password: s.wifiPassword,
      wifi_note_tr: s.wifiNoteTr, wifi_note_en: null, wifi_note_ar: null, opening_time: s.openingTime,
      footer_note_tr: s.footerNoteTr, footer_note_en: null, footer_note_ar: null, stats_enabled: s.statsEnabled ? 1 : 0,
      menu_updated_at: new Date(s.menuUpdatedAt), last_backup_at: null,
    }],
  };
}

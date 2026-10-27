import type { MenuRows } from "@/lib/db/rows";
import type { MenuData } from "./types";

const bySort = <T extends { sort_order: number; id: number }>(a: T, b: T) => a.sort_order - b.sort_order || a.id - b.id;
const iso = (d: Date | string) => new Date(d).toISOString();

/** Tablo satırları → menü verisi (serverNow hariç; o önbellek dışında eklenir). */
export function rowsToMenu(rows: MenuRows): Omit<MenuData, "serverNow"> {
  const groupSlug = new Map(rows.groups.map((g) => [g.id, g.slug]));
  const catSlug = new Map(rows.categories.map((c) => [c.id, c.slug]));
  const variantsOf = new Map<number, MenuRows["variants"]>();
  const tagName = new Map(rows.tags.map((tag) => [tag.id, tag.name_tr]));
  for (const v of [...rows.variants].sort(bySort)) {
    const list = variantsOf.get(v.product_id) ?? [];
    list.push(v);
    variantsOf.set(v.product_id, list);
  }
  const s = rows.settings[0];
  if (!s) throw new Error("settings satırı yok");

  return {
    groups: [...rows.groups].sort(bySort).map((g) => ({
      slug: g.slug, nameTr: g.name_tr, color: g.color, sortOrder: g.sort_order,
      imageKey: g.image_key, imageFocusX: g.image_focus_x, imageFocusY: g.image_focus_y,
    })),
    categories: [...rows.categories].sort(bySort).map((c) => ({
      slug: c.slug, nameTr: c.name_tr, group: groupSlug.get(c.group_id)!, sortOrder: c.sort_order, isVisible: Boolean(c.is_visible),
      defaultTemp: c.default_temp, defaultInSuggest: Boolean(c.default_in_suggest),
      imageKey: c.image_key, imageFocusX: c.image_focus_x, imageFocusY: c.image_focus_y,
    })),
    products: [...rows.products].sort(bySort).map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      category: catSlug.get(p.category_id)!,
      temp: p.temp,
      variants: (variantsOf.get(p.id) ?? []).map((v) => ({ key: v.label_key, priceKurus: v.price_kurus })),
      descTr: p.desc_tr,
      soldOutUntil: p.sold_out_until ? iso(p.sold_out_until) : null,
      isNew: Boolean(p.is_new),
      isFeatured: Boolean(p.is_featured),
      isVisible: Boolean(p.is_visible),
      imageKey: p.image_key,
      tags: rows.productTags.filter((link) => link.product_id === p.id).map((link) => tagName.get(link.tag_id)!).filter(Boolean),
      imageFocusX: p.image_focus_x,
      imageFocusY: p.image_focus_y,
    })),
    extras: [...rows.extras].sort(bySort).map((e) => ({
      slug: e.slug, nameTr: e.name_tr, priceKurus: e.price_kurus,
      categories: rows.extraCategories.filter((x) => x.extra_id === e.id).map((x) => catSlug.get(x.category_id)!),
    })),
    tags: [...rows.tags].sort(bySort).map((tag) => tag.name_tr),
    settings: {
      wifiSsid: s.wifi_ssid, wifiUsername: s.wifi_username, wifiPassword: s.wifi_password, wifiNoteTr: s.wifi_note_tr,
      openingTime: s.opening_time, footerNoteTr: s.footer_note_tr, statsEnabled: Boolean(s.stats_enabled), menuUpdatedAt: iso(s.menu_updated_at),
    },
  };
}

import seed from "@/db/seed/menu.json";
import photos from "@/db/seed/photos.json";
import type { MenuData, MenuProduct } from "./types";
import { READY_TAGS } from "./tags";

type SeedProduct = Omit<MenuProduct, "descTr" | "soldOutUntil" | "isNew" | "isFeatured" | "isVisible" | "imageKey" | "tags">;

/** Veritabanı yokken (testler, önizleme) menü seed dosyasından gelir. samples: önizleme fotoğrafları. */
export function seedMenu(samples: Record<string, string>): Omit<MenuData, "serverNow"> {
  const products: MenuProduct[] = (seed.products as SeedProduct[]).map((p) => ({
    ...p,
    descTr: null,
    soldOutUntil: null,
    isNew: false,
    isFeatured: false,
    isVisible: true,
    // Gerçek fotoğraf her zaman önce gelir; örnekler yalnızca önizlemede boşlukları doldurur.
    imageKey: (photos as Record<string, string>)[p.slug] ?? samples[p.slug] ?? null,
    tags: [],
  }));
  return {
    groups: seed.groups.map((group, sortOrder) => ({ ...group, sortOrder })) as MenuData["groups"],
    categories: seed.categories.map((category, sortOrder) => ({ ...category, sortOrder, isVisible: true })) as MenuData["categories"],
    products,
    extras: seed.extras,
    tags: [...READY_TAGS],
    settings: { ...seed.settings, menuUpdatedAt: new Date(seed.settings.menuUpdatedAt).toISOString() },
  };
}

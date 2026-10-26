import seed from "@/db/seed/menu.json";
import photos from "@/db/seed/photos.json";
import type { MenuData, MenuProduct } from "./types";

type SeedProduct = Omit<MenuProduct, "descTr" | "soldOutUntil" | "isNew" | "isFeatured" | "isVisible" | "imageKey">;

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
  }));
  return {
    groups: seed.groups as MenuData["groups"],
    categories: seed.categories as MenuData["categories"],
    products,
    extras: seed.extras,
    settings: { ...seed.settings, menuUpdatedAt: new Date(seed.settings.menuUpdatedAt).toISOString() },
  };
}

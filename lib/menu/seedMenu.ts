import seed from "@/db/seed/menu.json";
import photos from "@/db/seed/photos.json";
import type { MenuData, MenuProduct } from "./types";
import { READY_TAGS } from "./tags";

type SeedProduct = Pick<MenuProduct, "slug" | "name" | "category" | "temp" | "variants">;

/** Veritabanı yokken (testler, önizleme) menü seed dosyasından gelir. samples: önizleme fotoğrafları. */
export function seedMenu(samples: Record<string, string>): Omit<MenuData, "serverNow"> {
  const products: MenuProduct[] = (seed.products as (SeedProduct & { nameEn?: string | null; nameAr?: string | null; descTr?: string | null; descEn?: string | null; descAr?: string | null })[]).map((p, index) => ({
    ...p,
    id: index + 1,
    nameEn: p.nameEn ?? null,
    nameAr: p.nameAr ?? null,
    descTr: p.descTr ?? null,
    descEn: p.descEn ?? null,
    descAr: p.descAr ?? null,
    soldOutUntil: null,
    inSuggest: null,
    isNew: false,
    isFeatured: false,
    isVisible: true,
    // Gerçek fotoğraf her zaman önce gelir; örnekler yalnızca önizlemede boşlukları doldurur.
    imageKey: (photos as Record<string, string>)[p.slug] ?? samples[p.slug] ?? null,
    tags: [],
    imageFocusX: 0.5,
    imageFocusY: 0.5,
  }));
  return {
    groups: seed.groups.map((group: any, sortOrder) => ({
      ...group,
      nameEn: group.nameEn ?? null,
      nameAr: group.nameAr ?? null,
      sortOrder,
      imageKey: null,
      imageFocusX: 0.5,
      imageFocusY: 0.5,
    })) as MenuData["groups"],
    categories: seed.categories.map((category: any, sortOrder) => ({
      ...category,
      nameEn: category.nameEn ?? null,
      nameAr: category.nameAr ?? null,
      sortOrder,
      isVisible: true,
      imageKey: null,
      imageFocusX: 0.5,
      imageFocusY: 0.5,
    })) as MenuData["categories"],
    products,
    extras: seed.extras.map((extra: any) => ({
      ...extra,
      nameEn: extra.nameEn ?? null,
      nameAr: extra.nameAr ?? null,
    })),
    tags: [...READY_TAGS],
    settings: {
      suggestMode: "random", suggestPreferPhotos: true,
      ...seed.settings,
      wifiNoteEn: (seed.settings as any).wifiNoteEn ?? null,
      wifiNoteAr: (seed.settings as any).wifiNoteAr ?? null,
      footerNoteEn: (seed.settings as any).footerNoteEn ?? null,
      footerNoteAr: (seed.settings as any).footerNoteAr ?? null,
      menuUpdatedAt: new Date(seed.settings.menuUpdatedAt).toISOString(),
    },
  };
}

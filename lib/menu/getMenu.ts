import seed from "@/db/seed/menu.json";
import samplePhotos from "@/db/seed/sample-photos.json";
import photos from "@/db/seed/photos.json";
import type { MenuData, MenuProduct } from "./types";

type SeedProduct = Omit<MenuProduct, "descTr" | "soldOutUntil" | "isNew" | "isFeatured" | "isVisible" | "imageKey">;

/** Bu sürümde menü seed dosyasından okunur; A2'de aynı imzayla veritabanına bağlanır. */
export async function getMenu(): Promise<MenuData> {
  // Örnek fotoğraflar yalnızca önizlemede açılır; gerçek menüde fotoğraflar admin'den gelir.
  const samples: Record<string, string> = process.env.THTH_SAMPLE_PHOTOS === "1" ? samplePhotos : {};
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
    settings: seed.settings,
    serverNow: new Date().toISOString(),
  };
}

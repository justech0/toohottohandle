import seed from "@/db/seed/menu.json";
import type { MenuData, MenuProduct } from "./types";

type SeedProduct = Omit<MenuProduct, "descTr" | "soldOutUntil" | "isNew" | "isFeatured" | "isVisible" | "imageKey">;

/** Bu sürümde menü seed dosyasından okunur; A2'de aynı imzayla veritabanına bağlanır. */
export async function getMenu(): Promise<MenuData> {
  const products: MenuProduct[] = (seed.products as SeedProduct[]).map((p) => ({
    ...p,
    descTr: null,
    soldOutUntil: null,
    isNew: false,
    isFeatured: false,
    isVisible: true,
    imageKey: null,
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

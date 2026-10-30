import { listSlides } from "@/lib/admin/hero";
import { HERO_SLIDES } from "@/db/seed/hero";
import { cacheLife, cacheTag } from "next/cache";
import samplePhotos from "@/db/seed/sample-photos.json";
import { getPool, hasDb } from "@/lib/db/client";
import { readMenuRows } from "@/lib/db/setup";
import { rowsToMenu } from "./fromRows";
import { seedMenu } from "./seedMenu";
import type { MenuData } from "./types";

type Menu = Omit<MenuData, "serverNow">;

/**
 * Önbellekli iç okuma. Hata yakalamaz: hata fırlarsa Next.js sonucu önbelleğe yazmaz (spec 5.2).
 * Admin kaydı updateTag('menu') ile boşaltır; zamana bağlı yenileme yoktur.
 */
async function fetchMenuCached(): Promise<Menu> {
  "use cache";
  cacheTag("menu");
  cacheLife({ stale: 60 * 60 * 24 * 365, revalidate: 60 * 60 * 24 * 365, expire: 60 * 60 * 24 * 365 });
  const [rows, slides] = await Promise.all([readMenuRows(getPool()), listSlides(getPool())]);
  return { ...rowsToMenu(rows), slides: slides.filter(s => s.isVisible) };
}

/** Son başarılı okuma; veritabanı geçici hata verirse bu süreç bunu gösterir. */
let lastGood: Menu | null = null;

function withSamples(m: Menu): Menu {
  // Örnek fotoğraflar yalnızca önizlemede açılır; gerçek fotoğraf her zaman önce gelir.
  if (process.env.THTH_SAMPLE_PHOTOS !== "1") return m;
  const samples = samplePhotos as Record<string, string>;
  return { ...m, products: m.products.map((p) => ({ ...p, imageKey: p.imageKey ?? samples[p.slug] ?? null })) };
}

export async function getMenu(): Promise<MenuData> {
  let menu: Menu;
  if (!hasDb()) {
    menu = { ...seedMenu({}), slides: [...HERO_SLIDES] };
  } else {
    try {
      menu = await fetchMenuCached();
      lastGood = menu;
    } catch (e) {
      if (!lastGood) throw e;
      console.error("[menu] veritabanı okunamadı, son başarılı menü gösteriliyor", (e as Error).message);
      menu = lastGood;
    }
  }
  return { ...withSamples(menu), serverNow: new Date().toISOString() };
}

import { isSoldOut } from "./soldout";
import type { MenuCategory, MenuProduct } from "./types";

/** "Ne içsem?" havuzu (spec v3 6): görünür, tükenmemiş, kategorisi öneriye dahil ürünler. */
export function suggestPool(products: MenuProduct[], categories: MenuCategory[], serverNow: string, mode: "random" | "selected" = "random"): MenuProduct[] {
  const inSuggest = new Set(categories.filter((c) => c.defaultInSuggest).map((c) => c.slug));
  return products.filter((p) => p.isVisible && (mode === "selected" ? p.inSuggest === true : inSuggest.has(p.category)) && categories.some(c => c.slug === p.category && c.isVisible) && !isSoldOut(p.soldOutUntil, serverNow));
}

function shuffle<T>(xs: T[], rand: () => number): T[] {
  const a = xs.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Birbirinden farklı en fazla n öneri; önce fotoğraflılar.
 * Havuzda yeterince başka ürün varsa bir önceki önerileri (exclude) tekrar etmez.
 */
export function pickSuggestions<T extends { imageKey: string | null }>(pool: T[], n: number, rand: () => number, exclude: readonly T[] = [], preferPhotos = true): T[] {
  const fresh = pool.filter((p) => !exclude.includes(p));
  const base = fresh.length >= n ? fresh : pool;
  if (!preferPhotos) return shuffle(base, rand).slice(0, n);
  const withPhoto = shuffle(base.filter((p) => p.imageKey), rand);
  const without = shuffle(base.filter((p) => !p.imageKey), rand);
  return [...withPhoto, ...without].slice(0, n);
}

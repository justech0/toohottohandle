import { isSoldOut } from "./soldout";
import type { MenuCategory, MenuProduct } from "./types";

/** "Ne içsem?" havuzu (spec v3 6): görünür, tükenmemiş, kategorisi öneriye dahil ürünler. */
export function suggestPool(products: MenuProduct[], categories: MenuCategory[], serverNow: string, mode: "random" | "selected" = "random"): MenuProduct[] {
  const inSuggest = new Set(categories.filter((c) => c.defaultInSuggest).map((c) => c.slug));
  return products.filter((p) => p.isVisible && (mode === "selected" ? p.inSuggest === true : inSuggest.has(p.category)) && categories.some(c => c.slug === p.category && c.isVisible) && !isSoldOut(p.soldOutUntil, serverNow));
}

export const SUGGEST_WEIGHTS = [1, 2, 3, 5] as const;

/** Ağırlıklı karıştırma: puan = rand^(1/ağırlık), büyük puan öne. 5 kat ürün öne çıkma şansında beş kat. */
function weightedShuffle<T extends { suggestWeight?: number }>(xs: T[], rand: () => number): T[] {
  return xs
    .map((x) => ({ x, key: Math.pow(rand(), 1 / Math.max(1, x.suggestWeight ?? 1)) }))
    .sort((a, b) => b.key - a.key)
    .map(({ x }) => x);
}

/**
 * Birbirinden farklı en fazla n öneri; önce fotoğraflılar, grup içinde ağırlığa göre.
 * Havuzda yeterince başka ürün varsa bir önceki önerileri (exclude) tekrar etmez.
 */
export function pickSuggestions<T extends { imageKey: string | null; suggestWeight?: number }>(pool: T[], n: number, rand: () => number, exclude: readonly T[] = [], preferPhotos = true): T[] {
  const fresh = pool.filter((p) => !exclude.includes(p));
  const base = fresh.length >= n ? fresh : pool;
  if (!preferPhotos) return weightedShuffle(base, rand).slice(0, n);
  const withPhoto = weightedShuffle(base.filter((p) => p.imageKey), rand);
  const without = weightedShuffle(base.filter((p) => !p.imageKey), rand);
  return [...withPhoto, ...without].slice(0, n);
}

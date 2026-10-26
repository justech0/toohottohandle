import { isSoldOut } from "./soldout";
import type { MenuCategory, MenuProduct } from "./types";

/** "Ne içsem?" havuzu (spec v3 6): görünür, tükenmemiş, kategorisi öneriye dahil ürünler. */
export function suggestPool(products: MenuProduct[], categories: MenuCategory[], serverNow: string): MenuProduct[] {
  const inSuggest = new Set(categories.filter((c) => c.defaultInSuggest).map((c) => c.slug));
  return products.filter((p) => p.isVisible && inSuggest.has(p.category) && !isSoldOut(p.soldOutUntil, serverNow));
}

function shuffle<T>(xs: T[], rand: () => number): T[] {
  const a = xs.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Birbirinden farklı en fazla n öneri; önce fotoğraflılar. */
export function pickSuggestions<T extends { imageKey: string | null }>(pool: T[], n: number, rand: () => number): T[] {
  const withPhoto = shuffle(pool.filter((p) => p.imageKey), rand);
  const without = shuffle(pool.filter((p) => !p.imageKey), rand);
  return [...withPhoto, ...without].slice(0, n);
}

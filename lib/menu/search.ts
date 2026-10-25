import { normalizeForSearch } from "@/lib/text/normalize";
import type { MenuProduct } from "./types";

export function searchProducts(products: MenuProduct[], query: string): MenuProduct[] {
  const words = normalizeForSearch(query).split(" ").filter(Boolean);
  if (words.length === 0) return products;
  return products.filter((p) => {
    const haystack = normalizeForSearch(`${p.name} ${p.descTr ?? ""}`);
    return words.every((w) => haystack.includes(w));
  });
}

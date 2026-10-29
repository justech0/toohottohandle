import { normalizeForSearch } from "@/lib/text/normalize";

type Searchable = {
  name: string;
  nameEn?: string | null;
  nameAr?: string | null;
  descTr?: string | null;
  descEn?: string | null;
  descAr?: string | null;
};

export function searchProducts<T extends Searchable>(products: T[], query: string): T[] {
  const words = normalizeForSearch(query).split(" ").filter(Boolean);
  if (words.length === 0) return products;
  return products.filter((p) => {
    const haystack = normalizeForSearch(`${p.name} ${p.nameEn ?? ""} ${p.nameAr ?? ""} ${p.descTr ?? ""} ${p.descEn ?? ""} ${p.descAr ?? ""}`);
    return words.every((w) => haystack.includes(w));
  });
}


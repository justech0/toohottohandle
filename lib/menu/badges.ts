import { formatPrice } from "@/lib/format/price";
import { priceLabel } from "./soldout";
import type { MenuProduct, VariantKey } from "./types";

export type PriceStar = { short: "N" | "B" | "T" | "D" | null; price: string };

const SHORT: Record<NonNullable<VariantKey>, NonNullable<PriceStar["short"]>> = { normal: "N", buyuk: "B", tek: "T", duble: "D" };

/** Kart fiyat rozetleri (spec v3 4). Tükendi sunucu saatine göre (priceLabel). */
export function priceBadges(p: MenuProduct, serverNow: string): { soldOut: boolean; full: string; stars: PriceStar[] } {
  const label = priceLabel(p, serverNow);
  if (label.soldOut) return { soldOut: true, full: "Tükendi", stars: [] };
  return {
    soldOut: false,
    full: label.parts.join(" · "),
    stars: p.variants.map((v) => ({ short: v.key ? SHORT[v.key] : null, price: formatPrice(v.priceKurus) })),
  };
}

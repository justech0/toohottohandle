import { formatPrice, variantLabelTr } from "@/lib/format/price";
import type { MenuProduct } from "./types";

export function isSoldOut(soldOutUntil: string | null, serverNow: string): boolean {
  if (!soldOutUntil) return false;
  return Date.parse(soldOutUntil) > Date.parse(serverNow);
}

export function priceLabel(p: MenuProduct, serverNow: string): { soldOut: boolean; parts: string[] } {
  if (isSoldOut(p.soldOutUntil, serverNow)) return { soldOut: true, parts: ["Tükendi"] };
  return {
    soldOut: false,
    parts: p.variants.map((v) => [variantLabelTr(v.key), formatPrice(v.priceKurus)].filter(Boolean).join(" ")),
  };
}

import type { VariantKey } from "@/lib/menu/types";

export function formatPrice(kurus: number): string {
  const lira = Math.floor(kurus / 100);
  const rest = kurus % 100;
  return rest === 0 ? `${lira} ₺` : `${lira},${String(rest).padStart(2, "0")} ₺`;
}

const LABELS: Record<NonNullable<VariantKey>, string> = { normal: "Normal", buyuk: "Büyük", tek: "Tek", duble: "Duble" };

export function variantLabelTr(key: VariantKey): string {
  return key ? LABELS[key] : "";
}

import type { GroupColor } from "@/lib/menu/types";
import { BrandIcon, type BrandIconName } from "./BrandIcon";

/** Kategori afişi (spec v3 4): grup renginde, büyük ad, köşede yıldız, arkada büyük grup ikonu. */
export function CategoryPoster({ name, color, icon }: { name: string; color: GroupColor; icon: Exclude<BrandIconName, "logo"> }) {
  return (
    <h2 className="poster" data-color={color}>
      <BrandIcon name={icon} className="poster__icon" />
      <BrandIcon name="star" className="poster__star" />
      <span className="poster__name">{name}</span>
    </h2>
  );
}

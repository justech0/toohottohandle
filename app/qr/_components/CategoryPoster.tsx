import type { GroupColor } from "@/lib/menu/types";
import { BrandIcon, type BrandIconName } from "./BrandIcon";
import { imageSrc } from "@/lib/menu/image";

/** Kategori afişi (spec v3 4): grup renginde, büyük ad, köşede yıldız, arkada büyük grup ikonu. */
export function CategoryPoster({ name, color, icon, imageKey, focusX, focusY }: {
  name: string; color: GroupColor; icon: Exclude<BrandIconName, "logo">;
  imageKey: string | null; focusX: number; focusY: number;
}) {
  return (
    <h2 className="poster" data-color={color}>
      {imageKey ? <img className="poster__img" src={imageSrc(imageKey, 720)} alt=""
        style={{ objectPosition: `${focusX * 100}% ${focusY * 100}%` }} /> : <BrandIcon name={icon} className="poster__icon" />}
      <BrandIcon name="star" className="poster__star" />
      <span className="poster__name">{name}</span>
    </h2>
  );
}

import type { GroupColor } from "@/lib/menu/types";
import type { PriceStar } from "@/lib/menu/badges";
import type { BrandIconName } from "./BrandIcon";

/** Kartlara ve istemci bileşenlerine giden sade ürün bilgisi (fiyat metinleri sunucuda hazırlanır). */
export interface CardProduct {
  id: number;
  slug: string;
  name: string;
  descTr: string | null;
  categoryName: string;
  groupColor: GroupColor;
  groupIcon: Exclude<BrandIconName, "logo">;
  imageKey: string | null;
  imageFocusX: number;
  imageFocusY: number;
  soldOut: boolean;
  /** Ekran okuyucu ve arama için tam fiyat: "Normal 210 ₺ · Büyük 230 ₺" */
  full: string;
  stars: PriceStar[];
  /** Detay için boy-fiyat çiftleri: ["Normal 210 ₺", "Büyük 230 ₺"]; tükendiyse ["Tükendi"] */
  sizes: string[];
  tags: string[];
}

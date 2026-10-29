export type GroupColor = "red" | "yellow" | "pink" | "blue" | "green" | "gray";
export type Temp = "hot" | "cold" | null;
export type VariantKey = "normal" | "buyuk" | "tek" | "duble" | null;

export interface MenuGroup {
  slug: string; nameTr: string; nameEn: string | null; nameAr: string | null; color: GroupColor; sortOrder: number;
  imageKey: string | null; imageFocusX: number; imageFocusY: number;
}
export interface MenuCategory {
  slug: string; nameTr: string; nameEn: string | null; nameAr: string | null; group: string; sortOrder: number; isVisible: boolean; defaultTemp: Temp; defaultInSuggest: boolean;
  imageKey: string | null; imageFocusX: number; imageFocusY: number;
}
export interface MenuVariant { key: VariantKey; priceKurus: number }
export interface MenuProduct {
  id: number;
  slug: string;
  name: string;
  nameEn: string | null;
  nameAr: string | null;
  category: string;
  temp: Temp;
  variants: MenuVariant[];
  descTr: string | null;
  descEn: string | null;
  descAr: string | null;
  soldOutUntil: string | null;
  isNew: boolean;
  isFeatured: boolean;
  isVisible: boolean;
  imageKey: string | null;
  tags: string[];
  imageFocusX: number;
  imageFocusY: number;
}
export interface MenuExtra { slug: string; nameTr: string; nameEn: string | null; nameAr: string | null; priceKurus: number; categories: string[] }
export interface MenuSettings {
  wifiSsid: string;
  wifiUsername: string;
  wifiPassword: string;
  wifiNoteTr: string;
  wifiNoteEn: string | null;
  wifiNoteAr: string | null;
  openingTime: string;
  footerNoteTr: string;
  footerNoteEn: string | null;
  footerNoteAr: string | null;
  statsEnabled: boolean;
  menuUpdatedAt: string;
}
export interface MenuData {
  groups: MenuGroup[];
  categories: MenuCategory[];
  products: MenuProduct[];
  extras: MenuExtra[];
  tags: string[];
  settings: MenuSettings;
  serverNow: string;
}

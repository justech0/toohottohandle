export type GroupColor = "red" | "yellow" | "pink" | "blue" | "green" | "gray";
export type Temp = "hot" | "cold" | null;
export type VariantKey = "normal" | "buyuk" | "tek" | "duble" | null;

export interface MenuGroup { slug: string; nameTr: string; color: GroupColor }
export interface MenuCategory { slug: string; nameTr: string; group: string; defaultTemp: Temp; defaultInSuggest: boolean }
export interface MenuVariant { key: VariantKey; priceKurus: number }
export interface MenuProduct {
  slug: string;
  name: string;
  category: string;
  temp: Temp;
  variants: MenuVariant[];
  descTr: string | null;
  soldOutUntil: string | null;
  isNew: boolean;
  isFeatured: boolean;
  isVisible: boolean;
  imageKey: string | null;
}
export interface MenuExtra { slug: string; nameTr: string; priceKurus: number; categories: string[] }
export interface MenuSettings {
  wifiSsid: string;
  wifiUsername: string;
  wifiPassword: string;
  wifiNoteTr: string;
  openingTime: string;
  footerNoteTr: string;
  statsEnabled: boolean;
  menuUpdatedAt: string;
}
export interface MenuData {
  groups: MenuGroup[];
  categories: MenuCategory[];
  products: MenuProduct[];
  extras: MenuExtra[];
  settings: MenuSettings;
  serverNow: string;
}

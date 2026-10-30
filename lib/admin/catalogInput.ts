import type { GroupColor } from "@/lib/menu/types";

type Raw = Record<string, string | string[] | undefined>;
type Result<T> = { ok: true; value: T } | { ok: false; error: string };

export interface GroupInput { name: string; nameEn: string | null; nameAr: string | null; color: GroupColor; sortOrder: number }
export interface CategoryInput {
  name: string; nameEn: string | null; nameAr: string | null; groupId: number; sortOrder: number; isVisible: boolean; defaultInSuggest: boolean; defaultTemp: "hot" | "cold" | null;
}
export interface ExtraInput { name: string; nameEn: string | null; nameAr: string | null; priceKurus: number; categoryIds: number[] }
export interface TagInput { name: string }
export interface SettingsInput {
  wifiSsid: string; wifiUsername: string; wifiPassword: string | null;
  wifiNoteTr: string; wifiNoteEn: string | null; wifiNoteAr: string | null;
  openingTime: string;
  footerNoteTr: string; footerNoteEn: string | null; footerNoteAr: string | null;
  statsEnabled: boolean;
}

const COLORS: GroupColor[] = ["red", "yellow", "pink", "blue", "green", "gray"];
const clean = (value: string | string[] | undefined) => String(value ?? "").trim().replace(/\s+/g, " ");
const name = (raw: Raw, label: string, max: number): Result<string> => {
  const value = clean(raw.name);
  if (!value) return { ok: false, error: `${label} adını yaz.` };
  if (value.length > max) return { ok: false, error: `${label} adı en fazla ${max} karakter olabilir.` };
  return { ok: true, value };
};
const optional = (raw: Raw, key: string, label: string, max: number): Result<string | null> => {
  const value = clean(raw[key]);
  if (!value) return { ok: true, value: null };
  if (value.length > max) return { ok: false, error: `${label} en fazla ${max} karakter olabilir.` };
  return { ok: true, value };
};
const integer = (raw: string | string[] | undefined, label: string, min = 0): Result<number> => {
  const value = Number(raw);
  return Number.isInteger(value) && value >= min && value <= 10000
    ? { ok: true, value }
    : { ok: false, error: `${label} geçersiz.` };
};

export function parseGroupInput(raw: Raw): Result<GroupInput> {
  const n = name(raw, "Grup", 120);
  if (!n.ok) return n;
  const nEn = optional(raw, "nameEn", "İngilizce grup adı", 120); if (!nEn.ok) return nEn;
  const nAr = optional(raw, "nameAr", "Arapça grup adı", 120); if (!nAr.ok) return nAr;
  const color = clean(raw.color) as GroupColor;
  if (!COLORS.includes(color)) return { ok: false, error: "Grup rengi geçersiz." };
  const order = integer(raw.sortOrder, "Sıra");
  return order.ok ? { ok: true, value: { name: n.value, nameEn: nEn.value, nameAr: nAr.value, color, sortOrder: order.value } } : order;
}

export function parseCategoryInput(raw: Raw): Result<CategoryInput> {
  const n = name(raw, "Kategori", 120);
  if (!n.ok) return n;
  const nEn = optional(raw, "nameEn", "İngilizce kategori adı", 120); if (!nEn.ok) return nEn;
  const nAr = optional(raw, "nameAr", "Arapça kategori adı", 120); if (!nAr.ok) return nAr;
  const group = integer(raw.groupId, "Grup", 1);
  if (!group.ok) return group;
  const order = integer(raw.sortOrder, "Sıra");
  if (!order.ok) return order;
  const temp = clean(raw.defaultTemp);
  if (temp && temp !== "hot" && temp !== "cold") return { ok: false, error: "Varsayılan sıcaklık geçersiz." };
  return {
    ok: true,
    value: {
      name: n.value, nameEn: nEn.value, nameAr: nAr.value, groupId: group.value, sortOrder: order.value,
      isVisible: raw.isVisible === "on", defaultInSuggest: raw.defaultInSuggest === "on",
      defaultTemp: temp ? temp as "hot" | "cold" : null,
    },
  };
}

export function parseExtraInput(raw: Raw): Result<ExtraInput> {
  const n = name(raw, "Ekstra", 120);
  if (!n.ok) return n;
  const nEn = optional(raw, "nameEn", "İngilizce ekstra adı", 120); if (!nEn.ok) return nEn;
  const nAr = optional(raw, "nameAr", "Arapça ekstra adı", 120); if (!nAr.ok) return nAr;
  const price = clean(raw.price).replace(/\s|₺/g, "");
  if (!/^\d{1,5}([.,]\d{1,2})?$/.test(price)) return { ok: false, error: "Fiyat bir sayı olmalı (ör. 75 ya da 75,50)." };
  const priceKurus = Math.round(Number(price.replace(",", ".")) * 100);
  if (priceKurus < 100 || priceKurus > 1_000_000) return { ok: false, error: "Fiyat 1 ₺ ile 10.000 ₺ arasında olmalı." };
  const values = Array.isArray(raw.categoryIds) ? raw.categoryIds : clean(raw.categoryIds).split(",");
  const categoryIds = [...new Set(values.map(Number).filter((id) => Number.isInteger(id) && id > 0))];
  return { ok: true, value: { name: n.value, nameEn: nEn.value, nameAr: nAr.value, priceKurus, categoryIds } };
}

export function parseTagInput(raw: Raw): Result<TagInput> {
  const n = name(raw, "Etiket", 80);
  return n.ok ? { ok: true, value: { name: n.value.toLocaleUpperCase("tr-TR") } } : n;
}

export function parseSettingsInput(raw: Raw): Result<SettingsInput> {
  const field = (key: string, label: string, max: number): Result<string> => {
    const value = clean(raw[key]);
    if (!value) return { ok: false, error: `${label} alanını yaz.` };
    if (value.length > max) return { ok: false, error: `${label} en fazla ${max} karakter olabilir.` };
    return { ok: true, value };
  };
  const ssid = field("wifiSsid", "Ağ adı", 120); if (!ssid.ok) return ssid;
  const username = field("wifiUsername", "Kullanıcı adı", 120); if (!username.ok) return username;
  const note = field("wifiNoteTr", "WiFi yönergesi", 2000); if (!note.ok) return note;
  const noteEn = optional(raw, "wifiNoteEn", "İngilizce WiFi yönergesi", 2000); if (!noteEn.ok) return noteEn;
  const noteAr = optional(raw, "wifiNoteAr", "Arapça WiFi yönergesi", 2000); if (!noteAr.ok) return noteAr;
  const footer = field("footerNoteTr", "Alt bilgi notu", 255); if (!footer.ok) return footer;
  const footerEn = optional(raw, "footerNoteEn", "İngilizce alt bilgi notu", 255); if (!footerEn.ok) return footerEn;
  const footerAr = optional(raw, "footerNoteAr", "Arapça alt bilgi notu", 255); if (!footerAr.ok) return footerAr;
  const openingTime = clean(raw.openingTime);
  if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(openingTime)) return { ok: false, error: "Açılış saati geçersiz." };
  const password = String(raw.wifiPassword ?? "");
  if (password.length > 255) return { ok: false, error: "WiFi şifresi en fazla 255 karakter olabilir." };
  return {
    ok: true,
    value: {
      wifiSsid: ssid.value, wifiUsername: username.value, wifiPassword: password || null,
      wifiNoteTr: note.value, wifiNoteEn: noteEn.value, wifiNoteAr: noteAr.value,
      openingTime,
      footerNoteTr: footer.value, footerNoteEn: footerEn.value, footerNoteAr: footerAr.value,
      statsEnabled: raw.statsEnabled === "on",
    },
  };
}

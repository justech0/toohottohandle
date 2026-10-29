import { formatPrice, variantLabelTr } from "@/lib/format/price";
import type { MenuVariant, VariantKey } from "@/lib/menu/types";

/** Ürün formu → doğrulanmış değer. Sunucu her zaman yeniden doğrular (spec 5.5). */
export interface ProductInput {
  name: string;
  nameEn: string | null;
  nameAr: string | null;
  categoryId: number;
  descTr: string | null;
  descEn: string | null;
  descAr: string | null;
  ingredientsTr: string | null;
  ingredientsEn: string | null;
  ingredientsAr: string | null;
  temp: "hot" | "cold" | null;
  inSuggest: boolean | null;
  isNew: boolean;
  isFeatured: boolean;
  isVisible: boolean;
  tagIds: number[];
  imageKey: string | null;
  imageFocusX: number;
  imageFocusY: number;
  variants: MenuVariant[];
}

/** Boy seçenekleri: serbest boy adı yok (spec 4.2). */
export const SIZE_SETS: Record<string, VariantKey[]> = {
  none: [null],
  normal: ["normal"],
  buyuk: ["buyuk"],
  tek: ["tek"],
  duble: ["duble"],
  "normal-buyuk": ["normal", "buyuk"],
  "tek-duble": ["tek", "duble"],
};

export const sizeSetOf = (variants: { key: VariantKey }[]): string =>
  Object.keys(SIZE_SETS).find((k) => SIZE_SETS[k].join() === variants.map((v) => v.key).join()) ?? "none";

type Raw = Record<string, string | undefined>;
type Result = { ok: true; value: ProductInput } | { ok: false; error: string };

const MAX_KURUS = 10_000_00;

function priceKurus(raw: string | undefined, missing: string): number | string {
  const s = (raw ?? "").trim().replace(/\s|₺/g, "");
  if (!s) return missing;
  if (!/^\d{1,6}([.,]\d{1,2})?$/.test(s)) return "Fiyat bir sayı olmalı (ör. 180 ya da 176,50).";
  const kurus = Math.round(Number(s.replace(",", ".")) * 100);
  if (kurus < 100 || kurus > MAX_KURUS) return "Fiyat 1 ₺ ile 10.000 ₺ arasında olmalı.";
  return kurus;
}

const text = (raw: string | undefined, max: number, label: string): string | null | { error: string } => {
  const s = (raw ?? "").trim();
  if (s.length > max) return { error: `${label} en fazla ${max} karakter olabilir.` };
  return s || null;
};

const tri = (raw: string | undefined): boolean | null => (raw === "yes" ? true : raw === "no" ? false : null);

export function parseProductInput(raw: Raw): Result {
  const name = (raw.name ?? "").trim().replace(/\s+/g, " ");
  if (!name) return { ok: false, error: "Ürün adını yaz." };
  if (name.length > 160) return { ok: false, error: "Ürün adı en fazla 160 karakter olabilir." };
  const categoryId = Number(raw.categoryId);
  if (!Number.isInteger(categoryId) || categoryId < 1) return { ok: false, error: "Kategori seç." };

  const keys = SIZE_SETS[raw.sizes ?? ""];
  if (!keys) return { ok: false, error: "Boy seçimi geçersiz." };
  const variants: MenuVariant[] = [];
  for (let i = 0; i < keys.length; i++) {
    const p = priceKurus(raw[`price${i}`], i === 0 ? "Fiyatı yaz." : "İkinci boyun fiyatını yaz.");
    if (typeof p === "string") return { ok: false, error: p };
    variants.push({ key: keys[i], priceKurus: p });
  }

  const nameEn = text(raw.nameEn, 160, "İngilizce ürün adı");
  if (nameEn && typeof nameEn === "object") return { ok: false, error: nameEn.error };
  const nameAr = text(raw.nameAr, 160, "Arapça ürün adı");
  if (nameAr && typeof nameAr === "object") return { ok: false, error: nameAr.error };

  const descTr = text(raw.descTr, 1000, "Açıklama");
  if (descTr && typeof descTr === "object") return { ok: false, error: descTr.error };
  const descEn = text(raw.descEn, 1000, "İngilizce açıklama");
  if (descEn && typeof descEn === "object") return { ok: false, error: descEn.error };
  const descAr = text(raw.descAr, 1000, "Arapça açıklama");
  if (descAr && typeof descAr === "object") return { ok: false, error: descAr.error };

  const ingredientsTr = text(raw.ingredientsTr, 1000, "İçindekiler");
  if (ingredientsTr && typeof ingredientsTr === "object") return { ok: false, error: ingredientsTr.error };
  const ingredientsEn = text(raw.ingredientsEn, 1000, "İngilizce içindekiler");
  if (ingredientsEn && typeof ingredientsEn === "object") return { ok: false, error: ingredientsEn.error };
  const ingredientsAr = text(raw.ingredientsAr, 1000, "Arapça içindekiler");
  if (ingredientsAr && typeof ingredientsAr === "object") return { ok: false, error: ingredientsAr.error };

  const temp = raw.temp === "hot" || raw.temp === "cold" ? raw.temp : null;
  const tagIds = [...new Set((raw.tagIds ?? "").split(",").map(Number).filter((id) => Number.isInteger(id) && id > 0))];
  if (tagIds.length > 3) return { ok: false, error: "Bir ürüne en fazla 3 etiket seçilebilir." };
  const imageKey = (raw.imageKey ?? "").trim() || null;
  if (imageKey && !/^(?:[a-f0-9]{64}|(?:urun|ornek)-[a-z0-9-]+)$/.test(imageKey)) return { ok: false, error: "Fotoğraf anahtarı geçersiz." };
  const imageFocusX = Number(raw.imageFocusX ?? "0.5");
  const imageFocusY = Number(raw.imageFocusY ?? "0.5");
  if (![imageFocusX, imageFocusY].every((value) => Number.isFinite(value) && value >= 0 && value <= 1)) {
    return { ok: false, error: "Fotoğraf odağı geçersiz." };
  }
  return {
    ok: true,
    value: {
      name, nameEn: (nameEn as string | null) ?? null, nameAr: (nameAr as string | null) ?? null,
      categoryId,
      descTr: (descTr as string | null) ?? null, descEn: (descEn as string | null) ?? null, descAr: (descAr as string | null) ?? null,
      ingredientsTr: (ingredientsTr as string | null) ?? null, ingredientsEn: (ingredientsEn as string | null) ?? null, ingredientsAr: (ingredientsAr as string | null) ?? null,
      temp, inSuggest: tri(raw.inSuggest),
      isNew: raw.isNew === "on", isFeatured: raw.isFeatured === "on", isVisible: raw.isVisible === "on",
      tagIds, imageKey, imageFocusX, imageFocusY, variants,
    },
  };
}

const describe = (vs: MenuVariant[]) => vs.map((v) => [variantLabelTr(v.key), formatPrice(v.priceKurus)].filter(Boolean).join(" ")).join(" · ");

/** Kaydetmeden önce gösterilecek fiyat farkları: "Normal: 210 ₺ → 230 ₺" (spec 4.2). */
export function priceChanges(before: MenuVariant[], after: MenuVariant[]): string[] {
  const sameKeys = before.map((v) => v.key).join() === after.map((v) => v.key).join();
  if (!sameKeys) return [`${describe(before)} → ${describe(after)}`];
  return before.flatMap((b, i) => {
    const a = after[i];
    if (b.priceKurus === a.priceKurus) return [];
    const label = variantLabelTr(b.key);
    return [`${label ? `${label}: ` : ""}${formatPrice(b.priceKurus)} → ${formatPrice(a.priceKurus)}`];
  });
}

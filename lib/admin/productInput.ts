import { formatPrice, variantLabelTr } from "@/lib/format/price";
import type { MenuVariant, VariantKey } from "@/lib/menu/types";

/** Ürün formu → doğrulanmış değer. Sunucu her zaman yeniden doğrular (spec 5.5). */
export interface ProductInput {
  name: string;
  categoryId: number;
  descTr: string | null;
  ingredientsTr: string | null;
  temp: "hot" | "cold" | null;
  inSuggest: boolean | null;
  isNew: boolean;
  isFeatured: boolean;
  isVisible: boolean;
  tagIds: number[];
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

  const descTr = text(raw.descTr, 1000, "Açıklama");
  if (descTr && typeof descTr === "object") return { ok: false, error: descTr.error };
  const ingredientsTr = text(raw.ingredientsTr, 1000, "İçindekiler");
  if (ingredientsTr && typeof ingredientsTr === "object") return { ok: false, error: ingredientsTr.error };

  const temp = raw.temp === "hot" || raw.temp === "cold" ? raw.temp : null;
  const tagIds = [...new Set((raw.tagIds ?? "").split(",").map(Number).filter((id) => Number.isInteger(id) && id > 0))];
  if (tagIds.length > 3) return { ok: false, error: "Bir ürüne en fazla 3 etiket seçilebilir." };
  return {
    ok: true,
    value: {
      name, categoryId, descTr, ingredientsTr, temp, inSuggest: tri(raw.inSuggest),
      isNew: raw.isNew === "on", isFeatured: raw.isFeatured === "on", isVisible: raw.isVisible === "on", variants,
      tagIds,
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

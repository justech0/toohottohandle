import { describe, expect, it } from "vitest";
import { resolveText } from "@/lib/i18n/resolve";
import { DICTIONARY } from "@/lib/i18n/dictionary";
import type { Language } from "@/lib/i18n/types";
import { searchProducts } from "@/lib/menu/search";

describe("i18n resolveText fallback rules", () => {
  it("returns TR text when language is tr", () => {
    expect(resolveText("tr", "لاتيه", "Latte", "Latte TR")).toBe("Latte TR");
  });

  it("returns EN when language is en and en exists", () => {
    expect(resolveText("en", "لاتيه", "Latte EN", "Latte TR")).toBe("Latte EN");
  });

  it("falls back to TR when language is en and en is missing/empty", () => {
    expect(resolveText("en", "لاتيه", null, "Latte TR")).toBe("Latte TR");
    expect(resolveText("en", "لاتيه", "", "Latte TR")).toBe("Latte TR");
    expect(resolveText("en", "لاتيه", "   ", "Latte TR")).toBe("Latte TR");
  });

  it("returns AR when language is ar and ar exists", () => {
    expect(resolveText("ar", "لاتيه", "Latte EN", "Latte TR")).toBe("لاتيه");
  });

  it("falls back to EN when language is ar and ar is missing but en exists (AR -> EN -> TR)", () => {
    expect(resolveText("ar", null, "Latte EN", "Latte TR")).toBe("Latte EN");
    expect(resolveText("ar", "", "Latte EN", "Latte TR")).toBe("Latte EN");
    expect(resolveText("ar", "  ", "Latte EN", "Latte TR")).toBe("Latte EN");
  });

  it("falls back to TR when language is ar and both ar and en are missing (AR -> EN -> TR)", () => {
    expect(resolveText("ar", null, null, "Latte TR")).toBe("Latte TR");
    expect(resolveText("ar", "", "", "Latte TR")).toBe("Latte TR");
    expect(resolveText("ar", " ", " ", "Latte TR")).toBe("Latte TR");
  });

  it("returns empty string if all are null/undefined", () => {
    expect(resolveText("tr", null, null, null)).toBe("");
    expect(resolveText("en", null, null, null)).toBe("");
    expect(resolveText("ar", null, null, null)).toBe("");
  });
});

describe("i18n dictionary structure", () => {
  const languages: Language[] = ["tr", "en", "ar"];

  it("has dictionary entries for all three languages", () => {
    for (const lang of languages) {
      expect(DICTIONARY[lang]).toBeDefined();
      expect(DICTIONARY[lang].nav.search).toBeTruthy();
      expect(DICTIONARY[lang].nav.wifi).toBeTruthy();
      expect(DICTIONARY[lang].nav.close).toBeTruthy();
      expect(DICTIONARY[lang].product.soldOut).toBeTruthy();
      expect(DICTIONARY[lang].product.ingredients).toBeTruthy();
      expect(DICTIONARY[lang].search.placeholder).toBeTruthy();
      expect(DICTIONARY[lang].neIcsem.title).toBeTruthy();
      expect(DICTIONARY[lang].wifi.ssid).toBeTruthy();
    }
  });

  it("does not contain flag emojis in language names or labels", () => {
    const json = JSON.stringify(DICTIONARY);
    // Flag emojis generally range in regional indicator symbols \uD83C[\uDDE6-\uDDFF]
    expect(json).not.toMatch(/[\uD83C][\uDDE6-\uDDFF]/);
  });
});

describe("searchProducts with multilingual support", () => {
  const products = [
    {
      id: 1,
      name: "Filtre Kahve",
      nameEn: "Filter Coffee",
      nameAr: "قهوة مقطرة",
      descTr: "Taze demlenmiş",
      descEn: "Freshly brewed",
      descAr: "طازجة التحضير",
    },
    {
      id: 2,
      name: "Türk Kahvesi",
      nameEn: "Turkish Coffee",
      nameAr: "قهوة تركية",
      descTr: "Közde pişirilir",
      descEn: "Brewed on embers",
      descAr: "مطبوخة على الجمر",
    },
  ];

  it("finds product by Turkish name", () => {
    expect(searchProducts(products, "Filtre")).toHaveLength(1);
    expect(searchProducts(products, "Filtre")[0].id).toBe(1);
  });

  it("finds product by English name", () => {
    expect(searchProducts(products, "Filter")).toHaveLength(1);
    expect(searchProducts(products, "Filter")[0].id).toBe(1);
  });

  it("finds product by Arabic name", () => {
    expect(searchProducts(products, "مقطرة")).toHaveLength(1);
    expect(searchProducts(products, "مقطرة")[0].id).toBe(1);
    expect(searchProducts(products, "تركية")).toHaveLength(1);
    expect(searchProducts(products, "تركية")[0].id).toBe(2);
  });
});

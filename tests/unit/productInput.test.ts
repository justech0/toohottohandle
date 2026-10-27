import { describe, it, expect } from "vitest";
import { parseProductInput, priceChanges } from "@/lib/admin/productInput";

const base = {
  name: "Cortado", categoryId: "1", descTr: "", ingredientsTr: "", temp: "", inSuggest: "",
  isNew: "", isFeatured: "", isVisible: "on", sizes: "none", price0: "170", price1: "",
  imageKey: "", imageFocusX: "0.5", imageFocusY: "0.5",
};

describe("parseProductInput", () => {
  it("reads a single-price product in lira and stores kuruş", () => {
    const r = parseProductInput(base);
    expect(r.ok && r.value).toMatchObject({ name: "Cortado", categoryId: 1, variants: [{ key: null, priceKurus: 17000 }], isVisible: true, isNew: false, temp: null, inSuggest: null });
  });

  it("reads Normal/Büyük and Tek/Duble pairs", () => {
    const nb = parseProductInput({ ...base, sizes: "normal-buyuk", price0: "210", price1: "230" });
    expect(nb.ok && nb.value.variants).toEqual([{ key: "normal", priceKurus: 21000 }, { key: "buyuk", priceKurus: 23000 }]);
    const td = parseProductInput({ ...base, sizes: "tek-duble", price0: "110", price1: "150" });
    expect(td.ok && td.value.variants).toEqual([{ key: "tek", priceKurus: 11000 }, { key: "duble", priceKurus: 15000 }]);
  });

  it("accepts a lone named size", () => {
    const r = parseProductInput({ ...base, sizes: "buyuk", price0: "200" });
    expect(r.ok && r.value.variants).toEqual([{ key: "buyuk", priceKurus: 20000 }]);
  });

  it("accepts a comma or dot for kuruş and rounds to whole kuruş", () => {
    expect((parseProductInput({ ...base, price0: "176,5" }) as { ok: true; value: { variants: { priceKurus: number }[] } }).value.variants[0].priceKurus).toBe(17650);
    expect((parseProductInput({ ...base, price0: "176.50" }) as { ok: true; value: { variants: { priceKurus: number }[] } }).value.variants[0].priceKurus).toBe(17650);
  });

  it("refuses empty name, missing or silly prices, unknown size set", () => {
    expect(parseProductInput({ ...base, name: "  " })).toEqual({ ok: false, error: "Ürün adını yaz." });
    expect(parseProductInput({ ...base, price0: "" })).toEqual({ ok: false, error: "Fiyatı yaz." });
    expect(parseProductInput({ ...base, price0: "0" })).toEqual({ ok: false, error: "Fiyat 1 ₺ ile 10.000 ₺ arasında olmalı." });
    expect(parseProductInput({ ...base, price0: "abc" })).toEqual({ ok: false, error: "Fiyat bir sayı olmalı (ör. 180 ya da 176,50)." });
    expect(parseProductInput({ ...base, sizes: "normal-buyuk", price1: "" })).toEqual({ ok: false, error: "İkinci boyun fiyatını yaz." });
    expect(parseProductInput({ ...base, sizes: "xl" })).toEqual({ ok: false, error: "Boy seçimi geçersiz." });
  });

  it("reads temperature and Ne içsem as category default / yes / no", () => {
    const r = parseProductInput({ ...base, temp: "cold", inSuggest: "no" });
    expect(r.ok && [r.value.temp, r.value.inSuggest]).toEqual(["cold", false]);
  });

  it("accepts an uploaded image key and bounded focus", () => {
    const key = "a".repeat(64);
    const r = parseProductInput({ ...base, imageKey: key, imageFocusX: "0.25", imageFocusY: "0.75" });
    expect(r.ok && r.value).toMatchObject({ imageKey: key, imageFocusX: 0.25, imageFocusY: 0.75 });
    expect(parseProductInput({ ...base, imageKey: "../x" })).toEqual({ ok: false, error: "Fotoğraf anahtarı geçersiz." });
    expect(parseProductInput({ ...base, imageFocusX: "2" })).toEqual({ ok: false, error: "Fotoğraf odağı geçersiz." });
  });

  it("trims long texts and keeps them optional", () => {
    const r = parseProductInput({ ...base, descTr: "  Sütlü  " });
    expect(r.ok && [r.value.descTr, r.value.ingredientsTr]).toEqual(["Sütlü", null]);
    expect(parseProductInput({ ...base, descTr: "x".repeat(1001) })).toEqual({ ok: false, error: "Açıklama en fazla 1000 karakter olabilir." });
  });
});

describe("priceChanges", () => {
  it("lists only changed prices, old → new (spec 4.2)", () => {
    const before = [{ key: "normal" as const, priceKurus: 21000 }, { key: "buyuk" as const, priceKurus: 23000 }];
    const after = [{ key: "normal" as const, priceKurus: 23000 }, { key: "buyuk" as const, priceKurus: 23000 }];
    expect(priceChanges(before, after)).toEqual(["Normal: 210 ₺ → 230 ₺"]);
  });
  it("describes a size change as a whole", () => {
    expect(priceChanges([{ key: null, priceKurus: 17000 }], [{ key: "tek", priceKurus: 11000 }, { key: "duble", priceKurus: 15000 }])).toEqual([
      "170 ₺ → Tek 110 ₺ · Duble 150 ₺",
    ]);
  });
  it("is empty when nothing changed", () => {
    expect(priceChanges([{ key: null, priceKurus: 17000 }], [{ key: null, priceKurus: 17000 }])).toEqual([]);
  });
});

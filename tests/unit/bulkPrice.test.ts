import { describe, expect, it } from "vitest";
import { calculateBulkPrice, previewBulkPrices } from "@/lib/admin/bulkPrice";

describe("toplu fiyat hesabı", () => {
  it("yüzde değişimini en yakın 5 ve 10 liraya yuvarlar", () => {
    expect(calculateBulkPrice(17_300, { mode: "percent", amount: 1_000, rounding: 500 })).toBe(19_000);
    expect(calculateBulkPrice(17_600, { mode: "percent", amount: 1_000, rounding: 1_000 })).toBe(19_000);
  });

  it("iki boylu ürünün her fiyatına sabit tutarı uygular", () => {
    const [product] = previewBulkPrices([{
      id: 1,
      name: "Latte",
      variants: [
        { id: 10, labelKey: "normal", priceKurus: 21_000 },
        { id: 11, labelKey: "buyuk", priceKurus: 23_000 },
      ],
    }], { mode: "fixed", amount: 750, rounding: 0 });
    expect(product.variants).toEqual([
      { id: 10, labelKey: "normal", oldPriceKurus: 21_000, newPriceKurus: 21_750 },
      { id: 11, labelKey: "buyuk", oldPriceKurus: 23_000, newPriceKurus: 23_750 },
    ]);
  });
});

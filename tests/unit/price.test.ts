import { describe, it, expect } from "vitest";
import { formatPrice, variantLabelTr } from "@/lib/format/price";
import { priceLabel } from "@/lib/menu/soldout";
import { getMenu } from "@/lib/menu/getMenu";

const NOW = "2026-10-25T20:00:00+03:00";
const product = async (slug: string) => (await getMenu()).products.find((p) => p.slug === slug)!;

describe("formatPrice", () => {
  it("formats whole lira and kuruş", () => {
    expect(formatPrice(21000)).toBe("210 ₺");
    expect(formatPrice(21050)).toBe("210,50 ₺");
  });
  it("labels variants in Turkish", () => {
    expect(["normal", "buyuk", "tek", "duble", null].map((k) => variantLabelTr(k as never))).toEqual(["Normal", "Büyük", "Tek", "Duble", ""]);
  });
});

describe("priceLabel", () => {
  it("lists every size with its price", async () => {
    expect(priceLabel(await product("caramel-macchiato"), NOW)).toEqual({ soldOut: false, parts: ["Normal 210 ₺", "Büyük 230 ₺"] });
    expect(priceLabel(await product("cortado"), NOW)).toEqual({ soldOut: false, parts: ["170 ₺"] });
  });
  it("shows Tükendi until the sold-out time passes on the server clock", async () => {
    const p = { ...(await product("cortado")), soldOutUntil: "2026-10-26T08:00:00+03:00" };
    expect(priceLabel(p, NOW)).toEqual({ soldOut: true, parts: ["Tükendi"] });
    expect(priceLabel(p, "2026-10-26T08:00:01+03:00")).toEqual({ soldOut: false, parts: ["170 ₺"] });
  });
});

import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

const file = path.resolve(__dirname, "../../db/seed/menu.json");
const raw = fs.readFileSync(file, "utf8");
const seed = JSON.parse(raw);
const product = (slug: string) => seed.products.find((p: { slug: string }) => p.slug === slug);

describe("seed menu.json", () => {
  it("has 5 groups, 19 categories, 129 products, 4 extras", () => {
    expect(seed.groups).toHaveLength(5);
    expect(seed.categories).toHaveLength(19);
    expect(seed.products).toHaveLength(129);
    expect(seed.extras).toHaveLength(4);
  });

  it("has unique product slugs", () => {
    const slugs = seed.products.map((p: { slug: string }) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("gives every product at least one whole-lira variant", () => {
    for (const p of seed.products) {
      expect(p.variants.length).toBeGreaterThan(0);
      for (const v of p.variants) {
        expect(Number.isInteger(v.priceKurus)).toBe(true);
        expect(v.priceKurus).toBeGreaterThan(0);
        expect(v.priceKurus % 100).toBe(0);
      }
    }
  });

  it("contains no cost data", () => {
    const lower = raw.toLocaleLowerCase("tr");
    for (const word of ["cost", "cogs", "maliyet", "zam"]) expect(lower).not.toContain(word);
  });

  it("maps sizes and prices from the price list", () => {
    expect(product("caramel-macchiato").variants).toEqual([{ key: "normal", priceKurus: 21000 }, { key: "buyuk", priceKurus: 23000 }]);
    expect(product("iced-americano").variants).toEqual([{ key: "normal", priceKurus: 17600 }, { key: "buyuk", priceKurus: 19800 }]);
    expect(product("espresso").variants).toEqual([{ key: "tek", priceKurus: 11000 }, { key: "duble", priceKurus: 15000 }]);
    expect(product("white-mocha-frappe").variants).toEqual([{ key: "buyuk", priceKurus: 25000 }]);
    expect(product("cortado").variants).toEqual([{ key: null, priceKurus: 17000 }]);
  });

  it("sets product temperature and groups", () => {
    expect(product("portakal-suyu").temp).toBe("cold");
    const matcha = seed.categories.find((c: { slug: string }) => c.slug === "matcha-ube");
    expect(matcha.group).toBe("spesiyal");
  });

  it("names the blue group Spesiyal", () => {
    expect(seed.groups.map((g: { slug: string; nameTr: string }) => [g.slug, g.nameTr])).toEqual([
      ["kahve", "Kahve"], ["spesiyal", "Spesiyal"], ["yiyecek", "Yiyecek"], ["tatli", "Tatlı"], ["paket", "Paket & Atıştırmalık"],
    ]);
    expect(seed.categories.filter((c: { group: string }) => c.group === "spesiyal")).toHaveLength(7);
  });

  it("scopes extras", () => {
    const extra = (slug: string) => seed.extras.find((e: { slug: string }) => e.slug === slug);
    expect(extra("ekstra-shot").categories).toEqual(["sicak-kahveler", "soguk-kahveler", "coffee-frappe", "cream-frappe", "matcha-ube"]);
    expect(extra("ekstra-shot").priceKurus).toBe(7500);
    expect(extra("yumurta").categories).toEqual(["ekmek-ustu"]);
  });
});

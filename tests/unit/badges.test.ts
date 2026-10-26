import { describe, it, expect } from "vitest";
import { priceBadges } from "@/lib/menu/badges";
import { getMenu } from "@/lib/menu/getMenu";

const NOW = "2026-10-26T10:00:00.000Z";
const product = async (slug: string) => (await getMenu()).products.find((p) => p.slug === slug)!;

describe("priceBadges", () => {
  it("gives two stars with size letters for a two-size product", async () => {
    expect(priceBadges(await product("caramel-macchiato"), NOW)).toEqual({
      soldOut: false,
      full: "Normal 210 ₺ · Büyük 230 ₺",
      stars: [{ short: "N", price: "210 ₺" }, { short: "B", price: "230 ₺" }],
    });
  });
  it("gives one star without a letter for a single price", async () => {
    expect(priceBadges(await product("cortado"), NOW)).toEqual({ soldOut: false, full: "170 ₺", stars: [{ short: null, price: "170 ₺" }] });
  });
  it("uses T and D for espresso", async () => {
    expect(priceBadges(await product("espresso"), NOW).stars.map((s) => s.short)).toEqual(["T", "D"]);
  });
  it("shows Tükendi and no stars while sold out", async () => {
    const p = { ...(await product("cortado")), soldOutUntil: "2026-10-26T12:00:00.000Z" };
    expect(priceBadges(p, NOW)).toEqual({ soldOut: true, full: "Tükendi", stars: [] });
  });
});

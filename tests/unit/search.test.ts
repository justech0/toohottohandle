import { describe, it, expect } from "vitest";
import { getMenu } from "@/lib/menu/getMenu";
import { searchProducts } from "@/lib/menu/search";

const slugs = async (q: string) => searchProducts((await getMenu()).products, q).map((p) => p.slug);

describe("searchProducts", () => {
  it("finds iced drinks with Turkish capital İ", async () => {
    expect(await slugs("İCE")).toContain("iced-latte");
  });
  it("finds pistachio products with or without Turkish letters", async () => {
    const expected = ["fistikli-magnolia", "fistikli-cookie", "fistikli-cheesecake"];
    for (const q of ["fıstık", "FISTIK"]) expect((await slugs(q)).sort()).toEqual([...expected].sort());
  });
  it("matches every word of the query", async () => {
    expect(await slugs("ton balik")).toEqual(["ton-balikli-sandvic"]);
  });
  it("ignores accents", async () => {
    expect(await slugs("medellin")).toEqual(["colombia-medellin-200-g"]);
  });
  it("returns nothing for unknown text and everything for empty text", async () => {
    expect(await slugs("xyzq")).toEqual([]);
    expect(await slugs("")).toHaveLength(129);
  });
});

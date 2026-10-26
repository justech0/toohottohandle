import { describe, it, expect } from "vitest";
import seed from "@/db/seed/menu.json";
import photos from "@/db/seed/photos.json";
import { seedRows } from "@/lib/db/seedRows";
import { rowsToMenu } from "@/lib/menu/fromRows";
import { seedMenu } from "@/lib/menu/seedMenu";

const strip = <T extends { serverNow?: string }>(m: T) => {
  const { serverNow: _drop, ...rest } = m;
  return rest;
};

describe("seedRows", () => {
  const rows = seedRows(seed, photos);

  it("gives every table its seed rows", () => {
    expect(rows.groups).toHaveLength(5);
    expect(rows.categories).toHaveLength(19);
    expect(rows.products).toHaveLength(129);
    expect(rows.extras).toHaveLength(4);
    expect(rows.variants.length).toBe(seed.products.reduce((n, p) => n + p.variants.length, 0));
    expect(rows.settings).toHaveLength(1);
  });

  it("keeps prices in kuruş and the list order", () => {
    const espresso = rows.products.find((p) => p.slug === "espresso")!;
    const v = rows.variants.filter((x) => x.product_id === espresso.id);
    expect(v.map((x) => [x.label_key, x.price_kurus])).toEqual([["tek", 11000], ["duble", 15000]]);
    expect(rows.products.map((p) => p.slug)).toEqual(seed.products.map((p) => p.slug));
  });

  it("puts real photos on their products", () => {
    expect(rows.products.find((p) => p.slug === "kola")!.image_key).toBe("urun-kola");
    expect(rows.products.find((p) => p.slug === "espresso")!.image_key).toBeNull();
  });

  it("carries no cost data", () => {
    const text = JSON.stringify(rows).toLocaleLowerCase("tr");
    for (const w of ["cost", "cogs", "maliyet"]) expect(text).not.toContain(w);
  });
});

describe("rowsToMenu", () => {
  it("reads back exactly the menu the seed file gives", () => {
    const fromDb = rowsToMenu(seedRows(seed, photos));
    expect(strip(fromDb)).toEqual(strip(seedMenu({})));
  });

  it("hides nothing and shows sold-out time as ISO", () => {
    const rows = seedRows(seed, photos);
    rows.products[0].sold_out_until = new Date("2026-10-27T05:00:00Z");
    rows.products[1].is_visible = 0;
    const m = rowsToMenu(rows);
    expect(m.products[0].soldOutUntil).toBe("2026-10-27T05:00:00.000Z");
    expect(m.products[1].isVisible).toBe(false);
  });

  it("orders by sort_order, not by row order", () => {
    const rows = seedRows(seed, photos);
    rows.products.reverse();
    rows.categories.reverse();
    const m = rowsToMenu(rows);
    expect(m.products.map((p) => p.slug)).toEqual(seed.products.map((p) => p.slug));
    expect(m.categories.map((c) => c.slug)).toEqual(seed.categories.map((c) => c.slug));
  });
});

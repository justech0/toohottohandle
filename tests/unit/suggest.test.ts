import { describe, it, expect } from "vitest";
import { pickSuggestions, suggestPool } from "@/lib/menu/suggest";
import { getMenu } from "@/lib/menu/getMenu";

const NOW = "2026-10-26T10:00:00.000Z";
const items = (photo: number, plain: number) => [
  ...Array.from({ length: photo }, (_, i) => ({ id: `p${i}`, imageKey: `k${i}` })),
  ...Array.from({ length: plain }, (_, i) => ({ id: `n${i}`, imageKey: null })),
];
const seq = () => {
  let x = 0.13;
  return () => (x = (x * 9301 + 0.49297) % 1);
};

describe("pickSuggestions", () => {
  it("picks three different items", () => {
    const r = pickSuggestions(items(0, 6), 3, seq());
    expect(r).toHaveLength(3);
    expect(new Set(r.map((x) => x.id)).size).toBe(3);
  });
  it("caps at the pool size and handles an empty pool", () => {
    expect(pickSuggestions(items(1, 1), 3, seq())).toHaveLength(2);
    expect(pickSuggestions([], 3, seq())).toEqual([]);
  });
  it("prefers products with photos", () => {
    const r = pickSuggestions(items(2, 5), 3, seq());
    expect(r.slice(0, 2).map((x) => x.id).sort()).toEqual(["p0", "p1"]);
    expect(r[2].imageKey).toBeNull();
  });
  it("does not repeat the previous picks when the pool has enough others", () => {
    const pool = items(5, 5);
    const r = seq();
    const first = pickSuggestions(pool, 3, r);
    const second = pickSuggestions(pool, 3, r, first);
    expect(second.filter((x) => first.includes(x))).toEqual([]);
    expect(second.filter((x) => x.imageKey)).toHaveLength(2);
  });
  it("allows repeats when the pool is too small", () => {
    const pool = items(2, 2);
    const first = pickSuggestions(pool, 3, seq());
    expect(pickSuggestions(pool, 3, seq(), first)).toHaveLength(3);
  });
  it("is deterministic for the same random source", () => {
    expect(pickSuggestions(items(3, 6), 3, seq())).toEqual(pickSuggestions(items(3, 6), 3, seq()));
  });
});

describe("suggestPool", () => {
  it("keeps drinks and leaves out soft drinks, food and sold-out items", async () => {
    const menu = await getMenu();
    const products = menu.products.map((p) => (p.slug === "cortado" ? { ...p, soldOutUntil: "2026-10-26T12:00:00.000Z" } : p));
    const slugs = suggestPool(products, menu.categories, NOW).map((p) => p.slug);
    expect(slugs).toContain("cappuccino");
    expect(slugs).toContain("ube-latte");
    expect(slugs).not.toContain("kola");
    expect(slugs).not.toContain("morning-sando");
    expect(slugs).not.toContain("cortado");
  });
});

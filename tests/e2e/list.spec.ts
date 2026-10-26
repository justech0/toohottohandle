import { test, expect } from "@playwright/test";
import { openMenu } from "./helpers/menu";

const row = (page: import("@playwright/test").Page, slug: string) => page.locator(`[data-testid="product-row"][data-slug="${slug}"]`);

test("two-size price is read out in full", async ({ page }) => {
  await openMenu(page);
  await expect(row(page, "caramel-macchiato").getByTestId("price-full")).toHaveText("Normal 210 ₺ · Büyük 230 ₺");
});

test("prices sit in clean chips, not starburst stickers", async ({ page }) => {
  await openMenu(page);
  await expect(page.locator("main .star")).toHaveCount(0);
  const chips = row(page, "cappuccino").locator(".chip");
  await expect(chips).toHaveCount(2);
  await expect(chips.nth(0)).toContainText("Normal");
  await expect(chips.nth(0)).toContainText("180 ₺");
  await expect(chips.nth(1)).toContainText("Büyük");
  await expect(row(page, "ton-balikli-sandvic").locator(".chip")).toHaveText("370 ₺");
  await expect(row(page, "cortado").locator(".chip")).toHaveText("170 ₺");
});

test("photo-less cards use the group color", async ({ page }) => {
  await openMenu(page);
  const card = row(page, "cortado").locator("button");
  expect(await card.evaluate((el) => [getComputedStyle(el).backgroundColor, getComputedStyle(el).color])).toEqual(["rgb(220, 37, 36)", "rgb(255, 255, 255)"]);
  await expect(card.locator("img")).toHaveCount(0);
  await expect(card.locator(".brand-icon")).toHaveCount(1);
  await expect(card).toContainText("170 ₺");
});

test("each category starts with a poster", async ({ page }) => {
  await openMenu(page);
  const poster = page.locator("#cat-sicak-kahveler .poster");
  await expect(poster).toHaveText("Sıcak Kahveler");
  expect((await poster.boundingBox())!.height).toBeGreaterThanOrEqual(150);
});

test("cards sit two per row at 390", async ({ page }) => {
  await openMenu(page);
  const a = (await row(page, "espresso").boundingBox())!;
  const b = (await row(page, "cortado").boundingBox())!;
  expect(Math.abs(a.y - b.y)).toBeLessThan(1);
  expect(b.x).toBeGreaterThan(a.x + a.width - 1);
});

test("extras appear only under espresso and milk categories", async ({ page }) => {
  await openMenu(page);
  await expect(page.locator("#cat-sicak-kahveler [data-testid=extras]")).toHaveText("Ekstra shot +75 ₺ · Bitkisel süt +60 ₺ · Sos ve aroma +50 ₺");
  await expect(page.locator("#cat-caylar [data-testid=extras]")).toHaveCount(0);
  await expect(page.locator("#cat-ekmek-ustu [data-testid=extras]")).toHaveText("Yumurta +30 ₺");
});

test("group tab jumps to its first category and selects it", async ({ page }) => {
  await openMenu(page);
  await expect(page.getByTestId("group-tab")).toHaveCount(5);
  await page.getByTestId("group-tab").filter({ hasText: "Tatlı" }).click();
  await expect(page.locator("#cat-magnolia")).toBeInViewport();
  await expect(page.getByTestId("category-tab").filter({ hasText: "Magnolia" })).toHaveAttribute("aria-current", "true");
});

test("scrolling the list updates the selected category tab", async ({ page }) => {
  await openMenu(page);
  await page.locator("#cat-cookies").evaluate((el) => el.scrollIntoView({ block: "start" }));
  const tab = page.getByTestId("category-tab").filter({ hasText: "Cookies" });
  await expect(tab).toHaveAttribute("aria-current", "true");
  await expect(tab).toBeInViewport();
});

test("no horizontal scroll at 360 and long names stay whole", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await openMenu(page);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
  const name = row(page, "iced-white-chocolate-mocha").locator(".card__name");
  const clipped = await name.evaluate((el) => el.scrollWidth > el.clientWidth);
  expect(clipped).toBe(false);
});

test("tabs are at least 44px tall", async ({ page }) => {
  await openMenu(page);
  await expect(page.getByTestId("group-tab")).toHaveCount(5);
  expect(await page.getByTestId("category-tab").count()).toBeGreaterThan(0);
  for (const tab of await page.locator('[data-testid="group-tab"], [data-testid="category-tab"]').all()) {
    const box = await tab.boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(44);
  }
});

test("a sold-out card keeps 4.5:1 contrast for the name and Tükendi", async ({ page }) => {
  await openMenu(page);
  const ratios = await row(page, "cortado").locator("button").evaluate((btn) => {
    btn.classList.add("card--out");
    btn.querySelector(".card__price")?.remove();
    const out = document.createElement("span");
    out.className = "card__out";
    out.textContent = "Tükendi";
    btn.appendChild(out);
    const nums = (c: string) => (c.match(/[\d.]+/g) ?? []).map(Number);
    const lin = (v: number) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
    const lum = (c: number[]) => 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2]);
    const bgOf = (el: Element | null): number[] => {
      for (let n = el; n; n = n.parentElement) {
        const c = nums(getComputedStyle(n).backgroundColor);
        if (c.length === 3 || (c.length === 4 && c[3] > 0)) return c.slice(0, 3);
      }
      return [255, 255, 255];
    };
    const ratio = (el: Element) => {
      let a = 1;
      for (let n: Element | null = el; n; n = n.parentElement) a *= parseFloat(getComputedStyle(n).opacity);
      const bg = bgOf(el);
      const c = nums(getComputedStyle(el).color);
      const A = a * (c[3] ?? 1);
      const L1 = lum([0, 1, 2].map((i) => c[i] * A + bg[i] * (1 - A)));
      const L2 = lum(bg);
      return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
    };
    return { name: ratio(btn.querySelector(".card__name")!), out: ratio(out) };
  });
  expect(ratios.name).toBeGreaterThanOrEqual(4.5);
  expect(ratios.out).toBeGreaterThanOrEqual(4.5);
});

for (const size of [{ width: 768, height: 1024 }, { width: 1440, height: 900 }]) {
  test(`tapping the last group and category keeps them selected at ${size.width}px`, async ({ page }) => {
    await page.setViewportSize(size);
    await openMenu(page);
    await page.getByTestId("group-tab").filter({ hasText: "Paket" }).click();
    await page.waitForTimeout(300);
    await expect(page.getByTestId("category-tab").filter({ hasText: "Paket Kahve" })).toHaveAttribute("aria-current", "true");
    await page.getByTestId("category-tab").filter({ hasText: "Kasa Önü" }).click();
    await page.waitForTimeout(300);
    await expect(page.getByTestId("category-tab").filter({ hasText: "Kasa Önü" })).toHaveAttribute("aria-current", "true");
  });
}

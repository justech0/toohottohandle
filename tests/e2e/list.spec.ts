import { test, expect } from "@playwright/test";
import { openMenu } from "./helpers/menu";

const row = (page: import("@playwright/test").Page, slug: string) => page.locator(`[data-testid="product-row"][data-slug="${slug}"]`);

test("two-size price shows each size in its own bdi", async ({ page }) => {
  await openMenu(page);
  await expect(row(page, "caramel-macchiato").locator("bdi")).toHaveText(["Normal 210 ₺", "Büyük 230 ₺"]);
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
  const name = row(page, "iced-white-chocolate-mocha").locator(".row__name");
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

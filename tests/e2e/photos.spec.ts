import { test, expect } from "@playwright/test";
import { openMenu } from "./helpers/menu";

const row = (page: import("@playwright/test").Page, slug: string) => page.locator(`main [data-testid="product-row"][data-slug="${slug}"]`);
const loaded = (img: import("@playwright/test").Locator) => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0);

test("a product with a photo shows it across the top of its card", async ({ page }) => {
  await openMenu(page);
  const card = row(page, "cappuccino").locator("button");
  const img = card.locator("img");
  await img.scrollIntoViewIfNeeded();
  await expect.poll(() => loaded(img)).toBe(true);
  const ib = (await img.boundingBox())!;
  const cb = (await card.boundingBox())!;
  expect(Math.abs(ib.width - cb.width)).toBeLessThan(2);
  expect(ib.height).toBeGreaterThanOrEqual(140);
  expect(ib.height).toBeLessThanOrEqual(170);
});

test("a product without a photo shows the group icon instead", async ({ page }) => {
  await openMenu(page);
  await expect(row(page, "cortado").locator("img")).toHaveCount(0);
  await expect(row(page, "cortado").locator(".brand-icon")).toHaveCount(1);
});

test("only sample-photo products get photo cards", async ({ page }) => {
  await openMenu(page);
  await expect(page.locator("main .card--photo")).toHaveCount(11);
  await expect(page.locator("main .card--plain")).toHaveCount(118);
});

test("the detail sheet shows the large photo", async ({ page }) => {
  await openMenu(page);
  await row(page, "cheesecake").locator("button").click();
  const img = page.getByTestId("product-sheet").locator("img");
  await expect.poll(() => loaded(img)).toBe(true);
  expect(await img.getAttribute("srcset")).toContain("1280w");
  expect((await img.boundingBox())!.width).toBeGreaterThan(300);
});

test("photos keep the 360px layout without horizontal scroll", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await openMenu(page);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
});

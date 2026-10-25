import { test, expect } from "@playwright/test";
import { openMenu } from "./helpers/menu";

const row = (page: import("@playwright/test").Page, slug: string) => page.locator(`#cat-sicak-kahveler [data-slug="${slug}"], [data-testid="product-row"][data-slug="${slug}"]`).first();
const loaded = (img: import("@playwright/test").Locator) => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0);

test("a product with a photo shows a small square image in its row", async ({ page }) => {
  await openMenu(page);
  const img = row(page, "cappuccino").locator("img");
  await img.scrollIntoViewIfNeeded();
  await expect.poll(() => loaded(img)).toBe(true);
  const box = (await img.boundingBox())!;
  expect(Math.round(box.width)).toBe(Math.round(box.height));
  expect(box.width).toBeGreaterThanOrEqual(56);
});

test("a product without a photo has no image", async ({ page }) => {
  await openMenu(page);
  await expect(row(page, "cortado").locator("img")).toHaveCount(0);
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

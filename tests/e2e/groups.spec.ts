import { test, expect } from "@playwright/test";
import { openMenu } from "./helpers/menu";

test("shows five group posters and the rabbit square in order", async ({ page }) => {
  await openMenu(page);
  const tiles = page.getByTestId("group-tile");
  await expect(tiles).toHaveCount(5);
  expect(await tiles.evaluateAll((els) => els.map((e) => e.textContent?.trim()))).toEqual([
    "Kahve", "Spesiyal", "Yiyecek", "Tatlı", "Paket & Atıştırmalık",
  ]);
  const grid = page.getByRole("navigation", { name: "Gruplar" });
  await expect(grid.locator(":scope > *").nth(1)).toHaveAttribute("data-testid", "neicsem-tile");
  await expect(page.getByTestId("neicsem-tile")).toContainText("Ne içsem?");
});

test("tiles sit two per row at 390", async ({ page }) => {
  await openMenu(page);
  const a = (await page.getByTestId("group-tile").first().boundingBox())!;
  const b = (await page.getByTestId("neicsem-tile").boundingBox())!;
  expect(Math.abs(a.y - b.y)).toBeLessThan(1);
  expect(Math.abs(a.width - b.width)).toBeLessThan(1);
  expect(a.height).toBeGreaterThanOrEqual(150);
});

test("tapping Tatlı jumps to its first category", async ({ page }) => {
  await openMenu(page);
  await page.getByTestId("group-tile").filter({ hasText: "Tatlı" }).click();
  await expect(page.locator("#cat-magnolia")).toBeInViewport();
  await expect(page.getByTestId("category-tab").filter({ hasText: "Magnolia" })).toHaveAttribute("aria-current", "true");
});

test("the rabbit hops unless reduced motion", async ({ page }) => {
  await openMenu(page);
  expect(await page.locator(".ne-rabbit").evaluate((el) => getComputedStyle(el).animationName)).not.toBe("none");
  await page.emulateMedia({ reducedMotion: "reduce" });
  expect(await page.locator(".ne-rabbit").evaluate((el) => getComputedStyle(el).animationName)).toBe("none");
});

test("group grid has no horizontal scroll at 360", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await openMenu(page);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
});

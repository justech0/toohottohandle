import { test, expect } from "@playwright/test";
import { openMenu } from "./helpers/menu";

const names = (page: import("@playwright/test").Page) => page.getByTestId("neicsem-name");

test("opens in place, spins the three icons and lands on three different drinks", async ({ page }) => {
  await openMenu(page);
  const before = await page.evaluate(() => history.length);
  await page.getByTestId("neicsem-tile").click();
  await expect(page.getByTestId("neicsem-open")).toBeVisible();
  expect(new URL(page.url()).pathname).toBe("/qr");
  expect(await page.evaluate(() => history.length)).toBe(before);
  await expect(page.getByTestId("neicsem-reel")).toHaveCount(3);
  await expect(page.getByTestId("neicsem-reel").first().locator(".brand-icon").first()).toBeAttached();
  await expect(names(page)).toHaveCount(3, { timeout: 4000 });
  const texts = await names(page).allTextContents();
  expect(new Set(texts).size).toBe(3);
});

test("tapping a result opens its detail", async ({ page }) => {
  await openMenu(page);
  await page.getByTestId("neicsem-tile").click();
  await expect(names(page)).toHaveCount(3, { timeout: 4000 });
  const first = (await names(page).first().textContent())!;
  await page.getByTestId("neicsem-reel").first().click();
  await expect(page.getByTestId("product-sheet").getByRole("heading")).toHaveText(first);
});

test("spin again ignores taps while spinning", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await openMenu(page);
  await page.getByTestId("neicsem-tile").click();
  await expect(names(page)).toHaveCount(3, { timeout: 4000 });
  const again = page.getByRole("button", { name: "Tekrar çevir" });
  const t0 = Date.now();
  await again.click();
  await page.waitForTimeout(40);
  await again.click({ force: true });
  await page.waitForTimeout(40);
  await again.click({ force: true });
  await expect(names(page)).toHaveCount(3, { timeout: 4000 });
  expect(Date.now() - t0).toBeLessThan(3600);
  const first = await names(page).allTextContents();
  await page.waitForTimeout(1500);
  expect(await names(page).allTextContents()).toEqual(first);
  expect(errors).toEqual([]);
});

test("moves focus into the panel and back to the square", async ({ page }) => {
  await openMenu(page);
  await page.getByTestId("neicsem-tile").click();
  const close = page.getByTestId("neicsem-open").getByRole("button", { name: "Kapat" });
  await expect(close).toBeFocused();
  await close.click();
  await expect(page.getByTestId("neicsem-tile")).toBeFocused();
});

test("announces the suggestions and labels each box with its price", async ({ page }) => {
  await openMenu(page);
  await page.getByTestId("neicsem-tile").click();
  await expect(names(page)).toHaveCount(3, { timeout: 4000 });
  const n = await names(page).allTextContents();
  await expect(page.getByTestId("neicsem-live")).toHaveText(`Önerilerimiz: ${n.join(", ")}`);
  const price = await page.getByTestId("neicsem-open").locator(".ne-result__price").first().textContent();
  await expect(page.getByTestId("neicsem-reel").first()).toHaveAttribute("aria-label", `${n[0]}, ${price}`);
});

test("close returns the square", async ({ page }) => {
  await openMenu(page);
  await page.getByTestId("neicsem-tile").click();
  await page.getByTestId("neicsem-open").getByRole("button", { name: "Kapat" }).click();
  await expect(page.getByTestId("neicsem-tile")).toBeVisible();
  await expect(page.getByTestId("neicsem-open")).toHaveCount(0);
});

test("reduced motion shows results without spinning", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await openMenu(page);
  await page.getByTestId("neicsem-tile").click();
  await expect(names(page)).toHaveCount(3, { timeout: 400 });
});

test("works when photos fail to load", async ({ page }) => {
  await page.route("**/qr/img/**", (r) => r.abort());
  await openMenu(page);
  await page.getByTestId("neicsem-tile").click();
  await expect(names(page)).toHaveCount(3, { timeout: 4000 });
});

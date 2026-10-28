import { test, expect } from "@playwright/test";
import { openMenu } from "./helpers/menu";

const names = (page: import("@playwright/test").Page) => page.getByTestId("neicsem-name");
const reels = (page: import("@playwright/test").Page) => page.getByTestId("neicsem-reel");

test("opens in place and all three boxes land on the same drink", async ({ page }) => {
  await openMenu(page);
  const before = await page.evaluate(() => history.length);
  await page.getByTestId("neicsem-tile").click();
  await expect(page.getByTestId("neicsem-open")).toBeVisible();
  expect(new URL(page.url()).pathname).toBe("/qr");
  expect(await page.evaluate(() => history.length)).toBe(before);
  await expect(reels(page)).toHaveCount(3);
  await expect(reels(page).first().locator(".brand-icon").first()).toBeAttached();
  await expect(names(page)).toHaveCount(1, { timeout: 4000 });
  await expect(reels(page).first()).toHaveAttribute("data-open-product", /.+/, { timeout: 4000 });
  const name = (await names(page).textContent())!;
  const labels = await reels(page).evaluateAll((els) => els.map((e) => e.getAttribute("aria-label")));
  expect(new Set(labels).size).toBe(1);
  expect(labels[0]).toContain(name);
  const slugs = await reels(page).evaluateAll((els) => els.map((e) => e.getAttribute("data-open-product")));
  expect(new Set(slugs).size).toBe(1);
});

test("tapping a box opens the chosen drink", async ({ page }) => {
  await openMenu(page);
  await page.getByTestId("neicsem-tile").click();
  await expect(names(page)).toHaveCount(1, { timeout: 4000 });
  const name = (await names(page).textContent())!;
  await reels(page).nth(1).click();
  await expect(page.getByTestId("product-sheet").getByRole("heading")).toHaveText(name);
});

test("spin again ignores taps while spinning and picks a different drink", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await openMenu(page);
  await page.getByTestId("neicsem-tile").click();
  await expect(names(page)).toHaveCount(1, { timeout: 4000 });
  const firstPick = await names(page).textContent();
  const again = page.getByRole("button", { name: "Tekrar çevir" });
  const t0 = Date.now();
  await again.click();
  await page.waitForTimeout(40);
  await again.click({ force: true });
  await page.waitForTimeout(40);
  await again.click({ force: true });
  await expect(names(page)).toHaveCount(1, { timeout: 4000 });
  expect(Date.now() - t0).toBeLessThan(3600);
  const second = await names(page).textContent();
  expect(second).not.toBe(firstPick);
  await page.waitForTimeout(1500);
  expect(await names(page).textContent()).toBe(second);
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

test("announces the suggestion and labels each box with its price", async ({ page }) => {
  await openMenu(page);
  await page.getByTestId("neicsem-tile").click();
  await expect(names(page)).toHaveCount(1, { timeout: 4000 });
  const name = await names(page).textContent();
  await expect(page.getByTestId("neicsem-live")).toHaveText(`Önerimiz: ${name}`);
  const price = await page.getByTestId("neicsem-open").locator(".ne-result__price").textContent();
  await expect(reels(page).first()).toHaveAttribute("aria-label", `${name}, ${price}`);
});

test("close returns the square", async ({ page }) => {
  await openMenu(page);
  await page.getByTestId("neicsem-tile").click();
  await page.getByTestId("neicsem-open").getByRole("button", { name: "Kapat" }).click();
  await expect(page.getByTestId("neicsem-tile")).toBeVisible();
  await expect(page.getByTestId("neicsem-open")).toHaveCount(0);
});

test("reduced motion shows the suggestion without spinning", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await openMenu(page);
  await page.getByTestId("neicsem-tile").click();
  await expect(names(page)).toHaveCount(1, { timeout: 400 });
});

test("works when photos fail to load", async ({ page }) => {
  await page.route("**/qr/img/**", (r) => r.abort());
  await openMenu(page);
  await page.getByTestId("neicsem-tile").click();
  await expect(names(page)).toHaveCount(1, { timeout: 4000 });
});

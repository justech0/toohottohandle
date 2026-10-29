import { test, expect } from "@playwright/test";
import { openMenu } from "./helpers/menu";

const title = (page: import("@playwright/test").Page) => page.getByTestId("hero-title");

test.beforeEach(async ({ page }) => {
  await page.clock.install();
});

test("starts on HOT & FAST and rotates every 4 s", async ({ page }) => {
  await openMenu(page);
  await expect(title(page)).toHaveText("HOT & FAST");
  await page.clock.runFor(4100);
  await expect(title(page)).toHaveText("HOT & FREE");
  await page.clock.runFor(4000);
  await expect(title(page)).toHaveText("HOT & SHINE");
  await page.clock.runFor(4000);
  await expect(title(page)).toHaveText("HOT & FAST");
});

test("dots switch slides and reset the interval timer", async ({ page }) => {
  await openMenu(page);
  await page.clock.runFor(3500);
  const dot = page.getByRole("button", { name: "3. slayt" });
  await dot.click();
  await expect(page.getByTestId("hero")).toHaveAttribute("data-active", "shine");
  await expect(dot).toHaveAttribute("aria-current", "true");
  await expect(title(page)).toHaveText("HOT & SHINE");
  await page.clock.runFor(1000);
  await expect(title(page)).toHaveText("HOT & SHINE");
});

test("reduced motion keeps the first slide", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await openMenu(page);
  await page.clock.runFor(9000);
  await expect(title(page)).toHaveText("HOT & FAST");
});

test("pauses while the tab is hidden", async ({ page }) => {
  await openMenu(page);
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", { value: true, configurable: true });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await page.clock.runFor(9000);
  await expect(title(page)).toHaveText("HOT & FAST");
});

test("a broken hero image still shows the slogan on color", async ({ page }) => {
  await page.route("**/qr/hero/*.webp", (r) => r.abort());
  await openMenu(page);
  await expect(title(page)).toBeVisible();
  expect(await page.getByTestId("hero").evaluate((el) => getComputedStyle(el).backgroundColor)).toBe("rgb(220, 37, 36)");
});

test("a missing photo on a light brand color uses readable dark text", async ({ page }) => {
  await page.route("**/qr/hero/shine.webp", route => route.abort());
  await openMenu(page);
  await page.getByRole("button", { name: "3. slayt" }).click();
  await expect(title(page)).toHaveCSS("color", "rgb(42, 21, 20)");
});

test("hero says MENÜ and no branch name", async ({ page }) => {
  await openMenu(page);
  await expect(page.getByTestId("hero")).toContainText("MENÜ");
  await expect(page.getByTestId("hero")).not.toContainText("PETROL");
});

test("topbar is transparent over the hero and solid after scrolling", async ({ page }) => {
  await openMenu(page);
  const bar = page.locator(".topbar");
  const bg = () => bar.evaluate((el) => getComputedStyle(el).backgroundColor);
  await expect.poll(bg).toBe("rgba(0, 0, 0, 0)");
  await expect(page.getByRole("button", { name: "Ara", exact: true })).toBeVisible();
  await page.locator("#cat-sicak-kahveler").evaluate((el) => el.scrollIntoView());
  await page.clock.runFor(500);
  await expect.poll(bg).toBe("rgb(243, 236, 230)");
  await expect(page.getByRole("button", { name: "WiFi", exact: true })).toBeVisible();
  await expect(page.getByRole("img", { name: "Too Hot To Handle" }).first()).toBeVisible();
});

test("the rotating title is only announced after the visitor picks a slide", async ({ page }) => {
  await openMenu(page);
  await expect(title(page)).toHaveAttribute("aria-live", "off");
  await page.getByRole("button", { name: "2. slayt" }).click();
  await expect(title(page)).toHaveAttribute("aria-live", "polite");
});

test("pauses while search is open over it", async ({ page }) => {
  await openMenu(page);
  await page.getByRole("button", { name: "Ara", exact: true }).click();
  await expect(page.getByTestId("search-panel")).toBeVisible();
  await page.clock.runFor(9000);
  await expect(title(page)).toHaveText("HOT & FAST");
  await page.keyboard.press("Escape");
  await expect(page.getByTestId("search-panel")).toHaveCount(0);
  await page.clock.runFor(4100);
  await expect(title(page)).toHaveText("HOT & FREE");
});

test("pauses auto-rotation when scrolled out of view", async ({ page }) => {
  await openMenu(page);
  await expect(title(page)).toHaveText("HOT & FAST");
  await page.locator("#cat-sicak-kahveler").evaluate((el) => el.scrollIntoView());
  await expect(page.locator("html")).toHaveAttribute("data-hero-visible", "false");
  await page.clock.runFor(9000);
  await expect(title(page)).toHaveText("HOT & FAST");
  await page.getByTestId("hero").evaluate((el) => el.scrollIntoView());
  await expect(page.locator("html")).toHaveAttribute("data-hero-visible", "true");
  await page.clock.runFor(4100);
  await expect(title(page)).toHaveText("HOT & FREE");
});


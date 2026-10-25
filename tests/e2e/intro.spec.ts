import { test, expect } from "@playwright/test";

test("first visit plays the intro over an already rendered menu, then removes it", async ({ page }) => {
  await page.goto("/qr");
  await expect(page.getByTestId("intro")).toBeVisible();
  await expect(page.getByTestId("product-row")).toHaveCount(129);
  await expect(page.getByTestId("intro")).toHaveCount(0, { timeout: 1500 });
});

test("tapping skips the intro", async ({ page }) => {
  await page.goto("/qr");
  await page.getByTestId("intro").click();
  await expect(page.getByTestId("intro")).toHaveCount(0, { timeout: 300 });
});

test("the intro does not play again in the same session", async ({ page }) => {
  await page.goto("/qr");
  await expect(page.getByTestId("intro")).toHaveCount(0, { timeout: 1500 });
  await page.reload();
  await page.getByTestId("product-row").first().waitFor();
  await expect(page.getByTestId("intro")).not.toBeVisible();
});

test("reduced motion shows only a short fade", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/qr");
  await expect(page.getByTestId("intro")).toHaveCount(0, { timeout: 400 });
});

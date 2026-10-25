import { test, expect } from "@playwright/test";
import { openMenu } from "./helpers/menu";

const onMenu = (page: import("@playwright/test").Page) => expect(new URL(page.url()).pathname).toBe("/qr");

test("back with the wifi card open closes it and stays on the menu", async ({ page }) => {
  await openMenu(page);
  await page.getByRole("button", { name: "WiFi", exact: true }).click();
  await expect(page.getByTestId("wifi-card")).toBeVisible();
  await page.goBack();
  await expect(page.getByTestId("wifi-card")).toHaveCount(0);
  onMenu(page);
});

test("back with search open closes it and stays on the menu", async ({ page }) => {
  await openMenu(page);
  await page.getByRole("button", { name: "Ara", exact: true }).click();
  await expect(page.getByTestId("search-panel")).toBeVisible();
  await page.goBack();
  await expect(page.getByTestId("search-panel")).toHaveCount(0);
  onMenu(page);
});

test("search → result → back → back closes sheet, then search, and stays on the menu", async ({ page }) => {
  await openMenu(page);
  await page.getByRole("button", { name: "Ara", exact: true }).click();
  await page.getByLabel("Ürün ara").fill("cortado");
  await page.getByTestId("search-panel").locator('[data-slug="cortado"] button').click();
  await expect(page.getByTestId("product-sheet")).toBeVisible();
  await page.goBack();
  await expect(page.getByTestId("product-sheet")).toHaveCount(0);
  await expect(page.getByTestId("search-panel")).toBeVisible();
  await page.goBack();
  await expect(page.getByTestId("search-panel")).toHaveCount(0);
  onMenu(page);
});

test("closing search with × leaves no extra history entry", async ({ page }) => {
  await openMenu(page);
  await page.getByRole("button", { name: "Ara", exact: true }).click();
  await page.getByTestId("search-panel").getByRole("button", { name: "Kapat" }).click();
  await expect(page.getByTestId("search-panel")).toHaveCount(0);
  await page.getByRole("button", { name: "WiFi", exact: true }).click();
  await page.goBack();
  await expect(page.getByTestId("wifi-card")).toHaveCount(0);
  onMenu(page);
});

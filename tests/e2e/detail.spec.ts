import { test, expect } from "@playwright/test";
import { openMenu } from "./helpers/menu";

const openRow = (page: import("@playwright/test").Page, slug: string) =>
  page.locator(`[data-testid="product-row"][data-slug="${slug}"] button`).first().click();

test("tapping a row opens the sheet with name and sizes only", async ({ page }) => {
  await openMenu(page);
  await openRow(page, "caramel-macchiato");
  const sheet = page.getByTestId("product-sheet");
  await expect(sheet).toBeVisible();
  await expect(sheet.getByRole("heading", { name: "Caramel Macchiato" })).toBeVisible();
  await expect(sheet.locator("bdi")).toHaveText(["Normal 210 ₺", "Büyük 230 ₺"]);
  for (const id of ["sheet-desc", "sheet-allergens", "sheet-kcal"]) await expect(sheet.getByTestId(id)).toHaveCount(0);
  await expect(sheet).not.toContainText(/\b0 kcal\b/);
});

test("back button closes the sheet and stays on the menu", async ({ page }) => {
  await openMenu(page);
  await openRow(page, "caramel-macchiato");
  await page.goBack();
  await expect(page.getByTestId("product-sheet")).toHaveCount(0);
  expect(new URL(page.url()).pathname).toBe("/qr");
});

test("closing with × leaves no extra history entry", async ({ page }) => {
  await openMenu(page);
  await openRow(page, "cortado");
  await page.getByTestId("product-sheet").getByRole("button", { name: "Kapat" }).click();
  await expect(page.getByTestId("product-sheet")).toHaveCount(0);
  await openRow(page, "cortado");
  await page.goBack();
  await expect(page.getByTestId("product-sheet")).toHaveCount(0);
  expect(new URL(page.url()).pathname).toBe("/qr");
});

test("Escape closes the sheet and focus stays inside while open", async ({ page }) => {
  await openMenu(page);
  await openRow(page, "cortado");
  const sheet = page.getByTestId("product-sheet");
  for (let i = 0; i < 4; i++) await page.keyboard.press("Tab");
  expect(await sheet.evaluate((el) => el.contains(document.activeElement))).toBe(true);
  await page.keyboard.press("Escape");
  await expect(sheet).toHaveCount(0);
});

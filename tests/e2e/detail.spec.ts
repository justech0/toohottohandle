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
  await expect(sheet.getByTestId("sheet-size")).toHaveText(["Normal 210 ₺", "Büyük 230 ₺"]);
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

test("size buttons highlight the tapped size", async ({ page }) => {
  await openMenu(page);
  await openRow(page, "caramel-macchiato");
  const sizes = page.getByTestId("sheet-size");
  await expect(sizes.nth(0)).toHaveAttribute("aria-pressed", "true");
  await sizes.nth(1).click();
  await expect(sizes.nth(1)).toHaveAttribute("aria-pressed", "true");
  await expect(sizes.nth(0)).toHaveAttribute("aria-pressed", "false");
});

test("a single price shows plainly, without a starburst", async ({ page }) => {
  await openMenu(page);
  await openRow(page, "cortado");
  await expect(page.getByTestId("sheet-price")).toHaveText("170 ₺");
  await expect(page.locator(".sheet__star, .star__bg")).toHaveCount(0);
  await expect(page.getByTestId("sheet-size")).toHaveCount(0);
});

test("the panel takes the group color", async ({ page }) => {
  await openMenu(page);
  const colors = () => page.getByTestId("sheet-panel").evaluate((el) => [getComputedStyle(el).backgroundColor, getComputedStyle(el).color]);
  await openRow(page, "caramel-macchiato");
  expect(await colors()).toEqual(["rgb(220, 37, 36)", "rgb(255, 255, 255)"]);
  await page.getByTestId("product-sheet").getByRole("button", { name: "Kapat" }).click();
  await openRow(page, "cheesecake");
  expect(await colors()).toEqual(["rgb(221, 187, 209)", "rgb(42, 21, 20)"]);
});

test("shows the allergen note when no allergens are entered", async ({ page }) => {
  await openMenu(page);
  await openRow(page, "cortado");
  await expect(page.getByTestId("product-sheet")).toContainText("Alerjen bilgisi için ekibimize sorabilirsin.");
});

test("photo products show watermark ornament, non-photo products show large header icon", async ({ page }) => {
  await openMenu(page);
  // Non-photo product (cortado)
  await openRow(page, "cortado");
  const sheet = page.getByTestId("product-sheet");
  await expect(sheet.locator(".sheet__icon:not(.sheet__icon--watermark)")).toHaveCount(1);
  await expect(sheet.locator(".sheet__icon--watermark")).toHaveCount(0);
  await sheet.getByRole("button", { name: "Kapat" }).click();

  // Photo product (ube-latte has a real photo)
  await openRow(page, "ube-latte");
  await expect(sheet.locator(".sheet__icon--watermark")).toHaveCount(1);
  await expect(sheet.locator(".sheet__icon:not(.sheet__icon--watermark)")).toHaveCount(0);
});

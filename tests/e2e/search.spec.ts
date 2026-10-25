import { test, expect } from "@playwright/test";
import { openMenu } from "./helpers/menu";

test.beforeEach(async ({ page }) => {
  await openMenu(page);
  await page.getByRole("button", { name: "Ara" }).click();
});

test("finds pistachio products with Turkish letters", async ({ page }) => {
  await page.getByRole("searchbox", { name: "Ürün ara" }).fill("fıstık");
  const rows = page.getByTestId("search-panel").getByTestId("product-row");
  await expect(rows).toHaveCount(3);
  const slugs = await rows.evaluateAll((els) => els.map((e) => e.getAttribute("data-slug")).sort());
  expect(slugs).toEqual(["fistikli-cheesecake", "fistikli-cookie", "fistikli-magnolia"]);
});

test("finds iced drinks with capital İ", async ({ page }) => {
  await page.getByRole("searchbox", { name: "Ürün ara" }).fill("İCE");
  await expect(page.getByTestId("search-panel").locator('[data-slug="iced-latte"]')).toBeVisible();
});

test("shows the friendly empty message and clears", async ({ page }) => {
  const box = page.getByRole("searchbox", { name: "Ürün ara" });
  await box.fill("xyzq");
  await expect(page.getByTestId("search-empty")).toHaveText("Aradığını bulamadık. Ekibimiz sana yardımcı olabilir.");
  await page.getByRole("button", { name: "Aramayı temizle" }).click();
  await expect(box).toHaveValue("");
});

test("Escape closes the search panel", async ({ page }) => {
  await page.keyboard.press("Escape");
  await expect(page.getByTestId("search-panel")).toHaveCount(0);
});

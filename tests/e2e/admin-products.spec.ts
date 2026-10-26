import { test, expect } from "@playwright/test";
import { signIn } from "./helpers/admin";

/** admin-auth.spec.ts'ten sonra koşar (admin hesabı orada açılır). Veritabanlı sunucu gerekir. */
test.skip(!process.env.E2E_DB, "veritabanlı sunucu gerekli");
test.describe.configure({ mode: "serial" });

const menuPrice = async (page: import("@playwright/test").Page, slug: string) => {
  await page.goto("/qr");
  return page.locator(`[data-testid="product-row"][data-slug="${slug}"] [data-testid="price-full"]`).first().textContent();
};

test("search narrows the admin list", async ({ page }) => {
  await signIn(page);
  await page.getByRole("link", { name: "Ürünler ve fiyatlar" }).click();
  await page.getByPlaceholder("Ürün ara").fill("corta");
  await expect(page.getByTestId("admin-product").filter({ visible: true })).toHaveCount(1);
  await expect(page.getByTestId("admin-product").filter({ visible: true })).toContainText("Cortado");
});

test("a bad price shows an error and keeps what was typed", async ({ page }) => {
  await signIn(page);
  await page.goto("/qr/admin/urunler");
  await page.getByTestId("admin-product").filter({ hasText: "Cortado" }).click();
  await page.getByLabel("Ürün adı").fill("Cortado Yeni");
  await page.getByLabel("Fiyat (₺)").fill("abc");
  await page.getByRole("button", { name: "Kaydet" }).click();
  await expect(page.getByTestId("form-error")).toHaveText("Fiyat bir sayı olmalı (ör. 180 ya da 176,50).");
  await expect(page.getByLabel("Ürün adı")).toHaveValue("Cortado Yeni");
});

test("price change asks first, then shows on the public menu at once", async ({ page }) => {
  await signIn(page);
  await page.goto("/qr/admin/urunler");
  await page.getByTestId("admin-product").filter({ hasText: "Cortado" }).click();
  await page.getByLabel("Fiyat (₺)").fill("185");
  await page.getByRole("button", { name: "Kaydet" }).click();
  await expect(page.getByTestId("price-confirm")).toContainText("170 ₺ → 185 ₺");
  await page.getByRole("button", { name: "Evet, kaydet" }).click();
  await expect(page.getByRole("status")).toContainText("Kaydedildi");
  await expect(page.getByTestId("admin-product").filter({ hasText: "Cortado" })).toContainText("185 ₺");
  expect(await menuPrice(page, "cortado")).toContain("185");
});

test("undo puts the last change back and then turns itself off", async ({ page }) => {
  await signIn(page);
  await expect(page.getByTestId("last-change")).toHaveText("Cortado: 170 ₺ → 185 ₺");
  await page.getByTestId("undo").click();
  await expect(page.getByRole("status")).toContainText("geri alındı");
  await expect(page.getByTestId("undo")).toBeDisabled();
  expect(await menuPrice(page, "cortado")).toContain("170");
});

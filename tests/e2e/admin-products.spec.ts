import { test, expect } from "@playwright/test";
import { signIn } from "./helpers/admin";

/** admin-auth.spec.ts'ten sonra koşar (admin hesabı orada açılır). Veritabanlı sunucu gerekir. */
test.skip(!process.env.E2E_DB, "veritabanlı sunucu gerekli");
test.describe.configure({ mode: "serial" });

const menuPrice = async (page: import("@playwright/test").Page, slug: string) => {
  await page.goto("/qr");
  return page.locator(`[data-testid="product-row"][data-slug="${slug}"] [data-testid="price-full"]`).first().textContent();
};

const adminRow = (page: import("@playwright/test").Page, name: string) =>
  page.locator("[data-product-id]").filter({ hasText: name }).first();

const rowId = async (page: import("@playwright/test").Page, name: string) => {
  const value = await adminRow(page, name).getAttribute("data-product-id");
  if (!value) throw new Error(`${name} ürün kimliği bulunamadı`);
  return value;
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

test("sold-out choices show the opening target and the product can return to sale", async ({ page }) => {
  await signIn(page);
  await page.goto("/qr/admin/urunler");
  const id = await rowId(page, "Cortado");
  await page.getByTestId(`product-soldout-${id}`).click();
  const dialog = page.getByRole("dialog", { name: "Cortado tükendi" });
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText("Yarın 08:00'e kadar");
  await expect(dialog).toContainText("Ben açana kadar");
  await dialog.getByRole("button", { name: "Yarın 08:00'e kadar" }).click();
  await expect(page.getByRole("status")).toContainText("Tükendi bilgisi güncellendi");
  await page.goto("/qr");
  await expect(page.locator('[data-testid="product-row"][data-slug="cortado"]')).toContainText("Tükendi");

  await page.goto("/qr/admin/urunler");
  await page.getByTestId(`product-soldout-${id}`).click();
  await expect(page.getByRole("status")).toContainText("tekrar satışta");
  expect(await menuPrice(page, "cortado")).toContain("170");
});

test("visibility switch removes and restores the product with one touch", async ({ page }) => {
  await signIn(page);
  await page.goto("/qr/admin/urunler");
  const id = await rowId(page, "Cortado");
  await page.getByTestId(`product-visible-${id}`).click();
  await expect(page.getByTestId(`product-visible-${id}`)).toHaveAttribute("aria-checked", "false");
  await page.goto("/qr");
  await expect(page.locator('[data-testid="product-row"][data-slug="cortado"]')).toHaveCount(0);
  await page.goto("/qr/admin/urunler");
  await page.getByTestId(`product-visible-${id}`).click();
  await expect(page.getByTestId(`product-visible-${id}`)).toHaveAttribute("aria-checked", "true");
});

test("adds and duplicates a product", async ({ page }) => {
  await signIn(page);
  await page.goto("/qr/admin/urunler");
  await page.getByTestId("product-add").click();
  await page.getByLabel("Ürün adı").fill("Test Kakaosu");
  await page.getByLabel("Fiyat (₺)").fill("175");
  await page.getByRole("button", { name: "Kaydet" }).click();
  await expect(page.getByRole("status")).toContainText("Ürün eklendi");
  const id = await rowId(page, "Test Kakaosu");
  await page.getByTestId(`product-duplicate-${id}`).click();
  await expect(page.getByRole("status")).toContainText("Ürün çoğaltıldı");
  await expect(adminRow(page, "Test Kakaosu Kopya")).toContainText("175 ₺");
});

test("moves inside a category and undo restores the order", async ({ page }) => {
  await signIn(page);
  await page.goto("/qr/admin/urunler");
  const rows = page.locator("[data-cat]").first().locator("[data-product-id]");
  const first = await rows.nth(0).getAttribute("data-product-id");
  const second = await rows.nth(1).getAttribute("data-product-id");
  if (!first || !second) throw new Error("Sıralama için iki ürün bulunamadı");
  await page.getByTestId(`product-down-${first}`).click();
  const moved = page.locator("[data-cat]").first().locator("[data-product-id]");
  await expect(moved.nth(0)).toHaveAttribute("data-product-id", second);
  await expect(moved.nth(1)).toHaveAttribute("data-product-id", first);
  await page.goto("/qr/admin");
  await page.getByTestId("undo").click();
  await expect(page.getByRole("status")).toContainText("geri alındı");
  await page.goto("/qr/admin/urunler");
  const restored = page.locator("[data-cat]").first().locator("[data-product-id]");
  await expect(restored.nth(0)).toHaveAttribute("data-product-id", first);
  await expect(restored.nth(1)).toHaveAttribute("data-product-id", second);
});

test("delete uses an in-page dialog and undo restores the copied product", async ({ page }) => {
  await signIn(page);
  await page.goto("/qr/admin/urunler");
  const id = await rowId(page, "Test Kakaosu Kopya");
  await page.getByTestId(`product-delete-${id}`).click();
  const dialog = page.getByRole("dialog", { name: "Test Kakaosu Kopya silinsin mi?" });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Evet, sil" }).click();
  await expect(page.getByRole("status")).toContainText("Ürün silindi");
  await expect(page.locator(`[data-product-id="${id}"]`)).toHaveCount(0);
  await page.goto("/qr/admin");
  await page.getByTestId("undo").click();
  await expect(page.getByRole("status")).toContainText("geri alındı");
  await page.goto("/qr/admin/urunler");
  await expect(page.locator(`[data-product-id="${id}"]`)).toContainText("175 ₺");
});

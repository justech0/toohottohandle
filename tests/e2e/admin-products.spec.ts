import { test, expect } from "@playwright/test";
import path from "node:path";
import sharp from "sharp";
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

test("390px product controls keep accessible contrast, targets, and keyboard focus", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await signIn(page);
  await page.goto("/qr/admin/urunler");

  const add = page.getByTestId("product-add");
  const contrast = await add.evaluate((element) => {
    const rgb = (value: string) => value.match(/[\d.]+/g)!.slice(0, 3).map(Number);
    const luminance = (value: string) => {
      const channels = rgb(value).map((channel) => {
        const normalized = channel / 255;
        return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
    };
    const style = getComputedStyle(element);
    const lighter = Math.max(luminance(style.color), luminance(style.backgroundColor));
    const darker = Math.min(luminance(style.color), luminance(style.backgroundColor));
    return (lighter + 0.05) / (darker + 0.05);
  });
  expect(contrast).toBeGreaterThanOrEqual(4.5);
  expect((await add.boundingBox())!.height).toBeGreaterThanOrEqual(44);

  const operationButtons = page.locator(".adm-op");
  await expect(operationButtons.first()).toBeVisible();
  const operationHeights = await operationButtons.filter({ visible: true }).evaluateAll((buttons) =>
    buttons.map((button) => button.getBoundingClientRect().height),
  );
  expect(operationHeights.length).toBeGreaterThan(0);
  expect(Math.min(...operationHeights)).toBeGreaterThanOrEqual(44);

  const crumb = page.locator(".adm-crumb a");
  expect((await crumb.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  await crumb.focus();
  await expect(crumb).toBeFocused();
  expect(await crumb.evaluate((element) => {
    const style = getComputedStyle(element);
    return [style.outlineWidth, style.outlineStyle, style.outlineOffset, style.outlineColor];
  })).toEqual(["2px", "solid", "2px", "rgb(42, 21, 20)"]);

  await add.focus();
  await expect(add).toBeFocused();
  expect(await add.evaluate((element) => {
    const style = getComputedStyle(element);
    return [style.outlineWidth, style.outlineStyle, style.outlineOffset, style.outlineColor];
  })).toEqual(["2px", "solid", "2px", "rgb(255, 255, 255)"]);
});

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

test("uploads a JPEG, saves its focus, serves immutable WebP, then removes it", async ({ page }) => {
  await signIn(page);
  await page.goto("/qr/admin/urunler");
  await page.getByTestId("admin-product").filter({ hasText: "Cortado" }).click();
  await page.getByLabel("Fotoğraf seç").setInputFiles(path.join(process.cwd(), "public/yakinda/assets/og.jpg"));
  await expect(page.getByRole("status")).toContainText("Fotoğraf hazır");
  const preview = page.getByTestId("photo-focus");
  const box = (await preview.boundingBox())!;
  await preview.click({ position: { x: box.width * 0.25, y: box.height * 0.7 } });
  await page.getByRole("button", { name: "Kaydet" }).click();
  await expect(page.getByRole("status")).toContainText("Kaydedildi");

  await page.goto("/qr");
  const image = page.locator('[data-testid="product-row"][data-slug="cortado"] .card__img');
  const src = await image.getAttribute("src");
  expect(src).toMatch(/^\/qr\/foto\/[a-f0-9]{64}-320\.webp$/);
  expect(await image.evaluate((node) => getComputedStyle(node).objectPosition)).not.toBe("50% 50%");
  const response = await page.request.get(src!);
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("image/webp");
  expect(response.headers()["cache-control"]).toBe("public, max-age=31536000, immutable");
  const large = await page.request.get(src!.replace("-320.webp", "-1280.webp"));
  const largeBytes = await large.body();
  expect(largeBytes.byteLength).toBeLessThanOrEqual(400_000);
  const metadata = await sharp(largeBytes).metadata();
  expect(metadata).toMatchObject({ format: "webp" });
  expect(Math.max(metadata.width!, metadata.height!)).toBeLessThanOrEqual(1280);
  expect(metadata.exif).toBeUndefined();

  await page.goto("/qr/admin/urunler");
  await page.getByTestId("admin-product").filter({ hasText: "Cortado" }).click();
  await page.getByRole("button", { name: "Fotoğrafı sil" }).click();
  await page.getByRole("button", { name: "Kaydet" }).click();
  await expect(page.getByRole("status")).toContainText("Kaydedildi");
  await page.goto("/qr");
  await expect(page.locator('[data-testid="product-row"][data-slug="cortado"] .card__img')).toHaveCount(0);
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

  await page.getByTestId(`product-delete-${id}`).click();
  await page.getByRole("dialog", { name: "Test Kakaosu Kopya silinsin mi?" }).getByRole("button", { name: "Evet, sil" }).click();
  await expect(page.locator(`[data-product-id="${id}"]`)).toHaveCount(0);

  const originalId = await rowId(page, "Test Kakaosu");
  await page.getByTestId(`product-delete-${originalId}`).click();
  await page.getByRole("dialog", { name: "Test Kakaosu silinsin mi?" }).getByRole("button", { name: "Evet, sil" }).click();
  await expect(page.locator(`[data-product-id="${originalId}"]`)).toHaveCount(0);
});

import { expect, test } from "@playwright/test";
import { signIn, selectBrand } from "./helpers/admin";

test.skip(!process.env.E2E_DB, "veritabanlı sunucu gerekli");
test.describe.configure({ mode: "serial" });

const espressoPrice = (page: import("@playwright/test").Page) =>
  page.locator('[data-testid="product-row"][data-slug="espresso"] [data-testid="price-full"]').first();

test("previews and applies a category price change, undoes it, and restores its copy", async ({ page }) => {
  await signIn(page);
  await page.getByRole("link", { name: "Toplu fiyat" }).click();
  await selectBrand(page, "scope", "category");
  await selectBrand(page, "scopeId", "1");
  await selectBrand(page, "mode", "percent");
  await page.locator('input[name="amount"]').fill("10");
  await selectBrand(page, "rounding", "none");
  await page.getByRole("button", { name: "Önizle" }).click();

  const row = page.getByTestId("bulk-row").filter({ hasText: "Espresso" });
  await expect(row).toContainText("Tek 110 ₺ · Duble 150 ₺");
  await expect(row).toContainText("Tek 121 ₺ · Duble 165 ₺");
  await page.getByRole("button", { name: "Uygula" }).click();
  await page.waitForURL(/\/qr\/admin\?toplu=uygulandi/);
  await expect(page.getByTestId("last-change")).toContainText("toplu güncellendi");

  await page.goto("/qr");
  await expect(espressoPrice(page)).toContainText("121 ₺");
  await page.goto("/qr/admin");
  await page.getByTestId("undo").click();
  await page.waitForURL(/\/qr\/admin\?geri=1/);
  await page.goto("/qr");
  await expect(espressoPrice(page)).toContainText("110 ₺");

  await page.goto("/qr/admin");
  await page.getByRole("link", { name: "Loglar" }).click();
  await expect(page.getByText("Fiyat değişikliği öncesi menü", { exact: true }).first()).toBeVisible();
  await page.getByRole("button", { name: "Bu kopyaya dön" }).first().click();
  await page.getByRole("dialog").getByRole("button", { name: "Evet, bu kopyaya dön" }).click();
  await expect(page.getByRole("status")).toContainText("WiFi bilgileri değiştirilmedi");
});

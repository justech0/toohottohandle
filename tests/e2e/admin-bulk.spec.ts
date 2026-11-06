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
  const row = page.getByTestId("bulk-row").filter({ has: page.getByRole("rowheader", { name: "Espresso", exact: true }) });
  // Tüm fiyatlar önizlemeden önce de listede.
  await expect(row).toContainText("Tek 110 ₺ · Duble 150 ₺");
  await expect(page.getByRole("rowheader", { name: "Cheesecake", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Önizle" }).click();

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

test("imports products from CSV, reports skipped rows and created categories, and undoes the import", async ({ page }) => {
  await signIn(page);
  await page.getByRole("link", { name: "Toplu ürün yükle" }).click();
  await expect(page).toHaveURL("/qr/admin/toplu-urun");

  const csvContent = [
    "category_name,product_name,description,price,image_url,sort_order",
    "Sıcak Kahveler,E2E Toplu Kahve,Kavrulmuş fındık notalı,185,,",
    "E2E Yeni Kategori,E2E Özel İçecek,Taze naneli,210,,1",
    ",Bozuk Satır,Açıklama,150,,",
  ].join("\n");

  await page.locator('input[type="file"]').setInputFiles({
    name: "urunler.csv",
    mimeType: "text/csv",
    buffer: Buffer.from(csvContent, "utf-8"),
  });
  await page.getByRole("button", { name: "İçe Aktar" }).click();

  await expect(page.getByRole("status")).toContainText("İçe aktarma tamamlandı.");
  const results = page.getByTestId("import-results");
  await expect(results).toContainText("Okunan satır: 3");
  await expect(results).toContainText("Eklenen ürün: 2");
  await expect(results).toContainText("Yeni kategoriler: E2E Yeni Kategori");
  await expect(page.getByTestId("import-skipped")).toContainText("Satır 3: kategori veya ürün adı eksik.");

  await page.goto("/qr/admin");
  await expect(page.getByTestId("last-change")).toContainText("2 ürün toplu yüklendi");
  await page.getByTestId("undo").click();
  await page.waitForURL(/\/qr\/admin\?geri=1/);
});

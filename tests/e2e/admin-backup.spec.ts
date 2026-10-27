import { expect, test } from "@playwright/test";
import { unzipSync, strFromU8 } from "fflate";
import { signIn } from "./helpers/admin";

test.skip(!process.env.E2E_DB, "veritabanlı sunucu gerekli");
test.describe.configure({ mode: "serial" });

const espressoPrice = (page: import("@playwright/test").Page) =>
  page.locator('[data-testid="product-row"][data-slug="espresso"] [data-testid="price-full"]').first();

test("downloads a STORE backup, leaves the menu untouched after an image failure, then restores it", async ({ page }) => {
  await signIn(page);
  await page.goto("/qr/admin/yedek");
  await expect(page.getByText("Bilgisayardan almak daha hızlıdır")).toBeVisible();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Yedek indir" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^thth-menu-\d{4}-\d{2}-\d{2}\.zip$/);
  const path = await download.path();
  expect(path).toBeTruthy();
  const bytes = new Uint8Array(await (await import("node:fs/promises")).readFile(path!));
  const entries = unzipSync(bytes);
  const backup = JSON.parse(strFromU8(entries["menu.json"]));
  expect(backup.version).toBe(1);
  expect(Object.keys(entries).filter((name) => name.startsWith("photos/"))).toHaveLength(backup.images.length);

  await page.goto("/qr/admin/toplu-fiyat");
  await page.locator('select[name="scopeId"]').selectOption("1");
  await page.locator('input[name="amount"]').fill("10");
  await page.getByRole("button", { name: "Önizle" }).click();
  await page.getByRole("button", { name: "Uygula" }).click();
  await page.waitForURL(/toplu=uygulandi/);

  await page.goto("/qr/admin/yedek");
  const backupInput = page.getByLabel("ZIP yedeği");
  await expect(backupInput).toBeEnabled();
  await backupInput.setInputFiles(path!);
  await expect(page.getByTestId("backup-summary")).toContainText(`${backup.data.products.length} ürün`);
  await expect(page.getByTestId("backup-summary")).toContainText(`${backup.images.length} fotoğraf`);

  let failed = false;
  await page.route("**/qr/api/admin/restore-image", async (route) => {
    if (!failed) {
      failed = true;
      await route.fulfill({ status: 500, contentType: "application/json", body: JSON.stringify({ error: "test" }) });
    } else await route.continue();
  });
  await page.getByRole("button", { name: "Onayla ve geri yükle" }).click();
  await expect(page.locator(".adm-error")).toContainText("Fotoğraflar yüklenemedi. Menü değiştirilmedi.");
  const menu = await page.context().newPage();
  await menu.goto("/qr");
  await expect(espressoPrice(menu)).toContainText("121 ₺");
  await menu.close();

  await page.unroute("**/qr/api/admin/restore-image");
  await page.getByRole("button", { name: "Onayla ve geri yükle" }).click();
  await expect(page.getByRole("status")).toContainText("Yedek geri yüklendi. WiFi bilgileri değiştirilmedi.");
  await page.goto("/qr");
  await expect(espressoPrice(page)).toContainText("110 ₺");
  await page.goto("/qr/admin");
  await expect(page.getByText("Son yedek: 0 gün önce")).toBeVisible();
});

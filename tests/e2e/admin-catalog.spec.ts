import { expect, test } from "@playwright/test";
import { signIn } from "./helpers/admin";

test.skip(!process.env.E2E_DB, "veritabanlı sunucu gerekli");
test.describe.configure({ mode: "serial" });

test("admin sees the seed WiFi warning and can edit catalog/settings", async ({ page }) => {
  await signIn(page);
  await expect(page.getByText("WiFi test bilgisi kullanılıyor", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Katalog ve ayarlar" }).click();

  const group = page.getByTestId("group-form-1");
  await group.getByLabel("Grup adı").fill("Kahve & Espresso");
  await group.getByRole("button", { name: "Grubu kaydet" }).click();
  await page.waitForURL(/#group-1$/);

  await page.getByLabel("Yeni etiket").fill("FAVORİ");
  await page.getByRole("button", { name: "Etiket ekle" }).click();
  await expect(page.getByText("FAVORİ", { exact: true })).toBeVisible();

  await page.goto("/qr/admin/istatistik#settings");
  const settings = page.getByTestId("settings-form");
  await settings.getByLabel("Ağ adı").fill("CAFE WIFI");
  await settings.getByLabel("Kullanıcı adı").fill("misafir");
  await settings.getByLabel("Yeni WiFi şifresi").fill("e2e-wifi-987");
  await settings.getByRole("button", { name: "Ayarları kaydet" }).click();
  await page.waitForURL(/istatistik\?kaydedildi=1#settings$/);
  await page.goto("/qr/admin");
  await expect(page.getByText("WiFi test bilgisi kullanılıyor", { exact: true })).toHaveCount(0);
  await expect(page.getByTestId("last-change")).toContainText("WiFi şifresi değiştirildi");

  await page.getByRole("link", { name: "Katalog ve ayarlar" }).click();
  const restoredGroup = page.getByTestId("group-form-1");
  await restoredGroup.getByLabel("Grup adı").fill("Kahve");
  await restoredGroup.getByRole("button", { name: "Grubu kaydet" }).click();
  await page.waitForURL(/#group-1$/);
  await page.goto("/qr/admin/istatistik#settings");
  const restoredSettings = page.getByTestId("settings-form");
  await restoredSettings.getByLabel("Ağ adı").fill("HOT | WIFI");
  await restoredSettings.getByLabel("Kullanıcı adı").fill("test");
  await restoredSettings.getByLabel("Yeni WiFi şifresi").fill("test1234");
  await restoredSettings.getByRole("button", { name: "Ayarları kaydet" }).click();
  await page.waitForURL(/istatistik\?kaydedildi=1#settings$/);
});

test("product form saves tags and public detail reads them", async ({ page }) => {
  await signIn(page);
  await page.goto("/qr/admin/urunler");
  await page.getByTestId("admin-product").filter({ hasText: "Cortado" }).click();
  await page.getByLabel("VEGAN").check();
  await page.getByLabel("FAVORİ").check();
  await page.getByRole("button", { name: "Kaydet" }).click();
  await page.waitForURL(/\/qr\/admin\/urunler\?kaydedildi=/);
  await page.goto("/qr");
  await page.getByTestId("product-row").filter({ hasText: "Cortado" }).click();
  await expect(page.getByTestId("product-tags")).toContainText("VEGAN");
  await expect(page.getByTestId("product-tags")).toContainText("FAVORİ");
  await page.goto("/qr/admin");
  await page.getByTestId("undo").click();
  await expect(page.getByRole("status")).toContainText("geri alındı");
});

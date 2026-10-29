import { chromium } from "@playwright/test";

const BASE_URL = "http://localhost:3105";

async function run() {
  const browser = await chromium.launch();

  // 1. Mobile (390x844)
  {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
    await page.goto(`${BASE_URL}/qr/admin/giris`);
    await page.getByLabel("E-posta").fill("admin@test.kafe");
    await page.getByLabel("Şifre").fill("e2e-test-sifre-2026");
    await page.getByRole("button", { name: "Giriş yap" }).click();
    await page.waitForURL(/\/qr\/admin$/);
    await page.waitForTimeout(500);
    await page.screenshot({ path: "screens/admin-390.png", fullPage: true });

    await page.goto(`${BASE_URL}/qr/admin/urunler`, { waitUntil: "networkidle" });
    await page.waitForTimeout(500);
    await page.screenshot({ path: "screens/admin-products-390.png", fullPage: true });
    await page.close();
  }

  // 2. Desktop (1440x900)
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
    await page.goto(`${BASE_URL}/qr/admin/giris`);
    await page.getByLabel("E-posta").fill("admin@test.kafe");
    await page.getByLabel("Şifre").fill("e2e-test-sifre-2026");
    await page.getByRole("button", { name: "Giriş yap" }).click();
    await page.waitForURL(/\/qr\/admin$/);
    await page.waitForTimeout(500);
    await page.screenshot({ path: "screens/admin-1440.png", fullPage: true });

    await page.goto(`${BASE_URL}/qr/admin/urunler`, { waitUntil: "networkidle" });
    await page.waitForTimeout(500);
    await page.screenshot({ path: "screens/admin-products-1440.png", fullPage: true });
    await page.close();
  }

  await browser.close();
  console.log("Screenshots captured successfully!");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});


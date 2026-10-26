import { test, expect } from "@playwright/test";
import { openMenu } from "./helpers/menu";

const openWifi = (page: import("@playwright/test").Page) => page.getByRole("button", { name: "WiFi", exact: true }).click();

test("wifi card drops down from the top with network details", async ({ page }) => {
  await openMenu(page);
  await openWifi(page);
  const card = page.getByTestId("wifi-card");
  await expect(card).toBeVisible();
  const box = (await card.boundingBox())!;
  expect(box.y).toBeLessThan(844 / 2);
  await expect(card).toContainText("HOT | WIFI");
  await expect(card.getByTestId("wifi-username")).toHaveText("test");
  await expect(card.getByTestId("wifi-password")).toHaveText("test1234");
  await expect(card).toContainText("HOT | WIFI ağına bağlanın. Açılan giriş ekranına bu bilgileri yazın.");
});

test("copies the username and confirms", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await openMenu(page);
  await openWifi(page);
  const btn = page.getByTestId("copy-username");
  await btn.click();
  await expect(btn).toHaveText("Kopyalandı");
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe("test");
});

test("falls back to selecting the text when clipboard is refused", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", { value: { writeText: () => Promise.reject(new Error("denied")) }, configurable: true });
  });
  await openMenu(page);
  await openWifi(page);
  await page.getByTestId("copy-password").click();
  await expect(page.getByTestId("wifi-card")).toContainText("Kopyalanamadı. Metne basılı tutup kopyalayın.");
  expect(await page.evaluate(() => window.getSelection()?.toString())).toBe("test1234");
});

test("tapping outside closes the card", async ({ page }) => {
  await openMenu(page);
  await openWifi(page);
  await expect(page.getByTestId("wifi-card")).toBeVisible();
  await page.mouse.click(200, 800);
  await expect(page.getByTestId("wifi-card")).toHaveCount(0);
});

test("the card has a 44px close button", async ({ page }) => {
  await openMenu(page);
  await openWifi(page);
  const close = page.getByTestId("wifi-card").getByRole("button", { name: "Kapat" });
  expect(Math.round((await close.boundingBox())!.height)).toBeGreaterThanOrEqual(44);
  await close.click();
  await expect(page.getByTestId("wifi-card")).toHaveCount(0);
  expect(new URL(page.url()).pathname).toBe("/qr");
});

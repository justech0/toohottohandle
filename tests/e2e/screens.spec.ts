import { test } from "@playwright/test";
import { openMenu } from "./helpers/menu";

const sizes = [
  { name: "390", width: 390, height: 844 },
  { name: "768", width: 768, height: 1024 },
  { name: "1440", width: 1440, height: 900 },
];

for (const s of sizes) {
  test(`screens ${s.name}`, async ({ page }) => {
    await page.setViewportSize({ width: s.width, height: s.height });
    await openMenu(page);
    await page.screenshot({ path: `screens/menu-${s.name}.png` });
    await page.locator('[data-slug="caramel-macchiato"] button').click();
    await page.getByTestId("product-sheet").waitFor();
    await page.waitForTimeout(400);
    await page.screenshot({ path: `screens/detail-${s.name}.png` });
  });
}

test("screens Ne içsem 390", async ({ page }) => {
  await openMenu(page);
  await page.getByTestId("neicsem-tile").click();
  await page.getByTestId("neicsem-name").first().waitFor({ timeout: 4000 });
  await page.screenshot({ path: "screens/neicsem-390.png" });
});

test("screens wifi and intro 390", async ({ page }) => {
  await openMenu(page);
  await page.getByRole("button", { name: "WiFi", exact: true }).click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: "screens/wifi-390.png" });
  const fresh = await page.context().browser()!.newPage({ viewport: { width: 390, height: 844 } });
  await fresh.goto("/qr", { waitUntil: "commit" });
  await fresh.getByTestId("intro").waitFor();
  await fresh.waitForTimeout(550);
  await fresh.screenshot({ path: "screens/intro-390.png" });
  await fresh.close();
});

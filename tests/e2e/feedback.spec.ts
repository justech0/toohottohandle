import { expect, test } from "@playwright/test";
import { openMenu } from "./helpers/menu";
import { signIn } from "./helpers/admin";
import sharp from "sharp";

test("feedback sheet respects back, focus, keyboard and mobile width", async ({ page }) => {
  await openMenu(page);
  const trigger = page.getByTestId("feedback-open");
  await trigger.click();
  const sheet = page.getByTestId("feedback-sheet");
  await expect(sheet).toBeVisible();
  await expect(page.getByRole("button", { name: "Kapat", exact: true })).toBeFocused();
  await page.goBack();
  await expect(sheet).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await trigger.click();
  await page.getByRole("radio", { name: "Lezzet ve kalite", exact: true }).check();
  await page.getByRole("radio", { name: "5 puan" }).check();
  await page.getByLabel("Mesajın", { exact: true }).fill("Görüşümü paylaşmak istiyorum.");
  await expect(page.locator('.feedback-rating label[data-selected="true"]').last()).toHaveCSS("background-color", "rgb(220, 37, 36)");
  await expect(page.getByTestId("feedback-celebration")).toHaveCount(0);
  await expect(page.getByLabel("Adın", { exact: false })).not.toHaveAttribute("placeholder", /Misafir/);
  await expect(page.getByLabel("Mesajın", { exact: true })).toHaveAttribute("placeholder", "Neyi sevdin veya neleri daha iyi yapabiliriz?");
  await expect(page.locator("body")).toHaveJSProperty("scrollWidth", 390);
  await page.screenshot({ path: ".superpowers/feedback-form-mobile-v2.png" });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({ path: ".superpowers/feedback-form-desktop-v2.png" });
  await page.keyboard.press("Escape");
  await expect(sheet).toHaveCount(0);
});

test("private feedback goes from menu to admin; photo is protected, read and deletion work", async ({ page, request }) => {
  test.skip(!process.env.E2E_DB, "veritabanlı sunucu gerekli");
  await openMenu(page);
  await page.getByTestId("feedback-open").click();
  await page.getByRole("radio", { name: "Lezzet ve kalite", exact: true }).check();
  await page.getByRole("radio", { name: "4 puan" }).check();
  const message = `E2E geri bildirim ${Date.now()}`;
  await page.getByLabel("Mesajın", { exact: true }).fill(message);
  await page.getByLabel("Adın", { exact: false }).fill("Test Misafir");
  await page.getByLabel("Telefon veya e-posta", { exact: false }).fill("gecersiz");
  await page.getByRole("button", { name: "Ekibe gönder" }).click();
  await expect(page.getByTestId("feedback-sheet").getByRole("alert")).toContainText("Geçerli bir telefon veya e-posta yaz.");
  await expect(page.getByLabel("Mesajın", { exact: true })).toHaveValue(message);
  await expect(page.getByLabel("Adın", { exact: false })).toHaveValue("Test Misafir");
  await page.getByLabel("Telefon veya e-posta", { exact: false }).fill("misafir@example.com");
  await page.getByLabel("Fotoğraf", { exact: false }).setInputFiles({ name: "test.png", mimeType: "image/png", buffer: await sharp({ create: { width: 40, height: 40, channels: 3, background: "red" } }).png().toBuffer() });
  await expect(page.getByAltText("Seçtiğin fotoğrafın önizlemesi")).toBeVisible();
  await expect(page.getByText("test.png", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Ekibe gönder" }).click();
  await expect(page.getByRole("status")).toContainText("Görüşün yöneticilerimize ulaştı.");
  await page.getByRole("button", { name: "Menüye dön" }).click();
  await expect(page.getByText(message)).toHaveCount(0);
  await signIn(page);
  await expect(page.getByTestId("feedback-summary")).toContainText(message);
  await page.goto("/qr/admin/geri-bildirim");
  const entry = page.getByTestId("feedback-entry").filter({ hasText: message });
  await expect(entry).toContainText("Test Misafir");
  const imageUrl = await entry.getByRole("img").getAttribute("src");
  expect((await request.get(imageUrl!)).status()).toBe(401);
  expect((await page.request.get(imageUrl!)).status()).toBe(200);
  const key = imageUrl!.split("/").pop();
  expect((await request.get(`/qr/foto/${key}-720.webp`)).status()).toBe(404);
  await entry.getByRole("button", { name: "Okundu işaretle" }).click();
  await expect(entry).toContainText("Okundu");
  await entry.getByRole("button", { name: "Sil", exact: true }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Vazgeç" }).click();
  await expect(entry).toBeVisible();
  await entry.getByRole("button", { name: "Sil", exact: true }).click();
  await page.getByRole("button", { name: "Kalıcı olarak sil" }).click();
  await expect(entry).toHaveCount(0);
  expect((await page.request.get(imageUrl!)).status()).toBe(404);
});

for (const scenario of [
  { rating: 5, reduced: false, title: "TOOHOTT!" },
  { rating: 1, reduced: false, title: "Seni duyduk." },
  { rating: 5, reduced: true, title: "TOOHOTT!" },
]) {
  test(`receipt for ${scenario.rating} rabbits, reduced motion ${scenario.reduced}, appears only after successful submission`, async ({ page }) => {
    test.skip(!process.env.E2E_DB, "veritabanlı sunucu gerekli");
    if (scenario.reduced) await page.emulateMedia({ reducedMotion: "reduce" });
    await openMenu(page);
    await page.getByTestId("feedback-open").click();
    await page.getByRole("radio", { name: "Diğer", exact: true }).check();
    await page.getByRole("radio", { name: `${scenario.rating} puan`, exact: true }).check();
    await expect(page.getByTestId("feedback-receipt")).toHaveCount(0);
    await expect(page.getByTestId("feedback-celebration")).toHaveCount(0);
    await page.getByLabel("Mesajın", { exact: true }).fill(`Puanlı gönderim testi ${scenario.rating} ${scenario.reduced} ${Date.now()}`);
    await page.getByRole("button", { name: "Ekibe gönder" }).click();
    const receipt = page.getByTestId("feedback-receipt");
    await expect(receipt).toContainText(scenario.title);
    await expect(receipt).toContainText(/teşekkür/i);
    if (scenario.rating === 1) {
      await expect(receipt).toContainText("Daha iyi bir deneyim");
      await expect(page.getByTestId("feedback-celebration")).toHaveCount(0);
    } else {
      await expect(receipt.locator("h3")).toHaveCSS("animation-name", scenario.reduced ? "none" : "feedback-hot");
      await expect(page.getByTestId("feedback-celebration")).toHaveCSS("display", scenario.reduced ? "none" : "block");
    }
    if (!scenario.reduced) await page.screenshot({ path: `.superpowers/feedback-receipt-${scenario.rating}-v2.png` });
  });
}

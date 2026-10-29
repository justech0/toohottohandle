import { expect, test } from "@playwright/test";
import { signIn } from "./helpers/admin";

test.skip(!process.env.E2E_DB, "veritabanlı sunucu gerekli");
test.describe.configure({ mode: "serial" });

const hidePage = (page: import("@playwright/test").Page) => page.evaluate(() => {
  Object.defineProperty(document, "visibilityState", { configurable: true, value: "hidden" });
  Object.defineProperty(document, "hidden", { configurable: true, value: true });
  document.dispatchEvent(new Event("visibilitychange"));
});

test("counts one menu open per session, deduplicates details, and shows the admin report", async ({ page }) => {
  await page.addInitScript(() => {
    sessionStorage.setItem("thth-intro-seen", "1");
    const sendBeacon = navigator.sendBeacon.bind(navigator);
    navigator.sendBeacon = (url, data) => {
      if (String(url).endsWith("/qr/api/stats") && data instanceof Blob) {
        void data.text().then((text) => sessionStorage.setItem("thth-e2e-stats-payload", text));
      }
      return sendBeacon(url, data);
    };
  });
  await signIn(page);
  await page.goto("/qr/admin/istatistik");
  const before = Number(await page.getByTestId("stats-today").textContent());
  await page.goto("/qr");
  const cortado = page.getByTestId("product-row").filter({ hasText: "Cortado" });
  await cortado.click();
  await page.getByTestId("product-sheet").getByRole("button", { name: "Kapat" }).click();
  await cortado.click();
  await page.getByTestId("product-sheet").getByRole("button", { name: "Kapat" }).click();
  const beacon = page.waitForResponse((response) => response.url().endsWith("/qr/api/stats") && response.request().method() === "POST");
  await hidePage(page);
  expect((await beacon).status()).toBe(204);
  await expect.poll(() => page.evaluate(() => sessionStorage.getItem("thth-e2e-stats-payload"))).not.toBeNull();
  const payload = JSON.parse((await page.evaluate(() => sessionStorage.getItem("thth-e2e-stats-payload")))!);
  expect(payload).toMatchObject({ menuOpen: true });
  expect(payload.productIds).toHaveLength(1);

  await page.goto("/qr/admin/istatistik");
  await expect(page.getByTestId("stats-today")).toHaveText(String(before + 1));
  await expect(page.getByTestId("top-products")).toContainText("Cortado");
  await expect(page.getByRole("img", { name: "Saatlere göre menü açılışı" })).toBeVisible();

  await page.goto("/qr");
  await hidePage(page);
  await page.goto("/qr/admin/istatistik");
  await expect(page.getByTestId("stats-today")).toHaveText(String(before + 1));
});

test("does not send when disabled, returns 204, and downloads branded SVG", async ({ page }) => {
  await signIn(page);
  await page.goto("/qr/admin/istatistik#settings");
  const settings = page.getByTestId("settings-form");
  await settings.getByLabel("İstatistik açık").uncheck();
  await settings.getByRole("button", { name: "Ayarları kaydet" }).click();
  await page.waitForURL(/istatistik\?kaydedildi=1#settings$/);

  let sent = 0;
  page.on("request", (request) => { if (request.url().endsWith("/qr/api/stats")) sent++; });
  await page.addInitScript(() => sessionStorage.setItem("thth-intro-seen", "1"));
  await page.goto("/qr");
  await hidePage(page);
  expect(sent).toBe(0);
  const status = await page.evaluate(async () => (await fetch("/qr/api/stats", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ menuOpen: true, productIds: [] }),
  })).status);
  expect(status).toBe(204);

  await page.goto("/qr/admin/istatistik");
  await expect(page.getByText("İstatistik kapalı")).toBeVisible();
  const svg = await page.evaluate(async () => await (await fetch("/qr/api/admin/qr")).text());
  expect(svg).toContain('data-error-correction="H"');
  expect(svg).toContain("toohottohandlecoffee.com/qr");
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("link", { name: "Logolu SVG indir" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("toohottohandle-qr.svg");
  const pngResponse = await page.request.get("/qr/brand/qr-logolu.png");
  expect(pngResponse.status()).toBe(200);
  expect(pngResponse.headers()["content-type"]).toContain("image/png");
  const pngPromise = page.waitForEvent("download");
  await page.getByRole("link", { name: "PNG indir" }).click();
  expect((await pngPromise).suggestedFilename()).toBe("qr-logolu.png");

  await page.goto("/qr/admin/istatistik#settings");
  const restored = page.getByTestId("settings-form");
  await restored.getByLabel("İstatistik açık").check();
  await restored.getByRole("button", { name: "Ayarları kaydet" }).click();
  await page.waitForURL(/istatistik\?kaydedildi=1#settings$/);
});


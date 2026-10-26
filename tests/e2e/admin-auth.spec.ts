import { test, expect } from "@playwright/test";
import fs from "node:fs";

/**
 * Yalnızca veritabanlı sunucuda koşar: E2E_DB=1 ve sunucu kaydının yolu E2E_SERVER_LOG.
 * Sunucu boş admin tablosuyla açılmış olmalı (kurulum kodu kayıtta yazar).
 */
test.skip(!process.env.E2E_DB, "veritabanlı sunucu gerekli");
test.describe.configure({ mode: "serial" });

const EMAIL = "admin@test.kafe";
const PW = `Test-${Date.now()}-sifre`;
const setupCode = () => {
  const log = fs.readFileSync(process.env.E2E_SERVER_LOG!, "utf8");
  return [...log.matchAll(/Kurulum kodu: ([A-Z2-9-]{14})/g)].pop()![1];
};

test("first visit leads to setup; bad code and short password are refused", async ({ page }) => {
  await page.goto("/qr/admin");
  await expect(page).toHaveURL(/\/qr\/admin\/kurulum$/);
  await page.getByLabel("Kurulum kodu").fill("AAAA-BBBB-CCCC");
  await page.getByLabel("E-posta").fill(EMAIL);
  await page.getByLabel("Şifre (en az 10 karakter)").fill("kisa");
  await page.getByLabel("Şifre (tekrar)").fill("kisa");
  await page.getByRole("button", { name: "Hesabı oluştur" }).click();
  await expect(page.getByTestId("form-error")).toHaveText("Şifre en az 10 karakter olmalı.");
  // Hata sonrası e-posta ve kod kalır, şifreler boşalır.
  await expect(page.getByLabel("E-posta")).toHaveValue(EMAIL);
  await expect(page.getByLabel("Kurulum kodu")).toHaveValue("AAAA-BBBB-CCCC");
  await expect(page.getByLabel("Şifre (tekrar)")).toHaveValue("");
  await page.getByLabel("Şifre (en az 10 karakter)").fill(PW);
  await page.getByLabel("Şifre (tekrar)").fill(PW);
  await page.getByRole("button", { name: "Hesabı oluştur" }).click();
  await expect(page.getByTestId("form-error")).toContainText("Kurulum kodu geçersiz");
});

test("setup with the logged code creates the admin and signs in", async ({ page }) => {
  await page.goto("/qr/admin/kurulum");
  await page.getByLabel("Kurulum kodu").fill(setupCode().toLowerCase());
  await page.getByLabel("E-posta").fill(EMAIL);
  await page.getByLabel("Şifre (en az 10 karakter)").fill(PW);
  await page.getByLabel("Şifre (tekrar)").fill(PW);
  await page.getByRole("button", { name: "Hesabı oluştur" }).click();
  await expect(page).toHaveURL(/\/qr\/admin$/);
  await expect(page.getByTestId("admin-email")).toHaveText(EMAIL);
  const res = await page.request.get("/qr/admin/kurulum");
  expect(res.status()).toBe(404);
});

test("wrong password is refused, right one signs in, logout signs out", async ({ page }) => {
  await page.goto("/qr/admin/giris");
  await page.getByLabel("E-posta").fill(EMAIL);
  await page.getByLabel("Şifre").fill("yanlis-sifre-000");
  await page.getByRole("button", { name: "Giriş yap" }).click();
  await expect(page.getByTestId("form-error")).toHaveText("E-posta ya da şifre yanlış.");
  await page.getByLabel("Şifre").fill(PW);
  await page.getByRole("button", { name: "Giriş yap" }).click();
  await expect(page).toHaveURL(/\/qr\/admin$/);
  const cookie = (await page.context().cookies()).find((c) => c.name === "thth_admin")!;
  expect(cookie.httpOnly).toBe(true);
  expect(cookie.sameSite).toBe("Strict");
  await page.getByRole("button", { name: "Tüm cihazlardan çıkış yap" }).click();
  await expect(page).toHaveURL(/\/qr\/admin\/giris$/);
  await page.goto("/qr/admin");
  await expect(page).toHaveURL(/\/qr\/admin\/giris$/);
});

test("admin and api answers carry noindex", async ({ request }) => {
  for (const url of ["/qr/admin/giris", "/qr/api/health"]) {
    const res = await request.get(url);
    expect(res.headers()["x-robots-tag"]).toBe("noindex, nofollow");
  }
});

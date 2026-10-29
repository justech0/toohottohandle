import fs from "node:fs";
import type { Page } from "@playwright/test";

/** Yalnızca test veritabanı içindir; gerçek sunucuda kullanılmaz. */
export const ADMIN_EMAIL = "admin@test.kafe";
export const ADMIN_PW = "e2e-test-sifre-2026";

export const setupCode = (): string => {
  const log = fs.readFileSync(process.env.E2E_SERVER_LOG!, "utf8");
  return [...log.matchAll(/Kurulum kodu: ([A-Z2-9-]{14})/g)].pop()![1];
};

export async function signIn(page: Page): Promise<void> {
  await page.goto("/qr/admin/giris");
  await page.getByLabel("E-posta").fill(ADMIN_EMAIL);
  await page.getByLabel("Şifre").fill(ADMIN_PW);
  await page.getByRole("button", { name: "Giriş yap" }).click();
  await page.waitForURL(/\/qr\/admin$/);
}

export async function selectBrand(page: Page, name: string, value: string) {
  await page.locator(`[data-brand-select="${name}"]`).click();
  await page.getByRole("listbox").locator(`[role="option"][data-value="${value}"]`).click();
}

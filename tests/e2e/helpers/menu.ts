import type { Page } from "@playwright/test";

/** Menüyü giriş animasyonu atlanmış halde açar. */
export async function openMenu(page: Page) {
  await page.addInitScript(() => {
    try { sessionStorage.setItem("thth-intro-seen", "1"); } catch {}
  });
  await page.goto("/qr");
  await page.getByTestId("product-row").first().waitFor();
}

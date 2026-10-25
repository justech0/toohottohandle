import { test, expect } from "@playwright/test";

test("coming-soon page is served at / with title", async ({ page }) => {
  const res = await page.goto("/");
  expect(res?.status()).toBe(200);
  await expect(page).toHaveTitle("Too Hot To Handle — Çok yakında");
});

test("coming-soon page loads every asset without errors", async ({ page }) => {
  const failures: string[] = [];
  page.on("requestfailed", (r) => failures.push(`failed ${r.url()}`));
  page.on("response", (r) => { if (r.status() >= 400) failures.push(`${r.status()} ${r.url()}`); });
  await page.goto("/", { waitUntil: "networkidle" });
  expect(failures).toEqual([]);
});

test("legacy og:image url still resolves", async ({ request }) => {
  const res = await request.get("/assets/og.jpg");
  expect(res.status()).toBe(200);
});

test("official lockup and HOT are visible", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#stage")).toBeVisible();
  await expect(page.locator("#hot")).toBeAttached();
  await expect(page.locator("#lock").first()).toBeAttached();
});

import { test, expect } from "@playwright/test";
import { openMenu } from "./helpers/menu";

test.describe("i18n and RTL support (Spec 3.9 & 3.10)", () => {
  test("switches between TR, EN, AR without flags, and persists in localStorage", async ({ page }) => {
    await openMenu(page);

    // Initial state: TR default
    await expect(page.locator("html")).toHaveAttribute("lang", "tr");
    await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
    await expect(page.getByTestId("lang-trigger")).toHaveText("TR");

    // Open language modal via topbar button
    await page.getByTestId("lang-trigger").click();
    const modal = page.getByTestId("lang-modal");
    await expect(modal).toBeVisible();

    // Verify language options display language names/codes, no emoji flags
    const enOption = page.getByTestId("lang-option-en");
    await expect(enOption).toContainText("English");
    await expect(enOption).toContainText("EN");

    const arOption = page.getByTestId("lang-option-ar");
    await expect(arOption).toContainText("العربية");
    await expect(arOption).toContainText("AR");

    // Switch to EN
    await enOption.click();
    await expect(modal).toBeHidden();

    // Verify EN is applied
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
    await expect(page.getByTestId("lang-trigger")).toHaveText("EN");

    // Check localStorage persistence
    const savedLangEn = await page.evaluate(() => {
      try {
        return localStorage.getItem("thth-lang");
      } catch {
        return null;
      }
    });
    expect(savedLangEn).toBe("en");

    // Reload page and check persistence survives reload
    await page.reload();
    await page.getByTestId("product-row").first().waitFor();
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.getByTestId("lang-trigger")).toHaveText("EN");

    // Switch to AR via footer button
    await page.locator('.footer-lang-btn[data-lang="ar"]').click();
    await expect(page.locator("html")).toHaveAttribute("lang", "ar");
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.getByTestId("lang-trigger")).toHaveText("AR");

    const savedLangAr = await page.evaluate(() => localStorage.getItem("thth-lang"));
    expect(savedLangAr).toBe("ar");

    // Switch back to TR via footer button
    await page.locator('.footer-lang-btn[data-lang="tr"]').click();
    await expect(page.locator("html")).toHaveAttribute("lang", "tr");
    await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
    await expect(page.getByTestId("lang-trigger")).toHaveText("TR");
  });

  test("applies RTL, preserves LTR prices, does not mirror logo, and makes no CDN font calls in AR", async ({ page }) => {
    // Start directly with AR in localStorage
    await page.addInitScript(() => {
      try {
        sessionStorage.setItem("thth-intro-seen", "1");
        localStorage.setItem("thth-lang", "ar");
      } catch {}
    });

    await page.goto("/qr");
    await page.getByTestId("product-row").first().waitFor();

    // Verify HTML dir and lang
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.locator("html")).toHaveAttribute("lang", "ar");

    // Verify computed direction of document
    const computedDir = await page.evaluate(() => window.getComputedStyle(document.documentElement).direction);
    expect(computedDir).toBe("rtl");

    // Verify logo is NOT mirrored (transform: none)
    const logoTransform = await page.evaluate(() => {
      const logo = document.querySelector(".brand-icon--logo");
      return logo ? window.getComputedStyle(logo).transform : null;
    });
    expect(logoTransform === "none" || logoTransform === "matrix(1, 0, 0, 1, 0, 0)").toBe(true);

    // Verify prices have LTR direction
    const priceDir = await page.evaluate(() => {
      const priceEl = document.querySelector(".card__prices");
      return priceEl ? window.getComputedStyle(priceEl).direction : null;
    });
    expect(priceDir).toBe("ltr");

    // Verify no requests went to Google Fonts CDN
    const cdnRequests = await page.evaluate(() => {
      return performance
        .getEntriesByType("resource")
        .map((r) => r.name)
        .filter((url) => url.includes("googleapis.com") || url.includes("gstatic.com"));
    });
    expect(cdnRequests).toHaveLength(0);
  });

  test("finds product by Arabic name in search and displays localized title", async ({ page }) => {
    await openMenu(page);

    // Switch to Arabic
    await page.getByTestId("lang-trigger").click();
    await page.getByTestId("lang-option-ar").click();
    await expect(page.locator("html")).toHaveAttribute("lang", "ar");

    // Open search
    await page.getByRole("button", { name: "بحث" }).click();
    const searchPanel = page.getByTestId("search-panel");
    await expect(searchPanel).toBeVisible();

    // Search using Arabic name "إسبريسو"
    const searchInput = page.getByPlaceholder("ابحث عن منتج");
    await searchInput.fill("إسبريسو");

    // Expect search result to show espresso
    const results = searchPanel.getByTestId("product-row");
    await expect(results).toHaveCount(1);
    await expect(results.first()).toHaveAttribute("data-slug", "espresso");

    // Expect card title to display Arabic name
    await expect(results.first().locator(".card__name")).toHaveText("إسبريسو");
  });
});

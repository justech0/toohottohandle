import { test, expect } from "@playwright/test";
import { openMenu } from "./helpers/menu";

test("menu lists all 129 products", async ({ page }) => {
  await openMenu(page);
  await expect(page.getByTestId("product-row")).toHaveCount(129);
  await expect(page).toHaveTitle("Too Hot To Handle · Menü");
});

test("footer shows the business note, VAT and update date", async ({ page }) => {
  await openMenu(page);
  await expect(page.getByTestId("menu-footer")).toHaveText(
    "Self servis · Servis ücreti alınmaz · Fiyatlara KDV dahildir · Son güncelleme: 25.10.2026",
  );
});

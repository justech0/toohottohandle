import { expect, test } from "@playwright/test";
import { unzipSync, strFromU8 } from "fflate";
import { signIn } from "./helpers/admin";

test.skip(!process.env.E2E_DB, "veritabanlı sunucu gerekli");
test.describe.configure({ mode: "serial" });

const espressoPrice = (page: import("@playwright/test").Page) =>
  page.locator('[data-testid="product-row"][data-slug="espresso"] [data-testid="price-full"]').first();

test("downloads a STORE export without restore or backup-age warnings", async ({ page }) => {
  await signIn(page);
  await page.goto("/qr/admin/yedek");
  await expect(page.getByText("Bilgisayardan almak daha hızlıdır")).toBeVisible();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "ZIP indir" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^thth-menu-\d{4}-\d{2}-\d{2}\.zip$/);
  const path = await download.path();
  expect(path).toBeTruthy();
  const bytes = new Uint8Array(await (await import("node:fs/promises")).readFile(path!));
  const entries = unzipSync(bytes);
  const backup = JSON.parse(strFromU8(entries["menu.json"]));
  expect(backup.version).toBe(1);
  expect(Object.keys(entries).filter((name) => name.startsWith("photos/"))).toHaveLength(backup.images.length);

  await expect(page.getByLabel("ZIP yedeği")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Onayla ve geri yükle" })).toHaveCount(0);
  await page.goto("/qr/admin");
  await expect(page.getByText("Sistem & Yedek")).toHaveCount(0);
  await expect(page.getByText(/Son yedek:/)).toHaveCount(0);
});

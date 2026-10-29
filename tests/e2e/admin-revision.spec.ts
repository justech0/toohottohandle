import { expect, test } from "@playwright/test";
import { signIn, ADMIN_EMAIL } from "./helpers/admin";
test.skip(!process.env.E2E_DB, "veritabanlı sunucu gerekli");

test("vitrin: add, keyboard choices, edit, hide, order, upload and delete", async ({ page }) => {
  await signIn(page); await page.goto("/qr/admin/vitrin");
  const form = page.getByTestId("hero-new");
  await form.getByLabel("Yazı").fill("TEST VİTRİN");
  const color = form.getByRole("combobox", { name: "Renk" });
  await color.focus(); await color.press("ArrowDown"); await page.getByRole("listbox").press("End"); await page.getByRole("listbox").press("Enter");
  await expect(form.locator('input[name="color"]')).toHaveValue("gray");
  await form.getByRole("button", { name: "Slayt ekle" }).click();
  const added = page.locator("article").filter({ has: page.locator('input[value="TEST VİTRİN"]') });
  await expect(added).toHaveCount(1);
  const savedId = await added.locator('form[data-testid]').getAttribute("data-testid");
  const saved = page.locator("article").filter({ has: page.getByTestId(savedId!) });
  await saved.getByLabel("Yazı").fill("YENİ VİTRİN"); await saved.getByLabel("Sıra").fill("0");
  await saved.getByLabel("Menüde görünür").uncheck(); await saved.getByRole("button", { name: "Kaydet", exact: true }).click();
  await expect(saved.getByText("Kaydedildi.", { exact: true })).toBeVisible();
  await page.reload();
  const edited = page.locator("article").filter({ has: page.getByTestId(savedId!) });
  await expect(edited.getByLabel("Menüde görünür")).not.toBeChecked();
  await expect(edited.locator('input[type="file"]')).toBeEnabled();
  await edited.locator('input[type="file"]').setInputFiles("public/qr/hero/free.webp");
  await expect(edited.getByRole("status")).toContainText("Fotoğraf hazır");
  await edited.getByRole("button", { name: "Kaydet", exact: true }).click();
  await edited.getByRole("button", { name: "Slaytı sil" }).click();
  await expect(page.locator('input[value="YENİ VİTRİN"]')).toHaveCount(0);
  await page.goto("/qr/admin/kopyalar"); await expect(page.getByText(ADMIN_EMAIL, { exact: true }).first()).toBeVisible();
});

test("users: temporary password gate, change password, list and delete", async ({ page, browser }) => {
  await signIn(page); await page.goto("/qr/admin/kullanicilar");
  await expect(page.getByTestId("admin-row").filter({ hasText: ADMIN_EMAIL }).getByRole("button", { name: "Sil", exact: true })).toBeDisabled();
  await page.getByLabel("E-posta", { exact: true }).fill("second@test.kafe");
  await page.getByLabel("Geçici şifre").fill("temporary-e2e-password"); await page.getByRole("button", { name: "Admin oluştur" }).click();
  await expect(page.getByTestId("admin-row").filter({ hasText: "second@test.kafe" })).toBeVisible();
  const ctx = await browser.newContext(); const other = await ctx.newPage();
  await other.goto("/qr/admin/giris"); await other.getByLabel("E-posta").fill("second@test.kafe"); await other.getByLabel("Şifre", { exact: true }).fill("temporary-e2e-password"); await other.getByRole("button", { name: "Giriş yap" }).click();
  await expect(other).toHaveURL(/sifre-degistir/); await other.goto("/qr/admin/urunler"); await expect(other).toHaveURL(/sifre-degistir/);
  await other.getByLabel("Mevcut şifre").fill("temporary-e2e-password"); await other.getByLabel("Yeni şifre", { exact: true }).fill("permanent-e2e-password"); await other.getByLabel("Yeni şifre tekrar").fill("permanent-e2e-password"); await other.getByRole("button", { name: "Şifreyi değiştir" }).click();
  await expect(other).toHaveURL(/\/qr\/admin$/); await ctx.close();
  await page.getByTestId("admin-row").filter({ hasText: "second@test.kafe" }).getByRole("button", { name: "Sil", exact: true }).click();
  await expect(page.getByTestId("admin-row").filter({ hasText: "second@test.kafe" })).toHaveCount(0);
});

test("suggestions: selected products, photo preference and session history", async ({ page }) => {
  await signIn(page); await page.goto("/qr/admin/ne-icsem");
  await page.getByRole("combobox", { name: "Mod" }).click(); await page.getByRole("option", { name: "Seçtiklerim" }).click();
  for (const name of ["Espresso", "Cortado", "Filtre Kahve", "Caffè Americano", "Cappuccino", "Caffè Latte"]) await page.getByLabel(name, { exact: true }).check();
  await page.getByLabel("Fotoğraflı ürünlere öncelik ver").uncheck(); await page.getByRole("button", { name: "Kaydet", exact: true }).click();
  await expect(page.getByRole("status")).toHaveText("Kaydedildi.");
  await page.reload(); await expect(page.getByLabel("Fotoğraflı ürünlere öncelik ver")).not.toBeChecked();
  await page.emulateMedia({ reducedMotion: "reduce" }); await page.addInitScript(() => sessionStorage.setItem("thth-intro-seen", "1"));
  await page.goto("/qr"); await page.getByTestId("neicsem-tile").click();
  const names = [await page.getByTestId("neicsem-name").textContent()];
  for (let i=0;i<5;i++) { await page.getByRole("button", { name: "Tekrar çevir" }).click(); names.push(await page.getByTestId("neicsem-name").textContent()); }
  expect(new Set(names).size).toBe(6);
  await page.reload(); await page.getByTestId("neicsem-tile").click(); expect(names.slice(-5)).not.toContain(await page.getByTestId("neicsem-name").textContent());
  await page.goto("/qr/admin/ne-icsem"); await page.getByRole("combobox", { name: "Mod" }).click(); await page.getByRole("option", { name: "Rastgele", exact: true }).click(); await page.getByLabel("Fotoğraflı ürünlere öncelik ver").check(); await page.getByRole("button", { name: "Kaydet", exact: true }).click(); await expect(page.getByRole("status")).toHaveText("Kaydedildi.");
});

test("admin screens use brand lists and fit mobile and desktop", async ({ page }) => {
  await signIn(page);
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ["vitrin", "kullanicilar", "ne-icsem", "istatistik", "katalog", "geri-bildirim", "toplu-fiyat", "urunler/yeni"]) {
      await page.goto(`/qr/admin/${route}`);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expect(page.locator("main form").first()).toBeVisible();
      await expect(page.getByText("Yükleniyor…", { exact: true })).toHaveCount(0);
      await expect(page.locator("select")).toHaveCount(0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      if (["vitrin", "kullanicilar", "ne-icsem", "istatistik", "katalog"].includes(route)) await page.screenshot({ path: `screens/admin-revision-${route}-${width}.png`, scale: "css" });
    }
    await page.goto("/qr/admin/ne-icsem");
    const trigger = page.getByRole("combobox", { name: "Mod" });
    await trigger.focus(); await trigger.press("Enter");
    const list = page.getByRole("listbox");
    await expect(list).toBeFocused();
    await expect(list.getByRole("option").first()).toHaveAttribute("aria-selected", "true");
    for (const option of await list.getByRole("option").all()) expect((await option.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    await list.press("ArrowDown"); await list.press("Escape");
    await expect(list).toHaveCount(0); await expect(trigger).toBeFocused();
  }
});

import { test, expect } from "@playwright/test";

test("first visit plays the intro over an already rendered menu, then removes it", async ({ page }) => {
  await page.goto("/qr", { waitUntil: "commit" });
  await expect(page.getByTestId("intro")).toBeVisible();
  await expect(page.getByTestId("product-row")).toHaveCount(129);
  await expect(page.getByTestId("intro")).toHaveCount(0, { timeout: 1500 });
});

test("tapping skips the intro", async ({ page }) => {
  await page.goto("/qr", { waitUntil: "commit" });
  await page.getByTestId("intro").click();
  await expect(page.getByTestId("intro")).toHaveCount(0, { timeout: 300 });
});

test("the intro does not play again in the same session", async ({ page }) => {
  await page.goto("/qr", { waitUntil: "commit" });
  await expect(page.getByTestId("intro")).toBeVisible();
  await expect(page.getByTestId("intro")).toHaveCount(0, { timeout: 2000 });
  await page.reload();
  await page.getByTestId("product-row").first().waitFor();
  await expect(page.getByTestId("intro")).not.toBeVisible();
});

test("reduced motion shows only a short fade", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/qr", { waitUntil: "commit" });
  await expect(page.getByTestId("intro")).toBeAttached();
  await page.waitForLoadState("load");
  await expect(page.getByTestId("intro")).toHaveCount(0, { timeout: 400 });
});

const blockJs = (page: import("@playwright/test").Page) =>
  page.route(/\/_next\/static\/chunks\/.*\.js(\?.*)?$/, (r) => r.abort());

test("before hydration the logo turns white exactly where the flood is", async ({ page }) => {
  await blockJs(page);
  await page.goto("/qr");
  await page.waitForTimeout(700);
  const r = await page.evaluate(() => {
    const white = document.querySelector<HTMLElement>(".intro__logo--bottom")!;
    const flood = document.querySelector<HTMLElement>(".intro__flood")!;
    const box = white.getBoundingClientRect();
    const m = /inset\(\s*([\d.]+)(px|%)/.exec(getComputedStyle(white).clipPath);
    const cut = m ? (m[2] === "%" ? (box.height * parseFloat(m[1])) / 100 : parseFloat(m[1])) : 0;
    return { visibleTop: box.top + cut, floodTop: flood.getBoundingClientRect().top };
  });
  expect(Math.abs(r.visibleTop - r.floodTop)).toBeLessThan(24);
});

test("the intro still fades out when first paint is late", async ({ page }) => {
  await page.route(/\/_next\/static\/.*\.css(\?.*)?$/, async (r) => {
    await new Promise((f) => setTimeout(f, 700));
    await r.continue();
  });
  await page.addInitScript(() => {
    const w = window as unknown as { __introMin: number };
    w.__introMin = 1;
    const poll = () => {
      const el = document.querySelector('[data-testid="intro"]');
      if (el) w.__introMin = Math.min(w.__introMin, parseFloat(getComputedStyle(el).opacity));
      requestAnimationFrame(poll);
    };
    requestAnimationFrame(poll);
  });
  await page.goto("/qr");
  await expect(page.getByTestId("intro")).toHaveCount(0, { timeout: 4000 });
  expect(await page.evaluate(() => (window as unknown as { __introMin: number }).__introMin)).toBeLessThan(0.5);
});

test("reduced motion before hydration: still wave, no rise, a short fade", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await blockJs(page);
  await page.goto("/qr");
  const s = await page.evaluate(() => {
    const intro = document.querySelector('[data-testid="intro"]')!;
    const flood = document.querySelector(".intro__flood")!;
    return {
      wave: getComputedStyle(flood, "::before").animationName,
      flood: getComputedStyle(flood).animationName,
      name: getComputedStyle(intro).animationName,
      dur: getComputedStyle(intro).animationDuration,
    };
  });
  expect(s).toEqual({ wave: "none", flood: "none", name: "introFade", dur: "0.28s" });
});

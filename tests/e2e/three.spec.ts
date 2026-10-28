import { expect, test } from "@playwright/test";
import { openMenu } from "./helpers/menu";

test("does not start 3D while the first-visit intro is visible", async ({ page }) => {
  await page.goto("/qr");
  await expect(page.getByTestId("intro")).toBeVisible();
  await expect(page.getByTestId("hot-relief")).toHaveAttribute("data-three-status", "waiting");
});
test("reduced motion keeps the SVG fallback and skips Three.js", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await openMenu(page);
  const relief = page.getByTestId("hot-relief");
  await expect(relief).toHaveAttribute("data-three-status", "disabled");
  await expect(relief.locator(".relief__fallback")).toHaveCSS("opacity", "1");
  await expect(relief.locator("canvas")).toHaveCSS("opacity", "0");
});

test("capable browsers cross-fade the official HOT SVG to the 3D relief", async ({ page }) => {
  await openMenu(page);
  const webgl2 = await page.evaluate(() => Boolean(document.createElement("canvas").getContext("webgl2")));
  test.skip(!webgl2, "Tarayıcı WebGL2 sunmuyor");
  const relief = page.getByTestId("hot-relief");
  await expect(relief).toHaveAttribute("data-three-status", "three", { timeout: 8_000 });
  await expect(relief.locator("canvas")).toHaveCSS("opacity", "1");
});

test("a visible scene averaging above 45 ms falls back for the session", async ({ page }) => {
  await page.addInitScript(() => {
    sessionStorage.setItem("thth-intro-seen", "1");
    window.requestAnimationFrame = (callback) => window.setTimeout(() => callback(performance.now()), 55);
    window.cancelAnimationFrame = (id) => window.clearTimeout(id);
  });
  await page.goto("/qr");
  const relief = page.getByTestId("hot-relief");
  await expect(relief).toHaveAttribute("data-three-status", "three", { timeout: 8_000 });
  await expect(relief).toHaveAttribute("data-three-status", "disabled", { timeout: 6_000 });
  expect(await page.evaluate(() => sessionStorage.getItem("thth-3d-disabled"))).toBe("1");
  await expect(relief.locator(".relief__fallback")).toHaveCSS("opacity", "1");
});


import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 30_000,
  // Admin akışları aynı test veritabanını paylaşır; kurulum ve değişiklikler sırayla ilerler.
  workers: process.env.E2E_DB ? 1 : undefined,
  use: { baseURL: "http://localhost:3000", ...devices["Pixel 7"], viewport: { width: 390, height: 844 } },
  webServer: { command: "npm run start", env: { THTH_SAMPLE_PHOTOS: "1" }, port: 3000, reuseExistingServer: true, timeout: 120_000 },
});

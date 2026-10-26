import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname, ".") } },
  // Entegrasyon testleri aynı test veritabanını paylaşır; dosyalar sırayla koşar.
  test: { include: ["tests/unit/**/*.test.ts"], environment: "node", fileParallelism: false },
});

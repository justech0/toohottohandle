// Kullanım: node scripts/shot.mjs <url> <out.png> <genişlik> <yükseklik> [tamSayfa]
import { chromium } from "@playwright/test";
const [url, out, w = "390", h = "844", full = ""] = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: 1 });
await page.addInitScript(() => { try { sessionStorage.setItem("thth-intro-seen", "1"); } catch {} });
await page.goto(url, { waitUntil: "networkidle" });
await page.screenshot({ path: out, fullPage: full === "full", type: out.endsWith(".jpg") ? "jpeg" : "png", ...(out.endsWith(".jpg") ? { quality: 62 } : {}) });
await browser.close();

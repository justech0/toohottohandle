// Kullanım: node scripts/shot.mjs <url> <out.png> <genişlik> <yükseklik> [tamSayfa]
import { chromium } from "@playwright/test";
const [url, out, w = "390", h = "844", full = ""] = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: 2 });
await page.addInitScript(() => { try { sessionStorage.setItem("thth-intro-seen", "1"); } catch {} });
await page.goto(url, { waitUntil: "networkidle" });
await page.screenshot({ path: out, fullPage: full === "full" });
await browser.close();

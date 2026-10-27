const { chromium } = require("@playwright/test");
const fs = require("fs");
const path = require("path");

const BASE_URL = "http://localhost:3000";
const SCREEN_DIR = path.resolve(__dirname, "../docs/reviews/screens");
if (!fs.existsSync(SCREEN_DIR)) {
  fs.mkdirSync(SCREEN_DIR, { recursive: true });
}

function getSetupCode() {
  const log = fs.readFileSync(path.resolve(__dirname, "../server.log"), "utf8");
  const match = [...log.matchAll(/Kurulum kodu: ([A-Z2-9-]{14})/g)].pop();
  if (!match) return "UNKNOWN";
  return match[1];
}

function luminance(r, g, b) {
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function contrast(rgb1, rgb2) {
  const l1 = luminance(rgb1[0], rgb1[1], rgb1[2]);
  const l2 = luminance(rgb2[0], rgb2[1], rgb2[2]);
  const brightest = Math.max(l1, l2);
  const darkest = Math.min(l1, l2);
  return (brightest + 0.05) / (darkest + 0.05);
}

function parseRgb(str) {
  const match = str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (match) {
    return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
  }
  return null;
}

async function measureDOM(page, url, width, height, pageName) {
  const screenshotFile = `${pageName}-${width}.png`;
  const screenshotPath = path.join(SCREEN_DIR, screenshotFile);
  await page.screenshot({ path: screenshotPath, fullPage: true });

  // 1. Yatay taşma
  const overflow = await page.evaluate(() => {
    const scrollW = document.documentElement.scrollWidth;
    const innerW = window.innerWidth;
    return { scrollW, innerW, hasOverflow: scrollW > innerW };
  });

  // 2. Dokunma hedefleri
  const touchTargets = await page.evaluate(() => {
    const interactives = Array.from(document.querySelectorAll('a, button, input, select, textarea, [role="button"], [role="switch"]'));
    const results = [];
    for (const el of interactives) {
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      if (style.display === "none" || style.visibility === "hidden" || style.opacity === "0" || (rect.width === 0 && rect.height === 0)) {
        continue;
      }
      let effectiveH = rect.height;
      let effectiveW = rect.width;
      if (el.tagName === "INPUT" && (el.type === "checkbox" || el.type === "radio")) {
        const parentLabel = el.closest("label");
        if (parentLabel) {
          const lRect = parentLabel.getBoundingClientRect();
          effectiveH = lRect.height;
          effectiveW = lRect.width;
        }
      }
      const tag = el.tagName.toLowerCase();
      const text = (el.innerText || el.getAttribute("aria-label") || el.getAttribute("name") || el.getAttribute("placeholder") || "").trim().slice(0, 30);
      const isSmall = effectiveW < 44 || effectiveH < 44;
      if (isSmall) {
        results.push({
          tag,
          text,
          className: el.className,
          width: Math.round(rect.width * 10) / 10,
          height: Math.round(rect.height * 10) / 10,
          effectiveW: Math.round(effectiveW * 10) / 10,
          effectiveH: Math.round(effectiveH * 10) / 10,
        });
      }
    }
    return results;
  });

  // 3. Erişilebilir adlar
  const accessibleNames = await page.evaluate(() => {
    const elements = Array.from(document.querySelectorAll('input, button, select, textarea, [role="button"], [role="dialog"], dialog'));
    const missing = [];
    for (const el of elements) {
      const style = window.getComputedStyle(el);
      if (style.display === "none" || style.visibility === "hidden" || el.getAttribute("aria-hidden") === "true") {
        continue;
      }
      let name = "";
      if (el.getAttribute("aria-label")) {
        name = el.getAttribute("aria-label");
      } else if (el.getAttribute("aria-labelledby")) {
        const ref = document.getElementById(el.getAttribute("aria-labelledby"));
        if (ref) name = ref.innerText;
      } else if (el.labels && el.labels.length > 0) {
        name = Array.from(el.labels).map((l) => l.innerText).join(" ");
      } else if (el.innerText) {
        name = el.innerText;
      } else if (el.getAttribute("placeholder")) {
        name = el.getAttribute("placeholder");
      } else if (el.getAttribute("title")) {
        name = el.getAttribute("title");
      } else if (el.type === "submit" && el.value) {
        name = el.value;
      }
      if (!name || name.trim().length === 0) {
        missing.push({
          tag: el.tagName.toLowerCase(),
          className: el.className,
          id: el.id,
          outer: el.outerHTML.slice(0, 80),
        });
      }
    }
    return missing;
  });

  // 4. Tab sırası & odak halkası
  const tabAudit = await page.evaluate(() => {
    const focusables = Array.from(document.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'));
    return { focusableCount: focusables.length };
  });

  // 5. Metin kontrastı
  const contrastAudit = await page.evaluate(() => {
    function getBgColor(el) {
      let cur = el;
      while (cur && cur !== document.documentElement) {
        const bg = window.getComputedStyle(cur).backgroundColor;
        if (bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") {
          return bg;
        }
        cur = cur.parentElement;
      }
      return "rgb(255, 255, 255)";
    }
    const nodes = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      const text = node.nodeValue.trim();
      if (!text || text.length < 2) continue;
      const el = node.parentElement;
      if (!el) continue;
      const style = window.getComputedStyle(el);
      if (style.display === "none" || style.visibility === "hidden" || style.opacity === "0") continue;
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) continue;
      const color = style.color;
      const bg = getBgColor(el);
      const fontSize = parseFloat(style.fontSize);
      const isBold = parseInt(style.fontWeight, 10) >= 700 || style.fontWeight === "bold";
      nodes.push({ text: text.slice(0, 30), color, bg, fontSize, isBold, tag: el.tagName.toLowerCase(), className: el.className });
    }
    return nodes;
  });

  const contrastIssues = [];
  for (const item of contrastAudit) {
    const rgb1 = parseRgb(item.color);
    const rgb2 = parseRgb(item.bg);
    if (rgb1 && rgb2) {
      const ratio = contrast(rgb1, rgb2);
      const minRatio = item.fontSize >= 18 || (item.fontSize >= 14 && item.isBold) ? 3.0 : 4.5;
      if (ratio < minRatio) {
        contrastIssues.push({
          text: item.text,
          ratio: Math.round(ratio * 100) / 100,
          expected: minRatio,
          color: item.color,
          bg: item.bg,
          className: item.className,
          tag: item.tag,
        });
      }
    }
  }

  // 6. Dış alan adına istek
  const externalResources = await page.evaluate(() => {
    return window.performance
      .getEntriesByType("resource")
      .map((r) => r.name)
      .filter((n) => !n.startsWith(window.location.origin) && !n.startsWith("data:") && !n.startsWith("blob:"));
  });

  return {
    url,
    width,
    height,
    screenshotFile,
    overflow,
    touchTargets,
    accessibleNames,
    tabAudit,
    contrastIssues,
    externalResources,
  };
}

async function auditPage(page, url, width, height, pageName) {
  await page.setViewportSize({ width, height });
  const consoleErrors = [];
  const dialogs = [];

  const onConsole = (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  };
  const onDialog = (dlg) => {
    dialogs.push({ type: dlg.type(), message: dlg.message() });
    dlg.dismiss().catch(() => {});
  };

  page.on("console", onConsole);
  page.on("dialog", onDialog);

  await page.goto(`${BASE_URL}${url}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);

  const data = await measureDOM(page, url, width, height, pageName);
  page.off("console", onConsole);
  page.off("dialog", onDialog);

  return { ...data, consoleErrors, dialogs };
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log("=== STEP 1: Creating or Signing in as Admin ===");
  const setupCode = getSetupCode();
  const ADMIN_EMAIL = "admin@test.kafe";
  const ADMIN_PW = "Test2026!SifreGuvenliMinors";

  await page.goto(`${BASE_URL}/qr/admin/giris`);
  await page.waitForTimeout(400);

  if (page.url().includes("/qr/admin/kurulum")) {
    await page.getByLabel("Kurulum kodu").fill(setupCode.toLowerCase());
    await page.getByLabel("E-posta").fill(ADMIN_EMAIL);
    await page.getByLabel("Şifre (en az 10 karakter)").fill(ADMIN_PW);
    await page.getByLabel("Şifre (tekrar)").fill(ADMIN_PW);
    await page.getByRole("button", { name: "Hesabı oluştur" }).click();
    await page.waitForURL(/\/qr\/admin$/);
    console.log("Admin created and signed in successfully!");
  } else if (page.url().includes("/qr/admin/giris")) {
    await page.getByLabel("E-posta").fill(ADMIN_EMAIL);
    await page.getByLabel("Şifre").fill(ADMIN_PW);
    await page.getByRole("button", { name: "Giriş yap" }).click();
    await page.waitForURL(/\/qr\/admin$/);
    console.log("Admin signed in successfully!");
  }

  const results = [];
  const pagesToAudit = [
    { url: "/qr", name: "menu" },
    { url: "/qr/admin", name: "admin-home" },
    { url: "/qr/admin/urunler", name: "admin-products" },
    { url: "/qr/admin/urunler/2", name: "admin-product-edit" },
    { url: "/qr/admin/istatistik", name: "admin-stats" },
  ];

  for (const p of pagesToAudit) {
    console.log(`Auditing ${p.url} at 390x844...`);
    const r390 = await auditPage(page, p.url, 390, 844, p.name);
    results.push(r390);

    console.log(`Auditing ${p.url} at 1440x900...`);
    const r1440 = await auditPage(page, p.url, 1440, 900, p.name);
    results.push(r1440);
  }

  // Interactive menu states on /qr
  console.log("Auditing interactive menu states at 390x844...");
  const visitorContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const visitorPage = await visitorContext.newPage();
  await visitorPage.goto(`${BASE_URL}/qr`, { waitUntil: "networkidle" });
  await visitorPage.waitForTimeout(500);

  // 1. Ne Icsem open
  console.log("Auditing Ne İçsem open state...");
  await visitorPage.getByTestId("neicsem-tile").click();
  await visitorPage.waitForTimeout(1000);
  const neicsemAudit = await measureDOM(visitorPage, "/qr (Ne içsem açık)", 390, 844, "menu-neicsem-open");
  results.push({ ...neicsemAudit, consoleErrors: [], dialogs: [] });
  await visitorPage.getByTestId("neicsem-open").getByRole("button", { name: "Kapat" }).click();
  await visitorPage.waitForTimeout(300);

  // 2. WiFi open
  console.log("Auditing WiFi open state...");
  await visitorPage.getByRole("button", { name: "WiFi", exact: true }).click();
  await visitorPage.waitForTimeout(400);
  const wifiAudit = await measureDOM(visitorPage, "/qr (WiFi kartı açık)", 390, 844, "menu-wifi-open");
  results.push({ ...wifiAudit, consoleErrors: [], dialogs: [] });
  await visitorPage.keyboard.press("Escape");
  await visitorPage.waitForTimeout(300);

  // 3. Product detail sheet (photo product: ube-latte)
  console.log("Auditing Product detail (photo)...");
  await visitorPage.locator('[data-testid="product-row"][data-slug="ube-latte"] button').first().click();
  await visitorPage.waitForTimeout(500);
  const detailPhotoAudit = await measureDOM(visitorPage, "/qr (Ürün detayı - Fotoğraflı)", 390, 844, "menu-detail-photo");
  results.push({ ...detailPhotoAudit, consoleErrors: [], dialogs: [] });
  await visitorPage.getByTestId("product-sheet").getByRole("button", { name: "Kapat" }).click();
  await visitorPage.waitForTimeout(300);

  // 4. Product detail sheet (photo-less product: cortado)
  console.log("Auditing Product detail (photo-less)...");
  await visitorPage.locator('[data-testid="product-row"][data-slug="cortado"] button').first().click();
  await visitorPage.waitForTimeout(500);
  const detailPlainAudit = await measureDOM(visitorPage, "/qr (Ürün detayı - Fotoğrafsız)", 390, 844, "menu-detail-plain");
  results.push({ ...detailPlainAudit, consoleErrors: [], dialogs: [] });
  await visitorPage.getByTestId("product-sheet").getByRole("button", { name: "Kapat" }).click();
  await visitorPage.waitForTimeout(300);

  fs.writeFileSync(path.resolve(__dirname, "../docs/reviews/a2-minors-audit.json"), JSON.stringify(results, null, 2));
  console.log("Audit complete! Saved docs/reviews/a2-minors-audit.json");

  await browser.close();
})();

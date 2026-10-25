# THTH QR Menü v0 — Görünür Menü Uygulama Planı

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Gerçek 129 ürünlük listeyle açılan, markaya uygun, telefonda çalışan `/qr` menü ekranını Vercel sandbox'ında herkesin açabileceği bir adreste göstermek.

**Architecture:** Mevcut repo Next.js 16 uygulamasına çevrilir, canlı yakında sayfası `public/yakinda/` altına taşınıp `/` adresinde aynen kalır. Bu planda veritabanı yoktur: `getMenu()` aynı imzayla `db/seed/menu.json` dosyasını okur; A2 planında içi Neon'a çevrilir. Menü sunucuda hazırlanır, etkileşimler küçük istemci bileşenlerindedir.

**Tech Stack:** Next.js 16.4.x (App Router, TypeScript, `cacheComponents: true`), React 19, Vitest (birim), Playwright (uçtan uca), @fontsource (Unbounded 800, Montserrat 500/600), Python 3 + openpyxl (yalnızca seed dönüştürme betiği).

**Spec:** `docs/superpowers/specs/2026-10-25-thth-qr-menu-design.md` (sürüm 2.6, onaylı)

## Çalışma ortamı (önemli)

- Bu oturumun container'ında ve kullanıcının bilgisayarındaki çalışma alanında npm kapalıdır. Kod `/home/claude/toohottohandle` içinde yazılır, **derleme ve testler Vercel sandbox'ında** çalışır:
  - Takım: `team_nJzyzFIStqgGxpbtUiUU0GWt`, proje: `prj_jrLwZ8Nn4fwhEW3Ol8UUXehG4XEG`, sandbox adı `thth-qr-dev` (fra1, port 3000, açık adres `https://sb-83ldjlcvw0t2.vercel.run`; oturum değişirse `create_sandboxes_v4` yeni adres verir).
  - Eşitleme: repo `node_modules`, `.next`, `.git` hariç `tar czf` ile paketlenir, base64 olarak `write_session_files` ile `xCwd: /vercel/app` içine yazılır. Komutlar `run_session_command` ile `cwd: /vercel/app` içinde çalışır, çıktı `get_session_command_logs` ile okunur.
  - Ekran görüntüleri sandbox içindeki Playwright ile alınır ve `read_session_file` ile çekilir.
- Bütün iş `qr-menu` dalında yapılır. `main` ve canlı site bu planda değişmez. Vercel projesinin framework ayarı da değişmez.

## Global Constraints

- Next.js sürümü `16.4.x`'e sabitlenir; `next.config.ts` içinde `cacheComponents: true`. Vercel'e özel API kullanılmaz (`@vercel/*` paketi yok). `vercel.json` içinde `"regions": ["fra1"]`.
- Renk token'ları (yalnızca bunlar): `red #DC2524`, `yellow #F0EE40`, `pink #DDBBD1`, `blue #335DB2`, `green #35A97C`, `gray #DBDAD4`, `paper #F3ECE6`, `ink #2A1514`, `ink-soft #6B5550`, `red-text #B5191C`, `green-text #1F6B4D`, `line #E2D6CE`, `white #FFFFFF`.
- Beyaz yazı yalnızca `red` ve `blue` zeminde; `yellow`, `pink`, `green`, `gray` zeminde yazı `ink`. `red` krem zeminde yalnızca 24 px ve üstü başlıkta; küçük kırmızı metin `red-text`.
- Fontlar yalnızca: Unbounded 800 (liste içi kategori başlıkları, öne çıkan adları, rozetler), Montserrat 500 ve 600 (ürün adları 600, şerit sekmeleri 600, metin 500). Başka ağırlık yüklenmez. Google'dan çekilmez.
- Emoji yok. Parıltı, konfeti, gradyan yok.
- Her fiyatın yanında `₺`. İki boylu fiyat: `Normal 210 ₺ · Büyük 230 ₺`; her boy-fiyat çifti ayrı `<bdi>`.
- Grup adları ve sırası: Kahve (`red`), Kahvesiz (`blue`), Yiyecek (`green`), Tatlı (`pink`), Paket & Atıştırmalık (`gray`).
- Sabit metinler (aynen):
  - Arama sonuçsuz: `Aradığını bulamadık. Ekibimiz sana yardımcı olabilir.`
  - Kopyalama hatası: `Kopyalanamadı. Metne basılı tutup kopyalayın.`
  - Kopyalama başarılı (düğme): `Kopyalandı`
  - Alt bilgi: `{footer_note} · Fiyatlara KDV dahildir · Son güncelleme: {GG.AA.YYYY}`; `footer_note` varsayılanı `Self servis · Servis ücreti alınmaz`.
  - WiFi yönergesi varsayılanı: `HOT | WIFI ağına bağlanın. Açılan giriş ekranına bu bilgileri yazın.`
- Maliyet, COGS, zam oranı hiçbir dosyaya girmez. Excel repoya girmez.
- Dokunma alanı en az 44 × 44 px. Hiçbir genişlikte yatay sayfa kaydırması yok.
- Saat hesapları `Europe/Istanbul`.

## Bu planın kapsamı dışında (sonraki planlar)

Veritabanı ve admin (A2), EN/AR dil ve RTL, service worker, istatistik, 3D, "Ne içsem?", fotoğraf yükleme, font dosyalarının tek dosyada birleştirilmesi (spec 5.6; burada @fontsource'un latin + latin-ext dosyaları kullanılır), güvenlik başlıkları. Kod bunlara yer bırakır ama yazmaz.

## Review Focus

1. **Dar ekranda uzun ad + iki boylu fiyat** (360 px, "Iced White Chocolate Mocha", "Karışık Şarküteri Sandviç"): satır kırılır, sayfa yana kaymaz. → Task 6 e2e `no horizontal scroll at 360`.
2. **Türkçe büyük harfle arama** ("İCE", "FISTIK", "fıstık"): Iced ürünlerini ve Fıstıklı ürünleri bulur. → Task 3 birim testleri.
3. **Detay × ile kapatıldıktan sonra geri tuşu**: tekrar açılan detay geri tuşuyla kapanır, menüden çıkılmaz; geçmişte fazla kayıt kalmaz. → Task 8 e2e.
4. **Tükenmiş ürün**: fiyat yerine `Tükendi`, süre dolunca fiyat geri gelir; telefon saati değil sunucu saati esas. → Task 3 `priceLabel` birim testi.
5. **Kopyalama izni yok** (uygulama içi tarayıcı): metin seçilir ve hata metni çıkar. → Task 9 e2e.
6. **Hareket azaltma açık**: giriş animasyonu oynamaz, kısa kararma olur, menü hemen kullanılır. → Task 10 e2e.

---

### Task 1: Next.js iskeleti ve yakında sayfasının taşınması

**Files:**
- Create: `package.json`, `next.config.ts`, `tsconfig.json`, `vercel.json`, `vitest.config.ts`, `playwright.config.ts`, `app/layout.tsx`, `.gitignore`, `.env.example`
- Move: `index.html`, `style.css`, `motion.js`, `assets/`, `.htaccess` → `public/yakinda/`
- Modify: `public/yakinda/index.html` (yalnızca göreli dosya yolları)
- Test: `tests/e2e/yakinda.spec.ts`

**Interfaces:**
- Produces: `npm run build`, `npm run test` (Vitest), `npm run e2e` (Playwright, `webServer: npm run start`, `baseURL http://localhost:3000`).

- [ ] **Step 1:** `git checkout -b qr-menu`.
- [ ] **Step 2: Failing e2e testi yaz** — `tests/e2e/yakinda.spec.ts`:
  - `GET /` 200 döner, `<title>` `Too Hot To Handle — Çok yakında`.
  - Sayfa yüklenirken başarısız istek yok: `page.on('requestfailed')` ve 4xx/5xx yanıt sayısı 0.
  - `/assets/og.jpg` 200 döner (og:image eski mutlak adresi bozulmasın).
  - `#hot` ve `#lock` öğeleri görünür.
- [ ] **Step 3:** `git mv` ile dosyaları `public/yakinda/` altına taşı. `index.html` içinde yalnızca şu yollar mutlak yapılır: `assets/...` → `/yakinda/assets/...`, `style.css` → `/yakinda/style.css`, `motion.js` → `/yakinda/motion.js`. `#above`, `#below`, `#lock` başvurularına ve `<base>`'e dokunulmaz (`<base>` kullanılmaz). `style.css` içindeki `url("assets/...")` CSS dosyasına göre çözüldüğü için değişmez.
- [ ] **Step 4:** `next.config.ts`: `cacheComponents: true`; `rewrites`: `/` → `/yakinda/index.html`, `/assets/:path*` → `/yakinda/assets/:path*`. `vercel.json`: `{"regions":["fra1"]}`. `package.json` scriptleri: `dev`, `build`, `start`, `test` (`vitest run`), `e2e` (`playwright test`). Bağımlılıklar: `next@16.4.3`, `react`, `react-dom`, `typescript`, `@types/react`, `@types/node`, `vitest`, `@playwright/test`.
- [ ] **Step 5:** Sandbox'a eşitle, `npm install`, `npx playwright install --with-deps chromium`, `npm run build && npm run e2e -- yakinda`. Beklenen: 4 test PASS.
- [ ] **Step 6:** Commit: `feat: Next.js 16 skeleton, coming-soon page moved to public/yakinda`.

### Task 2: Excel → seed dönüştürücü ve `menu.json`

**Files:**
- Create: `scripts/excel_to_seed.py`, `db/seed/menu.json`, `tests/unit/seed.test.ts`

**Interfaces:**
- Produces: `db/seed/menu.json` şu biçimde:
  ```ts
  { groups: { slug: 'kahve'|'kahvesiz'|'yiyecek'|'tatli'|'paket'; nameTr: string; color: GroupColor }[];
    categories: { slug: string; nameTr: string; group: string; defaultTemp: 'hot'|'cold'|null; defaultInSuggest: boolean }[];
    products: { slug: string; name: string; category: string; temp: 'hot'|'cold'|null; variants: { key: 'normal'|'buyuk'|'tek'|'duble'|null; priceKurus: number }[] }[];
    extras: { slug: string; nameTr: string; priceKurus: number; categories: string[] }[];
    settings: { wifiSsid: 'HOT | WIFI'; wifiUsername: 'test'; wifiPassword: 'test1234'; wifiNoteTr: string; openingTime: '08:00'; footerNoteTr: 'Self servis · Servis ücreti alınmaz'; statsEnabled: true; menuUpdatedAt: '2026-10-25T00:00:00+03:00' } }
  ```

- [ ] **Step 1: Failing test yaz** — `tests/unit/seed.test.ts`:
  - 5 grup, 19 kategori, 129 ürün, 4 ekstra; bütün ürün slug'ları benzersiz.
  - Her ürünün en az bir varyantı var, her `priceKurus` pozitif tam sayı ve 100'ün katı.
  - JSON metninde `cost`, `cogs`, `maliyet`, `zam` geçmiyor (küçük harfe çevrilmiş metinde arama).
  - Örnekler: `caramel-macchiato` → `[{normal,21000},{buyuk,23000}]`; `iced-americano` → `[{normal,17600},{buyuk,19800}]`; `espresso` → `[{tek,11000},{duble,15000}]`; `white-mocha-frappe` → `[{buyuk,25000}]`; `portakal-suyu.temp === 'cold'`; `matcha-ube` kategorisinin grubu `kahvesiz`.
  - `ekstra-shot` kategorileri tam olarak `sicak-kahveler, soguk-kahveler, coffee-frappe, cream-frappe, matcha-ube`; `yumurta` yalnızca `ekmek-ustu`.
- [ ] **Step 2:** Testi çalıştır, dosya yok diye FAIL.
- [ ] **Step 3:** `scripts/excel_to_seed.py <xlsx> <out.json>` yaz. Eşleme ve düzeltme tabloları, kategori sırası, grup/renk/sıcaklık değerleri ve ekstra kapsamı oturumdaki `menu_build.py` ile aynıdır (Ek A ile birebir). Ek kurallar: slug = küçük harf, `ı→i`, NFD ile aksanlar silinir, `[a-z0-9]` dışındaki her dizi tek `-` olur, baştaki/sondaki `-` silinir (`Colombia Medellín · 200 g` → `colombia-medellin-200-g`, `Strawberries & Cream Frappe` → `strawberries-cream-frappe`). Ekstra slug'ları: `ekstra-shot`, `bitkisel-sut`, `sos-ve-aroma`, `yumurta`. Fiyat: `round(value*100)`; `abs(value-round(value,2)) > 0.001` ise betik hata verip durur. Yalnızca "Ürün Adı", "Kategori", "Yeni Fiyat" sütunları okunur.
- [ ] **Step 4:** Betiği bu container'da Excel ile çalıştır, `db/seed/menu.json`'u üret. Sandbox'ta `npm run test -- seed` → PASS.
- [ ] **Step 5:** Commit: `feat: seed menu from price list (129 products, no cost data)`.

### Task 3: Menü çekirdeği (tipler, okuma, arama, fiyat, tükendi)

**Files:**
- Create: `lib/menu/types.ts`, `lib/menu/getMenu.ts`, `lib/text/normalize.ts`, `lib/menu/search.ts`, `lib/format/price.ts`, `lib/menu/soldout.ts`
- Test: `tests/unit/normalize.test.ts`, `tests/unit/search.test.ts`, `tests/unit/price.test.ts`, `tests/unit/soldout.test.ts`

**Interfaces:**
- Produces:
  ```ts
  type GroupColor = 'red'|'yellow'|'pink'|'blue'|'green'|'gray'
  type VariantKey = 'normal'|'buyuk'|'tek'|'duble'|null
  interface MenuProduct { slug: string; name: string; category: string; temp: 'hot'|'cold'|null; variants: { key: VariantKey; priceKurus: number }[]; descTr: string|null; soldOutUntil: string|null; isNew: boolean; isFeatured: boolean; isVisible: boolean; imageKey: string|null }
  interface MenuData { groups; categories; products: MenuProduct[]; extras; settings; serverNow: string }  // seed biçimi + yeni alanlar
  getMenu(): Promise<MenuData>                         // lib/menu/getMenu.ts — bu planda seed'i okur, serverNow = new Date().toISOString()
  normalizeForSearch(s: string): string                 // lib/text/normalize.ts
  searchProducts(products: MenuProduct[], query: string): MenuProduct[]   // lib/menu/search.ts
  formatPrice(kurus: number): string                    // lib/format/price.ts → "210 ₺", "210,50 ₺"
  variantLabelTr(key: VariantKey): string               // "Normal" | "Büyük" | "Tek" | "Duble" | ""
  isSoldOut(soldOutUntil: string|null, serverNow: string): boolean        // lib/menu/soldout.ts
  priceLabel(p: MenuProduct, serverNow: string): { soldOut: boolean; parts: string[] }  // parts örn. ["Normal 210 ₺","Büyük 230 ₺"]; tükendiyse { soldOut:true, parts:["Tükendi"] }
  ```

- [ ] **Step 1: Failing testleri yaz:**
  - `normalizeForSearch`: `"FISTIKLI"→"fistikli"`, `"İÇECEK"→"icecek"`, `"Caffè Latte"→"caffe latte"`, `"Colombia Medellín"→"colombia medellin"`, `"  Ballı   Süt "→"balli sut"`.
  - `searchProducts` (seed ile): `"İCE"` sonucunda `iced-latte` var; `"fıstık"` ve `"FISTIK"` sonucunda `fistikli-magnolia`, `fistikli-cookie`, `fistikli-cheesecake` var; `"ton balik"` → `ton-balikli-sandvic`; `"medellin"` → `colombia-medellin-200-g`; `"xyzq"` → `[]`; `""` → bütün ürünler. Sorgu kelimelere bölünür, her kelime adda geçmelidir.
  - `formatPrice(21000)→"210 ₺"`, `formatPrice(21050)→"210,50 ₺"`.
  - `priceLabel`: `caramel-macchiato` → `["Normal 210 ₺","Büyük 230 ₺"]`; `cortado` → `["170 ₺"]`; `soldOutUntil="2026-10-26T08:00:00+03:00"`, `serverNow="2026-10-25T20:00:00+03:00"` → `{soldOut:true, parts:["Tükendi"]}`; aynı ürün `serverNow="2026-10-26T08:00:01+03:00"` → fiyat döner.
- [ ] **Step 2:** `npm run test` → FAIL.
- [ ] **Step 3:** Fonksiyonları yaz. `normalizeForSearch`: `toLocaleLowerCase('tr')`, `ı→i`, `normalize('NFD')` + birleşen işaretleri sil, boşlukları tekle, kırp. `getMenu` seed'deki ürünlere `descTr:null, soldOutUntil:null, isNew:false, isFeatured:false, isVisible:true, imageKey:null` ekler.
- [ ] **Step 4:** `npm run test` → PASS.
- [ ] **Step 5:** Commit: `feat: menu core (types, getMenu from seed, search, price, sold-out)`.

### Task 4: Tasarım token'ları, fontlar ve logo

**Files:**
- Create: `app/qr/layout.tsx`, `app/qr/styles/tokens.css`, `app/qr/styles/base.css`, `app/qr/_components/Logo.tsx`
- Test: `tests/unit/contrast.test.ts`

**Interfaces:**
- Produces: CSS değişkenleri `--c-red … --c-line`, `--f-display` (Unbounded), `--f-text` (Montserrat); `textOn(color: GroupColor): 'white'|'ink'` (`lib/design/textOn.ts`); `<Logo variant="lockup"|"hot" className? />` — yakında sayfasındaki resmi `#lock` ve `#hot` SVG yollarından kopyalanır, yeniden çizilmez.

- [ ] **Step 1: Failing test:** `textOn('red')==='white'`, `textOn('blue')==='white'`, `pink, yellow, green, gray → 'ink'`; ayrıca WCAG kontrast hesabıyla her `textOn` sonucu ilgili zeminde ≥ 4.5 (beyaz/kırmızı 4.85 dahil).
- [ ] **Step 2:** FAIL.
- [ ] **Step 3:** `lib/design/textOn.ts`, token CSS'i, @fontsource içe aktarımları (`@fontsource/unbounded/800.css`, `@fontsource/montserrat/500.css`, `@fontsource/montserrat/600.css`), `Logo.tsx`. `app/qr/layout.tsx`: `lang="tr"`, `<meta name="theme-color" content="#DC2524">`, zemin `paper`.
- [ ] **Step 4:** PASS; `npm run build` hatasız.
- [ ] **Step 5:** Commit: `feat: design tokens, self-hosted fonts, official logo component`.

### Task 5: Menü sayfası iskeleti (sunucu) ve alt bilgi

**Files:**
- Create: `app/qr/page.tsx`, `app/qr/_components/MenuShell.tsx`, `app/qr/_components/Footer.tsx`, `lib/format/date.ts`
- Test: `tests/unit/date.test.ts`, `tests/e2e/menu.spec.ts`

**Interfaces:**
- Consumes: `getMenu()`, `<Logo/>`.
- Produces: `formatDateTr(iso: string): string` → `"25.10.2026"` (`Europe/Istanbul`); `MenuShell` props `{ menu: MenuData }`; sayfada her ürün `data-testid="product-row"` ve `data-slug`, her kategori bölümü `id="cat-{slug}"`.

- [ ] **Step 1: Failing testler:** `formatDateTr("2026-10-24T22:30:00Z") === "25.10.2026"`. e2e: `/qr` açılır, `product-row` sayısı 129, alt bilgi metni tam olarak `Self servis · Servis ücreti alınmaz · Fiyatlara KDV dahildir · Son güncelleme: 25.10.2026`, sayfa başlığı `Too Hot To Handle · Menü`.
- [ ] **Step 2:** FAIL.
- [ ] **Step 3:** `app/qr/page.tsx` sunucu bileşeni: `await connection()`, `const menu = await getMenu()`, `<MenuShell menu={menu}/>`. Üst bar: küçük lockup logo; sağda arama ve WiFi düğmeleri (bu taskta işlevsiz yer tutucu, `aria-label` ile). Bölümler gruplara, gruplar kategorilere göre sıralı.
- [ ] **Step 4:** PASS.
- [ ] **Step 5:** Commit: `feat: /qr page shell with footer`.

### Task 6: Ürün listesi, fiyat satırı, ekstralar ve yapışkan şeritler

**Files:**
- Create: `app/qr/_components/ProductRow.tsx`, `app/qr/_components/PriceTag.tsx`, `app/qr/_components/ExtrasLine.tsx`, `app/qr/_components/CategoryStrip.tsx`, `app/qr/styles/menu.css`
- Test: `tests/e2e/menu.spec.ts` (ek testler)

**Interfaces:**
- Consumes: `priceLabel`, `variantLabelTr`, `formatPrice`, `textOn`.
- Produces: `CategoryStrip` — `data-testid="group-tab"` (5) ve `data-testid="category-tab"` (seçili grubun kategorileri), seçili sekmede `aria-current="true"`.

- [ ] **Step 1: Failing e2e testler (390 × 844):**
  - `caramel-macchiato` satırında iki `bdi`: `Normal 210 ₺` ve `Büyük 230 ₺`.
  - `#cat-sicak-kahveler` sonunda ekstra satırı `Ekstra shot +75 ₺ · Bitkisel süt +60 ₺ · Sos ve aroma +50 ₺`; `#cat-caylar` içinde ekstra satırı yok; `#cat-ekmek-ustu` içinde `Yumurta +30 ₺`.
  - 5 `group-tab`; "Tatlı" sekmesine dokununca `#cat-magnolia` görünür alana gelir ve `Magnolia` sekmesi `aria-current="true"` olur.
  - Liste `#cat-cookies`'e kaydırılınca seçili kategori `Cookies` olur ve sekme şerit içinde görünürdür.
  - **no horizontal scroll at 360:** 360 × 740'ta `document.documentElement.scrollWidth <= innerWidth`; `iced-white-chocolate-mocha` satırının ad öğesi tam görünür (kesik değil).
  - Her `group-tab` ve `category-tab` yüksekliği ≥ 44 px.
- [ ] **Step 2:** FAIL.
- [ ] **Step 3:** Bileşenleri yaz. Şerit iki sıra, tek satır, yatay kaydırma, `position: sticky`; sekmeler Montserrat 600; seçili kategori kendi grup rengiyle dolar, yazı rengi `textOn`. Liste içi kategori başlıkları Unbounded 800 büyük harf, grup rengi (kırmızı başlık ≥ 24 px). Kaydırma takibi `IntersectionObserver` ile. Satır: ad Montserrat 600, fiyat sağda, uzun adda alt satıra iner. Kategori geçişinde dalga efekti bu planda yok (Task 10'daki dalga yalnızca giriş için).
- [ ] **Step 4:** PASS (390 ve 360).
- [ ] **Step 5:** Commit: `feat: product list, prices, extras, sticky group/category strips`.

### Task 7: Arama

**Files:**
- Create: `app/qr/_components/SearchOverlay.tsx`
- Test: `tests/e2e/search.spec.ts`

**Interfaces:**
- Consumes: `searchProducts`, `ProductRow`.

- [ ] **Step 1: Failing e2e:** arama düğmesi (`aria-label="Ara"`) üstten paneli açar; `fıstık` yazınca 3 satır (`fistikli-magnolia`, `fistikli-cookie`, `fistikli-cheesecake`); `İCE` yazınca `iced-latte` var; `xyzq` yazınca metin tam olarak `Aradığını bulamadık. Ekibimiz sana yardımcı olabilir.` ve `Aramayı temizle` düğmesi; temizleyince giriş boşalır; Esc paneli kapatır.
- [ ] **Step 2:** FAIL.
- [ ] **Step 3:** Panel istemci bileşeni; filtre her tuşta, 129 ürün bellekte. Sonuç satırına dokunmak detay açar (Task 8 bağlar).
- [ ] **Step 4:** PASS.
- [ ] **Step 5:** Commit: `feat: search with Turkish/accent-insensitive matching`.

### Task 8: Ürün detayı ve geri tuşu davranışı

**Files:**
- Create: `app/qr/_components/ProductSheet.tsx`, `lib/ui/historySheet.ts`
- Test: `tests/e2e/detail.spec.ts`

**Interfaces:**
- Produces: `openSheet(slug)` → `history.pushState({ sheet: slug }, '')`; `closeSheet()` → `history.back()`; `popstate` dinleyicisi state'te `sheet` yoksa paneli kapatır.

- [ ] **Step 1: Failing e2e:**
  - `caramel-macchiato` satırına dokununca alttan `role="dialog"` açılır; ad ve iki boy-fiyat görünür; açıklama, alerjen, kalori bölümü yok (veri boş olduğu için hiç yazılmaz, `0` yazılmaz).
  - `page.goBack()` paneli kapatır ve URL `/qr` kalır.
  - Aç → `×` (`aria-label="Kapat"`) → tekrar aç → `page.goBack()` paneli kapatır, sayfa `/qr`'den ayrılmaz.
  - Esc kapatır; açıkken odak panel içinde kalır.
- [ ] **Step 2:** FAIL.
- [ ] **Step 3:** Panel ve geçmiş yardımcıları.
- [ ] **Step 4:** PASS.
- [ ] **Step 5:** Commit: `feat: product sheet with correct back-button history`.

### Task 9: WiFi kartı

**Files:**
- Create: `app/qr/_components/WifiCard.tsx`, `lib/ui/copyText.ts`
- Test: `tests/e2e/wifi.spec.ts`

**Interfaces:**
- Produces: `copyText(text: string, fallbackEl: HTMLElement): Promise<'copied'|'selected'>` — `navigator.clipboard.writeText` başarısızsa `fallbackEl` içindeki metni seçer ve `'selected'` döner.

- [ ] **Step 1: Failing e2e:**
  - WiFi düğmesi (`aria-label="WiFi"`) kartı üstten aşağı açar (kartın üst kenarı ekranın üst yarısında).
  - Kartta `HOT | WIFI`, `test`, `test1234` ve yönerge metni.
  - Kullanıcı adı "Kopyala" düğmesi panoya `test` yazar ve düğme metni `Kopyalandı` olur (`context.grantPermissions(['clipboard-read','clipboard-write'])`).
  - `addInitScript` ile `navigator.clipboard.writeText` reddedilince: şifre metni seçili (`getSelection().toString()==='test1234'`) ve `Kopyalanamadı. Metne basılı tutup kopyalayın.` görünür.
  - Kart dışına dokununca kapanır.
- [ ] **Step 2:** FAIL.
- [ ] **Step 3:** Kart; değerler büyük, eşit aralıklı yazıyla; `wifiSsid` boşsa WiFi düğmesi hiç görünmez.
- [ ] **Step 4:** PASS.
- [ ] **Step 5:** Commit: `feat: wifi card with separate copy buttons and fallback`.

### Task 10: 2D giriş animasyonu

**Files:**
- Create: `app/qr/_components/Intro.tsx`, `lib/motion/hotWave.ts`
- Test: `tests/unit/hotWave.test.ts`, `tests/e2e/intro.spec.ts`

**Interfaces:**
- Consumes: `<Logo/>` SVG yolları.
- Produces: `waveOffset(y: number, t: number): number` — yakında sayfasındaki HOT dalgası; sabitler `A = 22.8`, `λ = 277.5` (logo birimi), `P = 4.79`; `dx = A·(sin(k·y + P + φ(t)) − sin(k·y + P))`, `k = 2π/λ`, `y` T çubuğu için en az 104'e sabitlenir.

- [ ] **Step 1: Failing testler:**
  - Birim: `waveOffset(y, 0) === 0` her y için (faz 0'da resmi logonun kendi dalgalı şekli aynen korunur; düzleştirilmiş HOT hiçbir an gösterilmez); `|waveOffset(y,t)| ≤ 2·A`; `waveOffset(50, t) === waveOffset(104, t)` (kelepçe).
  - e2e: oturumdaki ilk açılışta `data-testid="intro"` görünür ve en geç 1,2 sn + 300 ms içinde DOM'dan kalkar; bu süre içinde de `product-row`'lar DOM'da vardır; ekrana dokununca hemen kalkar; aynı oturumda ikinci açılışta görünmez; `reducedMotion: 'reduce'` ile 400 ms içinde kalkar ve dalga hareketi oynamaz.
- [ ] **Step 2:** FAIL.
- [ ] **Step 3:** Giriş sırası (spec 3.1): krem zemin → kırmızı alttan dalgalı kenarla yarıya dolar → HOT dalgalanır, TOO HOT / TO HANDLE oturur → logo küçülüp üst bara geçer. SVG + CSS, `requestAnimationFrame`. Oturum bilgisi `sessionStorage` (`thth-intro-seen`), erişilemezse giriş her seferinde oynar ama yine atlanabilir. Ses yok.
- [ ] **Step 4:** PASS.
- [ ] **Step 5:** Commit: `feat: 2D intro based on coming-soon wave`.

### Task 11: Sandbox'ta yayın, ekran görüntüleri ve teslim

**Files:**
- Create: `tests/e2e/screens.spec.ts`, `docs/PROJECT_STATE.md`

- [ ] **Step 1:** `screens.spec.ts` 390 × 844, 768 × 1024, 1440 × 900'de `/qr` (giriş atlanmış) ve detay açıkken ekran görüntüsü alır, `screens/` klasörüne yazar.
- [ ] **Step 2:** Sandbox'ta `npm run build && npm run test && npm run e2e` → hepsi PASS. Çıktı özetini kaydet.
- [ ] **Step 3:** `npm run start -- -p 3000` arka planda; `https://<sandbox>.vercel.run/qr` adresinin 200 döndüğünü sandbox içinden `curl` ile doğrula.
- [ ] **Step 4:** Ekran görüntülerini `read_session_file` ile çek, gözle kontrol et (taşma, renk, font, emoji yok), kullanıcıya gönder.
- [ ] **Step 5:** `docs/PROJECT_STATE.md`: bitenler, sandbox adresi, sonraki plan (A2 veritabanı ve admin, dil, 3D). Commit ve `git push -u origin qr-menu`. `main`'e birleştirme ve Vercel framework ayarı bu planda yapılmaz; kullanıcı onayıyla ayrı adım.

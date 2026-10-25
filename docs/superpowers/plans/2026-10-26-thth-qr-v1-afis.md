# THTH QR v1 · Afiş Görünümü Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `/qr` menüsünü düz listeden marka afiş diline taşımak: dönen HOT & FAST / FREE / SHINE vitrini, grup afişleri, tavşanlı "Ne içsem?" karesi (yerinde açılan ikon slotu), kategori afişleri, yıldız fiyatlı ürün kartları, yeni ürün detayı.

**Architecture:** Liste hâlâ sunucuda üretilir (`MenuShell`), etkileşim küçük istemci bileşenlerinde (`HeroSlides`, `NeIcsem`, `MenuClient`). Marka ikonları resmi PNG'lerden alfa maskesiyle (`mask-image`) boyanır, yeniden çizilmez. Fiyat rozetleri `lib/menu/badges.ts` içinde saf fonksiyonla hazırlanır; aynı `ProductCard` hem listede hem aramada kullanılır.

**Tech Stack:** Next.js 16.4.3 (App Router, cacheComponents), React 19.3.1, TypeScript, Vitest 3.2.4, Playwright 1.64.1 (Pixel 7, 390×844), Python 3 + Pillow (görsel hazırlama, yalnızca geliştirme).

**Spec:** `docs/superpowers/specs/2026-10-26-thth-qr-v1-afis-design.md` (ana spec `docs/superpowers/specs/2026-10-25-thth-qr-menu-design.md` değişmeyen kısımlarda geçerli).

## Global Constraints

- Renkler yalnızca `app/qr/styles/tokens.css` token'larından; beyaz yazı yalnızca kırmızı ve mavi zeminde (`textOn`).
- Fontlar: Unbounded 800 (başlık, CSS'te 900 istense de 800 dosyası kullanılır), Montserrat 500/600; self-host, Google'dan yüklenmez.
- Logo ve ikonlar yeniden çizilmez: kaynak `/mnt/user-data/uploads/toohot/hot/toohottohandle-logolar-1.png` ve `/mnt/user-data/uploads/toohot/hottir/toohottohandle-iconlar-1.png`.
- Emoji yok. Koyu/ay görünümü yok. Şube adı vitrinde yazmaz.
- Metinler birebir: "MENÜ", "HOT & FAST", "HOT & FREE", "HOT & SHINE", "Ne içsem?", "Tekrar çevir", "Şu an önerecek içecek yok. Ekibimize sorabilirsin.", "Alerjen bilgisi için ekibimize sorabilirsin.", "Tükendi", grup adı "Spesiyal".
- Dokunma hedefleri ≥ 44 px. 360 px'te yatay kaydırma yok.
- Hareket azaltma açıksa: vitrin dönmez, tavşan zıplamaz, slot dönmez (sonuç kararmayla belirir).
- Maliyet verisi hiçbir yere girmez. Örnek fotoğraflar yalnızca `THTH_SAMPLE_PHOTOS=1` iken bağlanır.
- Testler Vercel sandbox `thth-qr-dev` içinde koşar (`/vercel/r.sh`), kod `qr-menu` dalına push ile gider.

## Review Focus

1. Canlıda hiç ürün fotoğrafı yokken menü: fotoğrafsız kartlar, kategori afişleri ve Ne içsem kutuları boş/kırık görünmemeli (Task 4 ve 6'da `THTH_SAMPLE_PHOTOS` kapalı testler).
2. 360 px ekranda iki sütun kart + uzun ad + iki boy: yatay kaydırma yok, iki fiyat da görünür (Task 4).
3. Ne içsem dönerken tekrar dokunma / "Tekrar çevir"e üst üste basma: ikinci dönüş başlamaz, sonuç tutarlı kalır (Task 6).
4. Vitrin sekme arka plandayken ya da ekran dışındayken dönmemeli; geri gelince kaldığı yerden devam etmeli (Task 2).
5. Vitrin fotoğrafı yüklenemezse slayt yine okunur: renkli zemin + slogan (Task 2).

---

### Task 1: Spesiyal grup adı ve marka görsel dosyaları

**Files:**
- Modify: `scripts/excel_to_seed.py` (GROUPS: `("spesiyal", "Spesiyal", "blue")`; kategori tuple'larındaki grup adı "Kahvesiz" → "Spesiyal")
- Modify: `db/seed/menu.json` (yeniden üretilir)
- Modify: `db/seed/sample-photos.json`
- Create: `scripts/brand_assets.py` (tek seferlik, Pillow; çıktıları repoya girer)
- Create: `public/qr/brand/logo.png`, `public/qr/brand/lips.png`, `public/qr/brand/rabbit.png`, `public/qr/brand/star.png` (alfa korunur, renk beyaz; uzun kenar logo 1400, ikon 400)
- Create: `public/qr/hero/fast.webp`, `free.webp`, `shine.webp` (780 px genişlik, ≤ 120 KB)
- Create: `public/qr/groups/kahve.webp`, `spesiyal.webp`, `yiyecek.webp`, `tatli.webp`, `paket.webp` (600 px, ≤ 70 KB)
- Create: `public/qr/img/ornek-<slug>-{320,720,1280}.webp` yeni örnekler
- Create: `app/qr/_components/BrandIcon.tsx`
- Test: `tests/unit/seed.test.ts`, `tests/unit/image.test.ts`

**Interfaces:**
- Produces: `BrandIcon({ name: "lips" | "rabbit" | "star" | "logo"; className?: string; label?: string })` → `<span class="brand-icon brand-icon--{name} {className}" style="mask-image:url(/qr/brand/{name}.png)" role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true}>`; renk `currentColor` (CSS `background: currentColor`).
- Produces: grup slug'ı `spesiyal`, adı `Spesiyal`.

Kaynaklar (Instagram dosyaları `/mnt/user-data/uploads/toohottohandlecofee/toohottohandlecoffee/` ve `/mnt/user-data/uploads/tohoottohandle.batman/toohottohandle.batman/`, sıralı listede indeks): hero fast = "Hot&Fast" değil, parlak HOT render (indeks 20, `..._Too_Hot_To_Handle_Coming_Soon_2026-07-12_Das7QYGKbeu...`), free = indeks 2 (`Hot&Free_#thth...`, buz + dudak), shine = indeks 12 (gözlükte frappe). Gruplar: kahve = indeks 34 (turuncu HOT bardak), spesiyal = indeks 33 (ube), yiyecek = indeks 7 sol üst çeyrek (ton balıklı sandviç), tatli = indeks 22 (çörek kulesi), paket = indeks 38 üst %75 (dalgalı bardak). Yeni örnek ürün fotoğrafları: `ube-latte` (33), `ube-vanilya-matcha-latte` (4, üst %22 kırpılır), `caramel-frappe` (12), `morning-sando` (8 sol üst çeyrek), `italy-sando` (9 sol üst çeyrek), `ton-balikli-sandvic` (7 sol üst çeyrek), `karisik-sarkuteri-sandvic` (13, kutu .1,.3,.9,.75). İkonlar: `toohottohandle-iconlar-1.png` 2973 px karede kutular (1000 ölçeğinde) x 215–405 / 405–595 / 595–785, y 413–583, 12 px içeriden kırpılıp alfa kutusuna göre kırpılır.

- [ ] **Step 1: Failing tests**

`tests/unit/seed.test.ts` içine:
```ts
it("names the blue group Spesiyal", () => {
  expect(seed.groups.map((g: { slug: string; nameTr: string }) => [g.slug, g.nameTr])).toEqual([
    ["kahve", "Kahve"], ["spesiyal", "Spesiyal"], ["yiyecek", "Yiyecek"], ["tatli", "Tatlı"], ["paket", "Paket & Atıştırmalık"],
  ]);
  expect(seed.categories.filter((c: { group: string }) => c.group === "spesiyal")).toHaveLength(7);
});
```
`tests/unit/image.test.ts` "attach … when THTH_SAMPLE_PHOTOS=1" testini güncelle: `ube-latte` → `"ornek-ube-latte"`, `cortado` → null, örnekli ürün sayısı `11`.

- [ ] **Step 2: Run, expect FAIL** — `npx vitest run tests/unit/seed.test.ts tests/unit/image.test.ts` → group adı "Kahvesiz", örnek sayısı 4.

- [ ] **Step 3: Implement** — seed script değişikliği ve `python3 scripts/excel_to_seed.py` ile `menu.json`'u yeniden üret (Excel yolu script'in mevcut argümanıyla; Excel repoya girmez). `scripts/brand_assets.py` yaz ve çalıştır; `sample-photos.json`'a 7 yeni eşleme ekle. `BrandIcon.tsx` ve `base.css`'e `.brand-icon{display:inline-block;background:currentColor;mask:no-repeat center/contain;-webkit-mask:no-repeat center/contain}` (mask-image inline style'dan gelir, `-webkit-mask-image` da aynı değerle verilir).

- [ ] **Step 4: Run, expect PASS** — aynı komut; ayrıca `npx vitest run` tamamı yeşil.

- [ ] **Step 5: Commit** — `feat(qr): Spesiyal group, brand icon/hero/group assets, more sample photos`

---

### Task 2: Vitrin (HOT & FAST / FREE / SHINE) ve saydam üst bar

**Files:**
- Create: `lib/brand/hero.ts`, `app/qr/_components/HeroSlides.tsx`, `app/qr/_components/Topbar.tsx`
- Modify: `app/qr/_components/MenuShell.tsx`, `app/qr/_components/MenuClient.tsx` (yalnızca buton renkleri sınıfla), `app/qr/_components/CategoryStrip.tsx` (`headerBottom` artık `.strip`'in kendi alt kenarı), `app/qr/styles/menu.css`
- Test: `tests/e2e/hero.spec.ts`

**Interfaces:**
- Produces: `HERO_SLIDES: readonly { key: "fast" | "free" | "shine"; title: string; image: string; color: "red" | "blue" | "yellow"; icon: "rabbit" | "lips" | "star" }[]` = fast (`HOT & FAST`, `/qr/hero/fast.webp`, red, rabbit), free (`HOT & FREE`, `/qr/hero/free.webp`, blue, lips), shine (`HOT & SHINE`, `/qr/hero/shine.webp`, yellow, star). `HERO_INTERVAL_MS = 4000`.
- Produces: `<HeroSlides />` (istemci): `data-testid="hero"`, aktif slayt `data-active="fast|free|shine"`, slogan `data-testid="hero-title"`, noktalar `<button aria-label="1. slayt">` … `aria-current="true"` aktifte; sol altta "MENÜ".
- Produces: üst bar `.topbar` sticky top 0; vitrin görünürken `data-solid="false"` (saydam, beyaz logo/ikon), vitrin %30'dan az görünürken `data-solid="true"` (kağıt zemin, kırmızı logo). Logo `BrandIcon name="logo" label="Too Hot To Handle"`.
- Produces: kategori şeridi `.strip` ayrı sticky (top = üst bar yüksekliği 60 px), vitrin + grup ızgarasından sonra gelir.

- [ ] **Step 1: Failing tests** (`tests/e2e/hero.spec.ts`, `openMenu` öncesi `await page.clock.install()`):
  - "starts on HOT & FAST and rotates every 4 s": `hero-title` = "HOT & FAST"; `page.clock.runFor(4100)` → "HOT & FREE"; tekrar → "HOT & SHINE"; tekrar → "HOT & FAST".
  - "dots switch slides": `getByRole("button", { name: "3. slayt" })` tık → `hero` `data-active="shine"`, o buton `aria-current="true"`.
  - "reduced motion keeps the first slide": `emulateMedia({ reducedMotion: "reduce" })`, `runFor(9000)` → hâlâ "HOT & FAST".
  - "pauses while the tab is hidden": `page.evaluate` ile `Object.defineProperty(document,"hidden",{value:true,configurable:true}); document.dispatchEvent(new Event("visibilitychange"))`, `runFor(9000)` → "HOT & FAST".
  - "a broken hero image still shows the slogan on color": `page.route("**/qr/hero/*.webp", r => r.abort())` → `hero-title` görünür, `hero` arka plan rengi `rgb(220, 37, 36)`.
  - "no branch name in the hero": `hero` metni "PETROL" içermez; "MENÜ" içerir.
  - "topbar turns solid after scrolling past the hero": başta `.topbar` `data-solid="false"`; `#cat-sicak-kahveler` görünüme kaydırılınca `"true"`; Ara ve WiFi düğmeleri her iki durumda görünür.
- [ ] **Step 2: Run, expect FAIL** — `npx playwright test hero` (bileşen yok).
- [ ] **Step 3: Implement** — `HeroSlides`: `useState` indeks; `setInterval(HERO_INTERVAL_MS)` yalnızca `!reducedMotion && !document.hidden && intersecting` iken çalışır (`IntersectionObserver` eşik 0.3, `visibilitychange`). Slaytlar üst üste mutlak, aktif olan `opacity:1; transform:scale(1)`, diğerleri `opacity:0; transform:scale(1.04)`, geçiş 600 ms. Zemin rengi token. Görsel `<img alt="" decoding="async">`; ilk slayt `fetchpriority="high"`, diğerleri `loading="lazy"`. Slayt ikonu sağ üstte `BrandIcon` 56 px. `Topbar` istemci bileşeni vitrinle aynı observer sonucunu `data-solid`'e yazar (HeroSlides `onSolidChange` prop'u veya `document.documentElement.dataset.heroVisible`; ikincisi seçildi: `HeroSlides` `html[data-hero-visible]` yazar, CSS `html[data-hero-visible="false"] .topbar` ile boyar — böylece Topbar sunucu bileşeni kalır).
- [ ] **Step 4: Run, expect PASS** — `npx playwright test hero`; ardından tam suite: önceki testlerden `.sticky`'ye dayanan seçiciler (CategoryStrip) güncellenir, `list.spec` şerit testleri yeşil kalmalı.
- [ ] **Step 5: Commit** — `feat(qr): rotating HOT & FAST/FREE/SHINE hero and transparent topbar`

---

### Task 3: Grup afişleri ve tavşanlı Ne içsem karesi (statik)

**Files:**
- Create: `lib/brand/groups.ts`, `app/qr/_components/GroupTiles.tsx`
- Modify: `app/qr/_components/MenuShell.tsx`, `app/qr/styles/menu.css`
- Test: `tests/e2e/groups.spec.ts`

**Interfaces:**
- Produces: `GROUP_STYLE: Record<string, { image: string; icon: "lips" | "rabbit" | "star" }>` = kahve (`/qr/groups/kahve.webp`, star), spesiyal (`/qr/groups/spesiyal.webp`, lips), yiyecek (`/qr/groups/yiyecek.webp`, rabbit), tatli (`/qr/groups/tatli.webp`, lips), paket (`/qr/groups/paket.webp`, star). Bilinmeyen grup: görsel yok, ikon star.
- Produces: `<GroupTiles groups firstCategoryOf neIcsem={ReactNode} />`: `<nav aria-label="Gruplar">` içinde 2×3 ızgara. Sıra: Kahve, [Ne içsem karesi], Spesiyal, Yiyecek, Tatlı, Paket & Atıştırmalık. Her afiş `<a href="#cat-{ilk kategori}" data-testid="group-tile">`, etiket grup renginde, yazı rengi `textOn`. Kare yüksekliği 196 px (390'da).
- Produces: Ne içsem karesi yer tutucu `<button data-testid="neicsem-tile">` sarı, `BrandIcon rabbit` 72 px (sınıf `ne-rabbit`, zıplama animasyonu, hareket azaltmada yok), altta "Ne içsem?". Task 6 bunu `NeIcsem` ile değiştirir.

- [ ] **Step 1: Failing tests** (`groups.spec.ts`):
  - "shows five group posters and the rabbit square in order": `group-tile` metinleri `["Kahve","Spesiyal","Yiyecek","Tatlı","Paket & Atıştırmalık"]` (büyük/küçük harf CSS ile; `textContent` bu metinler), ızgaradaki 2. çocuk `neicsem-tile`, onun metni "Ne içsem?".
  - "tiles are equal squares-ish and two per row at 390": ilk iki öğenin `boundingBox` y'si eşit, genişlikleri eşit, yükseklik ≥ 150.
  - "tapping Tatlı jumps to its first category": tık → `#cat-magnolia` görünümde, `category-tab` "Magnolia" `aria-current="true"`.
  - "the rabbit hops unless reduced motion": `.ne-rabbit` `animationName` ≠ "none"; reduce'ta "none".
  - "no horizontal scroll at 360": `scrollWidth - innerWidth ≤ 0`.
- [ ] **Step 2: Run, expect FAIL** — `npx playwright test groups`.
- [ ] **Step 3: Implement** — afiş görseli `<img alt="" loading="lazy">` `object-fit:cover`; görsel yoksa grup rengi + büyük ikon. Afiş linki CategoryStrip'in `jumpTo` mantığını kullanmalı (sticky başlık altında doğru konum): `GroupTiles` linkleri `data-jump="{slug}"` taşır, `CategoryStrip` belge tıklamalarında `[data-jump]` yakalayıp `jumpTo` çağırır ve `preventDefault` eder (JS yoksa `href` çalışır).
- [ ] **Step 4: Run, expect PASS** — `npx playwright test groups list`.
- [ ] **Step 5: Commit** — `feat(qr): group posters grid with rabbit Ne içsem square`

---

### Task 4: Kategori afişleri, yıldız fiyat rozetleri, ürün kartları (liste + arama)

**Files:**
- Create: `lib/menu/badges.ts`, `app/qr/_components/ProductCard.tsx`, `app/qr/_components/PriceStars.tsx`, `app/qr/_components/CategoryPoster.tsx`
- Delete: `app/qr/_components/ProductRow.tsx`, `ClientRow.tsx`, `RowImage.tsx`, `PriceTag.tsx`
- Modify: `app/qr/_components/MenuShell.tsx`, `SearchOverlay.tsx`, `clientTypes.ts`, `app/qr/styles/menu.css`
- Test: `tests/unit/badges.test.ts`; update `tests/e2e/list.spec.ts`, `menu.spec.ts`, `photos.spec.ts`, `search.spec.ts`

**Interfaces:**
- Produces: `priceBadges(p: MenuProduct, serverNow: string): { soldOut: boolean; full: string; stars: { short: "N" | "B" | "T" | "D" | null; price: string }[] }`. `full` = parçalar " · " ile ("Normal 210 ₺ · Büyük 230 ₺", tek fiyatta "170 ₺", tükendiyse "Tükendi"); `stars` tükendiyse `[]`.
- Produces: `CardProduct` (clientTypes'ta `ClientProduct` yerine): `{ slug; name; categoryName; groupColor: GroupColor; groupIcon: "lips"|"rabbit"|"star"; imageKey: string|null; soldOut: boolean; full: string; stars: {short,price}[]; sizes: string[] /* "Normal 210 ₺" gibi, detay için */; descTr: string|null; inSuggest: boolean }`.
- Produces: `<ProductCard p={CardProduct} />` → `<li data-testid="product-row" data-slug>` içinde `<button data-open-product={slug} class="card card--photo|card--plain">`; görünmez tam fiyat `<span class="sr-only" data-testid="price-full">{full}</span>`; yıldızlar `aria-hidden`.
- Produces: `<CategoryPoster name color icon />` → `<h2 class="poster">` 160 px, grup rengi, ad büyük harf Unbounded, sağ üstte `BrandIcon star` (renk zemine göre beyaz/mürekkep).

- [ ] **Step 1: Failing tests**
  - `badges.test.ts`: caramel-macchiato → `{ soldOut:false, full:"Normal 210 ₺ · Büyük 230 ₺", stars:[{short:"N",price:"210 ₺"},{short:"B",price:"230 ₺"}] }`; cortado → `full:"170 ₺", stars:[{short:null,price:"170 ₺"}]`; espresso → stars short `"T"`,`"D"`; `soldOutUntil` gelecekte → `{soldOut:true, full:"Tükendi", stars:[]}`.
  - `list.spec.ts`: `bdi` beklentileri `price-full` metnine çevrilir ("Normal 210 ₺ · Büyük 230 ₺"); yeni: "photo-less cards use the group color" (cortado kartı arka planı `rgb(220, 37, 36)`, yazı beyaz); "category starts with a poster" (`#cat-sicak-kahveler .poster` metni "Sıcak Kahveler", yükseklik ≥ 150); "two cards per row at 360 without horizontal scroll, long name wraps" (iced-white-chocolate-mocha adı kırpılmaz); sold-out kontrast testi yeni sınıflarla (kart `card--out`, etiket "Tükendi", kontrast ≥ 4.5).
  - `photos.spec.ts`: fotoğraflı kartta `img` üstte, genişlik = kart genişliği, yükseklik 140–170; fotoğrafsız kartta `img` yok ve `BrandIcon` var. `THTH_SAMPLE_PHOTOS` kapalıyken (ayrı `test.describe` ile değil — sunucu tek; bu durum `card--plain` sayısının 129 − örnek sayısı olmasıyla kontrol edilir).
  - `search.spec.ts`: sonuçlar `ProductCard` (seçiciler aynı `product-row`).
- [ ] **Step 2: Run, expect FAIL** — `npx vitest run tests/unit/badges.test.ts` ve `npx playwright test list photos search menu`.
- [ ] **Step 3: Implement** — `ProductCard`: fotoğraflı: beyaz kart, `<img src={imageSrc(key,320)} srcSet="…320w, …720w" sizes="50vw">` 150 px, ad Montserrat 600 büyük harf + kategori adı küçük; sağ altta `PriceStars` (ilk yıldız kırmızı 64 px beyaz fiyat; ikinci yıldız sarı 48 px, `B 230 ₺` mürekkep). Fotoğrafsız: grup renginde 132 px, sol üstte grup ikonu, ad Unbounded, altta fiyat düz metin (`stars` kısa harfleriyle "N 210 ₺ · B 230 ₺" ya da tek fiyat). Tükendi: yıldız yerine "Tükendi" etiketi (mürekkep zemin, kağıt yazı), fotoğraf `filter: grayscale(1)`. Liste `ul.cards` `grid-template-columns: repeat(2, minmax(0,1fr))`, 768+ üç sütun. `MenuShell` her kategori: `CategoryPoster` + `ul.cards` + `ExtrasLine`. `SearchOverlay` aynı `ul.cards`.
- [ ] **Step 4: Run, expect PASS** — aynı komutlar + tam suite.
- [ ] **Step 5: Commit** — `feat(qr): category posters and star-priced product cards`

---

### Task 5: Ürün detayı (fotoğraf + grup renginde panel)

**Files:**
- Modify: `app/qr/_components/ProductSheet.tsx`, `app/qr/styles/menu.css`
- Test: update `tests/e2e/detail.spec.ts`, `photos.spec.ts` (detay testi)

**Interfaces:**
- Consumes: `CardProduct` (Task 4).
- Produces: `data-testid="product-sheet"` korunur; panel `data-testid="sheet-panel"` grup renginde; boylar `data-testid="sheet-size"` düğme görünümlü (ilk seçili `aria-pressed="true"`, tıklayınca vurgu değişir, başka etkisi yok); tek fiyatta büyük beyaz yıldız `data-testid="sheet-price"`; × "Kapat" geçmiş davranışı aynen.

- [ ] **Step 1: Failing tests** (`detail.spec.ts`):
  - caramel-macchiato: başlık "Caramel Macchiato"; `sheet-size` metinleri `["Normal 210 ₺","Büyük 230 ₺"]`; ikincisine tık → onun `aria-pressed="true"`.
  - cortado: `sheet-price` "170 ₺", `sheet-size` yok.
  - `sheet-panel` arka planı kırmızı (Kahve), metin rengi beyaz; cheesecake (Tatlı) paneli pembe, yazı mürekkep.
  - alerjen girilmemiş üründe "Alerjen bilgisi için ekibimize sorabilirsin." görünür.
  - mevcut geri tuşu / × / Esc testleri aynen geçer.
- [ ] **Step 2: Run, expect FAIL** — `npx playwright test detail`.
- [ ] **Step 3: Implement** — fotoğraf varsa üstte `imageSrc 720/1280 srcset`, yükseklik `min(52vh, 460px)`; yoksa panel tam yükseklik ve grup ikonu 96 px. Panel yuvarlak üst köşe 26 px, ad Unbounded 32 px.
- [ ] **Step 4: Run, expect PASS** — `npx playwright test detail back photos`.
- [ ] **Step 5: Commit** — `feat(qr): product detail with photo and group-colored panel`

---

### Task 6: Ne içsem — yerinde açılan ikon slotu

**Files:**
- Create: `lib/menu/suggest.ts`, `app/qr/_components/NeIcsem.tsx`
- Modify: `app/qr/_components/GroupTiles.tsx` (yer tutucuyu `NeIcsem` ile değiştir), `MenuShell.tsx` (havuzu hazırla), `app/qr/styles/menu.css`
- Test: `tests/unit/suggest.test.ts`, `tests/e2e/neicsem.spec.ts`

**Interfaces:**
- Produces: `suggestPool(products: MenuProduct[], categories: MenuCategory[], serverNow: string): MenuProduct[]` — görünür, tükenmemiş, kategorisi `defaultInSuggest` olanlar.
- Produces: `pickSuggestions<T extends { imageKey: string | null }>(pool: T[], n: number, rand: () => number): T[]` — birbirinden farklı en fazla `n` öğe; önce fotoğraflılardan, sonra fotoğrafsızlardan; `rand` enjekte (test için).
- Produces: `<NeIcsem pool={CardProduct[]} />` — kapalıyken `data-testid="neicsem-tile"` sarı kare (Task 3 görünümü). Açıkken kare `grid-column: 1 / -1` olur, `data-testid="neicsem-open"`; üç kutu `data-testid="neicsem-reel"`, her biri durunca `<button data-open-product={slug}>` olur ve altında ad + `full` fiyat (`data-testid="neicsem-name"`); "Tekrar çevir" düğmesi; "Kapat" (×) kareyi geri kapatır. Geçmişe kayıt eklemez.

- [ ] **Step 1: Failing tests**
  - `suggest.test.ts`: `pickSuggestions` 3 farklı öğe döner; havuz 2 ise 2; boşsa []; fotoğraflılar önce (havuz 2 fotoğraflı + 5 fotoğrafsız, n=3 → ilk ikisi fotoğraflı); `rand` sabitken deterministik. `suggestPool` meşrubat ve yiyecek kategorilerini dışlar, tükenmişi dışlar.
  - `neicsem.spec.ts`:
    - "opens in place, spins the three icons and lands on three different drinks": kareye tık → URL değişmez (`history.length` aynı), `neicsem-open` görünür, 3 `neicsem-reel`; dönerken reel içinde `.brand-icon` görünür; 3 sn sonra 3 `neicsem-name`, metinleri birbirinden farklı.
    - "tapping a result opens its detail": ilk sonuca tık → `product-sheet` başlığı o adla aynı.
    - "spin again ignores taps while spinning": "Tekrar çevir"e hızlı iki kez bas → 3 sn sonra yine tam 3 sonuç, sayfada hata yok.
    - "close returns the square": × → `neicsem-tile` görünür, `neicsem-open` yok.
    - "reduced motion shows results without spinning": reduce → açıldıktan 400 ms içinde 3 `neicsem-name`.
    - "works without photos": `page.route("**/qr/img/**", r => r.abort())` → sonuç kutuları yine 3 ad gösterir (fotoğrafsız kutu grup renginde ikonla).
- [ ] **Step 2: Run, expect FAIL** — `npx vitest run tests/unit/suggest.test.ts`, `npx playwright test neicsem`.
- [ ] **Step 3: Implement** — her makara dikey şerit: 12 ikon karesi (dudak, tavşan, yıldız sırayla) + son kare sonuç (fotoğraf ya da grup renginde ikon). Açılınca bir kez kendiliğinden döner: şerit `translateY(0)`'dan son kareye, kutu başına süre 1400 / 1900 / 2400 ms, `cubic-bezier(.12,.75,.2,1)`. Dönerken `spinning` true; yeni dönüş yoksayılır. Tekrar çevirde şerit geçişsiz başa alınır (iki aşama: `transition:none` → bir kare sonra hedef). Sonuçlar `pickSuggestions(pool, 3, Math.random)`. Hareket azaltmada geçiş yok, sonuç 200 ms kararmayla. Havuz boşsa metin: "Şu an önerecek içecek yok. Ekibimize sorabilirsin."
- [ ] **Step 4: Run, expect PASS** — `npx playwright test neicsem groups detail` + tam suite (`npx vitest run`, `npx playwright test`).
- [ ] **Step 5: Commit** — `feat(qr): Ne içsem rabbit square with in-place icon slot`

---

### Son adım (Task 6 içinde değil, plan sonu)

- Ekran görüntüleri: `tests/e2e/screens.spec.ts` güncel düzenle 390/768/1440 + Ne içsem açık hali (`screens/neicsem-390.png`).
- Örnek fotoğraflı sunucu `THTH_SAMPLE_PHOTOS=1 npm run start` ile önizleme bağlantısı açılır, Enes'e gösterilir.

# A2 Toplu Ürün Yükleme (`a2-toplu-urun`) — Tarayıcı ve DOM İnceleme Raporu

- **Depo / Dal:** `justech0/toohottohandle` — `a2-toplu-urun`
- **Tarih:** 2026-11-04
- **Test Ortamı:** Boş `thth_dev` veritabanı (`scripts/reset-dev-db.js` ile sıfırlanmış, şema `001_menu` … `011_suggest_weight` ve başlangıç tohum verisi otomatik yüklenmiş), `THTH_SAMPLE_PHOTOS=1`, `npx next start -p 3000`
- **Kurulum Hesabı:** `/qr/admin/kurulum` üzerinden `admin@test.kafe` hesabı oluşturuldu (tek kullanımlık kurulum kodu sunucu kaydından alındı; rastgele üretilen şifre güvenlik kuralı gereği rapora yazılmamıştır)
- **İncelenen Görünümler:** `390×844` (Mobil — Pixel 7) ve `1440×900` (Masaüstü)
- **İncelenen Sayfalar:** `/qr`, `/qr/admin/kurulum`, `/qr/admin`, `/qr/admin/urunler`, `/qr/admin/urunler/2` (ürün düzenleme), `/qr/admin/toplu-urun` (bu dilimde eklenen toplu ürün yükleme ekranı — boş form ve aktarım sonucu durumları) ve `/qr/admin/kopyalar` (Loglar)

---

## 1. Yönetici Özeti

`a2-toplu-urun` diliminde eklenen **Toplu Ürün Yükle** (`/qr/admin/toplu-urun`) sayfası, yan menü (`AdminSidebar`), Genel Bakış (`/qr/admin`) hızlı erişim kartı ve Ürünler (`/qr/admin/urunler`) üst çubuk bağlantısı hem `390×844` hem de `1440×900` çözünürlüklerde gerçek Chromium tarayıcısında incelenmiş ve uçtan uca akışları (CSV yükleme, yeni kategori otomatik oluşturma, bozuk satırları satır numarasıyla raporlama, JSON yükleme, `/qr` canlı menüye anında yansıma, Loglar `/qr/admin/kopyalar` altında `"Toplu ürün yükleme öncesi menü"` kopyası ve `/qr/admin` üzerinden `"Son işlemi geri al"`) doğrulanmıştır.

Tüm ekranlarda **yatay taşma (`0`)**, **erişilebilir ad (`0 eksik`)**, **konsol/native dialog hatası (`0`)** ve **dış alan adı isteği (`0`)** kontrolleri **PASS** olmuştur. Bu dilimde eklenen `/qr/admin/toplu-urun` formunun kendi iç kontrolleri (`BrandSelect` grup seçici `48px`, dosya seçici `55px`, `İçe Aktar` düğmesi `48px`) `44×44px` dokunma hedefi koşulunu sağlamaktadır. Bununla birlikte ortak admin kabuğundan ve form stillerinden kaynaklanan aşağıdaki **4 bulgu (FAIL)** tespit edilmiştir:

1. **BULGU-1 (Dokunma Hedefi & Metin Kontrastı — `390×844` tüm `/qr/admin/*` sayfaları):** Mobil üst bardaki `.adm-bar__home-link` (`98.4×18px`) ve `.adm-bar__live-link` ("Canlı menüyü aç", `85.3×36px`) `44×44px` sınırının altındadır. Ayrıca `.adm-bar__live-link` bileşeninin `#dc2524` zemin üzerindeki yarı saydam arka planı (`rgba(255,255,255,0.18)` → efektif `#e24c4b`) ile `13px` beyaz metni arasındaki kontrast **3.91:1** olup `4.5:1` sınırının altındadır.
2. **BULGU-2 (Dokunma Hedefi — `1440×900` tüm `/qr/admin/*` sayfaları):** Masaüstü sol yan menüde `.adm-sidebar__logo-link` (`109.4×20px`) ve bu dilimde eklenen `"Toplu Ürün Yükle"` bağlantısı dahil 13 adet `.adm-sidebar__link` öğesinin tamamı (`227×42.3px`) `44px` minimum yükseklik sınırının altındadır.
3. **BULGU-3 (Dokunma Hedefi — `/qr/admin/urunler/2` `390×844` ve `1440×900`):** Ürün düzenleme sayfasındaki etiket ızgarası `.adm-check-grid label` `min-height: 40px` (`< 44px`) ile sınırdadır; ayrıca `.adm-checks input[type="checkbox"]` (`22×22px`) ve `.adm-check-grid input[type="checkbox"]` (`20×20px`) ham onay kutuları `< 44×44px` boyutundadır.
4. **BULGU-4 (Odak Halkası & Kenarlık Kontrastı — `/qr/admin/toplu-urun` dahil tüm `/qr/admin/*` sayfaları):** `.adm-btn--main:focus-visible` ("İçe Aktar", "Kaydet", "Son işlemi geri al") için `outline: 2px solid var(--c-white); outline-offset: 2px;` tanımlandığından, beyaz kart (`.adm-card` `#ffffff`) veya krem (`.adm` `#f3ece6`) zemin üzerinde düğme dışına çizilen beyaz odak halkasının arka planla kontrastı **1.00:1** / **1.17:1** olmaktadır (görünmez). Ayrıca `/qr/admin/toplu-urun` sayfasındaki `.adm-select__trigger` ve `.adm-field input[type="file"]` ile `/qr/admin/urunler` sayfasındaki `"Toplu Ürün Yükle"` (`.adm-btn--outline`) kenarlıklarında kullanılan `--c-line` (`#E2D6CE`) renginin beyaz zeminle kontrastı **1.42:1**, krem zeminle kontrastı **1.22:1** olup `3.0:1` sınırının altındadır.

---

## 2. Ölçüm Tablosu (Tüm Sayfalar — `390×844` ve `1440×900`)

| URL | Genişlik | Kontrol | Beklenen | Gerçek | PASS/FAIL |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/qr` | `390×844` | Yatay taşma | `scrollWidth <= 390` | `390 <= 390` | **PASS** |
| `/qr` | `390×844` | Dokunma hedefleri | Tüm hedefler `>= 44×44px` | 154 etkileşimli öğenin tamamı `>= 44×44px` (`smallTargets = 0`) | **PASS** |
| `/qr` | `390×844` | Erişilebilir ad | Eksik ad `= 0` | `0` eksik | **PASS** |
| `/qr` | `390×844` | Tab sırası ve odak halkası | Okuma sırasıyla uyumlu, odak görünür | `positiveTabIndex = 0`; odak halkaları `#120c0a` `2px` görünür | **PASS** |
| `/qr` | `390×844` | Metin ve kenarlık kontrastı | Metin `>= 4.5:1`, büyük/kenarlık `>= 3:1` | Metin `>= 4.86:1`, kenarlıklar `>= 3.0:1` | **PASS** |
| `/qr` | `390×844` | Konsol ve native dialog | `0` hata, native dialog yok | `0` konsol hatası, native `alert/confirm/prompt` yok | **PASS** |
| `/qr` | `390×844` | Dış alan adı isteği | `0` dış istek | `0` dış istek (yalnız `localhost:3000`) | **PASS** |
| `/qr` | `1440×900` | Yatay taşma | `scrollWidth <= 1440` | `1440 <= 1440` | **PASS** |
| `/qr` | `1440×900` | Dokunma hedefleri | Tüm hedefler `>= 44×44px` | 154 etkileşimli öğenin tamamı `>= 44×44px` (`smallTargets = 0`) | **PASS** |
| `/qr` | `1440×900` | Erişilebilir ad | Eksik ad `= 0` | `0` eksik | **PASS** |
| `/qr` | `1440×900` | Tab sırası ve odak halkası | Okuma sırasıyla uyumlu, odak görünür | `positiveTabIndex = 0`; odak halkaları görünür | **PASS** |
| `/qr` | `1440×900` | Metin ve kenarlık kontrastı | Metin `>= 4.5:1`, büyük/kenarlık `>= 3:1` | Metin `>= 4.86:1`, kenarlıklar `>= 3.0:1` | **PASS** |
| `/qr` | `1440×900` | Konsol ve native dialog | `0` hata, native dialog yok | `0` konsol hatası, native dialog yok | **PASS** |
| `/qr` | `1440×900` | Dış alan adı isteği | `0` dış istek | `0` dış istek | **PASS** |
| `/qr/admin/kurulum` | `390×844` | Yatay taşma | `scrollWidth <= 390` | `390 <= 390` | **PASS** |
| `/qr/admin/kurulum` | `390×844` | Dokunma hedefleri | Tüm hedefler `>= 44×44px` | `.adm-bar__home-link` `98.4×18px`, `.adm-bar__live-link` `85.3×36px` (form girdileri ve `Hesabı oluştur` düğmesi `>= 48px`) | **FAIL** |
| `/qr/admin/kurulum` | `390×844` | Erişilebilir ad | Eksik ad `= 0` | `0` eksik (`Kurulum kodu`, `E-posta`, `Şifre (en az 10 karakter)`, `Şifre (tekrar)`, `Hesabı oluştur`) | **PASS** |
| `/qr/admin/kurulum` | `390×844` | Tab sırası ve odak halkası | Okuma sırasıyla uyumlu, odak görünür | `positiveTabIndex = 0`; `.adm-btn--main:focus-visible` beyaz kart üzerinde `2px solid #ffffff` (`1.00:1`, görünmez) | **FAIL** |
| `/qr/admin/kurulum` | `390×844` | Metin ve kenarlık kontrastı | Metin `>= 4.5:1`, kenarlık `>= 3:1` | `.adm-bar__live-link` metin kontrastı `3.91:1` (`< 4.5:1`); `.adm-field input` kenarlığı `#E2D6CE` / `#FFFFFF` `1.42:1` (`< 3:1`) | **FAIL** |
| `/qr/admin/kurulum` | `390×844` | Konsol ve native dialog | `0` hata, native dialog yok | `0` konsol hatası, native dialog yok | **PASS** |
| `/qr/admin/kurulum` | `390×844` | Dış alan adı isteği | `0` dış istek | `0` dış istek | **PASS** |
| `/qr/admin/kurulum` | `1440×900` | Yatay taşma | `scrollWidth <= 1440` | `1440 <= 1440` | **PASS** |
| `/qr/admin/kurulum` | `1440×900` | Dokunma hedefleri | Tüm hedefler `>= 44×44px` | `.adm-sidebar__logo-link` `109.4×20px`, 13× `.adm-sidebar__link` `227×42.3px` (`< 44px`) | **FAIL** |
| `/qr/admin/kurulum` | `1440×900` | Erişilebilir ad | Eksik ad `= 0` | `0` eksik | **PASS** |
| `/qr/admin/kurulum` | `1440×900` | Tab sırası ve odak halkası | Okuma sırasıyla uyumlu, odak görünür | `.adm-btn--main:focus-visible` beyaz kart üzerinde `1.00:1` (görünmez) | **FAIL** |
| `/qr/admin/kurulum` | `1440×900` | Metin ve kenarlık kontrastı | Metin `>= 4.5:1`, kenarlık `>= 3:1` | Metin kontrastları `>= 4.86:1` PASS; `.adm-field input` kenarlığı `#E2D6CE` `1.42:1` (`< 3:1`) | **FAIL** |
| `/qr/admin/kurulum` | `1440×900` | Konsol ve native dialog | `0` hata, native dialog yok | `0` konsol hatası, native dialog yok | **PASS** |
| `/qr/admin/kurulum` | `1440×900` | Dış alan adı isteği | `0` dış istek | `0` dış istek | **PASS** |
| `/qr/admin` (Genel Bakış — `"Toplu ürün yükle"` kartı dahil) | `390×844` | Yatay taşma | `scrollWidth <= 390` | `390 <= 390` | **PASS** |
| `/qr/admin` | `390×844` | Dokunma hedefleri | Tüm hedefler `>= 44×44px` | `.adm-bar__home-link` `98.4×18px`, `.adm-bar__live-link` `85.3×36px` (`"Toplu ürün yükle"` dahil tüm `.adm-nav-tile` kartları `>= 77.6px` yükseklikte PASS) | **FAIL** |
| `/qr/admin` | `390×844` | Erişilebilir ad | Eksik ad `= 0` | `0` eksik | **PASS** |
| `/qr/admin` | `390×844` | Tab sırası ve odak halkası | Okuma sırasıyla uyumlu, odak görünür | `.adm-btn--main:focus-visible` (`Son işlemi geri al`) `1.00:1` beyaz odak halkası görünmez | **FAIL** |
| `/qr/admin` | `390×844` | Metin ve kenarlık kontrastı | Metin `>= 4.5:1`, kenarlık `>= 3:1` | `.adm-bar__live-link` `3.91:1`; `.adm-btn--outline` ("Çıkış yap") kenarlığı `#E2D6CE` `1.42:1` | **FAIL** |
| `/qr/admin` | `390×844` | Konsol ve native dialog | `0` hata, native dialog yok | `0` konsol hatası, native dialog yok | **PASS** |
| `/qr/admin` | `390×844` | Dış alan adı isteği | `0` dış istek | `0` dış istek | **PASS** |
| `/qr/admin` | `1440×900` | Yatay taşma | `scrollWidth <= 1440` | `1440 <= 1440` | **PASS** |
| `/qr/admin` | `1440×900` | Dokunma hedefleri | Tüm hedefler `>= 44×44px` | `.adm-sidebar__logo-link` `109.4×20px`, 13× `.adm-sidebar__link` `227×42.3px` | **FAIL** |
| `/qr/admin` | `1440×900` | Erişilebilir ad | Eksik ad `= 0` | `0` eksik | **PASS** |
| `/qr/admin` | `1440×900` | Tab sırası ve odak halkası | Okuma sırasıyla uyumlu, odak görünür | `.adm-btn--main:focus-visible` beyaz zemin üzerinde `1.00:1` görünmez | **FAIL** |
| `/qr/admin` | `1440×900` | Metin ve kenarlık kontrastı | Metin `>= 4.5:1`, kenarlık `>= 3:1` | `.adm-btn--outline` kenarlığı `#E2D6CE` `1.42:1` (`< 3:1`) | **FAIL** |
| `/qr/admin` | `1440×900` | Konsol ve native dialog | `0` hata, native dialog yok | `0` konsol hatası, native dialog yok | **PASS** |
| `/qr/admin` | `1440×900` | Dış alan adı isteği | `0` dış istek | `0` dış istek | **PASS** |
| `/qr/admin/urunler` (`"Toplu Ürün Yükle"` üst düğmesi dahil) | `390×844` | Yatay taşma | `scrollWidth <= 390` | `390 <= 390` | **PASS** |
| `/qr/admin/urunler` | `390×844` | Dokunma hedefleri | Tüm hedefler `>= 44×44px` | `.adm-bar__home-link` `98.4×18px`, `.adm-bar__live-link` `85.3×36px` (`"Toplu Ürün Yükle"` ve `"Yeni Ürün Ekle"` düğmeleri `>= 48px` PASS) | **FAIL** |
| `/qr/admin/urunler` | `390×844` | Erişilebilir ad | Eksik ad `= 0` | `0` eksik | **PASS** |
| `/qr/admin/urunler` | `390×844` | Tab sırası ve odak halkası | Okuma sırasıyla uyumlu, odak görünür | `.adm-btn--main:focus-visible` ("Yeni Ürün Ekle") `#f3ece6` zemin üzerinde beyaz halka `1.17:1` | **FAIL** |
| `/qr/admin/urunler` | `390×844` | Metin ve kenarlık kontrastı | Metin `>= 4.5:1`, kenarlık `>= 3:1` | `.adm-bar__live-link` `3.91:1`; `"Toplu Ürün Yükle"` (`.adm-btn--outline`) ve arama girdisi kenarlığı `#E2D6CE` `1.42:1` (`< 3:1`) | **FAIL** |
| `/qr/admin/urunler` | `390×844` | Konsol ve native dialog | `0` hata, native dialog yok | `0` konsol hatası, native dialog yok | **PASS** |
| `/qr/admin/urunler` | `390×844` | Dış alan adı isteği | `0` dış istek | `0` dış istek | **PASS** |
| `/qr/admin/urunler` | `1440×900` | Yatay taşma | `scrollWidth <= 1440` | `1440 <= 1440` | **PASS** |
| `/qr/admin/urunler` | `1440×900` | Dokunma hedefleri | Tüm hedefler `>= 44×44px` | `.adm-sidebar__logo-link` `109.4×20px`, 13× `.adm-sidebar__link` `227×42.3px` | **FAIL** |
| `/qr/admin/urunler` | `1440×900` | Erişilebilir ad | Eksik ad `= 0` | `0` eksik | **PASS** |
| `/qr/admin/urunler` | `1440×900` | Tab sırası ve odak halkası | Okuma sırasıyla uyumlu, odak görünür | `.adm-btn--main:focus-visible` `1.17:1` | **FAIL** |
| `/qr/admin/urunler` | `1440×900` | Metin ve kenarlık kontrastı | Metin `>= 4.5:1`, kenarlık `>= 3:1` | `"Toplu Ürün Yükle"` (`.adm-btn--outline`) ve arama girdisi kenarlığı `#E2D6CE` `1.42:1` | **FAIL** |
| `/qr/admin/urunler` | `1440×900` | Konsol ve native dialog | `0` hata, native dialog yok | `0` konsol hatası, native dialog yok | **PASS** |
| `/qr/admin/urunler` | `1440×900` | Dış alan adı isteği | `0` dış istek | `0` dış istek | **PASS** |
| `/qr/admin/urunler/2` (Cortado Düzenleme + `<dialog data-testid="price-confirm">`) | `390×844` | Yatay taşma | `scrollWidth <= 390` | `390 <= 390` | **PASS** |
| `/qr/admin/urunler/2` | `390×844` | Dokunma hedefleri | Tüm hedefler `>= 44×44px` | `.adm-bar__home-link` `98.4×18px`, `.adm-bar__live-link` `85.3×36px`, 6× `.adm-check-grid label` `40px` (`input` `20×20px`), 3× `.adm-checks input[type="checkbox"]` `22×22px` | **FAIL** |
| `/qr/admin/urunler/2` | `390×844` | Erişilebilir ad | Eksik ad `= 0` | `0` eksik (fiyat onay `<dialog>` `aria-labelledby="price-confirm-title"` ile adlandırılmış) | **PASS** |
| `/qr/admin/urunler/2` | `390×844` | Tab sırası ve odak halkası | Okuma sırasıyla uyumlu, odak görünür | `.adm-btn--main:focus-visible` ve `.adm-btn--danger:focus-visible` beyaz odak halkası `1.00:1` / `1.17:1` | **FAIL** |
| `/qr/admin/urunler/2` | `390×844` | Metin ve kenarlık kontrastı | Metin `>= 4.5:1`, kenarlık `>= 3:1` | `.adm-bar__live-link` `3.91:1`; `.adm-field input/textarea` ve `.adm-select__trigger` kenarlığı `#E2D6CE` `1.42:1` | **FAIL** |
| `/qr/admin/urunler/2` | `390×844` | Konsol ve native dialog | `0` hata, native dialog yok | `0` konsol hatası; fiyat onayı ve silme onayı yerel `<dialog>` kullanır | **PASS** |
| `/qr/admin/urunler/2` | `390×844` | Dış alan adı isteği | `0` dış istek | `0` dış istek | **PASS** |
| `/qr/admin/urunler/2` | `1440×900` | Yatay taşma | `scrollWidth <= 1440` | `1440 <= 1440` | **PASS** |
| `/qr/admin/urunler/2` | `1440×900` | Dokunma hedefleri | Tüm hedefler `>= 44×44px` | `.adm-sidebar` bağlantıları `42.3px`, 6× `.adm-check-grid label` `40px` (`input` `20×20px`), 3× `.adm-checks input` `22×22px` | **FAIL** |
| `/qr/admin/urunler/2` | `1440×900` | Erişilebilir ad | Eksik ad `= 0` | `0` eksik | **PASS** |
| `/qr/admin/urunler/2` | `1440×900` | Tab sırası ve odak halkası | Okuma sırasıyla uyumlu, odak görünür | `.adm-btn--main:focus-visible` ve `.adm-btn--danger:focus-visible` `1.00:1` / `1.17:1` | **FAIL** |
| `/qr/admin/urunler/2` | `1440×900` | Metin ve kenarlık kontrastı | Metin `>= 4.5:1`, kenarlık `>= 3:1` | `.adm-field input/textarea` ve `.adm-select__trigger` kenarlığı `#E2D6CE` `1.42:1` | **FAIL** |
| `/qr/admin/urunler/2` | `1440×900` | Konsol ve native dialog | `0` hata, native dialog yok | `0` konsol hatası, native dialog yok | **PASS** |
| `/qr/admin/urunler/2` | `1440×900` | Dış alan adı isteği | `0` dış istek | `0` dış istek | **PASS** |
| `/qr/admin/toplu-urun` (Yeni ekran — Boş form + Aktarım Sonucu Raporu) | `390×844` | Yatay taşma | `scrollWidth <= 390` | `390 <= 390` (hem boş formda hem rapor açıkken) | **PASS** |
| `/qr/admin/toplu-urun` | `390×844` | Dokunma hedefleri | Tüm hedefler `>= 44×44px` | Sayfa içi kontrollerin tamamı `>= 44×44px` (`BrandSelect` `318×48px`, `input[type="file"]` `318×55px`, `İçe Aktar` `318×48px`); ancak üst bardaki `.adm-bar__home-link` `98.4×18px` ve `.adm-bar__live-link` `85.3×36px` | **FAIL** |
| `/qr/admin/toplu-urun` | `390×844` | Erişilebilir ad | Eksik ad `= 0` | `0` eksik (`Yeni kategoriler için grup`, `Dosya Seç (.csv veya .json)`, `İçe Aktar`, `role="status"`, `aria-label="İçe Aktarma Sonucu"`) | **PASS** |
| `/qr/admin/toplu-urun` | `390×844` | Tab sırası ve odak halkası | Okuma sırasıyla uyumlu, odak görünür | `positiveTabIndex = 0`, `BrandSelect` (`3px solid #dc2524`) ve `input[type="file"]` (`2px solid #2a1514`) odak halkası görünür; ancak `.adm-btn--main:focus-visible` ("İçe Aktar") beyaz kart üzerinde `2px solid #ffffff` (`1.00:1`, görünmez) | **FAIL** |
| `/qr/admin/toplu-urun` | `390×844` | Metin ve kenarlık kontrastı | Metin `>= 4.5:1`, kenarlık `>= 3:1` | Sayfa içi tüm metinler (`15.6:1`, notlar `6.18:1`, eklenen ürün `#1f6b4d` `6.43:1`, atlanan satırlar `#b5191c` `6.48:1`) PASS; ancak `.adm-bar__live-link` metni `3.91:1` (`< 4.5:1`) ve `.adm-select__trigger` / `input[type="file"]` kenarlığı `#E2D6CE` `1.42:1` (`< 3:1`) | **FAIL** |
| `/qr/admin/toplu-urun` | `390×844` | Konsol ve native dialog | `0` hata, native dialog yok | `0` konsol hatası, native dialog yok | **PASS** |
| `/qr/admin/toplu-urun` | `390×844` | Dış alan adı isteği | `0` dış istek | `0` dış istek | **PASS** |
| `/qr/admin/toplu-urun` (Yeni ekran — Boş form + Aktarım Sonucu Raporu) | `1440×900` | Yatay taşma | `scrollWidth <= 1440` | `1440 <= 1440` (hem boş formda hem rapor açıkken) | **PASS** |
| `/qr/admin/toplu-urun` | `1440×900` | Dokunma hedefleri | Tüm hedefler `>= 44×44px` | Sayfa içi kontrollerin tamamı `>= 44×44px` (`BrandSelect` `877×48px`, `input[type="file"]` `877×55px`, `İçe Aktar` `877×48px`); ancak yan menüdeki `.adm-sidebar__logo-link` `109.4×20px` ve 13× `.adm-sidebar__link` `227×42.3px` | **FAIL** |
| `/qr/admin/toplu-urun` | `1440×900` | Erişilebilir ad | Eksik ad `= 0` | `0` eksik | **PASS** |
| `/qr/admin/toplu-urun` | `1440×900` | Tab sırası ve odak halkası | Okuma sırasıyla uyumlu, odak görünür | `.adm-btn--main:focus-visible` ("İçe Aktar") beyaz kart üzerinde `1.00:1` görünmez | **FAIL** |
| `/qr/admin/toplu-urun` | `1440×900` | Metin ve kenarlık kontrastı | Metin `>= 4.5:1`, kenarlık `>= 3:1` | Tüm metin kontrastları `>= 4.86:1` PASS; `.adm-select__trigger` ve `input[type="file"]` kenarlığı `#E2D6CE` `1.42:1` (`< 3:1`) | **FAIL** |
| `/qr/admin/toplu-urun` | `1440×900` | Konsol ve native dialog | `0` hata, native dialog yok | `0` konsol hatası, native dialog yok | **PASS** |
| `/qr/admin/toplu-urun` | `1440×900` | Dış alan adı isteği | `0` dış istek | `0` dış istek | **PASS** |
| `/qr/admin/kopyalar` (Loglar — `"Toplu ürün yükleme öncesi menü"` kopyası ve geçmiş) | `390×844` | Yatay taşma | `scrollWidth <= 390` | `390 <= 390` | **PASS** |
| `/qr/admin/kopyalar` | `390×844` | Dokunma hedefleri | Tüm hedefler `>= 44×44px` | `.adm-bar__home-link` `98.4×18px`, `.adm-bar__live-link` `85.3×36px` (`Bu kopyaya dön` düğmeleri `>= 48px` PASS) | **FAIL** |
| `/qr/admin/kopyalar` | `390×844` | Erişilebilir ad | Eksik ad `= 0` | `0` eksik | **PASS** |
| `/qr/admin/kopyalar` | `390×844` | Tab sırası ve odak halkası | Okuma sırasıyla uyumlu, odak görünür | Tab sırası doğru, `.adm-btn:focus-visible` `#2a1514` `2px` görünür | **PASS** |
| `/qr/admin/kopyalar` | `390×844` | Metin ve kenarlık kontrastı | Metin `>= 4.5:1`, kenarlık `>= 3:1` | `.adm-bar__live-link` `3.91:1` (`< 4.5:1`) | **FAIL** |
| `/qr/admin/kopyalar` | `390×844` | Konsol ve native dialog | `0` hata, native dialog yok | `0` konsol hatası, native dialog yok | **PASS** |
| `/qr/admin/kopyalar` | `390×844` | Dış alan adı isteği | `0` dış istek | `0` dış istek | **PASS** |
| `/qr/admin/kopyalar` | `1440×900` | Yatay taşma | `scrollWidth <= 1440` | `1440 <= 1440` | **PASS** |
| `/qr/admin/kopyalar` | `1440×900` | Dokunma hedefleri | Tüm hedefler `>= 44×44px` | `.adm-sidebar__logo-link` `109.4×20px`, 13× `.adm-sidebar__link` `227×42.3px` | **FAIL** |
| `/qr/admin/kopyalar` | `1440×900` | Erişilebilir ad | Eksik ad `= 0` | `0` eksik | **PASS** |
| `/qr/admin/kopyalar` | `1440×900` | Tab sırası ve odak halkası | Okuma sırasıyla uyumlu, odak görünür | Tab sırası doğru, `.adm-btn:focus-visible` `#2a1514` `2px` görünür | **PASS** |
| `/qr/admin/kopyalar` | `1440×900` | Metin ve kenarlık kontrastı | Metin `>= 4.5:1`, kenarlık `>= 3:1` | Metin kontrastları `>= 4.86:1`, `.adm-btn` kenarlığı `1.5px solid #2a1514` (`15.6:1`) | **PASS** |
| `/qr/admin/kopyalar` | `1440×900` | Konsol ve native dialog | `0` hata, native dialog yok | `0` konsol hatası, native dialog yok | **PASS** |
| `/qr/admin/kopyalar` | `1440×900` | Dış alan adı isteği | `0` dış istek | `0` dış istek | **PASS** |

---

## 3. Tespit Edilen FAIL Bulguları, Ekran Görüntüleri ve Önerilen Düzeltmeler

### BULGU-1: Mobil Üst Bar (`.adm-bar`) Dokunma Hedefleri (`< 44×44px`) ve "Canlı menüyü aç" Bağlantısı Metin Kontrastı (`3.91:1 < 4.5:1`)
- **Etkilenen Sayfalar:** `/qr/admin/toplu-urun` dahil tüm `/qr/admin/*` sayfaları (`390×844`)
- **Ekran Görüntüleri:**
  - `docs/reviews/screens/a2-toplu-urun-kurulum-390.png`
  - `docs/reviews/screens/a2-toplu-urun-admin-390.png`
  - `docs/reviews/screens/a2-toplu-urun-bos-390.png`
  - `docs/reviews/screens/a2-toplu-urun-sonuc-390.png`
- **Kök Neden (`app/qr/admin/admin.css` satır 167–198):**
  - `.adm-bar__home-link` için `min-height: 44px` tanımlanmamıştır (`98.4×18px`).
  - `.adm-bar__live-link` için `min-height: 36px; padding: 6px 12px;` ve `background: rgba(255, 255, 255, 0.18);` tanımlanmıştır (`85.3×36px`). `#dc2524` üst bar üzerinde `rgba(255, 255, 255, 0.18)` karışımı `#e24c4b` rengini üretmekte ve üzerindeki `13px` (`font-weight: 600`) `#ffffff` metinle **3.91:1** kontrast vermektedir.
- **Önerilen Düzeltme (`app/qr/admin/admin.css`):**
  ```css
  .adm-bar__home-link {
    display: inline-flex;
    align-items: center;
    min-height: 44px;
    padding: 0 4px;
    color: var(--c-white);
    text-decoration: none;
  }

  .adm-bar__live-link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-height: 44px;
    padding: 8px 14px;
    border-radius: 999px;
    background: rgba(18, 12, 10, 0.28); /* #dc2524 üzerinde #ffffff ile >= 6.4:1 kontrast sağlar */
    color: var(--c-white);
    font-size: 13px;
    font-weight: 600;
    text-decoration: none;
  }
  ```

---

### BULGU-2: Masaüstü Yan Menü (`.adm-sidebar`) Dokunma Hedefleri (`< 44×44px`)
- **Etkilenen Sayfalar:** `/qr/admin/toplu-urun` dahil tüm `/qr/admin/*` sayfaları (`1440×900`)
- **Ekran Görüntüleri:**
  - `docs/reviews/screens/a2-toplu-urun-admin-1440.png`
  - `docs/reviews/screens/a2-toplu-urun-urunler-1440.png`
  - `docs/reviews/screens/a2-toplu-urun-bos-1440.png`
  - `docs/reviews/screens/a2-toplu-urun-sonuc-1440.png`
  - `docs/reviews/screens/a2-toplu-urun-kopyalar-1440.png`
- **Kök Neden (`app/qr/admin/admin.css` satır 66–109):**
  - `.adm-sidebar__logo-link` (`109.4×20px`) ve bu dilimde eklenen `"Toplu Ürün Yükle"` dahil 13 adet `.adm-sidebar__link` (`padding: 11px 14px` → `227×42.3px`) öğesinde `min-height: 44px` tanımlı değildir.
- **Önerilen Düzeltme (`app/qr/admin/admin.css`):**
  ```css
  .adm-sidebar__logo-link {
    display: inline-flex;
    align-items: center;
    min-height: 44px;
    color: var(--c-ink);
    text-decoration: none;
  }

  .adm-sidebar__link {
    display: flex;
    align-items: center;
    gap: 12px;
    min-height: 44px;
    padding: 11px 14px;
  }
  ```

---

### BULGU-3: Ürün Düzenleme Etiket Izgarası (`.adm-check-grid label`) ve Onay Kutuları (`< 44×44px`)
- **Etkilenen Sayfa:** `/qr/admin/urunler/2` (`390×844` ve `1440×900`)
- **Ekran Görüntüleri:**
  - `docs/reviews/screens/a2-toplu-urun-duzenle-390.png`
  - `docs/reviews/screens/a2-toplu-urun-duzenle-1440.png`
- **Kök Neden (`app/qr/admin/admin.css` satır 1099–1111 ve 1245–1257):**
  - `.adm-check-grid label` `min-height: 40px` olarak tanımlanmıştır (`< 44px`).
  - `.adm-checks input` (`22×22px`) ve `.adm-check-grid input` (`20×20px`) ham onay kutuları `< 44×44px` boyutundadır.
- **Önerilen Düzeltme (`app/qr/admin/admin.css`):**
  ```css
  .adm-check-grid label {
    position: relative;
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 44px;
    font-size: 14px;
  }
  ```

---

### BULGU-4: Birincil/Tehlike Düğmelerinde Görünmez Beyaz Odak Halkası (`1.00:1`) ve `--c-line` (`#E2D6CE`) Kenarlık Kontrastı (`1.42:1 < 3.0:1`)
- **Etkilenen Sayfalar:** `/qr/admin/toplu-urun`, `/qr/admin`, `/qr/admin/urunler`, `/qr/admin/urunler/2`, `/qr/admin/kurulum` (`390×844` ve `1440×900`)
- **Ekran Görüntüleri:**
  - `docs/reviews/screens/a2-toplu-urun-bos-390.png`
  - `docs/reviews/screens/a2-toplu-urun-sonuc-390.png`
  - `docs/reviews/screens/a2-toplu-urun-urunler-390.png`
  - `docs/reviews/screens/a2-toplu-urun-duzenle-390.png`
- **Kök Neden (`app/qr/admin/admin.css` satır 402–408, 359–361, 1052–1063, 1547):**
  - Satır 402–408'de `.adm-btn--main:focus-visible, .adm-btn--danger:focus-visible` için `outline: 2px solid var(--c-white); outline-offset: 2px;` tanımlanmıştır. `outline-offset: 2px` halkayı düğmenin **dışına** (beyaz `.adm-card` `#ffffff` veya krem `.adm` `#f3ece6` arka planın üzerine) çizdiği için `/qr/admin/toplu-urun` üzerindeki `"İçe Aktar"` düğmesi dahil birincil düğmelerde odak halkası arka planla **1.00:1** / **1.17:1** kontrastta kalmakta ve görünmemektedir.
  - `.adm-field input` (`input[type="file"]` dahil), `.adm-field textarea`, `.adm-select__trigger` ve `.adm-btn--outline` (`"Toplu Ürün Yükle"` üst düğmesi dahil) kenarlıklarında kullanılan `--c-line` (`#E2D6CE`) rengi `#FFFFFF` üzerinde **1.42:1**, `#F3ECE6` üzerinde **1.22:1** kontrast üretmektedir (`< 3.0:1`).
- **Önerilen Düzeltme (`app/qr/admin/admin.css`):**
  ```css
  .adm-btn--main:focus-visible,
  .adm-btn--danger:focus-visible {
    outline: 2px solid var(--c-ink);
    outline-offset: 2px;
  }

  .adm-field input,
  .adm-field textarea,
  .adm-select__trigger,
  .adm-btn--outline {
    border-color: #8f7e75; /* #FFFFFF ile 3.92:1, #F3ECE6 ile 3.38:1 kontrast */
  }
  ```

---

## 4. Elle Denenen Akışlar ve `/qr` Canlı Yansıma Doğrulaması

| # | Akış | Adımlar | Beklenen | Gözlemlenen | Sonuç |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | **Kurulum (`/qr/admin/kurulum`)** | Sunucu kaydından kurulum kodu alındı, `admin@test.kafe` ve rastgele şifre ile hesap oluşturuldu | `/qr/admin` Genel Bakış ekranına yönlendirme, aktif oturum | `/qr/admin` açıldı (`Yönetici: admin@test.kafe`), kurulum sayfası kapandı | **PASS** |
| **2** | **Ürün Fiyat Değiştir → Onay → `/qr` → Geri Al (`/qr/admin/urunler/2`)** | `Cortado` (`id=2`) fiyatı `170` → `185` yapıldı, `Kaydet` tıklandı → `<dialog data-testid="price-confirm">` içinde `170 ₺ → 185 ₺` ve `Evet, kaydet` onayı verildi → `/qr` kontrol edildi → `/qr/admin` üzerinde `Son işlemi geri al` tıklandı → `/qr` tekrar kontrol edildi | Değişiklik `/qr`'de anında `185 ₺` olarak görünmeli; geri alındığında anında `170 ₺`'ye dönmeli | `/qr`'de `Cortado` satırı hemen `185 ₺` oldu; geri al sonrasında hemen `170 ₺`'ye döndü | **PASS** |
| **3** | **Toplu Ürün Yükle — CSV (`/qr/admin/toplu-urun` → `/qr` → `/qr/admin/kopyalar` → Geri Al)** | `/qr/admin/toplu-urun` açıldı; `Yeni kategoriler için grup` (`BrandSelect`) klavyeyle (`Enter`, `ArrowDown`, `Home`, `Enter`) test edildi; 4 satırlık CSV (`Sıcak Kahveler -> Tarayıcı Test Kahvesi 195 ₺`, `Tarayıcı Özel Kategori -> Tarayıcı İmza İçecek 240 ₺`, 1 eksik kategori satırı, 1 sayısal olmayan fiyat satırı) seçilip `İçe Aktar` tıklandı → sonuç kartı (`docs/reviews/screens/a2-toplu-urun-sonuc-390.png`, `a2-toplu-urun-sonuc-1440.png`) doğrulandı → `/qr` kontrol edildi (`docs/reviews/screens/a2-toplu-urun-qr-yansima-390.png`) → `/qr/admin/kopyalar` kontrol edildi (`docs/reviews/screens/a2-toplu-urun-kopyalar-1440.png`) → `/qr/admin`'de `Son işlemi geri al` tıklandı → `/qr` tekrar kontrol edildi | `Okunan satır: 4`, `Eklenen ürün: 2`, `Yeni kategoriler: Tarayıcı Özel Kategori` ve 2 atlanan satır raporlanmalı; `/qr`'de her iki ürün ve yeni kategori anında görünmeli; Loglar'da `"Toplu ürün yükleme öncesi menü"` kopyası ve `"2 ürün toplu yüklendi (1 yeni kategori)"` kaydı oluşmalı; geri alındığında `/qr`'den hem ürünler hem yeni kategori kalkmalı | Rapor birebir eşleşti; `/qr`'de `Tarayıcı Test Kahvesi` (`195 ₺`), `Tarayıcı Özel Kategori` başlığı ve `Tarayıcı İmza İçecek` (`240 ₺`) anında göründü; Loglar'da kopya ve geçmiş satırı doğrulandı; `Son işlemi geri al` sonrası `/qr`'den her iki ürün ve otomatik açılan kategori anında kaldırıldı (`qrAfterUndoCount = 0`, `qrCategoryAfterUndoCount = 0`) | **PASS** |
| **4** | **Toplu Ürün Yükle — JSON (`/qr/admin/toplu-urun` → `/qr` → Geri Al)** | `/qr/admin/toplu-urun` ekranında `Soğuk Kahveler` kategorisine `JSON Cold Brew` (`215 ₺`) içeren `.json` dosyası yüklendi → `/qr` kontrol edildi → `/qr/admin`'de `Son işlemi geri al` ile geri alındı | `Okunan satır: 1`, `Eklenen ürün: 1`, `Yeni kategoriler: Yok` görünmeli; ürün `/qr`'de anında listelenmeli ve geri alınabilmeli | `JSON Cold Brew` `/qr` menüsünde anında göründü (`qrHasJsonProduct = true`) ve geri al ile temizlendi | **PASS** |


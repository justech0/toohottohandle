# A2 Admin Revizyonu (`a2-admin-revize`) — Tarayıcı ve DOM İnceleme Raporu

- **Depo / Dal:** `justech0/toohottohandle` — `a2-admin-revize` (`08fd064`)
- **Tarih:** 2026-11-03
- **Test Ortamı:** Boş `thth_dev` veritabanı (`scripts/reset-dev-db.js` ile sıfırlanmış, şema `001_menu` … `011_suggest_weight` ve başlangıç tohum verisi otomatik yüklenmiş), `THTH_SAMPLE_PHOTOS=1`, `npx next start -p 3000`
- **Kurulum Hesabı:** `/qr/admin/kurulum` üzerinden `admin@test.kafe` hesabı oluşturuldu (tek kullanımlık kurulum kodu sunucu kaydından alındı; rastgele üretilen şifre güvenlik kuralı gereği rapora yazılmamıştır)
- **İncelenen Görünümler:** `390×844` (Mobil — Pixel 7) ve `1440×900` (Masaüstü)

---

## 1. Yönetici Özeti

`a2-admin-revize` diliminde yapılan tüm işlevsel ve yapısal değişiklikler (yan menüde **Genel Bakış** ilk ve **Loglar** son sırada, vitrin slaytlarından ikon alanının kaldırılması `010_hero_no_icon`, dışarı aktarma ekranından geri yükleme formunun kaldırılıp geri yüklemenin yalnızca **Loglar** `/qr/admin/kopyalar` ekranında tutulması, **WiFi, istatistik ve QR** ekranında QR altında açık URL yazısının kaldırılması, **Ne içsem** ürün olasılık ağırlıkları `Normal / 2 kat / 3 kat / 5 kat` `011_suggest_weight`, `/qr` sağ alt sabit **Söz sende** baloncuğu `.feedback-fab`, 5 tavşan seçildiğinde `TOOHOTT!` fişi ve **Toplu fiyat** ekranında **Tüm menü** kapsamı + 129 ürünlük tam fiyat tablosu üzerinde satır içi önizleme) hem `390×844` hem `1440×900` çözünürlüklerde uçtan uca doğrulanmıştır.

Bununla birlikte DOM ve CSS ölçümlerinde **yatay taşma (`0`)**, **erişilebilir ad (`0 eksik`)**, **konsol/native dialog hatası (`0`)** ve **dış alan adı isteği (`0`)** kontrolleri tüm ekranlarda **PASS** olurken, aşağıdaki **6 tasarım/erişilebilirlik bulgusu (FAIL)** tespit edilmiştir:

1. **BULGU-1 (Dokunma Hedefi & Metin Kontrastı — `390×844` tüm `/qr/admin/*` sayfaları):** Mobil üst bardaki `.adm-bar__home-link` (`98.4×18px`) ve `.adm-bar__live-link` ("Menü", `85.3×36px`) `44×44px` sınırının altındadır. Ayrıca `.adm-bar__live-link` bileşeninin `#dc2524` zemin üzerindeki yarı saydam arka planı (`rgba(255,255,255,0.18)` → efektif `#e24c4b`) ile `13px` beyaz metni arasındaki kontrast **3.90:1** olup `4.5:1` sınırının altındadır.
2. **BULGU-2 (Dokunma Hedefi — `1440×900` tüm `/qr/admin/*` sayfaları):** Masaüstü sol yan menüde `.adm-sidebar__logo-link` (`109.4×20px`) ve 12 adet `.adm-sidebar__link` öğesinin tamamı (`227.2×42.3px`) `44px` minimum yükseklik sınırının altındadır.
3. **BULGU-3 (Dokunma Hedefi — `/qr/admin/ne-icsem` `390×844` ve `1440×900`):** Bu dilimde eklenen olasılık ağırlık seçicileri (`.adm-weight-pill`, 129 ürün × 4 seçenek = 516 radyo hapı) `min-height: 40px` kuralı nedeniyle `69.7×40px` (`390×844`) ve `63.6×40px` (`1440×900`) boyutundadır (`< 44px`). "Seçtiklerim" modunda ürün satırı etiketi `label.adm-weight-row__name` `40px` yüksekliğinde, içindeki onay kutusu `input[type="checkbox"]` ise `20×20px` boyutundadır.
4. **BULGU-4 (Dokunma Hedefi — `/qr/admin/geri-bildirim` `390×844` ve `1440×900`):** Üstteki `.feedback-back` ("Menü yönetimine dön") bağlantısı `168.8×21.8px`, filtre formundaki `input[name="okunmamis"]` onay kutusu `13×13px` (sarmalayan `label` `44px`) ve geri bildirim kartı içindeki `.feedback-entry .adm-btn` ("Okundu işaretle" `136.9×36px`, "Sil" `56.4×36px`) düğmeleri `min-height: 36px` kuralı nedeniyle `44×44px` altındadır.
5. **BULGU-5 (Dokunma Hedefi — `/qr/admin/urunler/2`, `/qr/admin/vitrin`, `/qr/admin/katalog`, `/qr/admin/istatistik`):** Ürün düzenleme sayfasındaki etiket ızgarası `.adm-check-grid label` `min-height: 40px` (`158.6×40px` / `205.5×40px`) ile `44px` altındadır; ayrıca `.adm-checks input[type="checkbox"]` (`22×22px`) ve `.adm-check-grid input[type="checkbox"]` (`20×20px`) ham onay kutuları `44×44px` altındadır.
6. **BULGU-6 (Odak Halkası & Kenarlık Kontrastı — tüm `/qr/admin/*` sayfaları):** `.adm-btn--main:focus-visible` ve `.adm-btn--danger:focus-visible` için `outline: 2px solid var(--c-white); outline-offset: 2px;` tanımlandığından, beyaz (`.adm-card` `#ffffff`) veya krem (`.adm` `#f3ece6`) zemin üzerindeki birincil/tehlike düğmelerinin dışına çizilen beyaz odak halkasının arka planla kontrastı **1.00:1** / **1.17:1** olmaktadır (görünmez). Ayrıca admin form girdileri (`.adm-field input/textarea`), `.adm-select__trigger`, `.adm-op` ve `.adm-btn--outline` kenarlıklarında kullanılan `--c-line` (`#E2D6CE`) renginin beyaz zeminle kontrastı **1.42:1**, krem zeminle kontrastı **1.22:1** olup `3.0:1` sınırının altındadır.

---

## 2. Ölçüm Tablosu (Tüm Sayfalar — `390×844` ve `1440×900`)

| URL | Genişlik | Kontrol | Beklenen | Gerçek | PASS/FAIL |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/qr` (Varsayılan + "Söz sende" sabit baloncuğu `.feedback-fab`) | `390×844` | Yatay taşma | `scrollWidth <= 390` | `390 <= 390` | **PASS** |
| `/qr` (Varsayılan + `.feedback-fab`) | `390×844` | Dokunma hedefleri | Tüm hedefler `>= 44×44px` | 150 etkileşimli öğenin tamamı `>= 44×44px`; `.feedback-fab` `181.2×60px` | **PASS** |
| `/qr` (Varsayılan + `.feedback-fab`) | `390×844` | Erişilebilir ad | Eksik ad `= 0` | `0` eksik (`.feedback-fab`: `"Söz sende, geri bildirim gönder"`) | **PASS** |
| `/qr` (Varsayılan + `.feedback-fab`) | `390×844` | Tab sırası ve odak halkası | Okuma sırasıyla uyumlu, odak görünür | `positiveTabIndex = 0`; `.feedback-fab:focus-visible` `#120c0a` `2px` (`15.6:1`) | **PASS** |
| `/qr` (Varsayılan + `.feedback-fab`) | `390×844` | Metin ve kenarlık kontrastı | Metin `>= 4.5:1`, büyük/kenarlık `>= 3:1` | Metin `>= 4.86:1` (`#ffffff` / `#dc2524`), `.feedback-fab` kenarlığı `2px solid #ffffff` (`3.99:1` `#f3ece6` / `#dc2524` gölge ile ayrışık) | **PASS** |
| `/qr` (Varsayılan + `.feedback-fab`) | `390×844` | Konsol ve native dialog | `0` hata, native dialog yok | `0` konsol hatası, native `alert/confirm/prompt` yok | **PASS** |
| `/qr` (Varsayılan + `.feedback-fab`) | `390×844` | Dış alan adı isteği | `0` dış istek | `0` dış istek (yalnız `localhost:3000`) | **PASS** |
| `/qr` (Varsayılan + `.feedback-fab`) | `1440×900` | Yatay taşma | `scrollWidth <= 1440` | `1440 <= 1440` | **PASS** |
| `/qr` (Varsayılan + `.feedback-fab`) | `1440×900` | Dokunma hedefleri | Tüm hedefler `>= 44×44px` | 150 etkileşimli öğenin tamamı `>= 44×44px`; `.feedback-fab` `181.2×60px` | **PASS** |
| `/qr` (Varsayılan + `.feedback-fab`) | `1440×900` | Erişilebilir ad | Eksik ad `= 0` | `0` eksik | **PASS** |
| `/qr` (Varsayılan + `.feedback-fab`) | `1440×900` | Tab sırası ve odak halkası | Okuma sırasıyla uyumlu, odak görünür | `positiveTabIndex = 0`; odak halkaları görünür | **PASS** |
| `/qr` (Varsayılan + `.feedback-fab`) | `1440×900` | Metin ve kenarlık kontrastı | Metin `>= 4.5:1`, büyük/kenarlık `>= 3:1` | Metin `>= 4.86:1`, kenarlıklar `>= 3.0:1` | **PASS** |
| `/qr` (Varsayılan + `.feedback-fab`) | `1440×900` | Konsol ve native dialog | `0` hata, native dialog yok | `0` konsol hatası, native dialog yok | **PASS** |
| `/qr` (Varsayılan + `.feedback-fab`) | `1440×900` | Dış alan adı isteği | `0` dış istek | `0` dış istek | **PASS** |
| `/qr` ("Söz sende" Modalı `FeedbackSheet` + `TOOHOTT!` Fişi) | `390×844` | Tüm 7 kontrol | Taşma yok, `>=44×44`, a11y tam, kontrast uygun, `0` hata, `0` dış istek | `scrollWidth: 390`, 5 tavşan radyo etiketi `56.6×54px`, konu hapları `>=95×44px`, gönder `322×48px`, `html[data-overlay="feedback"]` iken `.feedback-fab` gizli (`opacity: 0; pointer-events: none`), 5 tavşan gönderiminde `TOOHOTT!` başlığı + tavşan ikonu görünür | **PASS** |
| `/qr/admin/kurulum` | `390×844` | Yatay taşma | `scrollWidth <= 390` | `390 <= 390` | **PASS** |
| `/qr/admin/kurulum` | `390×844` | Dokunma hedefleri | Tüm hedefler `>= 44×44px` | `.adm-bar__home-link` `98.4×18px`, `.adm-bar__live-link` `85.3×36px` (form girdileri `328.8×47.6px`, düğme `328.8×48px`) | **FAIL** |
| `/qr/admin/kurulum` | `390×844` | Erişilebilir ad | Eksik ad `= 0` | `0` eksik (`Kurulum kodu`, `E-posta`, `Şifre (en az 10 karakter)`, `Hesabı oluştur`) | **PASS** |
| `/qr/admin/kurulum` | `390×844` | Tab sırası ve odak halkası | Okuma sırasıyla uyumlu, odak görünür | Tab sırası doğru ancak `.adm-btn--main:focus-visible` beyaz kart üzerinde `2px solid #ffffff` (`1.00:1`, görünmez) | **FAIL** |
| `/qr/admin/kurulum` | `390×844` | Metin ve kenarlık kontrastı | Metin `>= 4.5:1`, kenarlık `>= 3:1` | `.adm-bar__live-link` metin kontrastı `3.90:1` (`< 4.5:1`); `.adm-field input` kenarlığı `#E2D6CE` / `#FFFFFF` `1.42:1` (`< 3:1`) | **FAIL** |
| `/qr/admin/kurulum` | `390×844` | Konsol ve native dialog | `0` hata, native dialog yok | `0` konsol hatası, native dialog yok | **PASS** |
| `/qr/admin/kurulum` | `390×844` | Dış alan adı isteği | `0` dış istek | `0` dış istek | **PASS** |
| `/qr/admin/kurulum` | `1440×900` | Yatay taşma | `scrollWidth <= 1440` | `1440 <= 1440` | **PASS** |
| `/qr/admin/kurulum` | `1440×900` | Dokunma hedefleri | Tüm hedefler `>= 44×44px` | `.adm-sidebar__logo-link` `109.4×20px`, 12× `.adm-sidebar__link` `227.2×42.3px` (`< 44px`) | **FAIL** |
| `/qr/admin/kurulum` | `1440×900` | Erişilebilir ad | Eksik ad `= 0` | `0` eksik | **PASS** |
| `/qr/admin/kurulum` | `1440×900` | Tab sırası ve odak halkası | Okuma sırasıyla uyumlu, odak görünür | `.adm-btn--main:focus-visible` beyaz kart üzerinde `1.00:1` (görünmez) | **FAIL** |
| `/qr/admin/kurulum` | `1440×900` | Metin ve kenarlık kontrastı | Metin `>= 4.5:1`, kenarlık `>= 3:1` | Metin kontrastları `>= 4.86:1` PASS; `.adm-field input` kenarlığı `#E2D6CE` `1.42:1` (`< 3:1`) | **FAIL** |
| `/qr/admin/kurulum` | `1440×900` | Konsol ve native dialog | `0` hata, native dialog yok | `0` konsol hatası, native dialog yok | **PASS** |
| `/qr/admin/kurulum` | `1440×900` | Dış alan adı isteği | `0` dış istek | `0` dış istek | **PASS** |
| `/qr/admin` (Genel Bakış — İlk: Genel Bakış, Son: Loglar) | `390×844` | Yatay taşma | `scrollWidth <= 390` | `390 <= 390` | **PASS** |
| `/qr/admin` | `390×844` | Dokunma hedefleri | Tüm hedefler `>= 44×44px` | `.adm-bar__home-link` `98.4×18px`, `.adm-bar__live-link` `85.3×36px` (tüm `.adm-nav-tile` kartları `358×77.6px..113.6px` PASS) | **FAIL** |
| `/qr/admin` | `390×844` | Erişilebilir ad | Eksik ad `= 0` | `0` eksik | **PASS** |
| `/qr/admin` | `390×844` | Tab sırası ve odak halkası | Okuma sırasıyla uyumlu, odak görünür | `.adm-btn--main:focus-visible` (`Son işlemi geri al`) `1.00:1` beyaz odak halkası görünmez | **FAIL** |
| `/qr/admin` | `390×844` | Metin ve kenarlık kontrastı | Metin `>= 4.5:1`, kenarlık `>= 3:1` | `.adm-bar__live-link` `3.90:1`; `.adm-btn--outline` ("Çıkış yap") kenarlığı `#E2D6CE` `1.42:1` | **FAIL** |
| `/qr/admin` | `390×844` | Konsol ve native dialog | `0` hata, native dialog yok | `0` konsol hatası, native dialog yok | **PASS** |
| `/qr/admin` | `390×844` | Dış alan adı isteği | `0` dış istek | `0` dış istek | **PASS** |
| `/qr/admin` | `1440×900` | Yatay taşma | `scrollWidth <= 1440` | `1440 <= 1440` | **PASS** |
| `/qr/admin` | `1440×900` | Dokunma hedefleri | Tüm hedefler `>= 44×44px` | `.adm-sidebar__logo-link` `109.4×20px`, 12× `.adm-sidebar__link` `227.2×42.3px` | **FAIL** |
| `/qr/admin` | `1440×900` | Erişilebilir ad | Eksik ad `= 0` | `0` eksik | **PASS** |
| `/qr/admin` | `1440×900` | Tab sırası ve odak halkası | Okuma sırasıyla uyumlu, odak görünür | `.adm-btn--main:focus-visible` beyaz zemin üzerinde `1.00:1` görünmez | **FAIL** |
| `/qr/admin` | `1440×900` | Metin ve kenarlık kontrastı | Metin `>= 4.5:1`, kenarlık `>= 3:1` | `.adm-btn--outline` kenarlığı `#E2D6CE` `1.42:1` (`< 3:1`) | **FAIL** |
| `/qr/admin` | `1440×900` | Konsol ve native dialog | `0` hata, native dialog yok | `0` konsol hatası, native dialog yok | **PASS** |
| `/qr/admin` | `1440×900` | Dış alan adı isteği | `0` dış istek | `0` dış istek | **PASS** |
| `/qr/admin/urunler` | `390×844` | Yatay taşma | `scrollWidth <= 390` | `390 <= 390` | **PASS** |
| `/qr/admin/urunler` | `390×844` | Dokunma hedefleri | Tüm hedefler `>= 44×44px` | `.adm-bar__home-link` `98.4×18px`, `.adm-bar__live-link` `85.3×36px` (129 ürünün "Tükendi"/"Düzenle" düğmeleri `>= 74×44px` PASS) | **FAIL** |
| `/qr/admin/urunler` | `390×844` | Erişilebilir ad | Eksik ad `= 0` | `0` eksik (263 etkileşimli öğenin tamamı adlandırılmış) | **PASS** |
| `/qr/admin/urunler` | `390×844` | Tab sırası ve odak halkası | Okuma sırasıyla uyumlu, odak görünür | `.adm-btn--main:focus-visible` ("Yeni ürün") `#f3ece6` zemin üzerinde beyaz halka `1.17:1` | **FAIL** |
| `/qr/admin/urunler` | `390×844` | Metin ve kenarlık kontrastı | Metin `>= 4.5:1`, kenarlık `>= 3:1` | `.adm-bar__live-link` `3.90:1`; `.adm-btn--outline` ("Düzenle") kenarlığı `#E2D6CE` `1.42:1` | **FAIL** |
| `/qr/admin/urunler` | `390×844` | Konsol ve native dialog | `0` hata, native dialog yok | `0` konsol hatası, native dialog yok | **PASS** |
| `/qr/admin/urunler` | `390×844` | Dış alan adı isteği | `0` dış istek | `0` dış istek | **PASS** |
| `/qr/admin/urunler` | `1440×900` | Yatay taşma | `scrollWidth <= 1440` | `1440 <= 1440` | **PASS** |
| `/qr/admin/urunler` | `1440×900` | Dokunma hedefleri | Tüm hedefler `>= 44×44px` | `.adm-sidebar__logo-link` `109.4×20px`, 12× `.adm-sidebar__link` `227.2×42.3px` | **FAIL** |
| `/qr/admin/urunler` | `1440×900` | Erişilebilir ad | Eksik ad `= 0` | `0` eksik (275 etkileşimli öğe) | **PASS** |
| `/qr/admin/urunler` | `1440×900` | Tab sırası ve odak halkası | Okuma sırasıyla uyumlu, odak görünür | `.adm-btn--main:focus-visible` `1.17:1` | **FAIL** |
| `/qr/admin/urunler` | `1440×900` | Metin ve kenarlık kontrastı | Metin `>= 4.5:1`, kenarlık `>= 3:1` | `.adm-btn--outline` kenarlığı `#E2D6CE` `1.42:1` | **FAIL** |
| `/qr/admin/urunler` | `1440×900` | Konsol ve native dialog | `0` hata, native dialog yok | `0` konsol hatası, native dialog yok | **PASS** |
| `/qr/admin/urunler` | `1440×900` | Dış alan adı isteği | `0` dış istek | `0` dış istek | **PASS** |
| `/qr/admin/urunler/2` (Cortado Düzenleme + `<dialog data-testid="price-confirm">`) | `390×844` | Yatay taşma | `scrollWidth <= 390` | `390 <= 390` | **PASS** |
| `/qr/admin/urunler/2` | `390×844` | Dokunma hedefleri | Tüm hedefler `>= 44×44px` | `.adm-bar__home-link` `98.4×18px`, `.adm-bar__live-link` `85.3×36px`, 5× `.adm-check-grid label` `158.6×40px` (`input` `20×20px`), 3× `.adm-checks input[type="checkbox"]` `22×22px` | **FAIL** |
| `/qr/admin/urunler/2` | `390×844` | Erişilebilir ad | Eksik ad `= 0` | `0` eksik (fiyat onay `<dialog>` `aria-labelledby="price-confirm-title"` ile adlandırılmış) | **PASS** |
| `/qr/admin/urunler/2` | `390×844` | Tab sırası ve odak halkası | Okuma sırasıyla uyumlu, odak görünür | `.adm-btn--main:focus-visible` ve `.adm-btn--danger:focus-visible` beyaz odak halkası `1.00:1` / `1.17:1` | **FAIL** |
| `/qr/admin/urunler/2` | `390×844` | Metin ve kenarlık kontrastı | Metin `>= 4.5:1`, kenarlık `>= 3:1` | `.adm-bar__live-link` `3.90:1`; `.adm-field input/textarea` ve `.adm-select__trigger` kenarlığı `#E2D6CE` `1.42:1` | **FAIL** |
| `/qr/admin/urunler/2` | `390×844` | Konsol ve native dialog | `0` hata, native dialog yok | `0` konsol hatası; fiyat onayı ve silme onayı yerel `<dialog>` kullanır | **PASS** |
| `/qr/admin/urunler/2` | `390×844` | Dış alan adı isteği | `0` dış istek | `0` dış istek | **PASS** |
| `/qr/admin/urunler/2` | `1440×900` | Yatay taşma | `scrollWidth <= 1440` | `1440 <= 1440` | **PASS** |
| `/qr/admin/urunler/2` | `1440×900` | Dokunma hedefleri | Tüm hedefler `>= 44×44px` | `.adm-sidebar` bağlantıları `42.3px`, 5× `.adm-check-grid label` `205.5×40px` (`input` `20×20px`), 3× `.adm-checks input` `22×22px` | **FAIL** |
| `/qr/admin/urunler/2` | `1440×900` | Erişilebilir ad | Eksik ad `= 0` | `0` eksik | **PASS** |
| `/qr/admin/urunler/2` | `1440×900` | Tab sırası ve odak halkası | Okuma sırasıyla uyumlu, odak görünür | `.adm-btn--main:focus-visible` ve `.adm-btn--danger:focus-visible` `1.00:1` / `1.17:1` | **FAIL** |
| `/qr/admin/urunler/2` | `1440×900` | Metin ve kenarlık kontrastı | Metin `>= 4.5:1`, kenarlık `>= 3:1` | `.adm-field input/textarea` ve `.adm-select__trigger` kenarlığı `#E2D6CE` `1.42:1` | **FAIL** |
| `/qr/admin/urunler/2` | `1440×900` | Konsol ve native dialog | `0` hata, native dialog yok | `0` konsol hatası, native dialog yok | **PASS** |
| `/qr/admin/urunler/2` | `1440×900` | Dış alan adı isteği | `0` dış istek | `0` dış istek | **PASS** |
| `/qr/admin/vitrin` (İkon alanı kaldırılmış `010_hero_no_icon`) | `390×844` | Yatay taşma | `scrollWidth <= 390` | `390 <= 390` | **PASS** |
| `/qr/admin/vitrin` | `390×844` | Dokunma hedefleri | Tüm hedefler `>= 44×44px` | `.adm-bar__home-link` `98.4×18px`, `.adm-bar__live-link` `85.3×36px`, 5× `input[name="isVisible"]` `22×22px` | **FAIL** |
| `/qr/admin/vitrin` | `390×844` | Erişilebilir ad | Eksik ad `= 0` | `0` eksik (ikon alanı tamamen kaldırılmış; yalnız `Yazı`, `Renk`, `Sıra`, `Fotoğraf`, `Menüde görünür`) | **PASS** |
| `/qr/admin/vitrin` | `390×844` | Tab sırası ve odak halkası | Okuma sırasıyla uyumlu, odak görünür | `.adm-btn--main:focus-visible` ve `.adm-btn--danger:focus-visible` `1.00:1` | **FAIL** |
| `/qr/admin/vitrin` | `390×844` | Metin ve kenarlık kontrastı | Metin `>= 4.5:1`, kenarlık `>= 3:1` | `.adm-bar__live-link` `3.90:1`; `.adm-field input` ve `.adm-select__trigger` kenarlığı `#E2D6CE` `1.42:1` | **FAIL** |
| `/qr/admin/vitrin` | `390×844` | Konsol ve native dialog | `0` hata, native dialog yok | `0` konsol hatası, native dialog yok | **PASS** |
| `/qr/admin/vitrin` | `390×844` | Dış alan adı isteği | `0` dış istek | `0` dış istek | **PASS** |
| `/qr/admin/vitrin` | `1440×900` | Yatay taşma | `scrollWidth <= 1440` | `1440 <= 1440` | **PASS** |
| `/qr/admin/vitrin` | `1440×900` | Dokunma hedefleri | Tüm hedefler `>= 44×44px` | `.adm-sidebar` bağlantıları `42.3px`, 5× `input[name="isVisible"]` `22×22px` | **FAIL** |
| `/qr/admin/vitrin` | `1440×900` | Erişilebilir ad | Eksik ad `= 0` | `0` eksik | **PASS** |
| `/qr/admin/vitrin` | `1440×900` | Tab sırası ve odak halkası | Okuma sırasıyla uyumlu, odak görünür | `.adm-btn--main:focus-visible` ve `.adm-btn--danger:focus-visible` `1.00:1` | **FAIL** |
| `/qr/admin/vitrin` | `1440×900` | Metin ve kenarlık kontrastı | Metin `>= 4.5:1`, kenarlık `>= 3:1` | `.adm-field input` ve `.adm-select__trigger` kenarlığı `#E2D6CE` `1.42:1` | **FAIL** |
| `/qr/admin/vitrin` | `1440×900` | Konsol ve native dialog | `0` hata, native dialog yok | `0` konsol hatası, native dialog yok | **PASS** |
| `/qr/admin/vitrin` | `1440×900` | Dış alan adı isteği | `0` dış istek | `0` dış istek | **PASS** |
| `/qr/admin/ne-icsem` (Ürün olasılık ağırlıkları `011_suggest_weight`) | `390×844` | Yatay taşma | `scrollWidth <= 390` | `390 <= 390` | **PASS** |
| `/qr/admin/ne-icsem` | `390×844` | Dokunma hedefleri | Tüm hedefler `>= 44×44px` | `.adm-bar__home-link` `98.4×18px`, `.adm-bar__live-link` `85.3×36px`, `input[name="preferPhotos"]` `22×22px`, 516× `.adm-weight-pill` (`Normal`/`2 kat`/`3 kat`/`5 kat`) `69.7×40px`, "Seçtiklerim" modunda `label.adm-weight-row__name` `328.8×40px` (`input` `20×20px`) | **FAIL** |
| `/qr/admin/ne-icsem` | `390×844` | Erişilebilir ad | Eksik ad `= 0` | `0` eksik (522 etkileşimli öğe; her ürün için `role="radiogroup" aria-label="<Ürün> olasılığı"` tanımlı) | **PASS** |
| `/qr/admin/ne-icsem` | `390×844` | Tab sırası ve odak halkası | Okuma sırasıyla uyumlu, odak görünür | Radyo haplarında odak halkası `.adm-weight-pill input:focus-visible + span` (`#120c0a` `2px`) görünür; `.adm-btn--main:focus-visible` ("Kaydet") `1.17:1` görünmez | **FAIL** |
| `/qr/admin/ne-icsem` | `390×844` | Metin ve kenarlık kontrastı | Metin `>= 4.5:1`, kenarlık `>= 3:1` | `.adm-bar__live-link` `3.90:1`; `.adm-weight-pill span` ve `.adm-select__trigger` kenarlığı `#E2D6CE` `1.42:1` | **FAIL** |
| `/qr/admin/ne-icsem` | `390×844` | Konsol ve native dialog | `0` hata, native dialog yok | `0` konsol hatası, native dialog yok | **PASS** |
| `/qr/admin/ne-icsem` | `390×844` | Dış alan adı isteği | `0` dış istek | `0` dış istek | **PASS** |
| `/qr/admin/ne-icsem` | `1440×900` | Yatay taşma | `scrollWidth <= 1440` | `1440 <= 1440` | **PASS** |
| `/qr/admin/ne-icsem` | `1440×900` | Dokunma hedefleri | Tüm hedefler `>= 44×44px` | `.adm-sidebar` bağlantıları `42.3px`, `input[name="preferPhotos"]` `22×22px`, 516× `.adm-weight-pill` `63.6×40px`, "Seçtiklerim" modunda `label.adm-weight-row__name` `40px` | **FAIL** |
| `/qr/admin/ne-icsem` | `1440×900` | Erişilebilir ad | Eksik ad `= 0` | `0` eksik (534 etkileşimli öğe) | **PASS** |
| `/qr/admin/ne-icsem` | `1440×900` | Tab sırası ve odak halkası | Okuma sırasıyla uyumlu, odak görünür | `.adm-btn--main:focus-visible` ("Kaydet") `1.17:1` | **FAIL** |
| `/qr/admin/ne-icsem` | `1440×900` | Metin ve kenarlık kontrastı | Metin `>= 4.5:1`, kenarlık `>= 3:1` | `.adm-weight-pill span` ve `.adm-select__trigger` kenarlığı `#E2D6CE` `1.42:1` | **FAIL** |
| `/qr/admin/ne-icsem` | `1440×900` | Konsol ve native dialog | `0` hata, native dialog yok | `0` konsol hatası, native dialog yok | **PASS** |
| `/qr/admin/ne-icsem` | `1440×900` | Dış alan adı isteği | `0` dış istek | `0` dış istek | **PASS** |
| `/qr/admin/kullanicilar` | `390×844` | Yatay taşma | `scrollWidth <= 390` | `390 <= 390` | **PASS** |
| `/qr/admin/kullanicilar` | `390×844` | Dokunma hedefleri | Tüm hedefler `>= 44×44px` | `.adm-bar__home-link` `98.4×18px`, `.adm-bar__live-link` `85.3×36px` (`Admin oluştur` ve `Sil` düğmeleri `320.8×48px` PASS) | **FAIL** |
| `/qr/admin/kullanicilar` | `390×844` | Erişilebilir ad | Eksik ad `= 0` | `0` eksik | **PASS** |
| `/qr/admin/kullanicilar` | `390×844` | Tab sırası ve odak halkası | Okuma sırasıyla uyumlu, odak görünür | `.adm-btn--main:focus-visible` ve `.adm-btn--danger:focus-visible` `1.00:1` | **FAIL** |
| `/qr/admin/kullanicilar` | `390×844` | Metin ve kenarlık kontrastı | Metin `>= 4.5:1`, kenarlık `>= 3:1` | `.adm-bar__live-link` `3.90:1`; `.adm-field input` kenarlığı `#E2D6CE` `1.42:1` | **FAIL** |
| `/qr/admin/kullanicilar` | `390×844` | Konsol ve native dialog | `0` hata, native dialog yok | `0` konsol hatası, native dialog yok | **PASS** |
| `/qr/admin/kullanicilar` | `390×844` | Dış alan adı isteği | `0` dış istek | `0` dış istek | **PASS** |
| `/qr/admin/kullanicilar` | `1440×900` | Yatay taşma | `scrollWidth <= 1440` | `1440 <= 1440` | **PASS** |
| `/qr/admin/kullanicilar` | `1440×900` | Dokunma hedefleri | Tüm hedefler `>= 44×44px` | `.adm-sidebar` bağlantıları `42.3px` | **FAIL** |
| `/qr/admin/kullanicilar` | `1440×900` | Erişilebilir ad | Eksik ad `= 0` | `0` eksik | **PASS** |
| `/qr/admin/kullanicilar` | `1440×900` | Tab sırası ve odak halkası | Okuma sırasıyla uyumlu, odak görünür | `.adm-btn--main:focus-visible` `1.00:1` | **FAIL** |
| `/qr/admin/kullanicilar` | `1440×900` | Metin ve kenarlık kontrastı | Metin `>= 4.5:1`, kenarlık `>= 3:1` | `.adm-field input` kenarlığı `#E2D6CE` `1.42:1` | **FAIL** |
| `/qr/admin/kullanicilar` | `1440×900` | Konsol ve native dialog | `0` hata, native dialog yok | `0` konsol hatası, native dialog yok | **PASS** |
| `/qr/admin/kullanicilar` | `1440×900` | Dış alan adı isteği | `0` dış istek | `0` dış istek | **PASS** |
| `/qr/admin/toplu-fiyat` ("Tüm menü" + 129 satırlık tam fiyat listesi + satır içi önizleme) | `390×844` | Yatay taşma | `scrollWidth <= 390` | `390 <= 390` | **PASS** |
| `/qr/admin/toplu-fiyat` | `390×844` | Dokunma hedefleri | Tüm hedefler `>= 44×44px` | `.adm-bar__home-link` `98.4×18px`, `.adm-bar__live-link` `85.3×36px` (`BrandSelect`, `.adm-op` radyo etiketleri `>=158×48px`, `Önizle` ve `Uygula` `>=48px` PASS) | **FAIL** |
| `/qr/admin/toplu-fiyat` | `390×844` | Erişilebilir ad | Eksik ad `= 0` | `0` eksik | **PASS** |
| `/qr/admin/toplu-fiyat` | `390×844` | Tab sırası ve odak halkası | Okuma sırasıyla uyumlu, odak görünür | `.adm-btn--main:focus-visible` ("Uygula") beyaz kart üzerinde `1.00:1` görünmez | **FAIL** |
| `/qr/admin/toplu-fiyat` | `390×844` | Metin ve kenarlık kontrastı | Metin `>= 4.5:1`, kenarlık `>= 3:1` | `.adm-bar__live-link` `3.90:1`; `.adm-select__trigger`, `.adm-op` ve `input[name="value"]` kenarlığı `#E2D6CE` `1.42:1` (yeni fiyat `.adm-price-table__next` `#dc2524` / `#ffffff` `4.86:1` PASS) | **FAIL** |
| `/qr/admin/toplu-fiyat` | `390×844` | Konsol ve native dialog | `0` hata, native dialog yok | `0` konsol hatası, native dialog yok | **PASS** |
| `/qr/admin/toplu-fiyat` | `390×844` | Dış alan adı isteği | `0` dış istek | `0` dış istek | **PASS** |
| `/qr/admin/toplu-fiyat` | `1440×900` | Yatay taşma | `scrollWidth <= 1440` | `1440 <= 1440` | **PASS** |
| `/qr/admin/toplu-fiyat` | `1440×900` | Dokunma hedefleri | Tüm hedefler `>= 44×44px` | `.adm-sidebar` bağlantıları `42.3px` | **FAIL** |
| `/qr/admin/toplu-fiyat` | `1440×900` | Erişilebilir ad | Eksik ad `= 0` | `0` eksik | **PASS** |
| `/qr/admin/toplu-fiyat` | `1440×900` | Tab sırası ve odak halkası | Okuma sırasıyla uyumlu, odak görünür | `.adm-btn--main:focus-visible` `1.00:1` | **FAIL** |
| `/qr/admin/toplu-fiyat` | `1440×900` | Metin ve kenarlık kontrastı | Metin `>= 4.5:1`, kenarlık `>= 3:1` | `.adm-select__trigger`, `.adm-op` ve `input[name="value"]` kenarlığı `#E2D6CE` `1.42:1` | **FAIL** |
| `/qr/admin/toplu-fiyat` | `1440×900` | Konsol ve native dialog | `0` hata, native dialog yok | `0` konsol hatası, native dialog yok | **PASS** |
| `/qr/admin/toplu-fiyat` | `1440×900` | Dış alan adı isteği | `0` dış istek | `0` dış istek | **PASS** |
| `/qr/admin/geri-bildirim` | `390×844` | Yatay taşma | `scrollWidth <= 390` | `390 <= 390` | **PASS** |
| `/qr/admin/geri-bildirim` | `390×844` | Dokunma hedefleri | Tüm hedefler `>= 44×44px` | `.adm-bar__home-link` `98.4×18px`, `.adm-bar__live-link` `85.3×36px`, `.feedback-back` `168.8×21.8px`, `input[name="okunmamis"]` `13×13px` (`label` `44px`), `.feedback-entry .adm-btn` (`Okundu işaretle` `136.9×36px`, `Sil` `56.4×36px`) | **FAIL** |
| `/qr/admin/geri-bildirim` | `390×844` | Erişilebilir ad | Eksik ad `= 0` | `0` eksik (`dialog.feedback-delete` `aria-labelledby="delete-feedback-..."` ile adlandırılmış) | **PASS** |
| `/qr/admin/geri-bildirim` | `390×844` | Tab sırası ve odak halkası | Okuma sırasıyla uyumlu, odak görünür | `.adm-btn--main:focus-visible` ("Filtrele") `1.00:1` | **FAIL** |
| `/qr/admin/geri-bildirim` | `390×844` | Metin ve kenarlık kontrastı | Metin `>= 4.5:1`, kenarlık `>= 3:1` | `.adm-bar__live-link` `3.90:1`; `.adm-select__trigger` kenarlığı `#E2D6CE` `1.42:1` | **FAIL** |
| `/qr/admin/geri-bildirim` | `390×844` | Konsol ve native dialog | `0` hata, native dialog yok | `0` konsol hatası, silme onayı yerel `<dialog>` kullanır | **PASS** |
| `/qr/admin/geri-bildirim` | `390×844` | Dış alan adı isteği | `0` dış istek | `0` dış istek | **PASS** |
| `/qr/admin/geri-bildirim` | `1440×900` | Yatay taşma | `scrollWidth <= 1440` | `1440 <= 1440` | **PASS** |
| `/qr/admin/geri-bildirim` | `1440×900` | Dokunma hedefleri | Tüm hedefler `>= 44×44px` | `.adm-sidebar` bağlantıları `42.3px`, `.feedback-back` `168.8×21.8px`, `input[name="okunmamis"]` `13×13px`, `.feedback-entry .adm-btn` `136.9×36px` ve `56.4×36px` | **FAIL** |
| `/qr/admin/geri-bildirim` | `1440×900` | Erişilebilir ad | Eksik ad `= 0` | `0` eksik | **PASS** |
| `/qr/admin/geri-bildirim` | `1440×900` | Tab sırası ve odak halkası | Okuma sırasıyla uyumlu, odak görünür | `.adm-btn--main:focus-visible` `1.00:1` | **FAIL** |
| `/qr/admin/geri-bildirim` | `1440×900` | Metin ve kenarlık kontrastı | Metin `>= 4.5:1`, kenarlık `>= 3:1` | `.adm-select__trigger` kenarlığı `#E2D6CE` `1.42:1` | **FAIL** |
| `/qr/admin/geri-bildirim` | `1440×900` | Konsol ve native dialog | `0` hata, native dialog yok | `0` konsol hatası, native dialog yok | **PASS** |
| `/qr/admin/geri-bildirim` | `1440×900` | Dış alan adı isteği | `0` dış istek | `0` dış istek | **PASS** |
| `/qr/admin/istatistik` (QR altında açık URL yazısı kaldırılmış) | `390×844` | Yatay taşma | `scrollWidth <= 390` | `390 <= 390` | **PASS** |
| `/qr/admin/istatistik` | `390×844` | Dokunma hedefleri | Tüm hedefler `>= 44×44px` | `.adm-bar__home-link` `98.4×18px`, `.adm-bar__live-link` `85.3×36px`, `input[name="enabled"]` `22×22px` (QR `SVG indir` ve `PNG indir` düğmeleri `48px` PASS) | **FAIL** |
| `/qr/admin/istatistik` | `390×844` | Erişilebilir ad | Eksik ad `= 0` | `0` eksik (QR önizleme altında açık URL metni yok) | **PASS** |
| `/qr/admin/istatistik` | `390×844` | Tab sırası ve odak halkası | Okuma sırasıyla uyumlu, odak görünür | `.adm-btn--main:focus-visible` `1.00:1` | **FAIL** |
| `/qr/admin/istatistik` | `390×844` | Metin ve kenarlık kontrastı | Metin `>= 4.5:1`, kenarlık `>= 3:1` | `.adm-bar__live-link` `3.90:1`; `.adm-field input` kenarlığı `#E2D6CE` `1.42:1` | **FAIL** |
| `/qr/admin/istatistik` | `390×844` | Konsol ve native dialog | `0` hata, native dialog yok | `0` konsol hatası, native dialog yok | **PASS** |
| `/qr/admin/istatistik` | `390×844` | Dış alan adı isteği | `0` dış istek | `0` dış istek | **PASS** |
| `/qr/admin/istatistik` | `1440×900` | Yatay taşma | `scrollWidth <= 1440` | `1440 <= 1440` | **PASS** |
| `/qr/admin/istatistik` | `1440×900` | Dokunma hedefleri | Tüm hedefler `>= 44×44px` | `.adm-sidebar` bağlantıları `42.3px`, `input[name="enabled"]` `22×22px` | **FAIL** |
| `/qr/admin/istatistik` | `1440×900` | Erişilebilir ad | Eksik ad `= 0` | `0` eksik | **PASS** |
| `/qr/admin/istatistik` | `1440×900` | Tab sırası ve odak halkası | Okuma sırasıyla uyumlu, odak görünür | `.adm-btn--main:focus-visible` `1.00:1` | **FAIL** |
| `/qr/admin/istatistik` | `1440×900` | Metin ve kenarlık kontrastı | Metin `>= 4.5:1`, kenarlık `>= 3:1` | `.adm-field input` kenarlığı `#E2D6CE` `1.42:1` | **FAIL** |
| `/qr/admin/istatistik` | `1440×900` | Konsol ve native dialog | `0` hata, native dialog yok | `0` konsol hatası, native dialog yok | **PASS** |
| `/qr/admin/istatistik` | `1440×900` | Dış alan adı isteği | `0` dış istek | `0` dış istek | **PASS** |
| `/qr/admin/katalog` | `390×844` | Yatay taşma | `scrollWidth <= 390` | `390 <= 390` | **PASS** |
| `/qr/admin/katalog` | `390×844` | Dokunma hedefleri | Tüm hedefler `>= 44×44px` | `.adm-bar__home-link` `98.4×18px`, `.adm-bar__live-link` `85.3×36px`, 12× `.adm-checks input[type="checkbox"]` `22×22px` | **FAIL** |
| `/qr/admin/katalog` | `390×844` | Erişilebilir ad | Eksik ad `= 0` | `0` eksik (225 etkileşimli öğe) | **PASS** |
| `/qr/admin/katalog` | `390×844` | Tab sırası ve odak halkası | Okuma sırasıyla uyumlu, odak görünür | `.adm-btn--main:focus-visible` `1.00:1` | **FAIL** |
| `/qr/admin/katalog` | `390×844` | Metin ve kenarlık kontrastı | Metin `>= 4.5:1`, kenarlık `>= 3:1` | `.adm-bar__live-link` `3.90:1`; `.adm-field input` ve `.adm-select__trigger` kenarlığı `#E2D6CE` `1.42:1` | **FAIL** |
| `/qr/admin/katalog` | `390×844` | Konsol ve native dialog | `0` hata, native dialog yok | `0` konsol hatası, native dialog yok | **PASS** |
| `/qr/admin/katalog` | `390×844` | Dış alan adı isteği | `0` dış istek | `0` dış istek | **PASS** |
| `/qr/admin/katalog` | `1440×900` | Yatay taşma | `scrollWidth <= 1440` | `1440 <= 1440` | **PASS** |
| `/qr/admin/katalog` | `1440×900` | Dokunma hedefleri | Tüm hedefler `>= 44×44px` | `.adm-sidebar` bağlantıları `42.3px`, 12× `.adm-checks input[type="checkbox"]` `22×22px` | **FAIL** |
| `/qr/admin/katalog` | `1440×900` | Erişilebilir ad | Eksik ad `= 0` | `0` eksik (237 etkileşimli öğe) | **PASS** |
| `/qr/admin/katalog` | `1440×900` | Tab sırası ve odak halkası | Okuma sırasıyla uyumlu, odak görünür | `.adm-btn--main:focus-visible` `1.00:1` | **FAIL** |
| `/qr/admin/katalog` | `1440×900` | Metin ve kenarlık kontrastı | Metin `>= 4.5:1`, kenarlık `>= 3:1` | `.adm-field input` ve `.adm-select__trigger` kenarlığı `#E2D6CE` `1.42:1` | **FAIL** |
| `/qr/admin/katalog` | `1440×900` | Konsol ve native dialog | `0` hata, native dialog yok | `0` konsol hatası, native dialog yok | **PASS** |
| `/qr/admin/katalog` | `1440×900` | Dış alan adı isteği | `0` dış istek | `0` dış istek | **PASS** |
| `/qr/admin/fotograflar` | `390×844` | Yatay taşma | `scrollWidth <= 390` | `390 <= 390` | **PASS** |
| `/qr/admin/fotograflar` | `390×844` | Dokunma hedefleri | Tüm hedefler `>= 44×44px` | `.adm-bar__home-link` `98.4×18px`, `.adm-bar__live-link` `85.3×36px` (tüm afiş fotoğraf seç/yükle düğmeleri `>=48px` PASS) | **FAIL** |
| `/qr/admin/fotograflar` | `390×844` | Erişilebilir ad | Eksik ad `= 0` | `0` eksik | **PASS** |
| `/qr/admin/fotograflar` | `390×844` | Tab sırası ve odak halkası | Okuma sırasıyla uyumlu, odak görünür | `.adm-btn--main:focus-visible` `1.00:1` | **FAIL** |
| `/qr/admin/fotograflar` | `390×844` | Metin ve kenarlık kontrastı | Metin `>= 4.5:1`, kenarlık `>= 3:1` | `.adm-bar__live-link` `3.90:1`; `.adm-btn--outline` kenarlığı `#E2D6CE` `1.42:1` | **FAIL** |
| `/qr/admin/fotograflar` | `390×844` | Konsol ve native dialog | `0` hata, native dialog yok | `0` konsol hatası, native dialog yok | **PASS** |
| `/qr/admin/fotograflar` | `390×844` | Dış alan adı isteği | `0` dış istek | `0` dış istek | **PASS** |
| `/qr/admin/fotograflar` | `1440×900` | Yatay taşma | `scrollWidth <= 1440` | `1440 <= 1440` | **PASS** |
| `/qr/admin/fotograflar` | `1440×900` | Dokunma hedefleri | Tüm hedefler `>= 44×44px` | `.adm-sidebar` bağlantıları `42.3px` | **FAIL** |
| `/qr/admin/fotograflar` | `1440×900` | Erişilebilir ad | Eksik ad `= 0` | `0` eksik | **PASS** |
| `/qr/admin/fotograflar` | `1440×900` | Tab sırası ve odak halkası | Okuma sırasıyla uyumlu, odak görünür | `.adm-btn--main:focus-visible` `1.00:1` | **FAIL** |
| `/qr/admin/fotograflar` | `1440×900` | Metin ve kenarlık kontrastı | Metin `>= 4.5:1`, kenarlık `>= 3:1` | `.adm-btn--outline` kenarlığı `#E2D6CE` `1.42:1` | **FAIL** |
| `/qr/admin/fotograflar` | `1440×900` | Konsol ve native dialog | `0` hata, native dialog yok | `0` konsol hatası, native dialog yok | **PASS** |
| `/qr/admin/fotograflar` | `1440×900` | Dış alan adı isteği | `0` dış istek | `0` dış istek | **PASS** |
| `/qr/admin/yedek` (Yalnız ZIP dışarı aktarma; geri yükleme formu kaldırılmış) | `390×844` | Yatay taşma | `scrollWidth <= 390` | `390 <= 390` | **PASS** |
| `/qr/admin/yedek` | `390×844` | Dokunma hedefleri | Tüm hedefler `>= 44×44px` | `.adm-bar__home-link` `98.4×18px`, `.adm-bar__live-link` `85.3×36px` (`ZIP indir` düğmesi `116.4×48px` PASS) | **FAIL** |
| `/qr/admin/yedek` | `390×844` | Erişilebilir ad | Eksik ad `= 0` | `0` eksik | **PASS** |
| `/qr/admin/yedek` | `390×844` | Tab sırası ve odak halkası | Okuma sırasıyla uyumlu, odak görünür | `.adm-btn--main:focus-visible` ("ZIP indir") beyaz kart üzerinde `1.00:1` | **FAIL** |
| `/qr/admin/yedek` | `390×844` | Metin ve kenarlık kontrastı | Metin `>= 4.5:1`, kenarlık `>= 3:1` | `.adm-bar__live-link` `3.90:1` | **FAIL** |
| `/qr/admin/yedek` | `390×844` | Konsol ve native dialog | `0` hata, native dialog yok | `0` konsol hatası, native dialog yok | **PASS** |
| `/qr/admin/yedek` | `390×844` | Dış alan adı isteği | `0` dış istek | `0` dış istek | **PASS** |
| `/qr/admin/yedek` | `1440×900` | Yatay taşma | `scrollWidth <= 1440` | `1440 <= 1440` | **PASS** |
| `/qr/admin/yedek` | `1440×900` | Dokunma hedefleri | Tüm hedefler `>= 44×44px` | `.adm-sidebar` bağlantıları `42.3px` | **FAIL** |
| `/qr/admin/yedek` | `1440×900` | Erişilebilir ad | Eksik ad `= 0` | `0` eksik | **PASS** |
| `/qr/admin/yedek` | `1440×900` | Tab sırası ve odak halkası | Okuma sırasıyla uyumlu, odak görünür | `.adm-btn--main:focus-visible` `1.00:1` | **FAIL** |
| `/qr/admin/yedek` | `1440×900` | Metin ve kenarlık kontrastı | Metin `>= 4.5:1`, kenarlık `>= 3:1` | Metin kontrastları `>= 4.86:1`, kart kenarlığı gölgeli | **PASS** |
| `/qr/admin/yedek` | `1440×900` | Konsol ve native dialog | `0` hata, native dialog yok | `0` konsol hatası, native dialog yok | **PASS** |
| `/qr/admin/yedek` | `1440×900` | Dış alan adı isteği | `0` dış istek | `0` dış istek | **PASS** |
| `/qr/admin/kopyalar` (Loglar — Geri yükleme `<RestoreButton>` ve son 100 işlem) | `390×844` | Yatay taşma | `scrollWidth <= 390` | `390 <= 390` | **PASS** |
| `/qr/admin/kopyalar` | `390×844` | Dokunma hedefleri | Tüm hedefler `>= 44×44px` | `.adm-bar__home-link` `98.4×18px`, `.adm-bar__live-link` `85.3×36px` (`Bu menüye dön` düğmeleri `>=48px` PASS) | **FAIL** |
| `/qr/admin/kopyalar` | `390×844` | Erişilebilir ad | Eksik ad `= 0` | `0` eksik | **PASS** |
| `/qr/admin/kopyalar` | `390×844` | Tab sırası ve odak halkası | Okuma sırasıyla uyumlu, odak görünür | Tab sırası doğru, `.adm-btn--outline:focus-visible` `#120c0a` `2px` görünür | **PASS** |
| `/qr/admin/kopyalar` | `390×844` | Metin ve kenarlık kontrastı | Metin `>= 4.5:1`, kenarlık `>= 3:1` | `.adm-bar__live-link` `3.90:1`; `.adm-btn--outline` ("Bu menüye dön") kenarlığı `#E2D6CE` `1.42:1` | **FAIL** |
| `/qr/admin/kopyalar` | `390×844` | Konsol ve native dialog | `0` hata, native dialog yok | `0` konsol hatası, geri yükleme onayı yerel `<dialog>` kullanır | **PASS** |
| `/qr/admin/kopyalar` | `390×844` | Dış alan adı isteği | `0` dış istek | `0` dış istek | **PASS** |
| `/qr/admin/kopyalar` | `1440×900` | Yatay taşma | `scrollWidth <= 1440` | `1440 <= 1440` | **PASS** |
| `/qr/admin/kopyalar` | `1440×900` | Dokunma hedefleri | Tüm hedefler `>= 44×44px` | `.adm-sidebar` bağlantıları `42.3px` | **FAIL** |
| `/qr/admin/kopyalar` | `1440×900` | Erişilebilir ad | Eksik ad `= 0` | `0` eksik | **PASS** |
| `/qr/admin/kopyalar` | `1440×900` | Tab sırası ve odak halkası | Okuma sırasıyla uyumlu, odak görünür | Tab sırası doğru, `.adm-btn--outline:focus-visible` `#120c0a` `2px` görünür | **PASS** |
| `/qr/admin/kopyalar` | `1440×900` | Metin ve kenarlık kontrastı | Metin `>= 4.5:1`, kenarlık `>= 3:1` | `.adm-btn--outline` kenarlığı `#E2D6CE` `1.42:1` | **FAIL** |
| `/qr/admin/kopyalar` | `1440×900` | Konsol ve native dialog | `0` hata, native dialog yok | `0` konsol hatası, native dialog yok | **PASS** |
| `/qr/admin/kopyalar` | `1440×900` | Dış alan adı isteği | `0` dış istek | `0` dış istek | **PASS** |

---

## 3. Tespit Edilen FAIL Bulguları, Ekran Görüntüleri ve Önerilen Düzeltmeler

### BULGU-1: Mobil Üst Bar (`.adm-bar`) Dokunma Hedefleri (`< 44×44px`) ve "Menü" Bağlantısı Metin Kontrastı (`3.90:1 < 4.5:1`)
- **Etkilenen Sayfalar:** Tüm `/qr/admin/*` sayfaları (`390×844`)
- **Ekran Görüntüleri:**
  - `docs/reviews/screens/a2-revize-admin-390.png`
  - `docs/reviews/screens/a2-revize-kurulum-390.png`
  - `docs/reviews/screens/a2-revize-urunler-390.png`
- **Kök Neden (`app/qr/admin/admin.css` satır 167–198):**
  - `.adm-bar__home-link` için `min-height` tanımlanmamıştır (`98.4×18px`).
  - `.adm-bar__live-link` için `min-height: 36px; padding: 6px 12px;` ve `background: rgba(255, 255, 255, 0.18);` tanımlanmıştır (`85.3×36px`). `#dc2524` üst bar üzerinde `rgba(255, 255, 255, 0.18)` karışımı `#e24c4b` rengini üretmekte ve üzerindeki `13px` (`font-weight: 600`) `#ffffff` metinle **3.90:1** kontrast vermektedir.
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
    border-radius: var(--r-pill);
    background: rgba(18, 12, 10, 0.28); /* #dc2524 üzerinde #ffffff ile >= 6.4:1 kontrast sağlar */
    color: var(--c-white);
    font-size: 13px;
    font-weight: 600;
    text-decoration: none;
  }
  ```

---

### BULGU-2: Masaüstü Yan Menü (`.adm-sidebar`) Dokunma Hedefleri (`< 44×44px`)
- **Etkilenen Sayfalar:** Tüm `/qr/admin/*` sayfaları (`1440×900`)
- **Ekran Görüntüleri:**
  - `docs/reviews/screens/a2-revize-admin-1440.png`
  - `docs/reviews/screens/a2-revize-urunler-1440.png`
  - `docs/reviews/screens/a2-revize-kopyalar-1440.png`
- **Kök Neden (`app/qr/admin/admin.css` satır 66–109):**
  - `.adm-sidebar__logo-link` (`109.4×20px`) ve `.adm-sidebar__link` (`padding: 11px 14px` → `227.2×42.3px`) öğelerinde `min-height: 44px` tanımlı değildir.
- **Önerilen Düzeltme (`app/qr/admin/admin.css`):**
  ```css
  .adm-sidebar__logo-link {
    display: inline-flex;
    align-items: center;
    min-height: 44px;
    color: var(--c-white);
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

### BULGU-3: `/qr/admin/ne-icsem` Olasılık Ağırlık Seçicileri (`.adm-weight-pill`) ve Seçim Satırları (`40px < 44px`)
- **Etkilenen Sayfa:** `/qr/admin/ne-icsem` (`390×844` ve `1440×900`)
- **Ekran Görüntüleri:**
  - `docs/reviews/screens/a2-revize-ne-icsem-390.png`
  - `docs/reviews/screens/a2-revize-ne-icsem-1440.png`
- **Kök Neden (`app/qr/admin/admin.css` satır 1567–1572):**
  - `.adm-weight-row__name` ve `.adm-weight-pill span` için `min-height: 40px` tanımlanmıştır (`69.7×40px` mobil, `63.6×40px` masaüstü). Ayrıca "Seçtiklerim" modunda `.adm-weight-row__name input[type="checkbox"]` `20×20px` boyutundadır.
- **Önerilen Düzeltme (`app/qr/admin/admin.css`):**
  ```css
  .adm-weight-row__name {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 10px;
    min-height: 44px;
    font-weight: 700;
  }
  .adm-weight-row__name input[type="checkbox"] {
    width: 22px;
    height: 22px;
    accent-color: var(--c-red);
  }
  .adm-weight-pill span {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 44px;
    padding: 6px 10px;
    border: 1.5px solid var(--c-line-strong, #8c7b72);
    border-radius: var(--r-sm);
    background: var(--c-white);
    font-size: 13px;
    font-weight: 700;
  }
  ```

---

### BULGU-4: `/qr/admin/geri-bildirim` Geri Bağlantısı (`.feedback-back`) ve Kart İçi Düğmeler (`.feedback-entry .adm-btn`) (`< 44×44px`)
- **Etkilenen Sayfa:** `/qr/admin/geri-bildirim` (`390×844` ve `1440×900`)
- **Ekran Görüntüleri:**
  - `docs/reviews/screens/a2-revize-geri-bildirim-390.png`
  - `docs/reviews/screens/a2-revize-geri-bildirim-1440.png`
- **Kök Neden (`app/qr/admin/admin.css` satır 1514 ve 1540):**
  - `.feedback-back` `display: inline-block; margin-bottom: 8px;` olarak tanımlandığından `168.8×21.8px` boyutundadır.
  - `.feedback-entry .adm-btn` kuralı genel `.adm-btn` (`min-height: 48px`) yüksekliğini `min-height: 36px; padding: 6px 14px;` ile ezmektedir (`136.9×36px` ve `56.4×36px`).
- **Önerilen Düzeltme (`app/qr/admin/admin.css`):**
  ```css
  .feedback-back {
    display: inline-flex;
    align-items: center;
    min-height: 44px;
    margin-bottom: 8px;
    color: var(--c-red);
    font-weight: 700;
    text-decoration: none;
  }
  .feedback-entry .adm-btn {
    min-height: 44px;
    padding: 8px 14px;
    font-size: 13px;
  }
  ```

---

### BULGU-5: Ürün Düzenleme Etiket Izgarası (`.adm-check-grid label`) ve Onay Kutuları (`< 44×44px`)
- **Etkilenen Sayfalar:** `/qr/admin/urunler/2` (`390×844` ve `1440×900`), `/qr/admin/vitrin`, `/qr/admin/katalog`, `/qr/admin/istatistik`
- **Ekran Görüntüleri:**
  - `docs/reviews/screens/a2-revize-urun-duzenle-390.png`
  - `docs/reviews/screens/a2-revize-urun-duzenle-1440.png`
- **Kök Neden (`app/qr/admin/admin.css` satır 1228–1259):**
  - `.adm-check-grid label` `min-height: 40px` olarak tanımlanmıştır (`158.6×40px` mobil, `205.5×40px` masaüstü).
  - `.adm-checks input` (`22×22px`) ve `.adm-check-grid input` (`20×20px`) ham onay kutuları kapsayıcı `<label>` üzerinde `position: relative` + tam alan kaplama kullanmadığı için doğrudan `input` ölçüldüğünde `< 44×44px` kalmaktadır.
- **Önerilen Düzeltme (`app/qr/admin/admin.css`):**
  ```css
  .adm-check-grid label {
    position: relative;
    display: flex;
    align-items: center;
    gap: 10px;
    min-height: 44px;
    padding: 8px 12px;
  }
  ```

---

### BULGU-6: Birincil/Tehlike Düğmelerinde Görünmez Beyaz Odak Halkası (`1.00:1`) ve `--c-line` (`#E2D6CE`) Kenarlık Kontrastı (`1.42:1 < 3.0:1`)
- **Etkilenen Sayfalar:** Tüm `/qr/admin/*` sayfaları (`390×844` ve `1440×900`)
- **Ekran Görüntüleri:**
  - `docs/reviews/screens/a2-revize-toplu-fiyat-390.png`
  - `docs/reviews/screens/a2-revize-toplu-fiyat-1440.png`
  - `docs/reviews/screens/a2-revize-yedek-1440.png`
- **Kök Neden (`app/qr/admin/admin.css` satır 34 ve satır 402–408):**
  - Satır 402–408'de `.adm-btn--main:focus-visible, .adm-btn--danger:focus-visible` için `outline: 2px solid var(--c-white); outline-offset: 2px;` tanımlanmıştır. `outline-offset: 2px` halkayı düğmenin **dışına** (beyaz `.adm-card` `#ffffff` veya krem `.adm` `#f3ece6` arka planın üzerine) çizdiği için kontrast **1.00:1** / **1.17:1** olmakta ve odak halkası görünmemektedir.
  - Satır 34'te `--c-line: #E2D6CE;` form girdileri (`.adm-field input/textarea`), `.adm-select__trigger`, `.adm-op` ve `.adm-btn--outline` kenarlıklarında kullanılmaktadır; `#FFFFFF` üzerinde **1.42:1**, `#F3ECE6` üzerinde **1.22:1** kontrast üretmektedir (`< 3.0:1`).
- **Önerilen Düzeltme (`app/qr/admin/admin.css`):**
  ```css
  /* 1. Odak halkasını düğme dışında koyu mürekkep rengiyle görünür kıl: */
  .adm-btn--main:focus-visible,
  .adm-btn--danger:focus-visible {
    outline: 2px solid var(--c-ink);
    outline-offset: 2px;
  }

  /* 2. Etkileşimli form kontrolü ve outline düğme kenarlıklarında >= 3.0:1 kontrastlı renk kullan: */
  .adm-field input,
  .adm-field textarea,
  .adm-select__trigger,
  .adm-op,
  .adm-btn--outline,
  .adm-weight-pill span {
    border-color: #8f7e75; /* #FFFFFF ile 3.92:1, #F3ECE6 ile 3.38:1 kontrast */
  }
  ```

---

## 4. Elle Denenen Akışlar ve `/qr` Canlı Yansıma Doğrulaması

| # | Akış | Adımlar | Beklenen | Gözlemlenen | Sonuç |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | **Kurulum (`/qr/admin/kurulum`)** | Sunucu kaydından kurulum kodu (`YAM7-GX95-RN7X`) alındı, `admin@test.kafe` ve rastgele şifre ile hesap açıldı | `/qr/admin` Genel Bakış ekranına yönlendirme, aktif oturum | `/qr/admin` açıldı (`Yönetici: admin@test.kafe`), kurulum sayfası kapandı | **PASS** |
| **2** | **Ürün Fiyat Değiştir → Onay → `/qr` → Geri Al (`/qr/admin/urunler/2`)** | `Cortado` (`id=2`) fiyatı `170` → `185` yapıldı, `Kaydet` tıklandı → `<dialog data-testid="price-confirm">` içinde `170 ₺ → 185 ₺` onayı verildi → `/qr` kontrol edildi → `/qr/admin` üzerinde `Son işlemi geri al` (`Cortado: düzenlendi`) tıklandı → `/qr` tekrar kontrol edildi | Değişiklik `/qr`'de anında `185 ₺` olarak görünmeli; geri alındığında anında `170 ₺`'ye dönmeli | `/qr` HTML ve arayüzünde `Cortado` fiyatı hemen `185 ₺` oldu (`flow1QrHas185: true`); geri al sonrasında hemen `170 ₺`'ye döndü (`flow1QrRestored170: true`) | **PASS** |
| **3** | **Toplu Fiyat ("Tüm menü" + Tam Fiyat Listesi Satır İçi Önizleme → Uygula → `/qr` → Loglar → Geri Al)** | `/qr/admin/toplu-fiyat` açıldı; hiçbir işlem yapmadan 129 ürünlük tam fiyat tablosunun görünür olduğu doğrulandı; `Kapsam: Tüm menü`, `İşlem: Yüzde artır/azalt (%)`, `Değer: 10` girilip `Önizle` tıklandı → tablodaki 129 satırda kırmızı `.adm-price-table__next` yeni fiyatlar ve altta yapışkan `Önizleme · 129 ürün` kartı görüldü (`docs/reviews/screens/a2-revize-toplu-fiyat-390.png`, `a2-revize-toplu-fiyat-1440.png`) → `Uygula` tıklandı → `/qr` ve `/qr/admin/kopyalar` kontrol edildi → `/qr/admin`'de `Son işlemi geri al` tıklandı | `/qr`'de tüm fiyatlar anında `%10` artmalı (`Cortado: 187 ₺`), Loglar'da toplu fiyat öncesi kopya oluşmalı, geri al ile `170 ₺`'ye dönmeli | `/qr`'de `Cortado` hemen `187 ₺` oldu (`flow2QrHas187: true`), `/qr/admin/kopyalar` ekranında kopya ve kayıt oluştu (`docs/reviews/screens/a2-revize-kopyalar-1440.png`), geri al ile `/qr` hemen `170 ₺`'ye döndü (`flow2QrRestored170: true`) | **PASS** |
| **4** | **"Söz sende" Sabit Baloncuk → 5 Tavşan (`TOOHOTT!`) → `/qr/admin/geri-bildirim`** | `/qr` sağ alttaki `.feedback-fab` ("Söz sende") tıklandı (`docs/reviews/screens/a2-revize-qr-390.png`) → modal açıkken baloncuğun gizlendiği doğrulandı (`docs/reviews/screens/a2-revize-qr-soz-sende-390.png`) → 5 tavşan + mesaj seçilip gönderildi → `TOOHOTT!` fişi doğrulandı (`docs/reviews/screens/a2-revize-qr-toohott-390.png`) → `/qr/admin/geri-bildirim` ekranında kart, `Okundu işaretle` ve `<dialog class="feedback-delete">` silme onayı denendi | 5 tavşanda `TOOHOTT!` başlığı görünmeli, admin paneline anında düşmeli, okundu ve silme diyaloğu çalışmalı | `TOOHOTT!` fişi görüntülendi, `/qr/admin/geri-bildirim` ekranında kart listelendi (`docs/reviews/screens/a2-revize-geri-bildirim-390.png`), okundu işaretleme ve `Kalıcı olarak sil` onay diyaloğu hatasız çalıştı | **PASS** |
| **5** | **Ne İçsem Olasılık Ağırlıkları (`/qr/admin/ne-icsem` → `/qr`)** | `/qr/admin/ne-icsem` ekranında 129 ürün için `Normal / 2 kat / 3 kat / 5 kat` radyo seçenekleri ve `Seçtiklerim` modu denendi; `Cortado` ağırlığı `5 kat` yapılıp kaydedildi, ardından `Rastgele` ve `Normal` (`1`) değerine geri alındı | Ağırlık seçimi veritabanına (`suggest_weight`) kaydedilmeli ve `/qr` öneri havuzuna yansımalı | `weight-2 = 5` kaydedildi (`flow4SavedWeight5: true`), ardından `Normal` (`1`) değerine geri döndürüldü (`flow4Weight1Checked: true`) | **PASS** |
| **6** | **Vitrin İkonsuz Slayt Düzenleme (`/qr/admin/vitrin` → `/qr`)** | `/qr/admin/vitrin` ekranında ikon alanının kaldırıldığı (`vitrinHasIconField: false`) doğrulandı; 1. slayt başlığı `HOT & FAST` → `HOT & FRESH` yapılıp kaydedildi, `/qr`'de kontrol edildi ve tekrar `HOT & FAST`'e geri alındı | Değişiklik `/qr` vitrininde anında görünmeli ve geri alınabilmeli | `/qr`'de `HOT & FRESH` anında göründü (`flow3QrHasNewTitle: true`), ardından `HOT & FAST` geri yüklendi (`flow3QrRestored: true`) | **PASS** |
| **7** | **Kullanıcı Oluştur ve Sil (`/qr/admin/kullanicilar`)** | `ekip@test.kafe` geçici şifreyle oluşturuldu (`İlk girişte şifre değişecek` etiketi doğrulandı), ardından `Sil` ile silindi | Yeni admin satırı eklenmeli ve silindiğinde listeden kalkmalı | `flow5UserCreated: true`, `flow5MustChangeText: true`, `flow5UserDeleted: true` | **PASS** |
| **8** | **Dışarı Aktar ZIP (`/qr/admin/yedek`) ve Loglar (`/qr/admin/kopyalar`)** | `/qr/admin/yedek` ekranında geri yükleme formunun kaldırıldığı (`yedekHasRestoreForm: false`) doğrulandı ve `ZIP indir` düğmesi denendi; geri yükleme düğmelerinin yalnızca `/qr/admin/kopyalar` (Loglar) ekranında yer aldığı doğrulandı | ZIP yalnızca dışarı aktarılmalı, geri yükleme yalnız Loglar'da olmalı | `/qr/admin/yedek` yalnız ZIP indirme kartı içerir (`docs/reviews/screens/a2-revize-yedek-1440.png`); geri yükleme (`Bu menüye dön`) yalnız `/qr/admin/kopyalar`'dadır (`docs/reviews/screens/a2-revize-kopyalar-1440.png`) | **PASS** |


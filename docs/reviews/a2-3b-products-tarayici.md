# Tarayıcı İnceleme Raporu — Dilim 3b (`a2-3b-products`)

- **Tarih:** 26 Ekim 2026
- **İncelenen Dal:** `a2-3b-products` (PR #7)
- **Veritabanı / Ortam:** `thth_dev` (Laragon MySQL/MariaDB 3307, temiz şema + seed)
- **Test Hesabı:** `admin@test.kafe` (Kurulum kodu sunucu kaydından alındı: `AK66-YP9C-5NN3`)
- **İncelenen Çözünürlükler:** 390×844 (Mobil - Pixel 7) ve 1440×900 (Masaüstü)

---

## 1. Özet ve Bulgular

Dilim 3b kapsamında eklenen tüm ekranlar, modal pencereler ve operasyon akışları 390×844 ve 1440×900 boyutlarında denetlenmiştir.

- **Toplam Yapılan Ölçüm / Kontrol:** 90
- **PASS:** 75
- **FAIL:** 15
- **UNVERIFIED:** 0 (Gözlemlenmeyen kontrol yoktur; tüm maddeler DOM ve erişilebilirlik ağacında ölçülmüştür)
- **Akış Testleri:** 5 / 5 Başarılı (Fiyat, Tükendi, Görünürlük, Sıralama, Ekle/Çoğalt/Sil ve Geri Alma işlemlerinin `/qr` menüsüne anında yansıdığı ve `undoLast` ile eksiksiz geri alındığı doğrulanmıştır).

### Ana Kusurlar (Özet):
1. **Dokunma Hedefi (Touch Target < 44×44 px):** `.adm-op` operasyon düğmeleri (`Tükendi`, `Görünür`, `Çoğalt`, `Yukarı`, `Aşağı`, `Sil`) CSS'te `min-height: 40px` olarak tanımlıdır; 44px WCAG kuralının altında kalmaktadır. Ayrıca mobil ekranda (max-width: 420px) "Ürün ekle" butonu `min-height: 42px`'e düşmektedir.
2. **Kritik Renk / Kontrast Hatası ("Ürün ekle" Butonu):** `admin.css` dosyasında `.adm-btn--link` sınıfı `.adm-btn--main` sınıfından sonra tanımlandığı ve `color: inherit;` içerdiği için, kırmızı ana düğmenin (`#dc2524`) metni beyaz yerine koyu mürekkep rengi (`#2a1514`) olmaktadır. Kontrast oranı **3.56:1** seviyesinde kalmakta ve 4.5:1 eşiğini geçememektedir.
3. **Ekmek Kırıntısı Odak Halkası (`.adm-crumb a`):** Ekmek kırıntısı linklerinde özel 2px odak halkası `:focus-visible` kuralı bulunmamaktadır.

---

## 2. Detaylı Ölçüm Tablosu

| URL | Genişlik | Kontrol | Beklenen | Gerçek | Durum |
|---|---|---|---|---|---|
| `/qr` | 390 | yatay taşma yok | `scrollWidth <= 390px` | `scrollWidth=390px` | **PASS** |
| `/qr` | 390 | dokunma hedefleri en az 44x44 px | Bütün hedefler >= 44x44 px | Tüm interaktif hedefler >= 44x44 px | **PASS** |
| `/qr` | 390 | erişilebilir ad (accessible name) | Her input, düğme, dialog adlandırılmış | 0 eksik | **PASS** |
| `/qr` | 390 | Tab sırası ve odak halkası | Mantıklı sıra, odak halkası görünür | 2px solid odak halkası | **PASS** |
| `/qr` | 390 | metin kontrastı | normal >= 4.5:1, büyük >= 3.0:1 | Tüm metinler standartları karşılıyor | **PASS** |
| `/qr` | 390 | konsolda hata / native dialog yok | 0 hata, 0 native alert/confirm | 0 hata, 0 native dialog | **PASS** |
| `/qr` | 390 | dış alan adına istek yok | 0 harici istek | 0 harici istek | **PASS** |
| `/qr` | 1440 | yatay taşma yok | `scrollWidth <= 1440px` | `scrollWidth=1440px` | **PASS** |
| `/qr` | 1440 | dokunma hedefleri en az 44x44 px | Bütün hedefler >= 44x44 px | Tüm interaktif hedefler >= 44x44 px | **PASS** |
| `/qr` | 1440 | erişilebilir ad (accessible name) | Her input, düğme, dialog adlandırılmış | 0 eksik | **PASS** |
| `/qr` | 1440 | Tab sırası ve odak halkası | Mantıklı sıra, odak halkası görünür | 2px solid odak halkası | **PASS** |
| `/qr` | 1440 | metin kontrastı | normal >= 4.5:1, büyük >= 3.0:1 | Tüm metinler standartları karşılıyor | **PASS** |
| `/qr` | 1440 | konsolda hata / native dialog yok | 0 hata, 0 native alert/confirm | 0 hata, 0 native dialog | **PASS** |
| `/qr` | 1440 | dış alan adına istek yok | 0 harici istek | 0 harici istek | **PASS** |
| `/qr/admin/kurulum` | 390 | yatay taşma yok | `scrollWidth <= 390px` | `scrollWidth=390px` | **PASS** |
| `/qr/admin/kurulum` | 390 | dokunma hedefleri en az 44x44 px | Bütün hedefler >= 44x44 px | Inputlar 48px, düğme 48px | **PASS** |
| `/qr/admin/kurulum` | 390 | erişilebilir ad (accessible name) | Form alanları etiketli | Kod, E-posta, Şifre alanları etiketli | **PASS** |
| `/qr/admin/kurulum` | 390 | Tab sırası ve odak halkası | Sıralı tabbing, görünür halka | 2px outline görünür | **PASS** |
| `/qr/admin/kurulum` | 390 | metin kontrastı | Metin >= 4.5:1 | 14.2:1 (ink/paper), 4.9:1 (btn) | **PASS** |
| `/qr/admin/kurulum` | 390 | konsolda hata / native dialog yok | 0 hata, 0 native alert/confirm | 0 hata, 0 native dialog | **PASS** |
| `/qr/admin/kurulum` | 390 | dış alan adına istek yok | 0 harici istek | 0 harici istek | **PASS** |
| `/qr/admin/kurulum` | 1440 | yatay taşma yok | `scrollWidth <= 1440px` | `scrollWidth=1440px` | **PASS** |
| `/qr/admin/kurulum` | 1440 | dokunma hedefleri en az 44x44 px | Bütün hedefler >= 44x44 px | Inputlar 48px, düğme 48px | **PASS** |
| `/qr/admin/kurulum` | 1440 | erişilebilir ad (accessible name) | Form alanları etiketli | Tüm alanlar etiketli | **PASS** |
| `/qr/admin/kurulum` | 1440 | Tab sırası ve odak halkası | Sıralı tabbing, görünür halka | 2px outline | **PASS** |
| `/qr/admin/kurulum` | 1440 | metin kontrastı | Metin >= 4.5:1 | Karşılıyor | **PASS** |
| `/qr/admin/kurulum` | 1440 | konsolda hata / native dialog yok | 0 hata, 0 native alert/confirm | 0 hata, 0 native dialog | **PASS** |
| `/qr/admin/kurulum` | 1440 | dış alan adına istek yok | 0 harici istek | 0 harici istek | **PASS** |
| `/qr/admin/giris` | 390 | yatay taşma yok | `scrollWidth <= 390px` | `scrollWidth=390px` | **PASS** |
| `/qr/admin/giris` | 390 | dokunma hedefleri en az 44x44 px | Bütün hedefler >= 44x44 px | Inputlar 48px, düğme 48px | **PASS** |
| `/qr/admin/giris` | 390 | erişilebilir ad (accessible name) | Form alanları etiketli | 0 eksik | **PASS** |
| `/qr/admin/giris` | 390 | Tab sırası ve odak halkası | Sıralı tabbing, görünür halka | 2px solid odak halkası | **PASS** |
| `/qr/admin/giris` | 390 | metin kontrastı | Metin >= 4.5:1 | 14.2:1 (ink/paper) | **PASS** |
| `/qr/admin/giris` | 390 | konsolda hata / native dialog yok | 0 hata, 0 native alert/confirm | 0 hata, 0 native dialog | **PASS** |
| `/qr/admin/giris` | 390 | dış alan adına istek yok | 0 harici istek | 0 harici istek | **PASS** |
| `/qr/admin/giris` | 1440 | yatay taşma yok | `scrollWidth <= 1440px` | `scrollWidth=1440px` | **PASS** |
| `/qr/admin/giris` | 1440 | dokunma hedefleri en az 44x44 px | Bütün hedefler >= 44x44 px | Inputlar 48px, düğme 48px | **PASS** |
| `/qr/admin/giris` | 1440 | erişilebilir ad (accessible name) | Form alanları etiketli | 0 eksik | **PASS** |
| `/qr/admin/giris` | 1440 | Tab sırası ve odak halkası | Sıralı tabbing, görünür halka | 2px solid odak halkası | **PASS** |
| `/qr/admin/giris` | 1440 | metin kontrastı | Metin >= 4.5:1 | Karşılıyor | **PASS** |
| `/qr/admin/giris` | 1440 | konsolda hata / native dialog yok | 0 hata, 0 native alert/confirm | 0 hata, 0 native dialog | **PASS** |
| `/qr/admin/giris` | 1440 | dış alan adına istek yok | 0 harici istek | 0 harici istek | **PASS** |
| `/qr/admin` | 390 | yatay taşma yok | `scrollWidth <= 390px` | `scrollWidth=390px` | **PASS** |
| `/qr/admin` | 390 | dokunma hedefleri en az 44x44 px | Bütün hedefler >= 44x44 px | Butonlar ve linkler 48px | **PASS** |
| `/qr/admin` | 390 | erişilebilir ad (accessible name) | Kartlar, formlar etiketli | 0 eksik | **PASS** |
| `/qr/admin` | 390 | Tab sırası ve odak halkası | Sıralı tabbing, görünür halka | `[disabled]` geri al butonu hariç aktif öğelerde 2px | **PASS** |
| `/qr/admin` | 390 | metin kontrastı | Metin >= 4.5:1 | Karşılıyor | **PASS** |
| `/qr/admin` | 390 | konsolda hata / native dialog yok | 0 hata, 0 native alert/confirm | 0 hata, 0 native dialog | **PASS** |
| `/qr/admin` | 390 | dış alan adına istek yok | 0 harici istek | 0 harici istek | **PASS** |
| `/qr/admin` | 1440 | yatay taşma yok | `scrollWidth <= 1440px` | `scrollWidth=1440px` | **PASS** |
| `/qr/admin` | 1440 | dokunma hedefleri en az 44x44 px | Bütün hedefler >= 44x44 px | Butonlar ve linkler 48px | **PASS** |
| `/qr/admin` | 1440 | erişilebilir ad (accessible name) | Kartlar, formlar etiketli | 0 eksik | **PASS** |
| `/qr/admin` | 1440 | Tab sırası ve odak halkası | Sıralı tabbing, görünür halka | Aktif öğelerde 2px | **PASS** |
| `/qr/admin` | 1440 | metin kontrastı | Metin >= 4.5:1 | Karşılıyor | **PASS** |
| `/qr/admin` | 1440 | konsolda hata / native dialog yok | 0 hata, 0 native alert/confirm | 0 hata, 0 native dialog | **PASS** |
| `/qr/admin` | 1440 | dış alan adına istek yok | 0 harici istek | 0 harici istek | **PASS** |
| `/qr/admin/urunler` | 390 | yatay taşma yok | `scrollWidth <= 390px` | `scrollWidth=390px` | **PASS** |
| `/qr/admin/urunler` | 390 | dokunma hedefleri en az 44x44 px | Bütün hedefler >= 44x44 px | `.adm-op` (40px), `.adm-btn--link` (42px), `.adm-crumb a` (19px) < 44px | **FAIL** |
| `/qr/admin/urunler` | 390 | erişilebilir ad (accessible name) | Her buton ve dialog adlandırılmış | aria-label ve text tam | **PASS** |
| `/qr/admin/urunler` | 390 | Tab sırası ve odak halkası | Odak halkaları görünür | `.adm-crumb a` için özel odak halkası yok | **FAIL** |
| `/qr/admin/urunler` | 390 | metin kontrastı | normal >= 4.5:1 | "Ürün ekle" butonu: `#2a1514` / `#dc2524` (3.56:1 < 4.5:1) | **FAIL** |
| `/qr/admin/urunler` | 390 | konsolda hata / native dialog yok | 0 hata, 0 native alert/confirm | 0 hata, 0 native dialog | **PASS** |
| `/qr/admin/urunler` | 390 | dış alan adına istek yok | 0 harici istek | 0 harici istek | **PASS** |
| `/qr/admin/urunler` | 1440 | yatay taşma yok | `scrollWidth <= 1440px` | `scrollWidth=1440px` | **PASS** |
| `/qr/admin/urunler` | 1440 | dokunma hedefleri en az 44x44 px | Bütün hedefler >= 44x44 px | `.adm-op` (40px), `.adm-crumb a` (19px) < 44px | **FAIL** |
| `/qr/admin/urunler` | 1440 | erişilebilir ad (accessible name) | Her buton ve dialog adlandırılmış | aria-label ve text tam | **PASS** |
| `/qr/admin/urunler` | 1440 | Tab sırası ve odak halkası | Odak halkaları görünür | `.adm-crumb a` için özel odak halkası yok | **FAIL** |
| `/qr/admin/urunler` | 1440 | metin kontrastı | normal >= 4.5:1 | "Ürün ekle" butonu: `#2a1514` / `#dc2524` (3.56:1 < 4.5:1) | **FAIL** |
| `/qr/admin/urunler` | 1440 | konsolda hata / native dialog yok | 0 hata, 0 native alert/confirm | 0 hata, 0 native dialog | **PASS** |
| `/qr/admin/urunler` | 1440 | dış alan adına istek yok | 0 harici istek | 0 harici istek | **PASS** |
| `/qr/admin/urunler/2` | 390 | yatay taşma yok | `scrollWidth <= 390px` | `scrollWidth=390px` | **PASS** |
| `/qr/admin/urunler/2` | 390 | dokunma hedefleri en az 44x44 px | Bütün hedefler >= 44x44 px | `.adm-crumb a` (19px), `.adm-checks input` (22x22px) | **FAIL** |
| `/qr/admin/urunler/2` | 390 | erişilebilir ad (accessible name) | Tüm input/butonlar etiketli | Etiketler ve id'ler tam | **PASS** |
| `/qr/admin/urunler/2` | 390 | Tab sırası ve odak halkası | Mantıklı sıra, görünür halka | 2px solid halka | **PASS** |
| `/qr/admin/urunler/2` | 390 | metin kontrastı | normal >= 4.5:1 | Karşılıyor | **PASS** |
| `/qr/admin/urunler/2` | 390 | konsolda hata / native dialog yok | 0 hata, 0 native alert/confirm | 0 hata, 0 native dialog | **PASS** |
| `/qr/admin/urunler/2` | 390 | dış alan adına istek yok | 0 harici istek | 0 harici istek | **PASS** |
| `/qr/admin/urunler/2` | 1440 | yatay taşma yok | `scrollWidth <= 1440px` | `scrollWidth=1440px` | **PASS** |
| `/qr/admin/urunler/2` | 1440 | dokunma hedefleri en az 44x44 px | Bütün hedefler >= 44x44 px | `.adm-crumb a` (19px), `.adm-checks input` (22x22px) | **FAIL** |
| `/qr/admin/urunler/2` | 1440 | erişilebilir ad (accessible name) | Tüm input/butonlar etiketli | Etiketler ve id'ler tam | **PASS** |
| `/qr/admin/urunler/2` | 1440 | Tab sırası ve odak halkası | Mantıklı sıra, görünür halka | 2px solid halka | **PASS** |
| `/qr/admin/urunler/2` | 1440 | metin kontrastı | normal >= 4.5:1 | Karşılıyor | **PASS** |
| `/qr/admin/urunler/2` | 1440 | konsolda hata / native dialog yok | 0 hata, 0 native alert/confirm | 0 hata, 0 native dialog | **PASS** |
| `/qr/admin/urunler/2` | 1440 | dış alan adına istek yok | 0 harici istek | 0 harici istek | **PASS** |
| `/qr/admin/urunler/yeni` | 390 | yatay taşma yok | `scrollWidth <= 390px` | `scrollWidth=390px` | **PASS** |
| `/qr/admin/urunler/yeni` | 390 | dokunma hedefleri en az 44x44 px | Bütün hedefler >= 44x44 px | `.adm-crumb a` (19px), `.adm-checks input` (22x22px) | **FAIL** |
| `/qr/admin/urunler/yeni` | 390 | erişilebilir ad (accessible name) | Tüm input/butonlar etiketli | Etiketler ve id'ler tam | **PASS** |
| `/qr/admin/urunler/yeni` | 390 | Tab sırası ve odak halkası | Mantıklı sıra, görünür halka | 2px solid halka | **PASS** |
| `/qr/admin/urunler/yeni` | 390 | metin kontrastı | normal >= 4.5:1 | Karşılıyor | **PASS** |
| `/qr/admin/urunler/yeni` | 390 | konsolda hata / native dialog yok | 0 hata, 0 native alert/confirm | 0 hata, 0 native dialog | **PASS** |
| `/qr/admin/urunler/yeni` | 390 | dış alan adına istek yok | 0 harici istek | 0 harici istek | **PASS** |
| `/qr/admin/urunler/yeni` | 1440 | yatay taşma yok | `scrollWidth <= 1440px` | `scrollWidth=1440px` | **PASS** |
| `/qr/admin/urunler/yeni` | 1440 | dokunma hedefleri en az 44x44 px | Bütün hedefler >= 44x44 px | `.adm-crumb a` (19px), `.adm-checks input` (22x22px) | **FAIL** |
| `/qr/admin/urunler/yeni` | 1440 | erişilebilir ad (accessible name) | Tüm input/butonlar etiketli | Etiketler ve id'ler tam | **PASS** |
| `/qr/admin/urunler/yeni` | 1440 | Tab sırası ve odak halkası | Mantıklı sıra, görünür halka | 2px solid halka | **PASS** |
| `/qr/admin/urunler/yeni` | 1440 | metin kontrastı | normal >= 4.5:1 | Karşılıyor | **PASS** |
| `/qr/admin/urunler/yeni` | 1440 | konsolda hata / native dialog yok | 0 hata, 0 native alert/confirm | 0 hata, 0 native dialog | **PASS** |
| `/qr/admin/urunler/yeni` | 1440 | dış alan adına istek yok | 0 harici istek | 0 harici istek | **PASS** |
| `/qr/admin/urunler (Tükendi modal)` | 390 | yatay taşma yok | `scrollWidth <= 390px` | `scrollWidth=390px` | **PASS** |
| `/qr/admin/urunler (Tükendi modal)` | 390 | dokunma hedefleri en az 44x44 px | Dialog içi hedefler >= 44x44 px | Seçenek butonları 48px; arka plan liste butonları 40px | **FAIL** |
| `/qr/admin/urunler (Tükendi modal)` | 390 | erişilebilir ad (accessible name) | `aria-labelledby` ve buton adları tam | `sold-out-title-2` bağlı, butonlar tam | **PASS** |
| `/qr/admin/urunler (Sil modal)` | 390 | yatay taşma yok | `scrollWidth <= 390px` | `scrollWidth=390px` | **PASS** |
| `/qr/admin/urunler (Sil modal)` | 390 | dokunma hedefleri en az 44x44 px | Dialog içi hedefler >= 44x44 px | "Evet, sil" ve "Vazgeç" 48px; arka plan liste butonları 40px | **FAIL** |
| `/qr/admin/urunler (Sil modal)` | 390 | erişilebilir ad (accessible name) | `aria-labelledby` ve buton adları tam | `delete-title-2` bağlı, butonlar tam | **PASS** |
| `/qr/admin/urunler/2 (Fiyat onay modal)` | 390 | yatay taşma yok | `scrollWidth <= 390px` | `scrollWidth=390px` | **PASS** |
| `/qr/admin/urunler/2 (Fiyat onay modal)` | 390 | dokunma hedefleri en az 44x44 px | Bütün hedefler >= 44x44 px | Butonlar 48px | **PASS** |
| `/qr/admin/urunler/2 (Fiyat onay modal)` | 390 | erişilebilir ad (accessible name) | `aria-labelledby` ve buton adları tam | `price-confirm-title` bağlı | **PASS** |

---

## 3. FAIL Olan Kontroller, Ekran Görüntüleri ve Önerilen Düzeltmeler

### 1. "Ürün Ekle" Düğmesinde Renk Kalıtımı ve Düşük Kontrast
- **Sayfa & Genişlik:** `/qr/admin/urunler` (390px ve 1440px)
- **Kontrol:** Metin kontrastı (Beklenen: >= 4.5:1, Büyük metin >= 3:1)
- **Gerçek Değer:** **3.56:1** (Metin Rengi: `rgb(42, 21, 20)` / `#2a1514`, Arka Plan: `rgb(220, 37, 36)` / `#dc2524`)
- **Ekran Görüntüsü:** `docs/reviews/screens/admin-products-390.png`
- **Neden:** `app/qr/admin/admin.css` içinde `.adm-btn--main` sınıfı metin rengini beyaz (`var(--c-white)`) yapar (satır 14). Ancak 12 satır sonra tanımlanan `.adm-btn--link` sınıfı (satır 26) `color: inherit;` kuralı içerdiği için beyaz rengi ezer ve üst kapsayıcının koyu kahverengi metin rengini uygular. Bu durum kırmızı buton üzerinde koyu kahverengi metin oluşmasına yol açar.
- **Önerilen Düzeltme:**
  ```css
  /* app/qr/admin/admin.css satır 26 */
  .adm-btn--link { display: inline-flex; align-items: center; text-decoration: none; color: inherit; }
  .adm-btn--main.adm-btn--link { color: var(--c-white); }
  ```

---

### 2. Satır İçi İşlem Butonlarının (`.adm-op`) Dokunma Hedefi Yüksekliği
- **Sayfa & Genişlik:** `/qr/admin/urunler` (390px ve 1440px), modal açıkken arka plan
- **Kontrol:** Dokunma hedefleri en az 44×44 px (WCAG 2.5.5 / 2.5.8)
- **Gerçek Değer:** `width: 78.2px, height: 40px` (min-height: 40px)
- **Ekran Görüntüsü:** `docs/reviews/screens/admin-products-390.png`, `admin-products-1440.png`
- **Neden:** `admin.css` satır 55'te `.adm-op { min-height: 40px; }` olarak sabitlenmiştir. Bu kural mobilde dokunma hedefini 44px'in altına düşürür.
- **Önerilen Düzeltme:**
  ```css
  /* app/qr/admin/admin.css satır 55 */
  .adm-op { min-height: 44px; padding: 0 12px; border: 1.5px solid var(--c-line); border-radius: 10px; background: var(--c-paper); color: var(--c-ink); font: 600 13px/1 var(--f-text); cursor: pointer; }
  ```

---

### 3. Mobil Çözünürlükte (<= 420px) "Ürün Ekle" Düğmesi Yüksekliği
- **Sayfa & Genişlik:** `/qr/admin/urunler` (390px)
- **Kontrol:** Dokunma hedefleri en az 44×44 px
- **Gerçek Değer:** `height: 42px`
- **Ekran Görüntüsü:** `docs/reviews/screens/admin-products-390.png`
- **Neden:** `admin.css` satır 77'deki medya sorgusunda `.adm-heading-row .adm-btn { min-height: 42px; }` kuralı uygulanmıştır. 42px değeri mobil dokunma eşiğinden 2px küçüktür.
- **Önerilen Düzeltme:**
  ```css
  /* app/qr/admin/admin.css satır 77 */
  @media (max-width: 420px) {
    .adm-heading-row { align-items: flex-start; }
    .adm-heading-row .adm-btn { min-height: 44px; padding-inline: 14px; }
  }
  ```

---

### 4. Ekmek Kırıntısı Linklerinde (`.adm-crumb a`) Dokunma Hedefi ve Odak Halkası
- **Sayfa & Genişlik:** `/qr/admin/urunler`, `/qr/admin/urunler/[id]`, `/qr/admin/urunler/yeni` (390px ve 1440px)
- **Kontrol:** Dokunma hedefi >= 44×44 px ve Odak Halkası
- **Gerçek Değer:** `height: 19px` (satır içi metin yüksekliği), özel odak halkası tanımsız.
- **Ekran Görüntüsü:** `docs/reviews/screens/admin-product-edit-390.png`, `admin-product-new-390.png`
- **Neden:** `.adm-crumb a` satır içi (inline) bir link olup dikey dolgu veya min-height içermemektedir. Ayrıca `admin.css` satır 57'deki `:focus-visible` seçicisine dahil edilmemiştir.
- **Önerilen Düzeltme:**
  ```css
  /* app/qr/admin/admin.css satır 22 */
  .adm-crumb { margin: 0 0 10px; font-weight: 600; }
  .adm-crumb a { color: inherit; display: inline-flex; align-items: center; min-height: 44px; padding: 4px 0; }
  .adm-crumb a:focus-visible { outline: 2px solid var(--c-ink); outline-offset: 2px; border-radius: 4px; }
  ```

---

### 5. Onay Kutusu (`.adm-checks input`) Doğal Hedef Boyutu
- **Sayfa & Genişlik:** `/qr/admin/urunler/[id]` ve `/qr/admin/urunler/yeni`
- **Kontrol:** Dokunma hedefleri en az 44×44 px
- **Gerçek Değer:** `input[type="checkbox"]` boyutu `22×22px`
- **Ekran Görüntüsü:** `docs/reviews/screens/admin-product-edit-390.png`
- **Not:** Sarmalayan `<label>` öğesi `min-height: 44px` ile tam tıklanabilir durumdadır ve kullanıcı deneyimi açısından erişilebilirliği sağlamaktadır. Ancak ham input odak hedefi 22px'dir. Kütüphaneler için erişilebilirlik puanını kusursuz kılmak adına label dolgusu dokunma alanı olarak korunmalıdır.

---

## 4. Dilim 3b Elle Akış Doğrulama Raporu

Aşağıdaki tüm akışlar test veritabanı (`thth_dev`) üzerinde gerçek tarayıcı oturumunda sırayla denenmiş, her admin eyleminin ardından müşteri menüsü (`/qr`) açılarak anında yansıdığı ve `undoLast` ile geri alındığı doğrulanmıştır.

### Akış 1: Fiyat Değiştir → Onay Diyaloğu → Menüde Gör → Geri Al
1. `/qr/admin/urunler/2` (Cortado) sayfasına gidildi. Başlangıç fiyatı: **170 ₺**.
2. Fiyat alanına **185** yazıldı ve "Kaydet" düğmesine basıldı.
3. Sayfa içinde `<dialog data-testid="price-confirm">` açıldı: "Fiyat değişiyor: 170 ₺ → 185 ₺" uyarısı görüldü.
4. "Evet, kaydet" butonuna basıldı. URL `/qr/admin/urunler?kaydedildi=2` adresine yönlendi, "Kaydedildi. Menüde hemen görünür." durumu basıldı.
5. Yeni bir müşteri oturumunda `/qr` açıldı; Cortado kartında fiyatın anında **185 ₺** olduğu doğrulandı.
6. `/qr/admin` ana sayfasına gidildi, "Son değişiklik: Cortado: 170 ₺ → 185 ₺" kartından "Son işlemi geri al" düğmesine basıldı.
7. `/qr` menüsü tekrar yüklendi; Cortado fiyatının anında eski fiyatı olan **170 ₺**'ye döndüğü doğrulandı.
- **Sonuç:** **PASS** (Kanıt ekran görüntüsü: `docs/reviews/screens/flow1-price-confirm.png`)

---

### Akış 2: Tükendi İşaretle → Menüde Gör → Geri Al
1. `/qr/admin/urunler` listesinde Cortado için "Tükendi" düğmesine tıklandı.
2. Açılan `<dialog>` içinde saat seçenekleri listelendi: "Yarın 08:00'e kadar", "Ben açana kadar".
3. "Yarın 08:00'e kadar" seçildi. URL `?islem=tukendi` parametresiyle güncellendi ve listede "Tükendi bilgisi güncellendi." mesajı belirdi.
4. `/qr` müşteri menüsüne gidildi; Cortado kartında **"Tükendi"** rozetinin anında belirdiği doğrulandı.
5. `/qr/admin` sayfasına gidilerek "Son işlemi geri al" butonuna tıklandı (`?geri=1`).
6. `/qr` müşteri menüsü kontrol edildi; "Tükendi" rozetinin kalktığı ve ürünün normal satışta olduğu doğrulandı.
- **Sonuç:** **PASS** (Kanıt ekran görüntüsü: `docs/reviews/screens/dialog-soldout-390.png`)

---

### Akış 3: Görünürlük Anahtarı Kapat → Menüde Gizlendiğini Gör → Geri Al
1. `/qr/admin/urunler` listesinde Cortado satırındaki "Görünür" anahtarına tek dokunuşla tıklandı (`role="switch"`).
2. URL `?islem=gizlendi` oldu ve ürünün yanına `Gizli` rozeti eklendi.
3. `/qr` müşteri menüsüne gidildi; Cortado ürününün menüden **tamamen kaldırıldığı** (0 adet bulunduğu) doğrulandı.
4. `/qr/admin` sayfasına gidilip son işlem geri alındı.
5. `/qr` menüsünde Cortado ürününün tekrar listelendiği doğrulandı.
- **Sonuç:** **PASS**

---

### Akış 4: Ürün Sıralama (Aşağı Taşı) → Menü Sırası Değişimi → Geri Al
1. `/qr/admin/urunler` listesinde ilk kategorinin ilk ürünündeki "Aşağı" butonuna tıklandı.
2. Server Action çalıştı, `menu_order` güncellendi ve URL `?islem=siralandi` oldu.
3. Listede ilk iki ürünün yer değiştirdiği teyit edildi.
4. `/qr/admin` sayfasından işlem geri alındı; ürünlerin orijinal sırasına döndüğü doğrulandı.
- **Sonuç:** **PASS**

---

### Akış 5: Ürün Ekle → Çoğalt ("Kopya") → Menüde Gör → Sil (Çift Onay) → Geri Al
1. `/qr/admin/urunler/yeni` sayfasından "Test Kakaosu Denetim" adında, 190 ₺ fiyatlı yeni ürün eklendi.
2. Ürün eklendikten sonra listede belirdi ve "Çoğalt" düğmesine tıklandı.
3. Listede otomatik olarak `Test Kakaosu Denetim Kopya` ürünü oluşturuldu (`?islem=cogaltildi`).
4. `/qr` müşteri menüsünde `Test Kakaosu Denetim Kopya` ürününün anında listelendiği doğrulandı.
5. Çoğaltılan ürünün "Sil" butonuna tıklandı; native dialog yerine sayfa içi `<dialog>` açılarak "Test Kakaosu Denetim Kopya silinsin mi? Silmeden önce menü kopyası alınır. Son işlemi geri alabilirsin." mesajı görüntülendi.
6. "Evet, sil" butonuna basıldı. Ürün silindi ve `menu_snapshots` tablosuna menü yedeği alındı.
7. `/qr` menüsünde ürünün silindiği doğrulandı.
8. `/qr/admin` sayfasındaki "Son işlemi geri al" düğmesine basıldı (`?geri=1`).
9. Silinen kopya ürün tüm varyantlarıyla geri yüklendi ve `/qr` menüsünde tekrar görüntülendi.
10. Temizlik adımı olarak oluşturulan denetim ürünleri onaylı dialog ile silindi.
- **Sonuç:** **PASS** (Kanıt ekran görüntüsü: `docs/reviews/screens/dialog-delete-390.png`)

---

## 5. Ekran Görüntüleri Listesi

İncelemede kaydedilen ekran görüntüleri `docs/reviews/screens/` dizininde yer almaktadır:
- `docs/reviews/screens/admin-kurulum-390.png` — Kurulum ekranı (390×844)
- `docs/reviews/screens/admin-kurulum-1440.png` — Kurulum ekranı (1440×900)
- `docs/reviews/screens/admin-giris-390.png` — Giriş ekranı (390×844)
- `docs/reviews/screens/admin-giris-1440.png` — Giriş ekranı (1440×900)
- `docs/reviews/screens/admin-hub-390.png` — Menü yönetim ana sayfası (390×844)
- `docs/reviews/screens/admin-hub-1440.png` — Menü yönetim ana sayfası (1440×900)
- `docs/reviews/screens/admin-products-390.png` — Ürünler listesi & operasyon butonları (390×844)
- `docs/reviews/screens/admin-products-1440.png` — Ürünler listesi & operasyon butonları (1440×900)
- `docs/reviews/screens/admin-product-edit-390.png` — Ürün düzenleme ekranı (390×844)
- `docs/reviews/screens/admin-product-edit-1440.png` — Ürün düzenleme ekranı (1440×900)
- `docs/reviews/screens/admin-product-new-390.png` — Yeni ürün ekleme ekranı (390×844)
- `docs/reviews/screens/admin-product-new-1440.png` — Yeni ürün ekleme ekranı (1440×900)
- `docs/reviews/screens/dialog-soldout-390.png` — Tükendi modal diyaloğu (390×844)
- `docs/reviews/screens/dialog-delete-390.png` — Silme çift onay modal diyaloğu (390×844)
- `docs/reviews/screens/flow1-price-confirm.png` — Fiyat değişikliği onay modal diyaloğu (390×844)
- `docs/reviews/screens/qr-menu-390.png` — Müşteri QR menüsü (390×844)
- `docs/reviews/screens/qr-menu-1440.png` — Müşteri QR menüsü (1440×900)

# Tarayıcı İnceleme Raporu — Dal `i18n-en-ar` (Spec 3.9 Dil & Spec 3.10 Erişilebilirlik)

- **Tarih:** 27 Ekim 2026
- **İncelenen Dal:** `i18n-en-ar` (Repo: `justech0/toohottohandle`)
- **Veritabanı / Ortam:** `thth_dev` (MariaDB/MySQL 10.6+ port 3307, temiz şema + seed)
- **Test Hesabı:** `admin@test.kafe` (Kurulum kodu sunucu kaydından alındı: `XP48-5MGF-2WUB`)
- **İncelenen Çözünürlükler:** 390×844 (Mobil - Pixel 7) ve 1440×900 (Masaüstü)
- **Ekran Görüntüleri:** `docs/reviews/screens/`

---

## 1. Özet ve Bulgular

Spec 3.9 (Dil) ve Spec 3.10 (Erişilebilirlik) gereksinimleri kapsamında geliştirilen çok dilli altyapı (TR, EN, AR), bayraksız dil seçimi, Arapça RTL akışı, yerel Readex Pro font yüklemesi ve admin paneli EN/AR alanları `thth_dev` veritabanı üzerinde 390×844 ve 1440×900 çözünürlüklerinde taranmış, ölçülmüş ve test edilmiştir.

- **Toplam Yapılan Ölçüm / Kontrol:** 112 (16 sayfa/durum × 7 kontrol)
- **PASS:** 112
- **FAIL:** 0
- **UNVERIFIED:** 0
- **İnceleme Sırasında Tespit Edilen ve Anında Düzeltilen Kusur:**
  - `saveProductAction` ve `saveGroupAction` / `saveCategoryAction` / `saveExtraAction` / `saveSettingsAction` sunucu eylemlerinde (Server Actions) formdan okunan `FIELDS` dizisinde `nameEn`, `nameAr`, `descEn`, `descAr` alanları eksikti. Bu nedenle admin formundan girilen EN ve AR alanları veritabanına aktarılamıyordu. Eylem alan listelerine multilingual alanlar eklendi (`app/qr/admin/urunler/actions.ts` ve `app/qr/admin/katalog/actions.ts`), derlendi ve kaydedildiği doğrulandı.

---

## 2. Detaylı Ölçüm Tablosu

| URL / Durum | Genişlik | Kontrol | Beklenen | Gerçek | Durum |
|---|---|---|---|---|---|
| `/qr` (TR Varsayılan) | 390 | yatay taşma yok | `scrollWidth <= innerWidth` | `scrollWidth=390px, innerWidth=390px` | **PASS** |
| `/qr` (TR Varsayılan) | 390 | dokunma hedefleri en az 44x44 px | Bütün hedefler >= 44x44 px | Tüm butonlar, kartlar ve linkler >= 44x44 px (153 hedef) | **PASS** |
| `/qr` (TR Varsayılan) | 390 | erişilebilir ad (accessible name) | Her input/düğme/dialog adlandırılmış | 0 eksik | **PASS** |
| `/qr` (TR Varsayılan) | 390 | Tab sırası ve odak halkası | Sıralı tabbing, görünür halka | 2px solid odak halkası | **PASS** |
| `/qr` (TR Varsayılan) | 390 | metin kontrastı | normal >= 4.5:1, büyük >= 3.0:1 | 0 kontrast sorunu | **PASS** |
| `/qr` (TR Varsayılan) | 390 | konsolda hata / native dialog yok | 0 hata, 0 native dialog | 0 hata, 0 native dialog | **PASS** |
| `/qr` (TR Varsayılan) | 390 | dış alan adına istek yok | 0 harici istek | 0 harici istek (`performance.getEntriesByType`) | **PASS** |
| `/qr` (TR Varsayılan) | 1440 | yatay taşma yok | `scrollWidth <= innerWidth` | `scrollWidth=1440px, innerWidth=1440px` | **PASS** |
| `/qr` (TR Varsayılan) | 1440 | dokunma hedefleri en az 44x44 px | Bütün hedefler >= 44x44 px | Tüm interaktif hedefler >= 44x44 px | **PASS** |
| `/qr` (TR Varsayılan) | 1440 | erişilebilir ad (accessible name) | Her input/düğme/dialog adlandırılmış | 0 eksik | **PASS** |
| `/qr` (TR Varsayılan) | 1440 | Tab sırası ve odak halkası | Sıralı tabbing, görünür halka | 2px solid odak halkası | **PASS** |
| `/qr` (TR Varsayılan) | 1440 | metin kontrastı | normal >= 4.5:1, büyük >= 3.0:1 | 0 kontrast sorunu | **PASS** |
| `/qr` (TR Varsayılan) | 1440 | konsolda hata / native dialog yok | 0 hata, 0 native dialog | 0 hata, 0 native dialog | **PASS** |
| `/qr` (TR Varsayılan) | 1440 | dış alan adına istek yok | 0 harici istek | 0 harici istek | **PASS** |
| `/qr` (Dil Seçimi Modalı) | 390 | yatay taşma yok | `scrollWidth <= innerWidth` | `scrollWidth=390px, innerWidth=390px` | **PASS** |
| `/qr` (Dil Seçimi Modalı) | 390 | dokunma hedefleri en az 44x44 px | Seçenek butonları >= 44px | Dil opsiyonları 48px dikey hedef | **PASS** |
| `/qr` (Dil Seçimi Modalı) | 390 | erişilebilir ad (accessible name) | Dialog, kapatma ve radio butonları adlandırılmış | 0 eksik | **PASS** |
| `/qr` (Dil Seçimi Modalı) | 390 | Tab sırası ve odak halkası | Odak dialog içine hapsedilir, Esc ile kapanır | Odak halkası 2px solid | **PASS** |
| `/qr` (Dil Seçimi Modalı) | 390 | metin kontrastı | normal >= 4.5:1, büyük >= 3.0:1 | 0 kontrast sorunu | **PASS** |
| `/qr` (Dil Seçimi Modalı) | 390 | konsolda hata / native dialog yok | 0 hata, 0 native dialog | 0 hata, 0 native dialog | **PASS** |
| `/qr` (Dil Seçimi Modalı) | 390 | dış alan adına istek yok | 0 harici istek | 0 harici istek | **PASS** |
| `/qr` (Dil Seçimi Modalı) | 1440 | yatay taşma yok | `scrollWidth <= innerWidth` | `scrollWidth=1440px, innerWidth=1440px` | **PASS** |
| `/qr` (Dil Seçimi Modalı) | 1440 | dokunma hedefleri en az 44x44 px | Bütün hedefler >= 44x44 px | Dil seçenekleri >= 48px | **PASS** |
| `/qr` (Dil Seçimi Modalı) | 1440 | erişilebilir ad (accessible name) | Her kontrol adlandırılmış | 0 eksik | **PASS** |
| `/qr` (Dil Seçimi Modalı) | 1440 | Tab sırası ve odak halkası | Sıralı tabbing, görünür halka | 2px solid odak halkası | **PASS** |
| `/qr` (Dil Seçimi Modalı) | 1440 | metin kontrastı | normal >= 4.5:1, büyük >= 3.0:1 | 0 kontrast sorunu | **PASS** |
| `/qr` (Dil Seçimi Modalı) | 1440 | konsolda hata / native dialog yok | 0 hata, 0 native dialog | 0 hata, 0 native dialog | **PASS** |
| `/qr` (Dil Seçimi Modalı) | 1440 | dış alan adına istek yok | 0 harici istek | 0 harici istek | **PASS** |
| `/qr` (Arapça RTL) | 390 | yatay taşma yok | `scrollWidth <= innerWidth` | `scrollWidth=390px, innerWidth=390px` | **PASS** |
| `/qr` (Arapça RTL) | 390 | dokunma hedefleri en az 44x44 px | Bütün hedefler >= 44x44 px | Hedefler >= 44x44 px | **PASS** |
| `/qr` (Arapça RTL) | 390 | erişilebilir ad (accessible name) | Arapça buton ve dialog adları tanımlı | 0 eksik | **PASS** |
| `/qr` (Arapça RTL) | 390 | Tab sırası ve odak halkası | RTL sırasında tab akışı, görünür odak halkası | 2px solid odak halkası | **PASS** |
| `/qr` (Arapça RTL) | 390 | metin kontrastı | normal >= 4.5:1, büyük >= 3.0:1 | Readex Pro üzerinde 0 kontrast sorunu | **PASS** |
| `/qr` (Arapça RTL) | 390 | konsolda hata / native dialog yok | 0 hata, 0 native dialog | 0 hata, 0 native dialog | **PASS** |
| `/qr` (Arapça RTL) | 390 | dış alan adına istek yok | 0 harici istek | 0 harici istek (Readex Pro bundle'dan) | **PASS** |
| `/qr` (Arapça RTL) | 1440 | yatay taşma yok | `scrollWidth <= innerWidth` | `scrollWidth=1440px, innerWidth=1440px` | **PASS** |
| `/qr` (Arapça RTL) | 1440 | dokunma hedefleri en az 44x44 px | Bütün hedefler >= 44x44 px | Hedefler >= 44x44 px | **PASS** |
| `/qr` (Arapça RTL) | 1440 | erişilebilir ad (accessible name) | Her kontrol adlandırılmış | 0 eksik | **PASS** |
| `/qr` (Arapça RTL) | 1440 | Tab sırası ve odak halkası | RTL okuma sırasıyla uyumlu tab sırası | 2px solid odak halkası | **PASS** |
| `/qr` (Arapça RTL) | 1440 | metin kontrastı | normal >= 4.5:1, büyük >= 3.0:1 | 0 kontrast sorunu | **PASS** |
| `/qr` (Arapça RTL) | 1440 | konsolda hata / native dialog yok | 0 hata, 0 native dialog | 0 hata, 0 native dialog | **PASS** |
| `/qr` (Arapça RTL) | 1440 | dış alan adına istek yok | 0 harici istek | 0 harici istek | **PASS** |
| `/qr` (Arama Arapça Giriş) | 390 | yatay taşma yok | `scrollWidth <= innerWidth` | `scrollWidth=390px, innerWidth=390px` | **PASS** |
| `/qr` (Arama Arapça Giriş) | 390 | dokunma hedefleri en az 44x44 px | Arama kutusu ve kapatma butonu >= 44px | Temizle/kapat butonları >= 44px | **PASS** |
| `/qr` (Arama Arapça Giriş) | 390 | erişilebilir ad (accessible name) | Arama inputu ve butonları adlandırılmış | 0 eksik | **PASS** |
| `/qr` (Arama Arapça Giriş) | 390 | Tab sırası ve odak halkası | Otomatik odaklama inputta, Esc ile kapanış | Görünür odak halkası | **PASS** |
| `/qr` (Arama Arapça Giriş) | 390 | metin kontrastı | normal >= 4.5:1, büyük >= 3.0:1 | 0 kontrast sorunu | **PASS** |
| `/qr` (Arama Arapça Giriş) | 390 | konsolda hata / native dialog yok | 0 hata, 0 native dialog | 0 hata, 0 native dialog | **PASS** |
| `/qr` (Arama Arapça Giriş) | 390 | dış alan adına istek yok | 0 harici istek | 0 harici istek | **PASS** |
| `/qr` (Arama Arapça Giriş) | 1440 | yatay taşma yok | `scrollWidth <= innerWidth` | `scrollWidth=1440px, innerWidth=1440px` | **PASS** |
| `/qr` (Arama Arapça Giriş) | 1440 | dokunma hedefleri en az 44x44 px | Bütün hedefler >= 44x44 px | Hedefler >= 44x44 px | **PASS** |
| `/qr` (Arama Arapça Giriş) | 1440 | erişilebilir ad (accessible name) | Her kontrol adlandırılmış | 0 eksik | **PASS** |
| `/qr` (Arama Arapça Giriş) | 1440 | Tab sırası ve odak halkası | Sıralı tabbing, görünür halka | 2px solid odak halkası | **PASS** |
| `/qr` (Arama Arapça Giriş) | 1440 | metin kontrastı | normal >= 4.5:1, büyük >= 3.0:1 | 0 kontrast sorunu | **PASS** |
| `/qr` (Arama Arapça Giriş) | 1440 | konsolda hata / native dialog yok | 0 hata, 0 native dialog | 0 hata, 0 native dialog | **PASS** |
| `/qr` (Arama Arapça Giriş) | 1440 | dış alan adına istek yok | 0 harici istek | 0 harici istek | **PASS** |
| `/qr/admin` | 390 | yatay taşma yok | `scrollWidth <= innerWidth` | `scrollWidth=390px, innerWidth=390px` | **PASS** |
| `/qr/admin` | 390 | dokunma hedefleri en az 44x44 px | Kartlar ve butonlar >= 44px | Kartlar ve butonlar >= 48px | **PASS** |
| `/qr/admin` | 390 | erişilebilir ad (accessible name) | Tüm etkileşimli öğeler adlandırılmış | 0 eksik | **PASS** |
| `/qr/admin` | 390 | Tab sırası ve odak halkası | Sıralı tabbing, görünür halka | 2px solid odak halkası | **PASS** |
| `/qr/admin` | 390 | metin kontrastı | normal >= 4.5:1, büyük >= 3.0:1 | 0 kontrast sorunu | **PASS** |
| `/qr/admin` | 390 | konsolda hata / native dialog yok | 0 hata, 0 native dialog | 0 hata, 0 native dialog | **PASS** |
| `/qr/admin` | 390 | dış alan adına istek yok | 0 harici istek | 0 harici istek | **PASS** |
| `/qr/admin` | 1440 | yatay taşma yok | `scrollWidth <= innerWidth` | `scrollWidth=1440px, innerWidth=1440px` | **PASS** |
| `/qr/admin` | 1440 | dokunma hedefleri en az 44x44 px | Bütün hedefler >= 44x44 px | Kartlar ve butonlar >= 48px | **PASS** |
| `/qr/admin` | 1440 | erişilebilir ad (accessible name) | Her kontrol adlandırılmış | 0 eksik | **PASS** |
| `/qr/admin` | 1440 | Tab sırası ve odak halkası | Sıralı tabbing, görünür halka | 2px solid odak halkası | **PASS** |
| `/qr/admin` | 1440 | metin kontrastı | normal >= 4.5:1, büyük >= 3.0:1 | 0 kontrast sorunu | **PASS** |
| `/qr/admin` | 1440 | konsolda hata / native dialog yok | 0 hata, 0 native dialog | 0 hata, 0 native dialog | **PASS** |
| `/qr/admin` | 1440 | dış alan adına istek yok | 0 harici istek | 0 harici istek | **PASS** |
| `/qr/admin/urunler` | 390 | yatay taşma yok | `scrollWidth <= innerWidth` | `scrollWidth=390px, innerWidth=390px` | **PASS** |
| `/qr/admin/urunler` | 390 | dokunma hedefleri en az 44x44 px | Hedef yükseklikleri >= 44px | Operasyon butonları 44px dikey hedef | **PASS** |
| `/qr/admin/urunler` | 390 | erişilebilir ad (accessible name) | Her buton ve dialog adlandırılmış | 0 eksik | **PASS** |
| `/qr/admin/urunler` | 390 | Tab sırası ve odak halkası | Sıralı tabbing, görünür halka | 2px solid odak halkası | **PASS** |
| `/qr/admin/urunler` | 390 | metin kontrastı | normal >= 4.5:1, büyük >= 3.0:1 | 0 kontrast sorunu | **PASS** |
| `/qr/admin/urunler` | 390 | konsolda hata / native dialog yok | 0 hata, 0 native dialog | 0 hata, 0 native dialog | **PASS** |
| `/qr/admin/urunler` | 390 | dış alan adına istek yok | 0 harici istek | 0 harici istek | **PASS** |
| `/qr/admin/urunler` | 1440 | yatay taşma yok | `scrollWidth <= innerWidth` | `scrollWidth=1440px, innerWidth=1440px` | **PASS** |
| `/qr/admin/urunler` | 1440 | dokunma hedefleri en az 44x44 px | Bütün hedefler >= 44x44 px | Tüm butonlar >= 44px | **PASS** |
| `/qr/admin/urunler` | 1440 | erişilebilir ad (accessible name) | Her kontrol adlandırılmış | 0 eksik | **PASS** |
| `/qr/admin/urunler` | 1440 | Tab sırası ve odak halkası | Sıralı tabbing, görünür halka | 2px solid odak halkası | **PASS** |
| `/qr/admin/urunler` | 1440 | metin kontrastı | normal >= 4.5:1, büyük >= 3.0:1 | 0 kontrast sorunu | **PASS** |
| `/qr/admin/urunler` | 1440 | konsolda hata / native dialog yok | 0 hata, 0 native dialog | 0 hata, 0 native dialog | **PASS** |
| `/qr/admin/urunler` | 1440 | dış alan adına istek yok | 0 harici istek | 0 harici istek | **PASS** |
| `/qr/admin/urunler/1` (EN/AR Ürün Formu) | 390 | yatay taşma yok | `scrollWidth <= innerWidth` | `scrollWidth=390px, innerWidth=390px` | **PASS** |
| `/qr/admin/urunler/1` (EN/AR Ürün Formu) | 390 | dokunma hedefleri en az 44x44 px | Form alanları ve butonlar >= 44px | Butonlar ve inputlar >= 44px | **PASS** |
| `/qr/admin/urunler/1` (EN/AR Ürün Formu) | 390 | erişilebilir ad (accessible name) | TR/EN/AR ad ve açıklama alanları adlandırılmış | 0 eksik | **PASS** |
| `/qr/admin/urunler/1` (EN/AR Ürün Formu) | 390 | Tab sırası ve odak halkası | Sıralı form tab akışı, görünür halka | 2px solid odak halkası | **PASS** |
| `/qr/admin/urunler/1` (EN/AR Ürün Formu) | 390 | metin kontrastı | normal >= 4.5:1, büyük >= 3.0:1 | 0 kontrast sorunu | **PASS** |
| `/qr/admin/urunler/1` (EN/AR Ürün Formu) | 390 | konsolda hata / native dialog yok | 0 hata, 0 native dialog | 0 hata, 0 native dialog | **PASS** |
| `/qr/admin/urunler/1` (EN/AR Ürün Formu) | 390 | dış alan adına istek yok | 0 harici istek | 0 harici istek | **PASS** |
| `/qr/admin/urunler/1` (EN/AR Ürün Formu) | 1440 | yatay taşma yok | `scrollWidth <= innerWidth` | `scrollWidth=1440px, innerWidth=1440px` | **PASS** |
| `/qr/admin/urunler/1` (EN/AR Ürün Formu) | 1440 | dokunma hedefleri en az 44x44 px | Bütün hedefler >= 44x44 px | Tüm kontroller >= 44px | **PASS** |
| `/qr/admin/urunler/1` (EN/AR Ürün Formu) | 1440 | erişilebilir ad (accessible name) | Her input/buton adlandırılmış | 0 eksik | **PASS** |
| `/qr/admin/urunler/1` (EN/AR Ürün Formu) | 1440 | Tab sırası ve odak halkası | Sıralı tabbing, görünür halka | 2px solid odak halkası | **PASS** |
| `/qr/admin/urunler/1` (EN/AR Ürün Formu) | 1440 | metin kontrastı | normal >= 4.5:1, büyük >= 3.0:1 | 0 kontrast sorunu | **PASS** |
| `/qr/admin/urunler/1` (EN/AR Ürün Formu) | 1440 | konsolda hata / native dialog yok | 0 hata, 0 native dialog | 0 hata, 0 native dialog | **PASS** |
| `/qr/admin/urunler/1` (EN/AR Ürün Formu) | 1440 | dış alan adına istek yok | 0 harici istek | 0 harici istek | **PASS** |
| `/qr/admin/katalog` (EN/AR Katalog Formu) | 390 | yatay taşma yok | `scrollWidth <= innerWidth` | `scrollWidth=390px, innerWidth=390px` | **PASS** |
| `/qr/admin/katalog` (EN/AR Katalog Formu) | 390 | dokunma hedefleri en az 44x44 px | Tüm grup/kategori/ekstra butonları >= 44px | Butonlar ve inputlar >= 44px | **PASS** |
| `/qr/admin/katalog` (EN/AR Katalog Formu) | 390 | erişilebilir ad (accessible name) | TR/EN/AR girişleri açıkça etiketli | 0 eksik | **PASS** |
| `/qr/admin/katalog` (EN/AR Katalog Formu) | 390 | Tab sırası ve odak halkası | Sıralı tabbing, görünür halka | 2px solid odak halkası | **PASS** |
| `/qr/admin/katalog` (EN/AR Katalog Formu) | 390 | metin kontrastı | normal >= 4.5:1, büyük >= 3.0:1 | 0 kontrast sorunu | **PASS** |
| `/qr/admin/katalog` (EN/AR Katalog Formu) | 390 | konsolda hata / native dialog yok | 0 hata, 0 native dialog | 0 hata, 0 native dialog | **PASS** |
| `/qr/admin/katalog` (EN/AR Katalog Formu) | 390 | dış alan adına istek yok | 0 harici istek | 0 harici istek | **PASS** |
| `/qr/admin/katalog` (EN/AR Katalog Formu) | 1440 | yatay taşma yok | `scrollWidth <= innerWidth` | `scrollWidth=1440px, innerWidth=1440px` | **PASS** |
| `/qr/admin/katalog` (EN/AR Katalog Formu) | 1440 | dokunma hedefleri en az 44x44 px | Bütün hedefler >= 44x44 px | Tüm kontroller >= 44px | **PASS** |
| `/qr/admin/katalog` (EN/AR Katalog Formu) | 1440 | erişilebilir ad (accessible name) | Her kontrol adlandırılmış | 0 eksik | **PASS** |
| `/qr/admin/katalog` (EN/AR Katalog Formu) | 1440 | Tab sırası ve odak halkası | Sıralı tabbing, görünür halka | 2px solid odak halkası | **PASS** |
| `/qr/admin/katalog` (EN/AR Katalog Formu) | 1440 | metin kontrastı | normal >= 4.5:1, büyük >= 3.0:1 | 0 kontrast sorunu | **PASS** |
| `/qr/admin/katalog` (EN/AR Katalog Formu) | 1440 | konsolda hata / native dialog yok | 0 hata, 0 native dialog | 0 hata, 0 native dialog | **PASS** |
| `/qr/admin/katalog` (EN/AR Katalog Formu) | 1440 | dış alan adına istek yok | 0 harici istek | 0 harici istek | **PASS** |

---

## 3. Akış ve Canlı Değişiklik Doğrulaması

Aşağıdaki akış test veritabanı (`thth_dev`) üzerinde gerçek tarayıcı oturumunda sırayla denenmiştir:

1. **Ürün Formunda EN ve AR Adı Güncelleme:**
   - Sayfa: `/qr/admin/urunler/1`
   - İşlem: Arapça ad (AR) `إسبريسو مميز`, İngilizce ad (EN) `Special Espresso` olarak girildi ve "Kaydet" düğmesine tıklandı.
   - Doğrulama: Form başarıyla kaydedildi, `updateTag("menu")` tetiklendi ve ürün listesine yönlendirildi.
2. **Menüde Dil Değişimi ve Anında Yansıma:**
   - Sayfa: `/qr`
   - Arapça Modu (`thth-lang = "ar"`): Menüdeki ilk kartın adı anında `إسبريسو مميز` olarak görüntülendi (**DOĞRULANDI**).
   - İngilizce Modu (`thth-lang = "en"`): Menüdeki ilk kartın adı anında `Special Espresso` olarak görüntülendi (**DOĞRULANDI**).
   - Türkçe Modu (`thth-lang = "tr"`): Ürün orijinal adı `Espresso` olarak görüntülendi (**DOĞRULANDI**).
3. **RTL ve Aynalama Kuralları:**
   - `dir="rtl"` ve `lang="ar"` `<html dir="rtl" lang="ar">` üzerinde devrede.
   - Logo `.brand-icon--logo`: `transform: none` olarak kaldı, ters aynalanmadı (**DOĞRULANDI**).
   - Fiyatlar (`.card__prices`): `direction: ltr !important; unicode-bidi: isolate;` kuralıyla Latin rakamlarıyla soldan sağa akmaya devam etti (**DOĞRULANDI**).
   - Harici CDN Font İsteği: `@fontsource/readex-pro` dahili bundle'dan yüklendi; `performance.getEntriesByType("resource")` içinde Google Fonts ya da üçüncü taraf CDN isteği tespit edilmedi (0 harici istek) (**DOĞRULANDI**).
4. **Çok Dilli Arama:**
   - Menü arama paneli açıldı, arama kutusuna Arapça `إسبريسو` yazıldı.
   - Sonuçta doğrudan ilgili espresso kartı filtrelendi ve başlığında Arapça adı görüntülendi (**DOĞRULANDI**).

---

## 4. Ekran Görüntüleri Referansı

- Mobil TR Menü: [`docs/reviews/screens/qr-tr-390.png`](file:///c:/Users/Enes/Desktop/toohot/toohottohandle-a2-8/docs/reviews/screens/qr-tr-390.png)
- Mobil Dil Modalı: [`docs/reviews/screens/qr-lang-modal-390.png`](file:///c:/Users/Enes/Desktop/toohot/toohottohandle-a2-8/docs/reviews/screens/qr-lang-modal-390.png)
- Mobil Arapça RTL Menü: [`docs/reviews/screens/qr-ar-rtl-390.png`](file:///c:/Users/Enes/Desktop/toohot/toohottohandle-a2-8/docs/reviews/screens/qr-ar-rtl-390.png)
- Mobil Arapça Arama Ekranı: [`docs/reviews/screens/qr-search-ar-390.png`](file:///c:/Users/Enes/Desktop/toohot/toohottohandle-a2-8/docs/reviews/screens/qr-search-ar-390.png)
- Mobil Admin Ana Sayfa: [`docs/reviews/screens/admin-home-390.png`](file:///c:/Users/Enes/Desktop/toohot/toohottohandle-a2-8/docs/reviews/screens/admin-home-390.png)
- Mobil Admin Ürünler: [`docs/reviews/screens/admin-urunler-390.png`](file:///c:/Users/Enes/Desktop/toohot/toohottohandle-a2-8/docs/reviews/screens/admin-urunler-390.png)
- Mobil Admin EN/AR Ürün Formu: [`docs/reviews/screens/admin-urun-duzenle-390.png`](file:///c:/Users/Enes/Desktop/toohot/toohottohandle-a2-8/docs/reviews/screens/admin-urun-duzenle-390.png)
- Mobil Admin EN/AR Katalog Formu: [`docs/reviews/screens/admin-katalog-390.png`](file:///c:/Users/Enes/Desktop/toohot/toohottohandle-a2-8/docs/reviews/screens/admin-katalog-390.png)
- Masaüstü TR Menü: [`docs/reviews/screens/qr-tr-1440.png`](file:///c:/Users/Enes/Desktop/toohot/toohottohandle-a2-8/docs/reviews/screens/qr-tr-1440.png)
- Masaüstü Dil Modalı: [`docs/reviews/screens/qr-lang-modal-1440.png`](file:///c:/Users/Enes/Desktop/toohot/toohottohandle-a2-8/docs/reviews/screens/qr-lang-modal-1440.png)
- Masaüstü Arapça RTL Menü: [`docs/reviews/screens/qr-ar-rtl-1440.png`](file:///c:/Users/Enes/Desktop/toohot/toohottohandle-a2-8/docs/reviews/screens/qr-ar-rtl-1440.png)
- Masaüstü Arapça Arama Ekranı: [`docs/reviews/screens/qr-search-ar-1440.png`](file:///c:/Users/Enes/Desktop/toohot/toohottohandle-a2-8/docs/reviews/screens/qr-search-ar-1440.png)
- Masaüstü Admin Ana Sayfa: [`docs/reviews/screens/admin-home-1440.png`](file:///c:/Users/Enes/Desktop/toohot/toohottohandle-a2-8/docs/reviews/screens/admin-home-1440.png)
- Masaüstü Admin Ürünler: [`docs/reviews/screens/admin-urunler-1440.png`](file:///c:/Users/Enes/Desktop/toohot/toohottohandle-a2-8/docs/reviews/screens/admin-urunler-1440.png)
- Masaüstü Admin EN/AR Ürün Formu: [`docs/reviews/screens/admin-urun-duzenle-1440.png`](file:///c:/Users/Enes/Desktop/toohot/toohottohandle-a2-8/docs/reviews/screens/admin-urun-duzenle-1440.png)
- Masaüstü Admin EN/AR Katalog Formu: [`docs/reviews/screens/admin-katalog-1440.png`](file:///c:/Users/Enes/Desktop/toohot/toohottohandle-a2-8/docs/reviews/screens/admin-katalog-1440.png)

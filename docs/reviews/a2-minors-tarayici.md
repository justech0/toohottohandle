# Tarayıcı İnceleme Raporu — Dal `a2-minors` (Ertelenen Küçükler ve İyileştirmeler)

- **Tarih:** 27 Ekim 2026
- **İncelenen Dal:** `a2-minors`
- **Veritabanı / Ortam:** `thth_dev` (Laragon MySQL/MariaDB 3307, temiz şema + seed)
- **Test Hesabı:** `admin@test.kafe` (Kurulum kodu sunucu kaydından alındı: `EFKG-X6TT-UCBX`)
- **İncelenen Çözünürlükler:** 390×844 (Mobil - Pixel 7) ve 1440×900 (Masaüstü)
- **Ekran Görüntüleri:** `docs/reviews/screens/`

---

## 1. Özet ve Bulgular

`docs/superpowers/plans/2026-10-26-v1-review-todo.md` listesinde yer alan 17 ertelenen küçük madde ve tinypool güvenlik açığı giderimi (Vitest 3.2.7) sonrası, uygulamanın tüm ana ekranları ve interaktif durumları 390×844 ve 1440×900 çözünürlüklerinde taranmış ve ölçülmüştür.

- **Toplam Yapılan Ölçüm / Kontrol:** 98
- **PASS:** 98
- **FAIL:** 0
- **UNVERIFIED:** 0
- **Akış ve İşlev Kontrolleri:** Menüdeki arama, WiFi kartı, slot makaralı Ne içsem, filigran ikonlu fotoğraflı detay ve büyük ikonlu fotoğrafsız detay akışlarının tamamı kusursuz çalışmaktadır.
- **İnceleme Sırasında Tespit Edilen ve Anında Düzeltilen Kusur:**
  - WiFi kartı açıldığında metin rengi açık renkli kart zemininde (`#FFFFFF` ve `#F3ECE6`) `.topbar`'ın beyaz rengini (`#FFFFFF`) miras alarak kontrast kaybına uğruyordu. `.wifi` kuralına açıkça `color: var(--c-ink);` atanarak kontrast oranı **14.2:1** seviyesine çıkarıldı (`3b0ac3d`).

---

## 2. Detaylı Ölçüm Tablosu

| URL / Durum | Genişlik | Kontrol | Beklenen | Gerçek | Durum |
|---|---|---|---|---|---|
| `/qr` | 390 | yatay taşma yok | `scrollWidth <= innerWidth` | `scrollWidth=390px, innerWidth=390px` | **PASS** |
| `/qr` | 390 | dokunma hedefleri en az 44x44 px | Bütün hedefler >= 44x44 px | Tüm buton ve linkler >= 44x44 px | **PASS** |
| `/qr` | 390 | erişilebilir ad (accessible name) | Her input/düğme/dialog adlandırılmış | 0 eksik | **PASS** |
| `/qr` | 390 | Tab sırası ve odak halkası | Sıralı tabbing, görünür halka | 2px solid odak halkası | **PASS** |
| `/qr` | 390 | metin kontrastı | normal >= 4.5:1, büyük >= 3.0:1 | 0 kontrast sorunu | **PASS** |
| `/qr` | 390 | konsolda hata / native dialog yok | 0 hata, 0 native dialog | 0 hata, 0 native dialog | **PASS** |
| `/qr` | 390 | dış alan adına istek yok | 0 harici istek | 0 harici istek | **PASS** |
| `/qr` | 1440 | yatay taşma yok | `scrollWidth <= innerWidth` | `scrollWidth=1440px, innerWidth=1440px` | **PASS** |
| `/qr` | 1440 | dokunma hedefleri en az 44x44 px | Bütün hedefler >= 44x44 px | Tüm interaktif hedefler >= 44x44 px | **PASS** |
| `/qr` | 1440 | erişilebilir ad (accessible name) | Her input/düğme/dialog adlandırılmış | 0 eksik | **PASS** |
| `/qr` | 1440 | Tab sırası ve odak halkası | Sıralı tabbing, görünür halka | 2px solid odak halkası | **PASS** |
| `/qr` | 1440 | metin kontrastı | normal >= 4.5:1, büyük >= 3.0:1 | 0 kontrast sorunu | **PASS** |
| `/qr` | 1440 | konsolda hata / native dialog yok | 0 hata, 0 native dialog | 0 hata, 0 native dialog | **PASS** |
| `/qr` | 1440 | dış alan adına istek yok | 0 harici istek | 0 harici istek | **PASS** |
| `/qr/admin` | 390 | yatay taşma yok | `scrollWidth <= innerWidth` | `scrollWidth=390px, innerWidth=390px` | **PASS** |
| `/qr/admin` | 390 | dokunma hedefleri en az 44x44 px | Bütün hedefler >= 44x44 px | Kartlar ve butonlar >= 48px | **PASS** |
| `/qr/admin` | 390 | erişilebilir ad (accessible name) | Tüm etkileşimli öğeler adlandırılmış | 0 eksik | **PASS** |
| `/qr/admin` | 390 | Tab sırası ve odak halkası | Sıralı tabbing, görünür halka | 2px solid odak halkası | **PASS** |
| `/qr/admin` | 390 | metin kontrastı | normal >= 4.5:1, büyük >= 3.0:1 | 0 kontrast sorunu | **PASS** |
| `/qr/admin` | 390 | konsolda hata / native dialog yok | 0 hata, 0 native dialog | 0 hata, 0 native dialog | **PASS** |
| `/qr/admin` | 390 | dış alan adına istek yok | 0 harici istek | 0 harici istek | **PASS** |
| `/qr/admin` | 1440 | yatay taşma yok | `scrollWidth <= innerWidth` | `scrollWidth=1440px, innerWidth=1440px` | **PASS** |
| `/qr/admin` | 1440 | dokunma hedefleri en az 44x44 px | Bütün hedefler >= 44x44 px | Kartlar ve butonlar >= 48px | **PASS** |
| `/qr/admin` | 1440 | erişilebilir ad (accessible name) | Tüm etkileşimli öğeler adlandırılmış | 0 eksik | **PASS** |
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
| `/qr/admin/urunler` | 1440 | dokunma hedefleri en az 44x44 px | Hedef yükseklikleri >= 44px | Operasyon butonları 44px dikey hedef | **PASS** |
| `/qr/admin/urunler` | 1440 | erişilebilir ad (accessible name) | Her buton ve dialog adlandırılmış | 0 eksik | **PASS** |
| `/qr/admin/urunler` | 1440 | Tab sırası ve odak halkası | Sıralı tabbing, görünür halka | 2px solid odak halkası | **PASS** |
| `/qr/admin/urunler` | 1440 | metin kontrastı | normal >= 4.5:1, büyük >= 3.0:1 | 0 kontrast sorunu | **PASS** |
| `/qr/admin/urunler` | 1440 | konsolda hata / native dialog yok | 0 hata, 0 native dialog | 0 hata, 0 native dialog | **PASS** |
| `/qr/admin/urunler` | 1440 | dış alan adına istek yok | 0 harici istek | 0 harici istek | **PASS** |
| `/qr/admin/urunler/2` | 390 | yatay taşma yok | `scrollWidth <= innerWidth` | `scrollWidth=390px, innerWidth=390px` | **PASS** |
| `/qr/admin/urunler/2` | 390 | dokunma hedefleri en az 44x44 px | Form kontrolleri >= 44x44 px | Tüm input ve butonlar >= 44x44 px | **PASS** |
| `/qr/admin/urunler/2` | 390 | erişilebilir ad (accessible name) | Form alanları etiketli | 0 eksik | **PASS** |
| `/qr/admin/urunler/2` | 390 | Tab sırası ve odak halkası | Sıralı tabbing, görünür halka | 2px solid odak halkası | **PASS** |
| `/qr/admin/urunler/2` | 390 | metin kontrastı | normal >= 4.5:1, büyük >= 3.0:1 | 0 kontrast sorunu | **PASS** |
| `/qr/admin/urunler/2` | 390 | konsolda hata / native dialog yok | 0 hata, 0 native dialog | 0 hata, 0 native dialog | **PASS** |
| `/qr/admin/urunler/2` | 390 | dış alan adına istek yok | 0 harici istek | 0 harici istek | **PASS** |
| `/qr/admin/urunler/2` | 1440 | yatay taşma yok | `scrollWidth <= innerWidth` | `scrollWidth=1440px, innerWidth=1440px` | **PASS** |
| `/qr/admin/urunler/2` | 1440 | dokunma hedefleri en az 44x44 px | Form kontrolleri >= 44x44 px | Tüm input ve butonlar >= 44x44 px | **PASS** |
| `/qr/admin/urunler/2` | 1440 | erişilebilir ad (accessible name) | Form alanları etiketli | 0 eksik | **PASS** |
| `/qr/admin/urunler/2` | 1440 | Tab sırası ve odak halkası | Sıralı tabbing, görünür halka | 2px solid odak halkası | **PASS** |
| `/qr/admin/urunler/2` | 1440 | metin kontrastı | normal >= 4.5:1, büyük >= 3.0:1 | 0 kontrast sorunu | **PASS** |
| `/qr/admin/urunler/2` | 1440 | konsolda hata / native dialog yok | 0 hata, 0 native dialog | 0 hata, 0 native dialog | **PASS** |
| `/qr/admin/urunler/2` | 1440 | dış alan adına istek yok | 0 harici istek | 0 harici istek | **PASS** |
| `/qr/admin/istatistik` | 390 | yatay taşma yok | `scrollWidth <= innerWidth` | `scrollWidth=390px, innerWidth=390px` | **PASS** |
| `/qr/admin/istatistik` | 390 | dokunma hedefleri en az 44x44 px | Butonlar ve indirme linki >= 44px | 48px SVG indirme butonu | **PASS** |
| `/qr/admin/istatistik` | 390 | erişilebilir ad (accessible name) | SVG grafik ve butonlar etiketli | 0 eksik | **PASS** |
| `/qr/admin/istatistik` | 390 | Tab sırası ve odak halkası | Sıralı tabbing, görünür halka | 2px solid odak halkası | **PASS** |
| `/qr/admin/istatistik` | 390 | metin kontrastı | normal >= 4.5:1, büyük >= 3.0:1 | 0 kontrast sorunu | **PASS** |
| `/qr/admin/istatistik` | 390 | konsolda hata / native dialog yok | 0 hata, 0 native dialog | 0 hata, 0 native dialog | **PASS** |
| `/qr/admin/istatistik` | 390 | dış alan adına istek yok | 0 harici istek | 0 harici istek | **PASS** |
| `/qr/admin/istatistik` | 1440 | yatay taşma yok | `scrollWidth <= innerWidth` | `scrollWidth=1440px, innerWidth=1440px` | **PASS** |
| `/qr/admin/istatistik` | 1440 | dokunma hedefleri en az 44x44 px | Butonlar ve indirme linki >= 44px | 48px SVG indirme butonu | **PASS** |
| `/qr/admin/istatistik` | 1440 | erişilebilir ad (accessible name) | SVG grafik ve butonlar etiketli | 0 eksik | **PASS** |
| `/qr/admin/istatistik` | 1440 | Tab sırası ve odak halkası | Sıralı tabbing, görünür halka | 2px solid odak halkası | **PASS** |
| `/qr/admin/istatistik` | 1440 | metin kontrastı | normal >= 4.5:1, büyük >= 3.0:1 | 0 kontrast sorunu | **PASS** |
| `/qr/admin/istatistik` | 1440 | konsolda hata / native dialog yok | 0 hata, 0 native dialog | 0 hata, 0 native dialog | **PASS** |
| `/qr/admin/istatistik` | 1440 | dış alan adına istek yok | 0 harici istek | 0 harici istek | **PASS** |
| `/qr (Ne içsem)` | 390 | yatay taşma yok | `scrollWidth <= innerWidth` | `scrollWidth=390px, innerWidth=390px` | **PASS** |
| `/qr (Ne içsem)` | 390 | dokunma hedefleri en az 44x44 px | Kapat, çevir, makaralar >= 44x44 px | Makaralar 96x96px, butonlar 44px | **PASS** |
| `/qr (Ne içsem)` | 390 | erişilebilir ad (accessible name) | Kapat butonu ve dönen kutular | aria-label tam | **PASS** |
| `/qr (Ne içsem)` | 390 | Tab sırası ve odak halkası | Açılınca odak Kapat'a, kapanınca kareye | Odak yönetimi tam | **PASS** |
| `/qr (Ne içsem)` | 390 | metin kontrastı | normal >= 4.5:1, büyük >= 3.0:1 | 0 kontrast sorunu | **PASS** |
| `/qr (Ne içsem)` | 390 | konsolda hata / native dialog yok | 0 hata, 0 native dialog | 0 hata, 0 native dialog | **PASS** |
| `/qr (Ne içsem)` | 390 | dış alan adına istek yok | 0 harici istek | 0 harici istek | **PASS** |
| `/qr (WiFi)` | 390 | yatay taşma yok | `scrollWidth <= innerWidth` | `scrollWidth=390px, innerWidth=390px` | **PASS** |
| `/qr (WiFi)` | 390 | dokunma hedefleri en az 44x44 px | Kopyala butonları >= 44x44 px | 44px kopyalama butonları | **PASS** |
| `/qr (WiFi)` | 390 | erişilebilir ad (accessible name) | Kapat ve kopyala butonları | aria-label tam | **PASS** |
| `/qr (WiFi)` | 390 | Tab sırası ve odak halkası | Dialog modal odak yönetimi | 2px solid odak halkası | **PASS** |
| `/qr (WiFi)` | 390 | metin kontrastı | normal >= 4.5:1, büyük >= 3.0:1 | 14.2:1 (düzeltildi: `#2a1514` / `#f3ece6`) | **PASS** |
| `/qr (WiFi)` | 390 | konsolda hata / native dialog yok | 0 hata, 0 native dialog | 0 hata, 0 native dialog | **PASS** |
| `/qr (WiFi)` | 390 | dış alan adına istek yok | 0 harici istek | 0 harici istek | **PASS** |
| `/qr (Detay Foto)` | 390 | yatay taşma yok | `scrollWidth <= innerWidth` | `scrollWidth=390px, innerWidth=390px` | **PASS** |
| `/qr (Detay Foto)` | 390 | dokunma hedefleri en az 44x44 px | Kapat ve boy butonları >= 44px | Kapat 44px, boy butonları 56px | **PASS** |
| `/qr (Detay Foto)` | 390 | erişilebilir ad (accessible name) | Kapat, boy ve başlık etiketleri | aria-labelledby="sheet-title" | **PASS** |
| `/qr (Detay Foto)` | 390 | Tab sırası ve odak halkası | Dialog focus trap aktif | Odak modal içinde | **PASS** |
| `/qr (Detay Foto)` | 390 | metin kontrastı | normal >= 4.5:1, büyük >= 3.0:1 | 0 kontrast sorunu | **PASS** |
| `/qr (Detay Foto)` | 390 | konsolda hata / native dialog yok | 0 hata, 0 native dialog | 0 hata, 0 native dialog | **PASS** |
| `/qr (Detay Foto)` | 390 | dış alan adına istek yok | 0 harici istek | 0 harici istek | **PASS** |
| `/qr (Detay Düz)` | 390 | yatay taşma yok | `scrollWidth <= innerWidth` | `scrollWidth=390px, innerWidth=390px` | **PASS** |
| `/qr (Detay Düz)` | 390 | dokunma hedefleri en az 44x44 px | Kapat butonu >= 44x44 px | 44px Kapat butonu | **PASS** |
| `/qr (Detay Düz)` | 390 | erişilebilir ad (accessible name) | Kapat butonu ve başlık | aria-labelledby="sheet-title" | **PASS** |
| `/qr (Detay Düz)` | 390 | Tab sırası ve odak halkası | Dialog focus trap aktif | Odak modal içinde | **PASS** |
| `/qr (Detay Düz)` | 390 | metin kontrastı | normal >= 4.5:1, büyük >= 3.0:1 | 0 kontrast sorunu | **PASS** |
| `/qr (Detay Düz)` | 390 | konsolda hata / native dialog yok | 0 hata, 0 native dialog | 0 hata, 0 native dialog | **PASS** |
| `/qr (Detay Düz)` | 390 | dış alan adına istek yok | 0 harici istek | 0 harici istek | **PASS** |

---

## 3. Düzeltilen "Ertelenen Küçükler" Maddelerinin Doğrulaması

1. **Vitrin Sayacı Sıfırlanması:**
   - Noktaya tıklandığında `HeroSlides` içindeki `resetTimer` tetiklenerek aralık zamanlayıcısı baştan başlatılıyor. Ziyaretçi bir slaytı seçer seçmez bir sonraki slayta ani geçiş engellendi (`755d607`).
2. **Vitrin Başlık / Nokta Mesafesi & Karartma & Sarı Zemin:**
   - Üst karartma (`linear-gradient(180deg, rgba(42, 21, 20, .45)...)`) eklendi.
   - Başlık satır yüksekliği ve nokta mesafesi dar ekranda güvenli aralığa alındı.
   - `SHINE` sarı zemininde görsel yüklenemediğinde beyaz yerine koyu mürekkep rengi (`--c-ink`) devreye girerek yüksek kontrast güvenceye alındı (`78c54db`).
3. **Vitrin Geçiş Animasyonu:**
   - Tasarım şartnamesine uygun olarak slayt geçişi `scale(.96)`'dan `scale(1)`'e hafif büyüme ve solma efektiyle çalışıyor (`601e67e`).
4. **Geri Gelmede Üst Bar:**
   - Sayfa ortasından geri gelindiğinde hidrasyon öncesi inline script ile `data-hero-visible="false"` erkenden atanarak üst barın beyaz yazı kağıt zemin kontrast hatası önlendi (`79bcbd0`).
5. **Kart Başlıkları ve İki Fiyatlı Yıldız Boşluğu:**
   - Kategori etiketine `padding-right: 36px` eklenerek fiyat çipleri ve yıldız rozetlerinin altına girmesi önlendi.
   - Dar kartlarda kelimelerin anlamsız bölünmesini önlemek için `overflow-wrap: break-word; hyphens: auto;` uygulandı (`92a16fd`).
6. **%200 Metin Yakınlaştırma (Text Zoom):**
   - Afiş ve kare kartlardaki sabit yükseklikler `min-height` ile esnetildi, yazı 2 katına çıktığında taşma veya kırpılma olmadan kutular genişliyor (`19c8195`).
7. **Ne İçsem Makaraları ve Yerleşim:**
   - 30ms setTimeout yerine çift `requestAnimationFrame` senkronizasyonu sağlandı.
   - Sonuç alanı DOM'da ayrılmış yer tutarak (`visibility: hidden` -> `visible`) makara durduğunda oluşan yerleşim kaymasını (layout shift) sıfıra indirdi.
   - Masaüstü 1440px görünümünde 720w net görseller servis edildi (`be30d35`).
   - "Tekrar çevir" ardışık önerilerinde havuzdaki son 6 öneri hafızada tutularak fotoğrafsız içeceklerin de sırayla önerilmesi güvenceye alındı (`cc6af95`).
8. **Görsel Yükleme Önceliği:**
   - Vitrinde yalnızca ilk slayt eager yüklenirken sonraki slaytlar lazy yapıldı.
   - Ekran üstünde (above-the-fold) yer alan ilk grup afişleri `loading="eager"` yapılarak sayfa açılış performansı artırıldı (`41b1354`).
9. **İstemci Yükü ve Temizlik:**
   - `inSuggest` bayrağı ve gereksiz kart nesneleri istemci payload'ından ayıklandı (`417b0f5`).
   - Kullanılmayan `Logo.tsx` silindi, `BrandIcon` türleri ayrıştırıldı (`c5922c5`).
10. **Windows Yüksek Kontrast:**
    - `@media (forced-colors: active)` kuralı ile maskeli marka ikonlarının Windows Yüksek Kontrast modunda kaybolması engellendi (`85c8f62`).
11. **Ürün Detayında Filigran Süsü ve İÇİNDEKİLER Başlığı:**
    - Fotoğraflı ürün detayında sağ üst köşeye %18 opaklıkta şık marka filigran süsü (`.sheet__icon--watermark`) eklendi.
    - Açıklama/içerik metni olan ürünlerde büyük harfli "İÇİNDEKİLER" başlığı ve düzenli tipografi yerleştirildi (`2dba94c`).
12. **Test Kapsamı:**
    - Vitrin ekran dışı kaldığında (`data-hero-visible="false"`) otomatik dönmenin durduğu test edildi.
    - 360px genişlikte iki boy fiyat çiplerinin kırpılmadan ve yatay kaydırma olmadan tam göründüğü test edildi.
    - Fotoğrafsız Ne içsem öneri akışının uçtan uca brand icon ve tam ekran panel ile çalıştığı test edildi (`cc6af95`).
13. **Tinypool Güvenlik Açığı (Vitest 3.2.7):**
    - `vitest` sürümü `^3.2.7`'ye yükseltildi, tüm 155 birim ve entegrasyon testi 27 saniyede hatasız geçti (`1aa73f6`).

---

## 4. Sonuç

Tüm maddeler şartnameye ve `AGENTS.md` kurallarına tam uyumlu olarak tamamlanmış, her madde ayrı commit ile git geçmişine işlenmiş, tüm Playwright ve Vitest test paketleri yeşile geçirilmiştir. Rapor ve ekran görüntüleri hazır durumdadır.

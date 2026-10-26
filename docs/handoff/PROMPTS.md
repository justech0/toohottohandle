# Devir promptları — hangi model, hangi iş

Her prompt olduğu gibi kopyalanır. Hepsi önce `AGENTS.md`'yi okutuyor; kurallar orada.

## İş bölümü

| Model | Nerede | Ne yapar | Ne yapmaz |
|---|---|---|---|
| **Codex** (GPT-6.1 Sol, Superpowers açık) | Enes'in Windows terminali | Kod, test, migration, PR açma. Komutları kendisi çalıştırır. | Görsel onay vermez, tarayıcıda "güzel görünüyor" demez. `main`e merge etmez. |
| **Gemini 3.1 Pro** (Antigravity, `browser_subagent`) | Antigravity tarayıcısı | Her dilimden sonra tarayıcı + DOM incelemesi, mobil görünüm, erişilebilirlik, görsel kusur listesi. | Kod yazmaz (yalnızca rapor). Flash kullanılmaz. |
| **Claude** | claude.ai / Claude Code | PR incelemesi (taze göz), takılınca sorun çözme, sonraki promptları güncelleme. | Uzun uygulama işi (limit). |

**Döngü (her dilim):** Codex uygular ve PR açar → Gemini PR dalını tarayıcıda inceler, rapor yazar → raporu Codex'e verirsin, düzeltir → Claude PR'ı inceler → Enes merge eder → Hostinger kendiliğinden yayınlar.

## Bir kez: yerel test veritabanı (Windows + Laragon MySQL, port 3306)

Laragon'da iki boş veritabanı aç: `thth_test`, `thth_dev`. Codex'i açtığın **aynı PowerShell penceresinde** önce şunları yaz (şifreyi sohbete ya da prompta yazma):

```powershell
$env:TEST_DATABASE_URL = "mysql://root:SIFREN@127.0.0.1:3306/thth_test"
$env:DEV_DATABASE_URL  = "mysql://root:SIFREN@127.0.0.1:3306/thth_dev"
codex
```

---

## 1 · Codex — Dilim 3b: tükendi, görünür, ekle/çoğalt/sil, sıralama

```
Repo: justech0/toohottohandle. Önce AGENTS.md, docs/PROJECT_STATE.md ve
docs/superpowers/specs/2026-10-25-thth-qr-menu-design.md bölüm 4.2 ve 4.4'ü oku.
PR #5 (a2-3-products) merge edildiyse main'den, edilmediyse a2-3-products'tan
a2-3b-products dalını aç.

Yapılacak (spec 4.2):
1. Tükendi: ürün listesinde her satırda "Tükendi" düğmesi. Seçenekler hedef saati açıkça yazar
   (Europe/Istanbul, açılış saati settings.opening_time):
   - açılıştan sonra: "Yarın 08:00'e kadar", "Ben açana kadar"
   - gece yarısından açılışa kadar: "Bugün 08:00'e kadar", "Yarın 08:00'e kadar", "Ben açana kadar"
   - tükendiyse: "Tekrar satışta".
   "Ben açana kadar" = 2099-12-31. Saf fonksiyon lib/admin/soldOut.ts: soldOutOptions(now, openingTime);
   00:20, 07:50, 08:00, 23:59 ve yaz/kış saati olmayan Türkiye için birim test yaz.
2. Listede "Görünür" anahtarı (tek dokunuş).
3. Ürün ekle, çoğalt ("Kopya" eki, aynı fotoğraf anahtarı), sil.
   Silme çift onay ("Cortado silinsin mi?") ve silmeden önce menü kopyası:
   migration 004_snapshots ile menu_snapshots tablosu (spec 5.4), son 25 tutulur.
4. Sıralama: kategori içinde yukarı/aşağı düğmeleri (sürükle-bırak şart değil; erişilebilir olsun).
5. Her işlem audit_log'a tek satır; undoLast bu işlemleri de geri alabilsin
   (tükendi, görünür, ekle, çoğalt, sil, sıralama). Sil geri alınınca ürün boylarıyla döner.
6. Her Server Action: requireAdmin() + updateTag('menu'). Hata mesajları Türkçe, role="alert".
   Onaylar native confirm() DEĞİL, sayfa içi <dialog> (Gemini DOM'da görebilsin).
7. Test önce: lib/admin birim + MariaDB/MySQL entegrasyon (tests/unit/*.integration.test.ts kalıbı),
   tests/e2e/admin-products.spec.ts'e akış ekle. Kararlı seçiciler: data-testid="product-<işlem>-<id>".

Bitti tanımı: npx vitest run (TEST_DATABASE_URL ile) yeşil, npx tsc --noEmit yeşil, npm run build yeşil,
AGENTS.md'deki veritabanlı tam e2e suite yeşil. PR aç, gövdeye test sayılarını yaz.
docs/PROJECT_STATE.md'yi güncelle. main'e merge etme. Şifre ya da DATABASE_URL değerini hiçbir yere yazma.
```

## 2 · Gemini — her dilimden sonra tarayıcı incelemesi (dilim adını değiştir)

```
Repo: justech0/toohottohandle, dal: <PR DALI>. AGENTS.md'yi oku. Kod yazma; yalnızca rapor üret.
Sunucuyu AGENTS.md'deki "Veritabanlı test" komutuyla thth_dev üzerinde aç (boş veritabanı).
Kurulum kodunu sunucu kaydından al, /qr/admin/kurulum'da test hesabı aç
(e-posta admin@test.kafe, şifreyi kendin üret, rapora yazma).

browser_subagent ile 390x844 ve 1440x900'de şu sayfaları incele:
/qr, /qr/admin, /qr/admin/urunler, bir ürünün düzenleme sayfası ve bu dilimde eklenen her ekran.
Her sayfada ölç ve tabloya yaz (URL, genişlik, kontrol, beklenen, gerçek, PASS/FAIL):
- yatay taşma yok: document.documentElement.scrollWidth <= innerWidth
- dokunma hedefleri en az 44x44 px
- her input/düğme/dialog'un erişilebilir adı var
- Tab sırası okuma sırasıyla aynı, odak halkası görünür
- metin kontrastı >= 4.5:1, büyük metin ve kenarlık >= 3:1
- konsolda uygulama hatası yok; native alert/confirm/prompt yok
- dış alan adına istek yok (performance.getEntriesByType('resource'))
Sonra bu dilimin akışlarını elle dene (ör. fiyat değiştir → onay → menüde gör → geri al)
ve admin'de yaptığın değişikliğin /qr'de hemen göründüğünü doğrula.
Çıktı: docs/reviews/<dilim>-tarayici.md (tablo + her FAIL için ekran görüntüsü yolu + önerilen düzeltme).
Görmediğin bir kontrolü PASS yazma; UNVERIFIED yaz.
```

## 3 · Codex — Dilim 4: kategoriler, gruplar, ekstralar, etiketler, ayarlar

```
AGENTS.md'yi oku. Spec 4.5 ve 4.4 (WiFi maskeleme). main'den a2-4-catalog dalı.
- Kategoriler: ad, grup, sıra, görünür, Ne içsem varsayılanı, varsayılan sıcak/soğuk. İçinde ürün varsa silinemez.
- Gruplar: ad, renk (yalnızca red/yellow/pink/blue/green/gray). İçinde kategori varsa silinemez.
- Ekstralar: ad, fiyat, hangi kategorilerde.
- Etiketler: hazır liste + ekleme (renk yok). product_tags tablosu, ürün formunda etiket seçimi.
- Ayarlar: WiFi (ağ adı, kullanıcı adı, şifre, yönerge), açılış saati, alt bilgi notu, istatistik açık/kapalı.
  WiFi şifresi audit_log'a "[değiştirildi]" diye yazılır, eski/yeni değer asla.
  Seed test WiFi'ı (HOT | WIFI / test / test1234) duruyorsa admin ana sayfasında "WiFi test bilgisi kullanılıyor" uyarısı.
- Hepsi geçmişe yazılır ve son işlem geri alınabilir. Menü verisi (lib/menu/fromRows.ts) yeni alanları okur.
Test önce (birim + entegrasyon + e2e). Bitti tanımı ve PR kuralları 3b ile aynı.
```

## 4 · Codex — Dilim 5: fotoğraf yükleme

```
AGENTS.md'yi oku. Spec 4.6, 5.5 (dosya güvenliği). main'den a2-5-photos dalı.
- Tarayıcıda küçültme: uzun kenar 1600 px, <= 1,5 MB, önce WebP; blob.type !== "image/webp" ise JPEG 0,82.
  Okunamazsa: "Bu fotoğraf açılamadı. Fotoğrafı galeriden JPEG olarak kaydedip tekrar dene."
- Route Handler POST /qr/api/admin/upload (requireAdmin): türü içerikten doğrula (JPEG/PNG/WebP),
  sharp ile 320/720/1280 WebP (1280 <= 400 KB), EXIF verisini sil, anahtar = 1280 dosyasının SHA-256'sı.
  sharp.concurrency(1), sharp.cache(false). Dosyalar THTH_UPLOAD_DIR altına. storage_objects tablosu (migration).
- GET /qr/foto/<anahtar>-<genişlik>.webp: diskten, Cache-Control: public, max-age=31536000, immutable.
  lib/menu/image.ts: anahtar "urun-"/"ornek-" ile başlıyorsa /qr/img (public), değilse /qr/foto.
- Odak noktası: önizlemede parmakla seçilir, image_focus_x/y kaydedilir, CSS object-position ile uygulanır.
- Kaydetme (anahtarı ürüne bağlama) Server Action'dır (updateTag). Değiştir/sil. Kullanılmayan dosya
  orphaned_at alır; admin girişinde 30 günden eski yetimler silinir; son 25 kopyada kullanılan dosya silinmez.
- Grup ve kategori afişi fotoğrafı da buradan seçilebilsin (şu an public/qr/groups sabit).
Test: JPEG fixture ile e2e yükleme; birim: anahtar, temizlik kuralı. sharp sürümünü >= 2 haftalık seç.
```

## 5 · Codex — Dilim 6: toplu fiyat + kopyalar

```
AGENTS.md'yi oku. Spec 4.3, 4.4, 4.9 (kopyalar kısmı). main'den a2-6-bulk dalı.
- Kategori ya da grup seç, yüzde ya da sabit tutar, yuvarlama: yok / en yakın 5 ₺ / en yakın 10 ₺.
  Önce önizleme tablosu (ürün, eski, yeni), "Uygula" tek işlem. Saf fonksiyon + birim test (yuvarlama, iki boylu ürün).
- Geçmişe tek satır (entity bulk_price, bütün ürünlerin eski/yeni fiyatı); son işlemse tek adımda geri alınır.
- Toplu fiyattan önce menu_snapshots kopyası. Admin'de "Kopyalar" ekranı: son 25, tarih + neden,
  "Bu kopyaya dön" (önce mevcut menünün kopyası alınır, WiFi bilgileri korunur).
```

## 6 · Codex — Dilim 7: ZIP yedek ve geri yükleme

```
AGENTS.md'yi oku. Spec 4.9'un tamamı. main'den a2-7-backup dalı.
ZIP tarayıcıda, STORE modunda, bellekte üretilir (fflate gibi küçük bir kütüphane, >= 2 haftalık sürüm).
Fotoğraflar /qr/api/admin/image/[key] üzerinden tek tek (admin oturumu). İlerleme "48 / 129 fotoğraf" + İptal.
Geri yüklemede sıra spec'teki gibi: doğrula → onay → fotoğrafları yükle (biri bile başarısızsa dur) →
Server Action ile tek işlemde menüyü değiştir (önce kopya; kopya alınamazsa başlama). WiFi korunur.
last_backup_at ve admin ana sayfasında "Son yedek: N gün önce" (30 günü geçerse kırmızı).
```

## 7 · Codex — Dilim 8: istatistik + QR

```
AGENTS.md'yi oku. Spec 4.7, 4.8. main'den a2-8-stats-qr dalı.
- /qr/api/stats: sayaçlar bellekte birikir, 20 dk ya da 500 sayaçta bir tek sorguyla yazılır.
  Bilinmeyen ürün atılır, istek başına ürün başına en fazla 1. stats kapalıysa 204.
  İstemci: menü açılışı oturumda bir kez, detaylar biriktirilir, sendBeacon ile sayfa gizlenince.
  Çerez ve kişisel veri yok.
- Admin: bugün / 7 gün / 30 gün açılış, en çok açılan 10 ürün, saatlere göre açılış grafiği.
- QR: admin'den logolu SVG indir, hata düzeltme H, 4 modül kenar, altında kısa adres. QR kütüphanesi >= 2 haftalık.
```

## 8 · Codex — Ertelenen küçükler

```
AGENTS.md'yi oku. docs/superpowers/plans/2026-10-26-v1-review-todo.md "Ertelenen küçükler" listesini
tek tek düzelt (her madde ayrı commit, mümkünse önce test). Vitest'i 3.2.7'ye yükselt (tinypool açığı).
Dal: a2-minors. Görsel değişiklikler sonrası Gemini incelemesi (prompt 2) zorunlu.
```

## 9 · Codex — EN + AR

```
AGENTS.md'yi oku. Spec 3.9 (dil) ve 3.10. Dal: i18n-en-ar.
Menüde TR/EN/AR seçimi (bayrak değil, dil kodu ya da adıyla; seçim localStorage'da, try/catch).
AR'de dir="rtl", Readex Pro yalnızca AR seçilince yüklenir. Arayüz sözlüğü lib/i18n/.
Ürün/kategori/grup/ekstra/ayar adlarının EN/AR alanları admin formlarına eklenir (boşsa TR gösterilir).
Otomatik çeviri yok. e2e: dil değişimi, AR'de RTL, aramada Arapça ad.
```

## 10 · Codex + Gemini — 3D

```
AGENTS.md'yi oku. Spec 5.3'ün tamamı. Dal: a3-3d.
Three.js yalnızca gereken modüller, sahne + kütüphane <= 180 KB gzip. Logo ve ikon kabartması resmi
PNG'lerden değil, resmi SVG'den yapılmalı: SVG yoksa DUR ve Enes'ten resmi SVG iste, çizme.
Yükleme koşulları, 45 ms kare süresi koruması, SVG'ye düşüş, görünmezken çizimi durdurma spec'teki gibi.
Bitince Gemini (prompt 2) gerçek telefon görünümünde akıcılığı ve düşüşü raporlasın.
```

## 12 · Codex — Geri bildirim (yalnızca admin görür) · dilim 5'ten (fotoğraf) sonra

HVK'daki geri bildirimin THTH uyarlaması. Yorumlar menüde **hiç görünmez**, yalnızca admin'de okunur.

```
AGENTS.md'yi oku. main'den a2-feedback dalı. Kaynak fikir: HVK projesindeki geri bildirim
(menüde form, admin'de liste); kod kopyalanmaz, bu repodaki kalıplarla yeniden yazılır.

Menü (/qr):
- Menünün sonunda, alt bilginin üstünde marka afişi gibi bir kart: "Nasıldı? Bize yaz" (resmi tavşan ikonu,
  BrandIcon). Dokununca ürün detayı gibi alttan açılan sayfa; geri tuşu davranışı lib/ui/historySheet ile aynı.
- Alanlar: konu (Lezzet ve kalite / Hizmet hızı / Personel / Hijyen / Diğer, zorunlu), puan 1-5 (yıldız ikonuyla,
  erişilebilir radio grubu, zorunlu), mesaj (zorunlu, en fazla 1000 karakter), adın (isteğe bağlı, boşsa "Misafir"),
  iletişim (isteğe bağlı, telefon ya da e-posta; altında "Yalnızca sana dönüş yapmak için kullanılır."),
  fotoğraf (isteğe bağlı, tek; dilim 5'teki tarayıcıda küçültme ve sunucu doğrulaması aynen).
- Gönderince: "Teşekkürler, ekibimize ulaştı." Hata metinleri Türkçe, role="alert". Form hata sonrası yazılanı korur.
- Kötüye kullanım: gizli tuzak alan (honeypot), IP başına saatte en fazla 5 gönderim (bellekte, lib/auth/clientIp),
  aynı mesaj 10 dk içinde ikinci kez kabul edilmez. Reddedilen isteğe nedenini söyleme, kısa genel mesaj ver.
- Gönderim Server Action ile (requireAdmin YOK, ama girdi zod-benzeri elle doğrulanır). updateTag gerekmez.

Veri: migration 00X_feedback → feedbacks (id, created_at, topic ENUM, rating TINYINT CHECK 1-5, message TEXT,
name VARCHAR(80) NULL, contact VARCHAR(120) NULL, image_key VARCHAR(96) NULL, is_read TINYINT DEFAULT 0, lang CHAR(2)).
IP saklanmaz. Fotoğraf THTH_UPLOAD_DIR/feedback altında; yalnızca admin oturumuyla verilir
(GET /qr/api/admin/feedback-image/[key], requireAdmin), menüdeki /qr/foto yolundan ERİŞİLEMEZ.

Admin:
- /qr/admin/geri-bildirim: en yeni üstte kartlar (tarih Europe/Istanbul, yıldız, konu, ad, iletişim, mesaj, fotoğraf
  küçük resmi → tıklayınca büyük). Filtre: konu, puan, okunmamış. Okundu işaretle. Sil (sayfa içi <dialog> ile onay,
  native confirm yok; fotoğraf dosyası da silinir). Sayfalama 30'ar.
- Admin ana sayfası: "Geri bildirim" kartı: okunmamış sayısı + son 3 mesajın ilk satırı + ortalama puan (son 30 gün).
- Geri bildirimler audit_log/undo dışında (menü verisi değil); silme kalıcıdır, onay metni bunu söyler.
- Yedek ZIP'e (dilim 7) girmez.

Test önce: birim (doğrulama, oran sınırı, honeypot), entegrasyon (kayıt, filtre, okundu, sil + dosya),
e2e (menüden gönder → admin'de gör → okundu → sil; geri tuşu sayfayı kapatır; 390px'te taşma yok).
Sonra Gemini incelemesi (prompt 2) bu ekranlar için. Bitti tanımı ve PR kuralları 3b ile aynı.
```

## 11 · Claude — PR incelemesi (her PR'da)

```
justech0/toohottohandle PR #<N>'yi incele. AGENTS.md ve ilgili spec bölümüne göre:
güvenlik (requireAdmin, gizli bilgi, maliyet verisi), geri alma doğruluğu, önbellek (updateTag),
cacheComponents tuzakları, test kapsamı. Bulguları önem sırasıyla yaz; kritik/önemli olanlar için
Codex'e verilecek düzeltme promptunu da yaz.
```

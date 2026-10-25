# Too Hot To Handle — QR Menü Tasarım Belgesi (Spec)

- Tarih: 2026-10-25
- Adres: `toohottohandlecoffee.com/qr` (menü), `toohottohandlecoffee.com/qr/admin` (admin)
- Şube: yalnızca Batman (Petrol City AVM)
- Proje yürütücüsü: Enes
- Durum: Onay bekliyor

## 1. Amaç ve başarı ölçütü

Masadaki QR okutulunca açılan, markaya sadık, sıra dışı ama hızlı bir menü. Kafe menüyü kod bilmeden admin panelinden yönetir.

Başarı ölçütleri:
1. Menü mobil veride 2,5 sn içinde görünür. Giriş animasyonu bunu geciktirmez.
2. Misafir bir ürünü en fazla iki dokunuşla bulur (kategori ya da arama, sonra kart).
3. WiFi kullanıcı adı ve şifresi tek dokunuşla ayrı ayrı kopyalanır.
4. Kafe ürün, fiyat, fotoğraf, kategori, etiket ve WiFi bilgisini admin'den değiştirir. Değişiklik menüde hemen görünür.
5. Menü TR, EN ve AR dillerinde okunur. Arapça sağdan sola akar.
6. Repo gizlidir. Repoda şifre ve anahtar yoktur.

## 2. Marka varlıkları (kaynak: `Desktop/toohot/hot`, `Desktop/toohot/hottir`)

### 2.1 Renkler (`toohottohandle-renkler.pdf`, Pantone Solid Coated)

| Rol | Pantone | Hex (PDF'ten örneklendi) |
|---|---|---|
| Ana kırmızı | 485 C | `#DC2524` |
| Sarı | 100 C | `#F0EE40` |
| Pembe | 2051 C | `#DDBBD1` |
| Mavi | 3506 C | `#335DB2` |
| Yeşil | 6144 C | `#35A97C` |
| Gri / zemin | Cool Gray 1 C | `#DBDAD4` |

Krem zemin (`#F3ECE6`) canlı yakında sayfasıyla aynı kalır. Kodda rastgele hex yoktur, yalnızca bu token'lar kullanılır. Kategori renkleri bu altı renkten seçilir.

### 2.2 Fontlar (kafenin lisansı var)

- **BORELA** (`BORELA-BF6512c82e7fbc5.otf`): ürün adları, kategori başlıkları, etiketler. Fontta İ, ı, Ş, ş, Ğ, ğ ve ₺ yoktur. Bu glifler mevcut harflerden (I + nokta, S + çengel, G + breve) fontTools ile eklenir; sonuç görsel olarak kontrol edilir.
- **Gotham Rounded** (Book, Medium, Bold): açıklamalar, arayüz yazıları, "coffee roasting co.".
- **Arapça**: Arapça destekli ayrı bir font (ör. IBM Plex Sans Arabic, OFL) yalnızca AR modunda yüklenir.
- Fontlar siteye gömülür (self-hosted), WOFF2'ye çevrilip alt kümelere ayrılır.

### 2.3 Logo ve ikonlar

- Logo kilitleri: `toohottohandle-logolar.pdf` / `.ai` / `-logolar-1.png` (tek satır, iki satır, HOT, HOT + coffee roasting co.). Canlı sitede kullanılan SVG çizimleri (IoU ≥ %99) korunur.
- Resmi ikonlar: `toohottohandle-iconlar-1.png` (2973 px) ve `.ai`: dudak, tavşan, 12 köşeli yıldız, üçlü slot kutusu. Tavşan bu resmi ikondan alınır, yeniden çizilmez.
- Kural: logo ve ikonlar yeniden çizilmez, AI ile değiştirilmez. SVG çıktısı kaynakla üst üste konup ölçülür (IoU ≥ %99).

## 3. Deneyim akışı

### 3.1 Giriş (≈1,5 sn, yalnızca oturumdaki ilk açılışta)

1. Krem zemin. Ortada resmi slot kutusu: dudak, tavşan, yıldız.
2. Dudak ve yıldız yanlara kayıp kaybolur. Tavşan büyür.
3. Tavşanın gözünde kırmızı nokta yanar, kamera göze dalar, ekran kırmızıya döner.
4. Kırmızının içinden yakında sayfasındaki dalga yükselir; üst yarı krem kalır.
5. TOO HOT / TO HANDLE logosu oturur, menü altından başlar.

- 3D sürüm: slot kutusu ve tavşan Three.js ile parlak kırmızı kabartma (markanın 3D HOT afişi gibi).
- İlk kare düz SVG olarak anında görünür. Three.js 0,6 sn içinde hazırsa 3D sahne oynar, değilse aynı sahnenin SVG sürümü oynar.
- "Geç" düğmesi ve ekrana dokunma girişi atlar. `prefers-reduced-motion`: kısa kararma geçişi.
- Menü verisi giriş sırasında arkada hazırdır. Ses yoktur.

### 3.2 Menü ekranı

- **Üst**: krem şerit, dalga ve TOO HOT / TO HANDLE logosu. Kaydırınca logo küçülür, sabit ince bara dönüşür. Sağ üstte dil (TR / EN / AR) ve WiFi ikonları.
- **Öne çıkan bandı**: admin'de "öne çıkan" işaretli ürünler logonun altında yatay kayan büyük kartlarda.
- **Kategori şeridi** (yapışkan): her kategori kendi Pantone rengini taşır, seçili olan o renkle dolar. Kategoriye geçerken dalga o rengin içinden geçer.
- **Kategori başlıkları**: BORELA, 3D afişteki gibi hafif parlak kabartma görünümü (CSS/SVG).
- **Ürün kartları**: iki sütun, büyük fotoğraf, BORELA ad, tek satır açıklama, fiyat, küçük alerjen simgeleri, etiketler, varsa "YENİ" rozeti.
- **Arama**: üstte büyüteç; yazdıkça ad, açıklama ve içindekilerde süzer (üç dilde).
- **"Ne içsem?"**: liste sonunda ve üst barda slot ikonu. Basınca dudak, tavşan, yıldız 3D makaraları döner (Three.js yoksa SVG), durunca rastgele bir içecek önerir ve kartını açar.

### 3.3 Ürün detayı

- Karta dokununca kart büyüyerek tam boy sayfaya dönüşür (alttan kayar).
- Büyük fotoğraf; ürünün videosu varsa sessiz döngü.
- Ad (BORELA), açıklama, fiyat, varsa boy seçenekleri (her boy ayrı fiyat).
- İçindekiler virgüllerle düz cümle olarak, büyük harf, marka afişlerindeki gibi.
- Alerjenler yalnızca simge; dokununca adı küçük yazıyla görünür, ekran okuyucu adı okur. Kalori sade sayı.
- Kapatma: aşağı kaydırma, × düğmesi, telefonun geri tuşu (yalnızca detayı kapatır; history API).

### 3.4 WiFi kartı

- Sağ üst ikondan aşağı doğru açılır (alttan değil).
- Ağ adı (ör. **HOT | WIFI**), kullanıcı adı ve şifre. Kullanıcı adı ve şifrenin her birinin yanında ayrı "Kopyala" düğmesi; basınca bir an "Kopyalandı".
- Yönerge: "HOT | WIFI ağına bağlanın, açılan ekrana kullanıcı adı ve şifreyi girin." (üç dilde).
- Kart dışına dokununca kapanır. Bilgiler admin'den değişir.

### 3.5 Etiket, rozet ve süs dili

- **Etiketler**: hap şeklinde, Pantone renklerinde, kafenin çıkartmaları gibi ince beyaz konturlu, BORELA yazılı (ör. VEGAN, ŞEKERSİZ, YULAF SÜTÜ, SICAK, SOĞUK).
- **"YENİ" rozeti**: resmi 12 köşeli yıldızın içinde "YENİ / NEW / جديد", hafif döner ve parlar.
- **Süsler**: yalnızca resmi yıldız ve dudak ikonları.
- **Emoji yoktur.** Uydurma parıltı, konfeti, gradyan yoktur.
- **Alerjen simgeleri**: süt, gluten, fıstık, yumurta, soya, susam; resmi ikonlar gibi düz, dolu, beyaz siluet olarak çizilir. Hazır ikon paketi kullanılmaz.

### 3.6 Dil

- TR (varsayılan), EN, AR. Seçim tarayıcıda hatırlanır.
- AR modunda `dir="rtl"`, düzen aynalanır, Arapça font yüklenir.
- Ürün adları marka dili olduğu için çevrilmez (admin isterse dil başına ad girebilir). Açıklama, içindekiler, kategori ve arayüz metinleri üç dilde.
- Çeviriler elle girilir. Otomatik çeviri servisi kullanılmaz.

## 4. Admin paneli (`/qr/admin`)

- Telefonda da rahat kullanılacak tasarım.
- **Giriş**: e-posta + şifre. Yanlış denemelerde geçici kilit.
- **Ürünler**: ekle, düzenle, sil, sürükleyerek sırala. Alanlar: ad, açıklama (TR/EN/AR sekmeleri), fiyat veya boy-fiyat listesi, kategori, fotoğraf, isteğe bağlı kısa video, içindekiler (3 dil), alerjenler, kalori, etiketler, "Yeni", "Öne çıkan", "Görünür" anahtarları.
- **Kategoriler**: ad (3 dil), renk (yalnızca 6 Pantone renginden), sıralama.
- **Etiketler**: hazır liste + yeni ekleme; renk Pantone'dan.
- **WiFi**: ağ adı, kullanıcı adı, şifre.
- **İstatistik**: bugün / hafta / ay menü açılışı, en çok bakılan 10 ürün, saatlere göre yoğunluk. Çerez ve kişisel veri yok; yalnızca sayaçlar.
- **Kullanıcı**: tek admin (Enes). İkinci hesap ileride eklenebilir.

## 5. Teknik mimari

### 5.1 Repo ve klasör düzeni

- Repo: `justech0/toohottohandle`, **gizli** (lisanslı fontlar ve admin kodu nedeniyle).
- Yakında sayfası `yakinda/` klasörüne taşınır; `/` adresi bu sayfayı göstermeye devam eder. Asıl site gelince tek adımda kaldırılır.
- QR menü ve admin aynı repoda, Next.js uygulaması olarak.

```
AGENTS.md                tüm AI'ların kalıcı kuralları
docs/PROJECT_STATE.md    şu anki durum, sıradaki işler, engeller
docs/DECISIONS.md        kararlar ve nedenleri
docs/DESIGN_SYSTEM.md    renk, font, hareket token'ları
docs/superpowers/specs/  tasarım belgeleri
docs/superpowers/plans/  uygulama planları
yakinda/                 canlı yakında sayfası (değişmeden)
app/qr/                  menü
app/qr/admin/            admin
public/                  fontlar, logo ve ikon SVG'leri
```

### 5.2 Teknoloji

- **Next.js (App Router) + TypeScript**, Vercel'de. Menü sayfası sunucuda önceden üretilir; admin kaydında yeniden üretilir (on-demand revalidation).
- **Veritabanı**: Vercel Marketplace Postgres (Neon), ücretsiz katman. Sorgular parametreli.
- **Dosyalar**: Vercel Blob. Yüklemede otomatik küçültme ve WebP dönüşümü; video için boyut sınırı.
- **3D**: Three.js, yalnızca giriş ve "Ne içsem?" için; dinamik import ile ilk boyamadan sonra yüklenir. Logo/ikon SVG'leri `SVGLoader` + `ExtrudeGeometry` ile kabartılır; kırmızı parlak malzeme.
- **Hareket**: dalga ve geçişler CSS/SVG; ağır kütüphane yok.
- **Yayın**: Vercel MCP veya GitHub → Vercel otomatik yayın.

### 5.3 Veri modeli

`categories`: `id`, `slug`, `name_tr`, `name_en`, `name_ar`, `color` (enum: red, yellow, pink, blue, green, gray), `sort_order`, `is_visible`

`products`: `id`, `slug`, `category_id`, `name`, `name_en`, `name_ar` (boşsa `name`), `desc_tr`, `desc_en`, `desc_ar`, `ingredients_tr`, `ingredients_en`, `ingredients_ar`, `price` (kuruş, tek fiyat) veya `sizes` (JSON: `[{label_tr, label_en, label_ar, price}]`), `kcal`, `allergens` (dizi: milk, gluten, nuts, egg, soy, sesame), `image_url`, `video_url`, `is_new`, `is_featured`, `is_visible`, `sort_order`, `updated_at`

`tags`: `id`, `label_tr`, `label_en`, `label_ar`, `color`; `product_tags`: `product_id`, `tag_id`

`settings`: `wifi_ssid`, `wifi_username`, `wifi_password` (tek satır)

`stats_daily`: `date`, `menu_opens`; `stats_hourly`: `date`, `hour`, `opens`; `stats_product`: `date`, `product_id`, `views`

`admins`: `id`, `email`, `password_hash` (argon2id), `created_at`, `last_login_at`; `sessions`: `id` (rastgele 32 bayt), `admin_id`, `expires_at`; `login_attempts`: `ip_hash`, `attempted_at`

### 5.4 Hata yönetimi

- Three.js başlamazsa SVG giriş/slot oynar.
- Veritabanı erişilemezse menü son başarılı önceden üretilmiş sayfadan sunulur.
- Fotoğraf yüklenemezse kategori renginde, üstünde resmi ikon olan kart görünür.
- Admin kaydı başarısızsa form verisi kaybolmaz, hata metni ne olduğunu ve ne yapılacağını söyler.

### 5.5 Güvenlik

- argon2id şifre hash'i; HttpOnly + Secure + SameSite=Strict oturum çerezi; admin işlemlerinde CSRF koruması.
- Giriş deneme sınırı (`login_attempts`).
- Yükleme: tür içerikten doğrulanır, boyut sınırı, rastgele dosya adı.
- Güvenlik başlıkları: CSP, X-Content-Type-Options, Referrer-Policy, frame-ancestors.
- Anahtarlar yalnızca Vercel ortam değişkenlerinde; repoda `.env.example`.
- Şifre ve anahtarlar sohbete veya AI'a yazılmaz.

### 5.6 Performans bütçesi

- Menü LCP ≤ 2,5 sn (mobil 4G), CLS ≤ 0,1, INP ≤ 200 ms.
- İlk yüklemede JS ≤ 100 KB gzip (3D hariç). Three.js + sahne ≤ 200 KB gzip, sonradan yüklenir.
- Zayıf cihazda 3D piksel oranı düşer, gölge yok.
- Görseller WebP/AVIF, `srcset` ile.

## 6. Göstermelik (demo) içerik

Kafeden gerçek liste gelene kadar menü, marka görsellerinden okunan ürünlerle doldurulur. Admin'de ve kodda bu içerik "demo" olarak işaretlenir. Fiyatlar örnek değerdir ve gerçek menü girilince silinir.

- **İçecek**: Citrus Berry Cloud, Month Blanc, Ube Vanilya Matcha Latte, Matcha Latte, Ube Latte, Americano.
- **Sandviç**: Ton Balıklı, Hindi Füme, Morning Sando, Italy Sando.
- **Ekmek üstü**: `THTH-EKMEKUSTU-PHOTO` görsellerinden (adlar görsellerden okunur; okunamazsa "Ekmek Üstü 1–5").
- **Fırın**: Yaban Mersinli Biscoff Tart, Scroll (Biscoff, yaban mersini, antep fıstığı, çilek), Tarçınlı Rulo.
- **WiFi**: ağ adı `HOT | WIFI`, kullanıcı adı ve şifre örnek değerler.
- İçerik metinleri görsellerdeki yazılardan alınır; okunamayan kısımlar uydurulmaz, kısa ve genel bırakılır.

## 7. AI iş bölümü ve aşamalar

| Aşama | İş | Sahip | Bitti tanımı |
|---|---|---|---|
| A0 | Gizli repo, `yakinda/` taşıma, Next.js iskeleti, fontlar (BORELA Türkçe glifleri), logo/ikon SVG'leri | Claude | `/` yakında sayfası aynen çalışır, build geçer, SVG IoU ≥ %99 |
| A1 | Menü ekranı, ürün detayı, WiFi kartı, arama, 3 dil + RTL | Claude | 390/768/1440'ta ekran görüntüsü kontrolü, demo içerikle |
| A2 | 3D giriş ve 3D "Ne içsem?" + SVG yedekleri | Claude | Bütçe içinde, reduced-motion ve yedek çalışır |
| A3 | Veritabanı, admin, yükleme, istatistik | Codex (yönergeyi Claude yazar, diff'i Claude inceler) | Testler geçer |
| A4 | Alerjen simgeleri, etiket ve rozet seti | Claude | Simgeler resmi ikon diliyle tutarlı |
| A5 | QA: telefon, hız, erişilebilirlik, güvenlik, metin | Antigravity Sonnet + Codex; Claude Security, Humanizer, Slop Stopper | Bölüm 8 eşikleri geçer |
| A6 | Vercel'e yayın, masa QR kodu | Vercel MCP | `/qr` canlıda, QR okutulunca açılır |

A3, A1/A2 ile paralel kendi branch'inde yürür. Her aşama için ayrı uygulama planı yazılır.

### Devir kuralı

1. Her AI işe başlamadan `AGENTS.md` ve `docs/PROJECT_STATE.md` okur.
2. Bir oturum = bir iş, kendi branch'inde. Küçük commit'ler.
3. İş bitince `PROJECT_STATE.md` güncellenir; başka bir model diff'i inceler, sonra `main`'e birleşir.

## 8. Test

- Sunucu mantığı (doğrulama, giriş, oturum, deneme sınırı, yükleme kontrolü) için birim testleri; test önce yazılır.
- Playwright: menü açılıyor, kategori geçişi, arama, detay açma/kapama (geri tuşu dahil), WiFi kopyalama, dil değişimi, AR'de RTL; admin girişi, ürün ekleme, fotoğraf yükleme, sıralama, WiFi değiştirme.
- Ekran görüntüsü kontrolü: 390, 768, 1440 px.
- Lighthouse mobil: performans ≥ 85, erişilebilirlik ≥ 95.
- Claude Security taraması.
- Gerçek cihaz: en az bir iPhone ve bir orta seviye Android, kafe WiFi'ı ve mobil veri.

## 9. Kapsam dışı (v1)

- Diğer şube(ler)
- Sipariş ve ödeme
- Tükendi işareti
- Otomatik çeviri
- Çok kullanıcılı admin rolleri
- Müzik / ses

## 10. Riskler

- Gerçek menü, fiyat ve WiFi bilgisi henüz yok → demo içerikle ilerlenir, A3 sonrası değiştirilir.
- BORELA'ya eklenen Türkçe glifler orijinalle birebir olmayabilir → görsel kontrol; gerekirse tasarımcıdan Türkçe destekli dosya istenir.
- GitHub'a bu oturumdan yazma izni yok → push, Claude GitHub uygulaması kurulduktan sonra yeni oturumda ya da Antigravity'den yapılır.
- Vercel Postgres/Blob ücretsiz katman sınırları → kafe ölçeğinde yeterli; istatistik günlük özet tablosunda tutulur.

# Too Hot To Handle — QR Menü Tasarım Belgesi (Spec) · Sürüm 2

- Tarih: 2026-10-25 (sürüm 2: gerçek ürün listesi, AI incelemeleri, font ve barındırma kararları işlendi)
- Adres: `toohottohandlecoffee.com/qr` (menü), `toohottohandlecoffee.com/qr/admin` (admin)
- Şube: yalnızca Batman (Petrol City AVM)
- Proje yürütücüsü: Enes
- Durum: Onay bekliyor

## 1. Amaç ve başarı ölçütü

Masadaki QR okutulunca açılan, markaya sadık ve hızlı bir menü yapılacak. Kafe menüyü kod bilmeden admin panelinden yönetecek.

Başarı ölçütleri:
1. Menü metni, mobil 4G'de 2,5 saniye içinde okunur hale gelir. Giriş animasyonu bunu geciktirmez.
2. Menüyü ilk kez gören biri, örnek 5 ürünün (Caramel Macchiato, Ton Balıklı Sandviç, Lotus Cheesecake, Cool Lime, Fas Nanesi) her birini ortalama 10 saniyede bulur. Ölçüm en az 3 kişiyle, gerçek telefonda yapılır.
3. WiFi kullanıcı adı ve şifresi ayrı ayrı kopyalanır. Kopyalama çalışmazsa metin büyük yazıyla okunabilir.
4. Admin'de kaydedilen değişiklik menüde en geç 10 saniyede görünür. Açık duran menüler, sekmeye dönüldüğünde kendini günceller.
5. Menü TR, EN ve AR dillerinde okunur. Arapça sağdan sola akar.
6. Repo gizlidir, repoda şifre veya anahtar bulunmaz. Maliyet verisi repoya, veritabanına ve menüye girmez.
7. Site Vercel'e bağımlı değildir. Hostinger'e taşımak için ortam değişkenlerini değiştirmek ve yeniden derlemek yeterlidir.

## 2. Marka varlıkları

### 2.1 Renkler

Marka paleti (`toohottohandle-renkler.pdf`, Pantone Solid Coated):

| Token | Pantone | Hex | Anlamı menüde |
|---|---|---|---|
| `red` | 485 C | `#DC2524` | Kahve grubu, ana marka rengi |
| `yellow` | 100 C | `#F0EE40` | Vurgu: Yeni, Öne çıkan |
| `pink` | 2051 C | `#DDBBD1` | Tatlı grubu |
| `blue` | 3506 C | `#335DB2` | Kahvesiz içecek grubu |
| `green` | 6144 C | `#35A97C` | Yiyecek grubu |
| `gray` | Cool Gray 1 C | `#DBDAD4` | Paket & Atıştırmalık grubu |

Renk kategoriye değil gruba bağlıdır. Böylece kategori sayısı artsa da kural bozulmaz. Renk her zaman bir anlam taşır.

İşlevsel renkler (marka paletinden türetilmiştir, okunurluk için):

| Token | Hex | Kullanım | Krem zeminde kontrast |
|---|---|---|---|
| `paper` | `#F3ECE6` | Zemin (yakında sayfasıyla aynı) | — |
| `ink` | `#2A1514` | Gövde metni | 14,8 : 1 |
| `ink-soft` | `#6B5550` | İkincil metin | 5,9 : 1 |
| `red-text` | `#B5191C` | Küçük kırmızı metin, hata metni | 5,75 : 1 |
| `green-text` | `#1F6B4D` | Başarı metni ("Kopyalandı") | 5,5 : 1 |
| `line` | `#E2D6CE` | Ayırıcı çizgiler | — |
| `white` | `#FFFFFF` | Kırmızı ve mavi zemin üstü metin | kırmızıda 4,85, mavide 6,3 |

Kurallar:
- `red` (#DC2524) krem zeminde 4,14 : 1 verir. Bu yüzden yalnızca 24 px ve üstü başlıklarda kullanılır. Küçük kırmızı metinde `red-text` kullanılır.
- Yeşil zemin üstüne beyaz yazı yazılmaz (2,95 : 1). Yeşil ve pembe zeminde `ink` kullanılır.
- Kodda bu token'lar dışında renk bulunmaz.

### 2.2 Fontlar

Kafenin BORELA ve Gotham lisansı doğrulanamadığı için açık lisanslı (SIL OFL) yakın fontlar kullanılır:

| Rol | Font | Yerine geçtiği | Nerede |
|---|---|---|---|
| Başlık | **Unbounded** (700, 800) | BORELA | Kategori başlıkları, öne çıkan kart adları, rozetler, fiyat rakamları |
| Metin | **Montserrat** (500, 600, 700) | Gotham / Gotham Rounded | Ürün adları, açıklamalar, arayüz, admin |
| Arapça | **Readex Pro** (400, 600) | — | Yalnızca AR modunda yüklenir |

- Fontlar siteyle birlikte barındırılır. Google'dan çekilmez. WOFF2'ye çevrilir, latin, latin-ext ve arabic alt kümelerine bölünür. OFL lisans dosyaları repoya konur.
- Font aileleri tek bir token dosyasında tanımlanır. Kafe ileride BORELA ve Gotham lisansını belgelerse geçiş tek satırla yapılır.
- Ürün adları Montserrat SemiBold ile yazılır. Unbounded geniş bir font olduğu için uzun adlarda ("Iced White Chocolate Mocha") dar ekrana sığmaz.
- ₺ işareti Unbounded'da yoksa fiyatın yanında Montserrat'tan gelir. Bu durum A0'da kontrol edilir.
- Logo ve TOO HOT TO HANDLE yazısı fontla yazılmaz. Resmi logo çizimi kullanılır.

### 2.3 Logo ve ikonlar

- Logo: canlı yakında sayfasındaki resmi SVG çizimleri (TOO HOT / TO HANDLE iki satır, HOT dalgası).
- Resmi ikonlar `toohottohandle-iconlar-1.png` ve `.ai` dosyalarından gelir: dudak, tavşan, 12 köşeli yıldız, üçlü slot kutusu. Tavşan bu dosyadan alınır, yeniden çizilmez.
- Kural: logo ve ikonlar yeniden çizilmez, AI ile değiştirilmez. Vektöre çevrilen ikon kaynak görselle üst üste konup gözle karşılaştırılır. Fark görülürse düzeltilir.

## 3. Deneyim

### 3.1 Giriş (oturumdaki ilk açılışta, en fazla 1,2 sn)

Giriş, yakında sayfasının dilini sürdürür:
1. Krem zemin. Kırmızı, alttan dalgalı kenarla ekranın yarısına kadar dolar.
2. HOT logosu dalganın üstünde ısınıp dalgalanır. TOO HOT / TO HANDLE iki satır olarak yerine oturur.
3. Logo küçülerek üst bara geçer, menü altından görünür.

İki katmanlı çalışır:
- **2D (herkes):** SVG ve CSS. İlk kare HTML ile birlikte gelir, ek dosya beklemez.
- **3D (yalnızca güçlü telefonda):** HOT logosu parlak kırmızı kabartmaya dönüşür, hafif döner, sonra düz logoya oturur. 3D yüklemesi şu koşulların hepsi tutarsa başlar: WebGL2 var, `navigator.deviceMemory` ≥ 4 (bilinmiyorsa geçer), işlemci çekirdeği ≥ 6, veri tasarrufu kapalı, bağlantı 3G'den hızlı, hareket azaltma kapalı. 3D sahne 600 ms içinde hazır olmazsa o oturumda 2D oynar.

Menü verisi ve metni giriş başlarken sayfada hazırdır. Ekrana dokunmak ya da "Geç" düğmesi girişi atlar. Hareket azaltma açıksa kısa bir kararma geçişi oynar. Ses yoktur.

### 3.2 Menü ekranı

- **Üst bar:** küçük TOO HOT / TO HANDLE logosu. Sağda arama, WiFi ve dil (TR / EN / AR).
- **Grup ve kategori şeridi** (yapışkan): beş grup (Kahve, Kahvesiz, Yiyecek, Tatlı, Paket & Atıştırmalık) ve altında kategoriler. Menüde yalnızca grup ve kategori adları yazar. Renk adı, sıcaklık gibi iç bilgiler yazmaz, renk yalnızca görsel olarak kullanılır. Seçili kategori kendi grup rengiyle dolar. Kategoriye geçerken dalga o rengin içinden geçer. Ekranda tek baskın hareket bu dalgadır.
- **Öne çıkan:** admin'de "öne çıkan" işaretli en fazla 6 ürün, en üstte büyük kartlarda durur. Elle kaydırılır, kendi kendine kaymaz. Etiketi "Öne çıkan"dır, "en çok satan" yazılmaz.
- **Ürün listesi:** tek sütun liste. Her satırda ad, varsa bir satır açıklama ve sağda fiyat bulunur. İki boylu üründe fiyat "Normal 210 · Büyük 230" biçimindedir. Fotoğrafı olan ürünün satırında küçük kare fotoğraf görünür. Fotoğrafı olmayan satır da eksik durmaz: menü bir kafe panosu gibi yalnızca yazıyla da tamamlanmış görünür. 768 px üstünde liste iki sütuna geçer.
- **Kategori başlıkları:** Unbounded, büyük harf, grup rengi. Kabartma görünümü statik CSS gölgesiyle verilir, hareket etmez.
- **Ekstralar:** kahve ve içecek kategorilerinin sonunda tek satır: "Ekstra shot +75 · Bitkisel süt +60 · Sos ve aroma +50". Ekmek Üstü'nde: "Yumurta +30".
- **Tükendi:** ürün listede kalır, soluk görünür, fiyat yerine "Tükendi" yazar. "Ne içsem?" onu seçmez.
- **Alt bilgi:** "Self servis · Servis ücreti alınmaz · Fiyatlara KDV dahildir · Son güncelleme: 25.10.2026". Tarih, en son değişen ürünün tarihinden otomatik alınır. Alt bilgi metni admin'den değiştirilebilir.

### 3.3 Arama

- Üstten açılır. Yazdıkça ürün adı, açıklama ve içindekilerde arar. Üç dilde çalışır.
- Türkçe harfler eşit sayılır: "fistik" yazan "Fıstıklı"yı bulur (ı/i/İ, ş/s, ç/c, ğ/g, ö/o, ü/u).
- Sonuç yoksa şu metin çıkar: "Aradığını bulamadık. Ekibimiz sana yardımcı olabilir." (EN: "We couldn't find that. Our team is happy to help." AR: "لم نجد ما تبحث عنه. فريقنا يسعده مساعدتك.") Altında aramayı temizle düğmesi bulunur.

### 3.4 Ürün detayı

- Satıra dokununca detay alttan açılır. Telefonun geri tuşu detayı kapatır, menüden çıkarmaz.
- İçeriği: varsa fotoğraf, ad, açıklama, boy ve fiyatlar, içindekiler, alerjenler, varsa kalori, etiketler.
- İçindekiler normal cümle düzeninde yazılır, tamamı büyük harf olmaz.
- **Alerjenler:** simge ve yanında adı yazılı durur ("Süt", "Gluten", "Antep fıstığı (sert kabuklu)"). Alerjenler admin'den elle girilir. Alerjen bölümü yalnızca o ürün için "alerjen bilgisi girildi" işaretliyse görünür. Böylece hiç girilmemiş ürün "alerjen yok" gibi görünmez.
- **Eksik bilgi:** girilmemiş alan hiç gösterilmez. Kalori yoksa yazmaz, 0 yazmaz. Açıklama yoksa ad ve fiyat yeter.
- Ürün videosu yoktur.

### 3.5 "Ne içsem?"

- Liste sonunda ve üst barda slot ikonu bulunur.
- Önce sorar: Sıcak / Soğuk / Fark etmez.
- Resmi slot kutusunun makaraları (dudak, tavşan, yıldız) döner. Güçlü telefonda 3D, diğerlerinde SVG oynar.
- Makara tavşanda durur. Tavşanın gözüne dalış geçişi ile seçilen içeceğin detayı açılır.
- Yalnızca görünür, tükenmemiş ve "Ne içsem'e dahil" kategorideki içecekler seçilir. Yiyecek ve meşrubat seçilmez.
- "Bir daha" düğmesi yeniden çevirir.

### 3.6 WiFi kartı

- Sağ üstteki WiFi ikonundan aşağı doğru açılır.
- İçeriği: ağ adı (**HOT | WIFI**), kullanıcı adı ve şifre. Değerler büyük ve eşit aralıklı yazıyla durur. Her birinin yanında ayrı "Kopyala" düğmesi vardır. Basınca düğme bir an "Kopyalandı" olur.
- Kopyalama çalışmazsa metin seçili hale gelir ve "Kopyalanamadı. Metne basılı tutup kopyalayın." yazar.
- Kısa yönerge admin'den düzenlenir. Varsayılan metin: "HOT | WIFI ağına bağlanın. Açılan giriş ekranına bu bilgileri yazın." Telefonun giriş penceresinden başka uygulamaya geçmek o pencereyi kapatabilir. Bu yüzden bilgiler, ekrana bakarak yazılabilecek büyüklüktedir.
- Admin'de WiFi bilgisi girilmemişse WiFi ikonu görünmez.

### 3.7 Etiket ve rozet dili

- **Etiketler:** küçük, köşeleri yuvarlak, grup rengine göre zeminli kutular. Kafenin çıkartma dilinde, ince beyaz konturlu, Unbounded yazılı. Hazır liste: VEGAN, ŞEKERSİZ, BİTKİSEL SÜT SEÇENEKLİ, SICAK, SOĞUK, ACILI. Admin yenisini ekleyebilir. Bir üründe en fazla 3 etiket görünür.
- **"YENİ" rozeti:** resmi 12 köşeli yıldızın içinde YENİ / NEW / جديد yazar. Hareket etmez.
- **Süsler:** yalnızca resmi yıldız ve dudak ikonları kullanılır.
- **Emoji yoktur.** Parıltı, konfeti ya da gradyan kullanılmaz.

### 3.8 Alerjen seti

Türk Gıda Kodeksi ve AB'nin 14 alerjeni: gluten, kabuklu deniz ürünleri, yumurta, balık, yer fıstığı, soya, süt, sert kabuklu yemişler (antep fıstığı, fındık, badem, ceviz vb.), kereviz, hardal, susam, sülfit, acı bakla, yumuşakçalar.

- "Fıstık" kelimesi tek başına kullanılmaz. Ekranda "Yer fıstığı" ya da "Antep fıstığı (sert kabuklu)" yazar.
- Simgeler resmi ikon dilinde, düz ve dolu siluet olarak çizilir. Hazır ikon paketi kullanılmaz.
- Alerjenler admin'de ürün başına elle işaretlenir. İşaretleme bitince "alerjen bilgisi girildi" anahtarı açılır. Anahtar kapalıysa menüde alerjen bölümü görünmez.

### 3.9 Dil

- TR varsayılandır. EN ve AR seçilebilir, seçim tarayıcıda hatırlanır.
- Çeviri yoksa sırayla şu dil gösterilir: AR → EN → TR, EN → TR.
- Ürün adları marka dili olduğu için çevrilmez. Admin isterse dile göre ad girebilir.
- AR modunda sayfa sağdan sola akar. Fiyat, WiFi şifresi ve kullanıcı adı soldan sağa yazılır ve Latin rakam kullanılır (kasadaki fiyatla aynı görünsün). Logo aynalanmaz.
- Çeviriler elle girilir. Otomatik çeviri kullanılmaz.

### 3.10 Erişilebilirlik (tüm bileşenler)

- Dokunma alanı en az 44 × 44 px.
- Klavye odağı her kontrolde görünür. Detay ve WiFi kartı odağı içinde tutar, Esc ile kapanır.
- Metin %200 büyütüldüğünde yatay kaydırma olmaz.
- Hareket azaltma açıksa dalga durur, giriş ve slot kısa geçişe döner.
- Simgelerin hepsinin yazılı adı vardır.

### 3.11 Hata durumları

| Durum | Görünen |
|---|---|
| Arama sonuçsuz | "Aradığını bulamadık. Ekibimiz sana yardımcı olabilir." ve temizle düğmesi |
| Kategori boş ya da tamamı gizli | Kategori şeritte de listede de görünmez |
| Kopyalama başarısız | Metin seçilir, "Kopyalanamadı. Metne basılı tutup kopyalayın." |
| Bağlantı yok (daha önce açılmışsa) | Son kaydedilen menü açılır, üstte "Bağlantı yok. Gösterilen menü: 25.10.2026 14:30" yazar |
| Fotoğraf yüklenemedi | Satır fotoğrafsız haliyle görünür |
| Veritabanına ulaşılamıyor | Menü son üretilmiş sayfadan sunulur, ziyaretçi farkı görmez |

## 4. Admin paneli (`/qr/admin`)

Telefonda da rahat kullanılır. Metin fontu Montserrat'tır.

### 4.1 Giriş ve hesap

- E-posta ve şifre ile giriş yapılır. Yanlış denemelerde artan bekleme süresi uygulanır.
- "Tüm cihazlardan çıkış yap" düğmesi bulunur.
- Şifre sıfırlama: tek admin olduğu için e-posta servisi kurulmaz. Geliştirici `npm run admin:reset-password` komutunu çalıştırır. Komut yeni şifreyi ekrana basmaz, kullanıcının yazmasını ister. Adımlar `docs/KULLANIM.md` içinde yazılıdır.

### 4.2 Ürünler

- Ekleme, düzenleme, çoğaltma ve sürükleyerek sıralama yapılır.
- Silinen ürün 30 gün çöp kutusunda kalır ve geri alınabilir.
- Alanlar: ad (dile göre isteğe bağlı), açıklama (TR/EN/AR), boy ve fiyat listesi (tek fiyat da bir satırdır; boy adı hazır listeden seçilir: Normal, Büyük, Tek, Duble), kategori, fotoğraf, içindekiler (3 dil), alerjenler ve "alerjen bilgisi girildi" anahtarı, kalori (boş bırakılabilir), sıcak/soğuk, etiketler, Yeni, Öne çıkan, Görünür.
- **Tükendi:** ürün satırında tek dokunuşluk anahtar. "Bugün tükendi" seçilince ürün, ertesi açılış saatinde (admin ayarı, varsayılan 08:00) kendiliğinden geri gelir. "Ben açana kadar" seçeneği de vardır.
- **Kaydedilmemiş değişiklik uyarısı:** sayfadan çıkarken sorar.
- **Fiyat değişikliği onayı:** kaydetmeden önce "210 ₺ → 230 ₺" biçiminde eski ve yeni fiyat gösterilir.

### 4.3 Toplu fiyat güncelleme

- Kategori ya da grup seçilir. Yüzde ya da sabit tutar girilir. Yuvarlama seçilir: yok, en yakın 5 ₺, en yakın 10 ₺.
- Önce önizleme tablosu çıkar (ürün, eski fiyat, yeni fiyat). "Uygula" denince tek seferde kaydedilir ve tek adımda geri alınabilir.

### 4.4 Değişiklik geçmişi ve geri alma

- Her kayıt (kim, ne zaman, önce, sonra) geçmişe yazılır.
- Son 100 değişiklik listelenir. Her birinde "Geri al" bulunur.
- Kayıt doğrudan yayına çıkar. Taslak ve yayınla adımı yoktur, çünkü tek admin vardır ve geri alma bu ihtiyacı karşılar.
- Kaydedilen değişiklik menüde en geç 10 saniyede görünür.

### 4.5 Kategoriler, etiketler ve ayarlar

- Kategoriler: ad (3 dil), grup, sıralama, görünürlük, "Ne içsem'e dahil" ve varsayılan sıcak/soğuk.
- Gruplar: ad (3 dil), renk (yalnızca 6 marka renginden).
- Etiketler: hazır liste ve ekleme.
- Ayarlar: WiFi (ağ adı, kullanıcı adı, şifre, yönerge metni), açılış saati, alt bilgi notu (varsayılan: "Self servis · Servis ücreti alınmaz"). Hepsi admin'den girilir.
- Geliştirme ve demo için seed test değerleri koyar: ağ adı `HOT | WIFI`, kullanıcı adı `test`, şifre `test1234`, açılış saati 08:00. Admin ana sayfasında "WiFi test bilgisi kullanılıyor" uyarısı, gerçek bilgi girilene kadar durur.

### 4.6 Fotoğraf yükleme

- Kabul edilen türler: JPEG, PNG, WebP, HEIC. En fazla 12 MB.
- Sunucu dosyayı yüklerken `sharp` ile küçültür: 160 px (liste), 720 px ve 1280 px (detay), WebP ve AVIF olarak kaydeder. Vercel'in görsel servisi kullanılmaz.
- Hata metni nedenini söyler: "Dosya 12 MB'tan büyük. Daha küçük bir fotoğraf seçin."

### 4.7 İstatistik

- Bugün, son 7 gün ve son 30 gün için menü açılışı sayısı gösterilir. Açılış, aynı oturumda bir kez sayılır.
- En çok detayı açılan 10 ürün listelenir.
- "Saatlere göre menü açılışı" grafiği bulunur. Bu grafik kafe yoğunluğu ya da müşteri sayısı olarak adlandırılmaz.
- Ziyaretçi takibi için çerez ve kişisel veri kullanılmaz. Yalnızca toplam sayaçlar tutulur. Admin girişi kendi oturum çerezini kullanır.
- Ziyaretçi başına en fazla 2 yazma yapılır: biri açılışta, diğeri sayfadan çıkarken detay sayaçları için toplu olarak.

### 4.8 Basılı menü ve QR

- **A4 fiyat listesi:** admin'de "Basılı fiyat listesi" sayfası bulunur. Tüm görünür ürünler, fiyatlar, "KDV dahildir" notu ve tarih yazdırmaya uygun düzende çıkar. Masada basılı menü bulundurmak zorunlu olduğu için QR menünün yanında bu liste kullanılır.
- **QR:** sabit adres `toohottohandlecoffee.com/qr`. Admin'den logolu QR (SVG ve PDF) indirilir. QR'ın altında kısa adres yazılı durur. Basmadan önce gerçek masada en az 3 telefonla okutma testi yapılır.

### 4.9 Yedek

- Admin'de "Yedek indir" düğmesi menünün tamamını (kategoriler, ürünler, ayarlar; admin hesabı hariç) JSON olarak indirir.
- "Yedekten geri yükle" önce farkı gösterir, onaydan sonra uygular.
- Ayrıca veritabanı sağlayıcısının kendi geri dönüş özelliği kullanılır. Ayda bir yedek indirmek `docs/KULLANIM.md`'de rutin olarak yazılıdır.

## 5. Teknik mimari

### 5.1 Repo ve klasör düzeni

- Repo `justech0/toohottohandle`, **gizli** olacak (GitHub → Settings → Change visibility → Private).
- Yakında sayfası `yakinda/` klasörüne taşınır. `/` adresi bu sayfayı göstermeye devam eder.
- QR menü ve admin aynı repoda, tek bir Next.js uygulamasıdır.

```
AGENTS.md                tüm AI'lar için kalıcı kurallar
docs/PROJECT_STATE.md    şu anki durum, sıradaki işler
docs/DECISIONS.md        kararlar ve nedenleri
docs/DESIGN_SYSTEM.md    renk, font, hareket token'ları
docs/KULLANIM.md         kafe için kısa kullanım ve devir rehberi
docs/superpowers/        spec ve planlar
yakinda/                 canlı yakında sayfası (değişmeden)
app/qr/                  menü
app/qr/admin/            admin
lib/storage/             dosya deposu adaptörü
db/                      şema, migration, seed
public/fonts/            WOFF2 fontlar ve OFL lisansları
```

### 5.2 Teknoloji ve taşınabilirlik

Kural: Vercel'e özel API kullanılmaz. Her şey düz Node.js sunucusunda da çalışır.

| Konu | Şimdi (Vercel Hobby) | Hostinger'e geçince |
|---|---|---|
| Uygulama | Next.js App Router + TypeScript | Aynı build, `output: "standalone"`, Hostinger Node.js web app (Business veya Cloud plan) |
| Veritabanı | Neon Postgres (ücretsiz, Frankfurt), standart `postgres` sürücüsü + Drizzle ORM | Aynı Neon, yalnızca bağlantı adresi ortam değişkeninde. İstenirse Supabase Postgres |
| Dosyalar | `lib/storage` adaptörü, Vercel Blob | Aynı adaptör, S3 uyumlu depo (ör. Cloudflare R2). Hostinger'in kendi diski kullanılmaz, çünkü her yayında üzerine yazılıyor |
| Görsel küçültme | Yüklemede `sharp` | Aynı |
| Önbellek | Sayfa üretimi + kayıtta `revalidatePath` | Aynı (Node sunucusunda da çalışır) |
| Zamanlanmış iş | Yok. Tükendi süresi okunurken hesaplanır | Aynı |
| İstatistik | Kendi tablolarımız | Aynı |

- Taşıma adımları `docs/KULLANIM.md`'de yazılıdır: ortam değişkenlerini kopyala, depo dosyalarını aktar, DNS'i çevir.
- Menü sayfası sunucuda önceden üretilir. Ziyaretçi isteği veritabanına gitmez, bu yüzden veritabanı uyurken bile menü hızlı açılır. Admin kaydı sayfayı yeniden üretir. Yedek olarak sayfa 5 dakikada bir tazelenir (tükendi süresi dolan ürünler için).
- Açık duran menü, sekmeye dönüldüğünde küçük bir sürüm adresine sorar. Sürüm değişmişse veriyi sessizce yeniler.
- Bağlantı kesilmesine karşı küçük bir service worker son menüyü ve fontları saklar. Önce ağa gider, ağ yoksa saklananı gösterir.

### 5.3 3D

- Three.js yalnızca giriş HOT kabartması ve "Ne içsem?" makaraları için kullanılır. İkisi aynı küçük sahne modülünü paylaşır.
- Dinamik import ile, ilk boyamadan sonra ve yalnızca cihaz koşulları tutarsa (3.1) yüklenir.
- Logo ve ikon SVG'leri `SVGLoader` ve `ExtrudeGeometry` ile kabartılır. Malzeme parlak kırmızıdır, gölge yoktur.
- Bütçe: Three.js ve sahne birlikte en fazla 180 KB gzip. Piksel oranı en fazla 2'dir.

### 5.4 Veri modeli

`groups`: `id`, `slug`, `name_tr`, `name_en`, `name_ar`, `color` (red | yellow | pink | blue | green | gray), `sort_order`

`categories`: `id`, `slug`, `group_id`, `name_tr`, `name_en`, `name_ar`, `sort_order`, `is_visible`, `in_suggest` (Ne içsem'e dahil), `default_temp` (hot | cold | null)

`products`: `id`, `slug`, `category_id`, `name`, `name_en`, `name_ar` (boşsa `name`), `desc_tr`, `desc_en`, `desc_ar`, `ingredients_tr`, `ingredients_en`, `ingredients_ar`, `kcal` (null olabilir, 0 anlamına gelmez), `allergens` (dizi, 14 kod), `allergens_entered` (bool, "alerjen bilgisi girildi"), `temp` (hot | cold | null → kategoriden gelir), `image_key`, `is_new`, `is_featured`, `is_visible`, `sold_out_until` (null | zaman | "süresiz" için uzak tarih), `sort_order`, `updated_at`, `deleted_at`

`product_variants`: `id`, `product_id`, `label` (null = tek fiyat; Normal | Büyük | Tek | Duble | serbest), `price_kurus` (tam sayı), `sort_order`. Her üründe en az bir satır bulunur. Tek fiyat yapısı budur, ayrı `price` sütunu yoktur.

`extras`: `id`, `name_tr`, `name_en`, `name_ar`, `price_kurus`, `scope` (category_id listesi), `sort_order`

`tags`, `product_tags`: `id`, `label_tr`, `label_en`, `label_ar`, `group_color`

`settings` (tek satır): `wifi_ssid`, `wifi_username`, `wifi_password`, `wifi_note_tr/en/ar`, `opening_time`, `footer_note_tr/en/ar`

`audit_log`: `id`, `admin_id`, `at`, `entity`, `entity_id`, `action`, `before` (JSON), `after` (JSON)

`stats_daily`: `date`, `menu_opens`; `stats_hourly`: `date`, `hour`, `opens`; `stats_product`: `date`, `product_id`, `views`

`admins`: `id`, `email`, `password_hash` (argon2id), `created_at`, `last_login_at`; `sessions`: `id_hash`, `admin_id`, `expires_at`; `login_attempts`: `key_hash`, `attempted_at`

Maliyet, COGS ve zam oranı hiçbir tabloda yoktur.

### 5.5 Güvenlik

- Şifre hash'i argon2id. Oturum çerezi HttpOnly, Secure, SameSite=Strict. Veritabanında oturum kimliğinin yalnızca hash'i tutulur.
- Admin işlemlerinde CSRF koruması ve sunucu tarafında doğrulama (zod) yapılır.
- Giriş deneme sınırı uygulanır.
- Yüklenen dosyanın türü içeriğinden doğrulanır. Boyut sınırı vardır. Dosya adı rastgele üretilir. EXIF verisi silinir.
- Güvenlik başlıkları: CSP, X-Content-Type-Options, Referrer-Policy, frame-ancestors 'none'.
- Anahtarlar yalnızca barındırma ortam değişkenlerinde durur. Repoda yalnızca `.env.example` bulunur. Şifre ve anahtar sohbete veya AI'a yazılmaz.

### 5.6 Performans bütçesi

- Menü LCP ≤ 2,5 sn (mobil 4G), CLS ≤ 0,1, INP ≤ 200 ms.
- İlk yüklemede JS ≤ 100 KB gzip (3D hariç).
- Fontlar: ilk yüklemede Unbounded 800 ve Montserrat 500/600 latin alt kümesi, toplam ≤ 90 KB. Readex Pro yalnızca AR seçilince yüklenir.
- Liste fotoğrafı 160 px, ≤ 12 KB. Detay fotoğrafı `srcset` ile verilir.

### 5.7 Barındırma ve maliyet

- Şimdilik Vercel Hobby (ücretsiz). Hobby planı kişisel ve ticari olmayan kullanım içindir. Kafe menüsü canlıya çıkınca ücretli plana ya da Hostinger'e geçilir. Geçiş kararı ve takvimi Enes'tedir.
- Neon ücretsiz planı ayda 100 CU-saat ve 1 GB veri verir. Menü sayfası veritabanına gitmez. İstatistik yazmaları veritabanını uyandırır. Gün boyu her 5 dakikada bir ziyaret gelirse aylık süre sınıra yaklaşır. Admin'de bu kullanım görünür. Sınıra yaklaşınca istatistik yazması tek düğmeyle kapatılabilir.

### 5.8 Devir

- Alan adı, barındırma, veritabanı ve GitHub hesapları için kimin sahip olacağı yayın öncesi Enes ve kafeyle netleşir. Hesapların kafe adına açılması ve Enes'in üye olması önerilir.
- `docs/KULLANIM.md`: ürün ekleme, tükendi, toplu zam, yedek, şifre sıfırlama, taşıma adımları. Kısa, ekran görüntülü, Türkçe.
- Şifreler devirde yüz yüze ya da şifre yöneticisiyle verilir. Repoya ve sohbete yazılmaz.

## 6. İçerik

### 6.1 Kaynak

- Ürün listesi ve fiyatlar `SATIŞ ve MALİYET SON 1.xlsx` dosyasından gelir. Yalnızca "Ürün Adı", "Kategori" ve "Yeni Fiyat" sütunları kullanılır. Maliyet, COGS ve zam oranı okunmaz.
- Excel dosyası repoya konmaz. Dönüştürülmüş liste `db/seed/menu.json` olarak repoya girer. Bu dosyada maliyet sütunu yoktur.
- Fiyatlar "Yeni Fiyat" sütunundan olduğu gibi alınır, ekstralar dahil. Küsurlu fiyatlar (176, 198, 231, 253, 187) değiştirilmez. Yalnızca Excel'in hesap kalıntısı temizlenir (229,999999 → 230).
- Aynı ürünün boyları tek ürün olur: "Büyük", "12", "12oz", "16", "16 OZ" satırları birleşir. Küçük boy "Normal", büyük boy "Büyük" adını alır. Espresso ve Türk kahvesi "Tek · Duble" kullanır.
- Ad yazımı düzeltilir: Chocalate → Chocolate, Rasberry → Raspberry, Cheescake → Cheesecake, Ofreso → Ofresko, Ethiophia → Ethiopia, Chocolaate → Chocolate, Cappucino → Cappuccino, Coffe → Coffee.
- Adı farklı yazılmış satırlar birleştirilmez, ayrı ürün olarak kalır: White Mocha Frappe (yalnızca Büyük) ve White Chocolate Frappe (yalnızca Normal); White Mocha Cream Frappe ve White Chocolate Cream Frappe; Melonberry Frozen ve Melonberry Twist Frozen. Tek boyu olan üründe boy adı fiyatın yanında yazar.
- "DEMO ÜRÜN" satırı alınmaz.
- Excel'de açıklama, içindekiler, alerjen, kalori ve fotoğraf yoktur. Bu alanlar boş başlar ve menüde görünmez. İşletme doldurdukça görünür hale gelir.

### 6.2 Sonuç

19 kategori, 129 ürün ve 4 ekstra. Liste Ek A'da.

### 6.3 Kafeyle netleşenler

- Fiyatlar "Yeni Fiyat" sütunundan olduğu gibi alınır, yuvarlanmaz.
- Adı farklı yazılmış satırlar ayrı ürün kalır.
- Signatures ve Matcha & Ube soğuk içecektir. Ürün başına admin'den değiştirilebilir.
- Kafe self servistir, servis ücreti alınmaz.
- WiFi bilgisi ve açılış saati admin'den girilir. O zamana kadar test değerleri kullanılır.
- Alerjenler admin'den elle girilir.

## 7. Aşamalar

| Aşama | İş | Bitti tanımı |
|---|---|---|
| A0 | Gizli repo, `yakinda/` taşıma, Next.js iskeleti, fontlar, logo ve ikon SVG'leri, Excel → `menu.json` dönüştürme | `/` yakında sayfası aynen çalışır, build geçer, seed 129 ürünü yükler |
| A1 | Menü ekranı, arama, detay, WiFi kartı, 3 dil ve RTL, 2D giriş, service worker | 390, 768 ve 1440 px'te ekran görüntüsü kontrolü, gerçek ürün listesiyle |
| A2 | Veritabanı, admin, yükleme, toplu fiyat, geçmiş ve geri al, tükendi, yedek, istatistik, basılı liste, QR | Bölüm 8 testleri geçer |
| A3 | 3D giriş ve 3D "Ne içsem?" (tavşan gözü geçişi), alerjen simgeleri, etiket ve rozet seti | 3D bütçe içinde, zayıf cihazda 2D çalışır |
| A4 | QA, gerçek cihaz testi, yayın, QR baskı testi, `KULLANIM.md` | `/qr` canlıda, 3 telefonda okutuldu |

AI'ların iş bölümü ve devir kuralları her aşamanın uygulama planında yazılır.

## 8. Test

- Sunucu mantığı (doğrulama, giriş, oturum, deneme sınırı, yükleme kontrolü, toplu fiyat hesabı, tükendi süresi, Türkçe arama eşlemesi, seed dönüştürme) için birim testleri yazılır. Test koddan önce yazılır.
- Playwright testleri:
  - Menü: açılış, kategori geçişi, arama (sonuçlu ve sonuçsuz), detay açma ve kapama (geri tuşu dahil), WiFi kopyalama, dil değişimi, AR'de RTL, tükendi görünümü, bağlantısız açılış.
  - Admin: giriş, ürün ekleme, çoğaltma, fotoğraf yükleme, sıralama, tükendi, toplu fiyat önizleme ve uygulama, geri alma, WiFi değiştirme, yedek indirme ve geri yükleme.
- Ekran görüntüsü kontrolü: 390, 768, 1440 px.
- Lighthouse mobil: performans ≥ 85, erişilebilirlik ≥ 95.
- Güvenlik taraması.
- Gerçek cihaz testi: en az bir iPhone ve bir orta seviye Android, kafe WiFi'ı ve mobil veri ile, %200 metin büyütmeyle.
- Bulma süresi testi (Bölüm 1, madde 2).

## 9. Kapsam dışı (v1)

- Diğer şube(ler)
- Sipariş ve ödeme
- Otomatik çeviri
- Çok kullanıcılı admin rolleri
- Müzik ve ses
- Ürün videosu
- Taslak ve yayınla akışı (yerine geçmiş ve geri al var)

## 10. Riskler

- **Gerçek fotoğraf, açıklama ve alerjen yok.** Menü yazı ağırlıklı başlar, tasarım bunu kaldıracak şekilde kurulur. Alerjenler admin'den girilene kadar gizli kalır.
- **Vercel Hobby ticari kullanıma izin vermez.** Canlıya çıkışta ücretli plana ya da Hostinger'e geçilir.
- **Neon compute süresi.** İstatistik yazmaları sınırı zorlarsa istatistik kapatılır ya da plan yükseltilir.
- **Unbounded genişliği.** Uzun ürün adlarında Montserrat kullanılarak çözülür. Kategori başlıkları dar ekranda iki satıra iner.
- **3D ağırlığı.** Cihaz koşulu ve 600 ms sınırı tutmazsa 2D oynar. Menü hiçbir zaman 3D'yi beklemez.

## Ek A. Menü listesi (Excel'den dönüştürüldü)

Başlık, menüde görünen kategori adıdır. Altındaki italik satır yalnızca iç nottur ve menüde yazmaz: grubu, rengi, varsayılan sıcaklığı ve "Ne içsem?" çarkına dahil olup olmadığını gösterir.

### Sıcak Kahveler (11)

_İç not, menüde yazmaz: grup Kahve · renk kırmızı · sıcak · Ne içsem'e dahil_

| Ürün | Fiyat |
|---|---|
| Espresso | Tek 110 ₺ · Duble 150 ₺ |
| Cortado | 170 ₺ |
| Filtre Kahve | Normal 150 ₺ · Büyük 170 ₺ |
| Caffè Americano | Normal 160 ₺ · Büyük 180 ₺ |
| Cappuccino | Normal 180 ₺ · Büyük 200 ₺ |
| Caffè Latte | Normal 180 ₺ · Büyük 200 ₺ |
| Flat White | Normal 200 ₺ · Büyük 220 ₺ |
| Caramel Macchiato | Normal 210 ₺ · Büyük 230 ₺ |
| Caffè Mocha | Normal 210 ₺ · Büyük 230 ₺ |
| White Chocolate Mocha | Normal 210 ₺ · Büyük 230 ₺ |
| Türk Kahvesi | Tek 120 ₺ · Duble 160 ₺ |

### Soğuk Kahveler (8)

_İç not, menüde yazmaz: grup Kahve · renk kırmızı · soğuk · Ne içsem'e dahil_

| Ürün | Fiyat |
|---|---|
| Cold Brew | 220 ₺ |
| Iced Americano | Normal 176 ₺ · Büyük 198 ₺ |
| Iced Latte | Normal 198 ₺ · Büyük 220 ₺ |
| Iced Flat White | Normal 198 ₺ · Büyük 220 ₺ |
| Iced Caramel Macchiato | Normal 231 ₺ · Büyük 253 ₺ |
| Iced Mocha | Normal 231 ₺ · Büyük 253 ₺ |
| Iced White Chocolate Mocha | Normal 231 ₺ · Büyük 253 ₺ |
| Iced Filtre Kahve | Normal 165 ₺ · Büyük 187 ₺ |

### Signatures (5)

_İç not, menüde yazmaz: grup Kahve · renk kırmızı · soğuk · Ne içsem'e dahil_

| Ürün | Fiyat |
|---|---|
| Mont Blanc | 260 ₺ |
| Chocolate Cloud Espresso | 260 ₺ |
| Strawberry Foam Cold Brew | 260 ₺ |
| Citrus Berry Cloud | 260 ₺ |
| Blue Garden | 260 ₺ |

### Matcha & Ube (3)

_İç not, menüde yazmaz: grup Kahve · renk kırmızı · soğuk · Ne içsem'e dahil_

| Ürün | Fiyat |
|---|---|
| Ube Latte | 280 ₺ |
| Ube Vanilya Matcha Latte | 280 ₺ |
| Strawberry Matcha Latte | 280 ₺ |

### Coffee Frappe (6)

_İç not, menüde yazmaz: grup Kahve · renk kırmızı · soğuk · Ne içsem'e dahil_

| Ürün | Fiyat |
|---|---|
| Caramel Frappe | Normal 230 ₺ · Büyük 250 ₺ |
| Espresso Frappe | Normal 230 ₺ · Büyük 250 ₺ |
| Mocha Frappe | Normal 230 ₺ · Büyük 250 ₺ |
| Coconut Mocha Frappe | Normal 230 ₺ · Büyük 250 ₺ |
| White Mocha Frappe | Büyük 250 ₺ |
| White Chocolate Frappe | Normal 230 ₺ |

### Cream Frappe (6)

_İç not, menüde yazmaz: grup Kahve · renk kırmızı · soğuk · Ne içsem'e dahil_

| Ürün | Fiyat |
|---|---|
| Chocolate Cream Frappe | Normal 230 ₺ · Büyük 250 ₺ |
| Strawberries & Cream Frappe | Normal 230 ₺ · Büyük 250 ₺ |
| Vanilla Cream Frappe | Normal 230 ₺ · Büyük 250 ₺ |
| Caramel Cream Frappe | Normal 230 ₺ · Büyük 250 ₺ |
| White Mocha Cream Frappe | Büyük 250 ₺ |
| White Chocolate Cream Frappe | Normal 230 ₺ |

### Frozen (8)

_İç not, menüde yazmaz: grup Kahvesiz · renk mavi · soğuk · Ne içsem'e dahil_

| Ürün | Fiyat |
|---|---|
| Mango Frozen | Normal 220 ₺ · Büyük 240 ₺ |
| Raspberry Frozen | Normal 220 ₺ · Büyük 240 ₺ |
| Strawberry Frozen | Normal 220 ₺ · Büyük 240 ₺ |
| Melonberry Frozen | Büyük 240 ₺ |
| Cool Lime Frozen | Normal 220 ₺ · Büyük 240 ₺ |
| Berry Hibiscus Frozen | Normal 220 ₺ · Büyük 240 ₺ |
| Orange Mango Frozen | Normal 220 ₺ · Büyük 240 ₺ |
| Melonberry Twist Frozen | Normal 220 ₺ |

### Ice Shaken (3)

_İç not, menüde yazmaz: grup Kahvesiz · renk mavi · soğuk · Ne içsem'e dahil_

| Ürün | Fiyat |
|---|---|
| Cool Lime | Normal 210 ₺ · Büyük 230 ₺ |
| Berry Hibiscus | Normal 210 ₺ · Büyük 230 ₺ |
| Orange Mango | Normal 210 ₺ · Büyük 230 ₺ |

### Kahvesiz İçecekler (5)

_İç not, menüde yazmaz: grup Kahvesiz · renk mavi · Ne içsem'e dahil_

| Ürün | Fiyat |
|---|---|
| Portakal Suyu | 205 ₺ |
| Ballı Süt | 160 ₺ |
| Sıcak Çikolata | Normal 205 ₺ · Büyük 220 ₺ |
| Chai Tea Latte | Normal 205 ₺ · Büyük 220 ₺ |
| Sahlep | 205 ₺ |

### Çaylar (8)

_İç not, menüde yazmaz: grup Kahvesiz · renk mavi · sıcak · Ne içsem'e dahil_

| Ürün | Fiyat |
|---|---|
| Fincan Çay | 120 ₺ |
| Çay | 80 ₺ |
| Fas Nanesi | 160 ₺ |
| Hibiscus | 160 ₺ |
| Relax | 160 ₺ |
| Wake Up | 160 ₺ |
| Nar & Baharat | 160 ₺ |
| Kış Çayı | 160 ₺ |

### Meşrubat (10)

_İç not, menüde yazmaz: grup Kahvesiz · renk mavi · soğuk_

| Ürün | Fiyat |
|---|---|
| Kola | 130 ₺ |
| Fanta | 130 ₺ |
| Kutu Kola Vanilya | 200 ₺ |
| Kutu Kola Cherry | 200 ₺ |
| Su | 50 ₺ |
| Meyve Suyu | 130 ₺ |
| Beyoğlu Gazoz | 165 ₺ |
| Fuse Tea | 130 ₺ |
| Red Bull | 220 ₺ |
| Premium Soda | 165 ₺ |

### Ekmek Üstü (5)

_İç not, menüde yazmaz: grup Yiyecek · renk yeşil_

| Ürün | Fiyat |
|---|---|
| Caprese | 320 ₺ |
| Avokado & Ricotta | 290 ₺ |
| Norwegian | 400 ₺ |
| Garden | 280 ₺ |
| Füme Et & Yumurta | 350 ₺ |

### Sandviç & Börek (10)

_İç not, menüde yazmaz: grup Yiyecek · renk yeşil_

| Ürün | Fiyat |
|---|---|
| Peynirli Börek | 130 ₺ |
| Ispanaklı Börek | 130 ₺ |
| Füme Somonlu Sandviç | 400 ₺ |
| Summer Sandviç | 350 ₺ |
| Ton Balıklı Sandviç | 370 ₺ |
| Hindi Füme Sandviç | 320 ₺ |
| Karışık Şarküteri Sandviç | 390 ₺ |
| Akdeniz Sandviç | 290 ₺ |
| Morning Sando | 300 ₺ |
| Italy Sando | 350 ₺ |

### Kruvasan (3)

_İç not, menüde yazmaz: grup Yiyecek · renk yeşil_

| Ürün | Fiyat |
|---|---|
| Sade Kruvasan | 130 ₺ |
| Kruvasan Sandviç | 275 ₺ |
| Tatlı Kruvasan | 280 ₺ |

### Magnolia (3)

_İç not, menüde yazmaz: grup Tatlı · renk pembe_

| Ürün | Fiyat |
|---|---|
| Orman Meyveli Magnolia | 250 ₺ |
| Çikolatalı Magnolia | 250 ₺ |
| Fıstıklı Magnolia | 250 ₺ |

### Tatlılar (13)

_İç not, menüde yazmaz: grup Tatlı · renk pembe_

| Ürün | Fiyat |
|---|---|
| Cheesecake | 330 ₺ |
| Çikolatalı Kardelen | 310 ₺ |
| Rulo Pasta | 300 ₺ |
| Vişneli Brownie | 310 ₺ |
| Mousse Pasta | 310 ₺ |
| Yaban Mersinli Pasta | 300 ₺ |
| Çilekli Pasta | 300 ₺ |
| Bowl | 365 ₺ |
| Karamelli Pasta | 300 ₺ |
| Lotus Cheesecake | 330 ₺ |
| Fıstıklı Cheesecake | 330 ₺ |
| Beyaz Kardelen | 300 ₺ |
| Brownie | 285 ₺ |

### Cookies (4)

_İç not, menüde yazmaz: grup Tatlı · renk pembe_

| Ürün | Fiyat |
|---|---|
| Fıstıklı Cookie | 165 ₺ |
| Rocher Cookie | 165 ₺ |
| Triple Chocolate Cookie | 180 ₺ |
| Chocolate Chip Cookie | 170 ₺ |

### Paket Kahve (5)

_İç not, menüde yazmaz: grup Paket & Atıştırmalık · renk gri_

| Ürün | Fiyat |
|---|---|
| Türk Kahvesi · 200 g | 253 ₺ |
| Colombia Medellín · 200 g | 330 ₺ |
| Espresso Roast · 200 g | 330 ₺ |
| Ethiopia Sidamo · 200 g | 330 ₺ |
| Aç Demle Kahve | 385 ₺ |

### Kasa Önü (13)

_İç not, menüde yazmaz: grup Paket & Atıştırmalık · renk gri_

| Ürün | Fiyat |
|---|---|
| Züber | 130 ₺ |
| Ofresko Strawberry | 120 ₺ |
| Ofresko Melon | 120 ₺ |
| Ofresko Green Apple | 110 ₺ |
| Ofresko Fig | 140 ₺ |
| Ofresko Black Mulberry | 140 ₺ |
| Mini Oreo | 275 ₺ |
| Cips Sade | 130 ₺ |
| Cips Acılı | 130 ₺ |
| Cips Mantar | 130 ₺ |
| Züber Kids | 100 ₺ |
| Züber Granola | 130 ₺ |
| Züber Cips | 130 ₺ |

### Ekstralar

| Ekstra | Fiyat | Nerede görünür |
|---|---|---|
| Yumurta | +30 ₺ | Ekmek Üstü |
| Ekstra shot | +75 ₺ | Kahve ve içecek bölümleri |
| Bitkisel süt | +60 ₺ | Kahve ve içecek bölümleri |
| Sos ve aroma | +50 ₺ | Kahve ve içecek bölümleri |

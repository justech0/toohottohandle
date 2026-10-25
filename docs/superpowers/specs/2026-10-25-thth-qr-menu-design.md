# Too Hot To Handle — QR Menü Tasarım Belgesi (Spec) · Sürüm 2

- Tarih: 2026-10-25 (sürüm 2: gerçek ürün listesi, AI incelemeleri, font ve barındırma kararları işlendi; sürüm 2.1: ikinci AI incelemesi, gerçekçi 3D yolu; sürüm 2.2: basılı liste çıkarıldı, sayfa yeniden üretme yerine kısa önbellek, Android ayrıntıları; sürüm 2.3: önbellek, yedek ve fotoğraf silme ayrıntıları; sürüm 2.4: zamana bağlı önbellek yerine kayıtta geçersiz kılma, iki aşamalı geri yükleme)
- Adres: `toohottohandlecoffee.com/qr` (menü), `toohottohandlecoffee.com/qr/admin` (admin)
- Şube: yalnızca Batman (Petrol City AVM)
- Proje yürütücüsü: Enes
- Durum: Onay bekliyor

## 1. Amaç ve başarı ölçütü

Masadaki QR okutulunca açılan, markaya sadık ve hızlı bir menü yapılacak. Kafe menüyü kod bilmeden admin panelinden yönetecek.

Başarı ölçütleri:
1. Menü metni, mobil 4G'de 2,5 saniye içinde okunur hale gelir. Giriş animasyonu bunu geciktirmez. Ziyaretçi isteği veritabanına gitmediği için uyuyan veritabanını beklemez (5.2). Tek istisna, yeni yayından ya da admin kaydından sonraki ilk istektir; veritabanı uyuyorsa yaklaşık 0,5 sn uzar.
2. Menüyü ilk kez gören biri, örnek 5 ürünün (Caramel Macchiato, Ton Balıklı Sandviç, Lotus Cheesecake, Cool Lime, Fas Nanesi) her birini ortalama 10 saniyede bulur. Ölçüm en az 3 kişiyle, gerçek telefonda yapılır.
3. WiFi kullanıcı adı ve şifresi ayrı ayrı kopyalanır. Kopyalama çalışmazsa metin büyük yazıyla okunabilir.
4. Admin'de kaydedilen değişiklik, kayıt biter bitmez açılan her menüde görünür. Açık duran menüler, sekmeye dönüldüğünde kendini günceller.
5. Menü TR, EN ve AR dillerinde okunur. Arapça sağdan sola akar.
6. Repo gizlidir, repoda şifre veya anahtar bulunmaz. Maliyet verisi repoya, veritabanına ve menüye girmez.
7. Site Vercel'e bağımlı değildir. Hostinger'e taşımak için ortam değişkenlerini değiştirmek ve yeniden derlemek yeterlidir.

## 2. Marka varlıkları

### 2.1 Renkler

Marka paleti (`toohottohandle-renkler.pdf`, Pantone Solid Coated):

| Token | Pantone | Hex | Anlamı menüde |
|---|---|---|---|
| `red` | 485 C | `#DC2524` | Kahve grubu (espresso ve kahve bazlı), ana marka rengi |
| `yellow` | 100 C | `#F0EE40` | Vurgu: Yeni, Öne çıkan |
| `pink` | 2051 C | `#DDBBD1` | Tatlı grubu |
| `blue` | 3506 C | `#335DB2` | Kahvesiz grup (Cream Frappe, Matcha & Ube dahil) |
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
- Beyaz yazı yalnızca `red` ve `blue` zeminde kullanılır. `yellow`, `pink`, `green` ve `gray` zeminde yazı her zaman `ink` olur (yeşilde beyaz yalnızca 2,95 : 1 verir, sarı ve gride beyaz hiç okunmaz).
- Kodda bu token'lar dışında renk bulunmaz.

### 2.2 Fontlar

Kafenin BORELA ve Gotham lisansı doğrulanamadığı için açık lisanslı (SIL OFL) yakın fontlar kullanılır:

| Rol | Font | Yerine geçtiği | Nerede |
|---|---|---|---|
| Başlık | **Unbounded** (800) | BORELA | Kategori başlıkları, öne çıkan kart adları, rozetler, fiyat rakamları |
| Metin | **Montserrat** (500, 600) | Gotham / Gotham Rounded | Ürün adları, açıklamalar, arayüz, admin. Kalın yazı gereken yerde 600 kullanılır, 700 yüklenmez |
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

### 3.1 Giriş (oturumdaki ilk açılışta, en fazla 1,2 sn, her zaman 2D)

Giriş, yakında sayfasının dilini sürdürür ve tamamen SVG ve CSS ile çalışır:
1. Krem zemin. Kırmızı, alttan dalgalı kenarla ekranın yarısına kadar dolar.
2. HOT logosu dalganın üstünde ısınıp dalgalanır. TOO HOT / TO HANDLE iki satır olarak yerine oturur.
3. Logo küçülerek üst bara geçer, menü altından görünür.

- İlk kare HTML ile birlikte gelir, ek dosya beklemez. Girişte Three.js yüklenmez.
- Menü verisi ve metni giriş başlarken sayfada hazırdır. Ekrana dokunmak ya da "Geç" düğmesi girişi atlar.
- Hareket azaltma açıksa kısa bir kararma geçişi oynar. Ses yoktur.

3D, menü kullanılabilir hale geldikten sonra iki yerde devreye girer (5.3):
- **Üstteki HOT:** menünün en üstündeki büyük HOT logosu, 3D hazır olunca parlak kırmızı kabartmaya döner. Kendi kendine hareket etmez. Yalnızca kaydırmaya ve parmakla sürüklemeye hafifçe eğilerek tepki verir. 3D yoksa aynı yerde SVG logo durur.
- **"Ne içsem?" makaraları** (3.5).

### 3.2 Menü ekranı

- **Üst bar:** küçük TOO HOT / TO HANDLE logosu. Sağda arama, WiFi ve dil (TR / EN / AR).
- **Grup ve kategori şeridi** (yapışkan, iki ince sıra): üst sıra grup, alt sıra o grubun kategorileri. Her sıra tek satırdır, alt satıra kaymaz, parmakla yatay kaydırılır. Seçili kategori her zaman görünür alana kaydırılır. Liste kaydırıldıkça şeritteki seçim de kendiliğinden değişir. Beş grup (Kahve, Kahvesiz, Yiyecek, Tatlı, Paket & Atıştırmalık) ve altında kategoriler. Menüde yalnızca grup ve kategori adları yazar. Renk adı, sıcaklık gibi iç bilgiler yazmaz, renk yalnızca görsel olarak kullanılır. Seçili kategori kendi grup rengiyle dolar. Kategoriye geçerken dalga o rengin içinden geçer. Ekranda tek baskın hareket bu dalgadır.
- **Öne çıkan:** admin'de "öne çıkan" işaretli en fazla 6 ürün, en üstte büyük kartlarda durur. Elle kaydırılır, kendi kendine kaymaz. Etiketi "Öne çıkan"dır, "en çok satan" yazılmaz.
- **Ürün listesi:** tek sütun liste. Her satırda ad, varsa bir satır açıklama ve sağda fiyat bulunur. Her fiyatın yanında ₺ yazar. İki boylu üründe fiyat "Normal 210 ₺ · Büyük 230 ₺" biçimindedir. Fotoğrafı olan ürünün satırında küçük kare fotoğraf görünür. Fotoğrafı olmayan satır da eksik durmaz: menü bir kafe panosu gibi yalnızca yazıyla da tamamlanmış görünür. 768 px üstünde liste iki sütuna geçer.
- **Kategori başlıkları:** Unbounded, büyük harf, grup rengi. Kabartma görünümü statik CSS gölgesiyle verilir, hareket etmez.
- **Ekstralar:** yalnızca espresso ve süt bazlı kategorilerin sonunda tek satır: Sıcak Kahveler, Soğuk Kahveler, Coffee Frappe, Cream Frappe, Matcha & Ube. Metin: "Ekstra shot +75 ₺ · Bitkisel süt +60 ₺ · Sos ve aroma +50 ₺". Ekmek Üstü'nde: "Yumurta +30 ₺". Çaylar, Frozen, Meşrubat gibi kategorilerde ekstra satırı çıkmaz. Hangi ekstranın nerede görüneceği admin'den değiştirilebilir.
- **Tükendi:** ürün listede kalır, soluk görünür, fiyat yerine "Tükendi" yazar. "Ne içsem?" onu seçmez. Tükendi süresinin dolup dolmadığı sunucu saatine göre hesaplanır, telefonun saatine güvenilmez (5.2).
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
- Resmi slot kutusunun makaraları (dudak, tavşan, yıldız) döner. 3D hazırsa 3D, değilse SVG oynar. Makaralar dokunur dokunmaz döner, 3D'yi beklemez.
- Makara tavşanda durur. Tavşanın gözüne dalış geçişi ile seçilen içeceğin detayı açılır.
- Uygunluk ürün düzeyinde belirlenir. Seçilebilen ürün: görünür, tükenmemiş, "Ne içsem'e dahil" işaretli ve sıcaklık filtresine uyan içecek. Ürünün sıcaklığı boşsa kategorinin varsayılanı kullanılır. Yiyecek ve meşrubat varsayılan olarak dahil değildir.
- Seçime uyan ürün yoksa: "Şu an bu seçime uygun içecek yok. Diğer seçeneği dene." yazar.
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
| İlk açılışta bağlantı yok (kayıtlı menü yok) | "Menüye bağlanamadık. Bağlantını kontrol et ya da ekibimize sor." ve "Tekrar dene" düğmesi |
| Bağlantı yok ya da 2,5 sn'de yanıt yok (daha önce açılmışsa) | Son kaydedilen menü açılır, üstte "Bağlantı zayıf. Gösterilen menü: 25.10.2026 14:30" yazar |
| Fotoğraf yüklenemedi | Satır fotoğrafsız haliyle görünür |
| Veritabanına ulaşılamıyor | Menü son üretilmiş sayfadan sunulur, ziyaretçi farkı görmez |

### 3.12 iPhone ve Android farkları

| Konu | iPhone (Safari) | Android (Chrome, Samsung Internet) |
|---|---|---|
| QR'ı okutma | Kamera uygulaması Safari'de açar | Kamera ya da Google Lens çoğunlukla Chrome'da açar. Bazı QR uygulamaları ve Instagram kendi içindeki tarayıcıda açar, menü orada da tam çalışır |
| Geri tuşu | Kenardan kaydırma | Sistem geri tuşu ve geri hareketi. İkisi de yalnızca açık detayı ya da WiFi kartını kapatır |
| WiFi girişi | Giriş penceresi açılır, uygulama değiştirince kapanabilir | "Ağda oturum açın" bildirimi açılır. Kopyala ve yapıştır genelde çalışır, yine de bilgiler okunarak yazılabilecek büyüklükte |
| Kopyalama | Clipboard API çalışır (HTTPS) | Aynı. Uygulama içi tarayıcıda engellenirse seçme yedeği devreye girer |
| Yazı boyutu | Dinamik Yazı | Sistem yazı ölçeği (%130'a kadar sık). İkisinde de düzen bozulmaz |
| Ekran kenarı | Çentik ve alt çubuk için güvenli alan | Hareketli gezinme çubuğu ve kamera deliği için güvenli alan |
| Ekran yenileme | 60 Hz ya da 120 Hz | 60, 90 ya da 120 Hz. 3D testi bunu hesaba katar (5.3) |
| Veri tasarrufu | Bilgi vermez | Chrome "Lite/Veri tasarrufu" açıksa 3D yüklenmez |
| Admin'de fotoğraf | Safari HEIC'i yüklerken JPEG'e çevirir | Chrome HEIC açamaz. Samsung'un HEIC fotoğrafında 4.6'daki uyarı çıkar |

## 4. Admin paneli (`/qr/admin`)

Telefonda da rahat kullanılır. Metin fontu Montserrat'tır.

### 4.1 Giriş ve hesap

- E-posta ve şifre ile giriş yapılır. Kayıt sayfası yoktur.
- **İlk kurulum:** geliştirici `npm run admin:create` komutunu çalıştırır. Komut e-postayı ve şifreyi terminalde sorar, şifreyi ekrana basmaz, argon2id hash'ini veritabanına yazar. Tabloda zaten bir admin varsa çalışmaz.
- **Şifre sıfırlama:** tek admin olduğu için e-posta servisi kurulmaz. Geliştirici `npm run admin:reset-password` komutunu çalıştırır. Komut yeni şifreyi aynı şekilde terminalde sorar ve o admin'in bütün oturumlarını kapatır.
- **Deneme sınırı:** sayaç (IP adresi + e-posta) çifti için tutulur. Böylece başka yerden deneyen biri gerçek admin'i kilitleyemez. Kafe WiFi'ında aynı dış IP'yi paylaşan bir müşteri de admin'i dışarıda bırakamaz. IP adresi yalnızca barındırmanın kendi eklediği başlıktan okunur (Vercel'de platformun koyduğu `x-forwarded-for` ilk değeri, Hostinger'de sunucunun güvendiği vekil başlığı). Ziyaretçinin gönderdiği başlığa güvenilmez. Sıra şöyledir: (1) yalnızca `locked_until` okunur, kilitliyse şifre hiç kontrol edilmez; (2) şifre argon2id ile doğrulanır; (3) yanlışsa sayaç tek bir `INSERT … ON CONFLICT … DO UPDATE … RETURNING` sorgusuyla artırılır, 15 dakikalık pencere dolmuşsa sıfırdan başlar, 5. yanlıştan sonra `locked_until` katlanarak uzar (1, 2, 4, 8 dk, en fazla 15 dk); (4) doğruysa o çiftin sayacı silinir. Böylece admin art arda doğru girişlerle kendini kilitlemez, aynı anda gelen istekler de sayacı atlatamaz.
- "Tüm cihazlardan çıkış yap" düğmesi bulunur.
- Adımlar `docs/KULLANIM.md` içinde yazılıdır.

### 4.2 Ürünler

- Ekleme, düzenleme, çoğaltma ve sürükleyerek sıralama yapılır.
- Silinen ürün 30 gün çöp kutusunda kalır ve geri alınabilir. Zamanlanmış iş olmadığı için 30 günü geçenler ve eski fotoğraf dosyaları admin her giriş yaptığında temizlenir.
- **Fotoğraf dosyası silme kuralı:** ürün çoğaltılınca aynı fotoğraf dosyası iki üründe kullanılabilir. Bu yüzden bir dosya yalnızca hiçbir ürün (çöp kutusundakiler dahil) ve son 5 `menu_snapshots` kopyasından hiçbiri onu kullanmıyorsa ve 30 günden uzun süredir kullanılmıyorsa silinir. Kullanım durumu her temizlikte veritabanından yeniden hesaplanır.
- Alanlar: ad (dile göre isteğe bağlı), açıklama (TR/EN/AR), boy ve fiyat listesi (tek fiyat da bir satırdır; boy adı hazır listeden seçilir: Normal, Büyük, Tek, Duble), kategori, fotoğraf, içindekiler (3 dil), alerjenler ve "alerjen bilgisi girildi" anahtarı, kalori (boş bırakılabilir), sıcak/soğuk, etiketler, Yeni, Öne çıkan, Görünür.
- **Tükendi:** ürün satırında tek dokunuşluk anahtar. "Bugün tükendi" seçilince ürün, ertesi açılış saatinde (admin ayarı, varsayılan 08:00) kendiliğinden geri gelir. "Ben açana kadar" seçeneği de vardır.
- **Kaydedilmemiş değişiklik uyarısı:** sayfadan çıkarken sorar.
- **Fiyat değişikliği onayı:** kaydetmeden önce "210 ₺ → 230 ₺" biçiminde eski ve yeni fiyat gösterilir.

### 4.3 Toplu fiyat güncelleme

- Kategori ya da grup seçilir. Yüzde ya da sabit tutar girilir. Yuvarlama seçilir: yok, en yakın 5 ₺, en yakın 10 ₺.
- Önce önizleme tablosu çıkar (ürün, eski fiyat, yeni fiyat). "Uygula" denince tek seferde kaydedilir ve tek adımda geri alınabilir.

### 4.4 Değişiklik geçmişi ve geri alma

- Her kayıt geçmişe yazılır: kim, ne zaman, hangi kayıt, önce ve sonra.
- **WiFi şifresi geçmişte maskelenir.** Geçmişe yalnızca "WiFi şifresi değiştirildi" yazılır, eski ya da yeni şifre yazılmaz. Admin şifresi ve oturum bilgisi hiçbir zaman geçmişe girmez.
- Son 100 değişiklik okunabilir liste olarak görünür.
- **Geri al yalnızca iki yerde:** son yapılan değişiklik ve son toplu fiyat güncellemesi. Aradan eski bir kaydı geri almak, sonradan yapılan değişikliklerle çakışıp veriyi bozabileceği için yoktur.
- Silinen ürünler çöp kutusundan ayrıca geri getirilir (4.2).
- Kayıt doğrudan yayına çıkar. Taslak ve yayınla adımı yoktur.
- Kaydedilen değişiklik, kayıt biter bitmez açılan her menüde görünür.

### 4.5 Kategoriler, etiketler ve ayarlar

- Kategoriler: ad (3 dil), grup, sıralama, görünürlük, "Ne içsem'e dahil" varsayılanı ve varsayılan sıcak/soğuk. Ürün kendi değerini girerse kategorinin varsayılanını geçersiz kılar.
- Ekstralar: ad (3 dil), fiyat, hangi kategorilerde görüneceği.
- Gruplar: ad (3 dil), renk (yalnızca 6 marka renginden).
- Etiketler: hazır liste ve ekleme.
- Ayarlar: WiFi (ağ adı, kullanıcı adı, şifre, yönerge metni), açılış saati, alt bilgi notu (varsayılan: "Self servis · Servis ücreti alınmaz"). Hepsi admin'den girilir.
- Geliştirme ve demo için seed test değerleri koyar: ağ adı `HOT | WIFI`, kullanıcı adı `test`, şifre `test1234`, açılış saati 08:00. Admin ana sayfasında "WiFi test bilgisi kullanılıyor" uyarısı, gerçek bilgi girilene kadar durur.

### 4.6 Fotoğraf yükleme

- Fotoğraf önce telefonda, tarayıcının içinde küçültülür: uzun kenar 1600 px, WebP (desteklenmezse JPEG), en fazla 1,5 MB. Böylece Vercel'in 4,5 MB istek sınırına takılmaz.
- iPhone Safari, HEIC fotoğrafı seçerken JPEG'e çevirir. Android'de Chrome HEIC dosyasını açamaz. Tarayıcı fotoğrafı okuyamazsa şu metin çıkar: "Bu fotoğraf açılamadı. Fotoğrafı galeriden JPEG olarak kaydedip tekrar dene." Sunucuya hiç HEIC gelmez. Sunucudaki `sharp` paketi zaten HEIC açamaz.
- Sunucu gelen dosyanın türünü içeriğinden kontrol eder ve `sharp` ile yalnızca WebP üretir: 320, 720 ve 1280 px. AVIF üretilmez, çünkü yavaştır ve WebP bütün güncel telefonlarda çalışır. Vercel'in görsel servisi kullanılmaz.
- **Odak noktası:** fotoğraf seçilince önizleme açılır. Liste karesinde ürünün hangi kısmının görüneceği parmakla seçilir (varsayılan: orta). Sunucu kırpma yapmaz. Odak noktası kaydedilir ve tarayıcıda CSS `object-position` ile uygulanır. Odak sonradan değişirse fotoğrafın yeniden işlenmesi gerekmez.
- **Değiştirme ve silme:** fotoğraf değiştirilebilir ya da silinebilir. Silinince ürün fotoğrafsız haline döner. Eski dosyalar 30 gün sonra temizlenir (4.2).

### 4.7 İstatistik

- Bugün, son 7 gün ve son 30 gün için menü açılışı sayısı gösterilir. Açılış, aynı oturumda bir kez sayılır.
- En çok detayı açılan 10 ürün listelenir.
- "Saatlere göre menü açılışı" grafiği bulunur. Bu grafik kafe yoğunluğu ya da müşteri sayısı olarak adlandırılmaz.
- Ziyaretçi takibi için çerez ve kişisel veri kullanılmaz. Yalnızca toplam sayaçlar tutulur. Admin girişi kendi oturum çerezini kullanır.
- Menü açılışı oturumda bir kez gönderilir. Açılan detaylar telefonda biriktirilir. Sayfa arka plana geçince yalnızca henüz gönderilmemiş olanlar tek istekte gönderilir. Ziyaretçi WiFi'ye bağlanıp geri dönerse aynı sayaçlar ikinci kez gönderilmez.

### 4.8 QR

- Sabit adres: `toohottohandlecoffee.com/qr`.
- Admin'den logolu QR SVG olarak indirilir. Ortadaki logo okumayı bozmasın diye hata düzeltme seviyesi H (%30) kullanılır. Kenarda 4 modül boşluk bırakılır. Basılı boyut en az 3 × 3 cm'dir. QR'ın altında kısa adres yazılı durur.
- Basmadan önce gerçek masada en az bir iPhone ve iki Android telefonla okutma testi yapılır.

### 4.9 Yedek

- Admin'de "Yedek indir" düğmesi bir ZIP dosyası indirir. İçinde menü verisi (kategoriler, ürünler, ekstralar, ayarlar; admin hesabı ve WiFi şifresi hariç) JSON olarak ve bütün ürün fotoğrafları (1280 px WebP) bulunur. Böylece depo bozulsa da fotoğraflar geri gelir.
- Hazırlanırken ilerleme ("48 / 129 fotoğraf") ve İptal düğmesi görünür. Boyut fotoğraflara göre değişir. Sunucu 1280 px WebP dosyasını en fazla 400 KB olacak şekilde kaydeder (gerekirse kaliteyi düşürür), bu yüzden 129 fotoğraf en fazla yaklaşık 52 MB, genelde bunun yarısından azdır. Ekranda "Bilgisayardan almak daha hızlıdır" notu bulunur.
- ZIP sunucuda değil tarayıcıda hazırlanır, böylece sunucu yanıt sınırına takılmaz. Fotoğraflar depodan doğrudan değil, admin oturumu isteyen aynı alan adındaki `/qr/api/admin/image/[key]` adresinden tek tek çekilir. Depo farklı bir alan adında olduğu için doğrudan çekmek CORS engeline takılırdı. Bu yol Vercel Blob'da da R2'de de aynı çalışır. Akış halinde ZIP üretiminin iPhone Safari ve Android Chrome'da çalıştığı gerçek cihazda test edilir.
- **Yedekten geri yükleme sırası:** (1) ZIP tarayıcıda açılır ve doğrulanır: JSON biçimi, sürüm, her ürünün fotoğrafının ZIP'te bulunması. Hata varsa hiçbir şey gönderilmez. (2) Yedekteki kategori, ürün ve fotoğraf sayısı gösterilip onay istenir. (3) Fotoğraflar yeni anahtarlarla depoya tek tek yüklenir (her biri 4,5 MB sınırının çok altında). Biri bile başarısız olursa işlem durur, menüye dokunulmaz. (4) Hepsi yüklenince JSON sunucuya gönderilir. Sunucu önce mevcut menünün kopyasını `menu_snapshots`'a alır, sonra bütün anahtarların depoda var olduğunu kontrol eder ve menüyü tek bir veritabanı işleminde (transaction) değiştirir. Herhangi bir adım hata verirse eski menü olduğu gibi kalır. Yarıda kalan yüklemelerden artan dosyalar 30 günlük temizlikte silinir.
- **Geri yüklemeden önce güvence:** tarayıcı indirmesi engellenebileceği için ona güvenilmez. Sunucu, üzerine yazmadan önce mevcut menünün kopyasını veritabanında `menu_snapshots` tablosuna alır. Kopya alınamazsa geri yükleme başlamaz. Son 5 kopya tutulur, admin'den tek dokunuşla geri dönülür. Eski fotoğraflar 30 gün silinmediği için kopyayla birlikte geri gelir.
- **WiFi:** WiFi şifresi yedeğe girmez. Geri yüklemede mevcut WiFi ağ adı, kullanıcı adı ve şifresi olduğu gibi korunur. Ekranda "WiFi bilgileri değiştirilmedi" yazar.
- Ayrıca veritabanı sağlayıcısının kendi geri dönüş özelliği kullanılır.
- Admin ana sayfasında "Son yedek: 12 gün önce" yazar (`last_backup_at`). 30 günü geçince uyarı kırmızıya döner. Ayda bir yedek almak `docs/KULLANIM.md`'de rutin olarak yazılıdır.

### 4.10 İzleme ve haber verme

- **Site erişilemezse:** ücretsiz bir erişim izleme servisi (ör. UptimeRobot) `/qr/api/health` adresini 5 dakikada bir kontrol eder. Bu adres veritabanına dokunmaz, yalnızca uygulamanın ayakta olduğunu söyler. Böylece izleme, veritabanını gece boyu uyandırmaz. Site açılmazsa Enes'e e-posta gider. Devirden sonra kafenin e-postası da eklenir.
- **Sunucu hataları:** yalnızca barındırmanın kendi panelinde okunur (Vercel'de Logs, Hostinger'de kendi kayıtları). Admin'de ayrı bir hata ekranı yoktur. Kayda şifre ve kişisel veri yazılmaz.
- **Yedek:** otomatik yedek olmadığı için bildirim yerine 4.9'daki son yedek uyarısı kullanılır.

## 5. Teknik mimari

### 5.1 Repo ve klasör düzeni

- Repo `justech0/toohottohandle`, **gizli** olacak (GitHub → Settings → Change visibility → Private).
- Yakında sayfası `public/yakinda/` klasörüne aynen taşınır. `/` adresi `next.config` içindeki yeniden yönlendirme (rewrite) ile bu sayfayı göstermeye devam eder. Sayfanın dosya yolları ve stilleri değişmez.
- QR menü ve admin aynı repoda, tek bir Next.js uygulamasıdır.

```
AGENTS.md                tüm AI'lar için kalıcı kurallar
docs/PROJECT_STATE.md    şu anki durum, sıradaki işler
docs/DECISIONS.md        kararlar ve nedenleri
docs/DESIGN_SYSTEM.md    renk, font, hareket token'ları
docs/KULLANIM.md         kafe için kısa kullanım ve devir rehberi
docs/superpowers/        spec ve planlar
public/yakinda/          canlı yakında sayfası (değişmeden)
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
| Önbellek | Next.js veri önbelleği, `menu` etiketiyle. Yalnızca admin kaydında geçersiz kılınır | Aynı, tek sunucunun diskinde (Next.js varsayılanı) |
| Zamanlanmış iş | Yok. Tükendi süresi okunurken hesaplanır | Aynı |
| İstatistik | Kendi tablolarımız | Aynı |

- Taşıma adımları `docs/KULLANIM.md`'de yazılıdır: ortam değişkenlerini kopyala, depo dosyalarını aktar, DNS'i çevir.
- **Zamana bağlı yenileme yoktur.** Menü verisi (`getMenu`) Next.js'in veri önbelleğinde `menu` etiketiyle tutulur ve süresi dolmaz. Ziyaretçi istekleri yalnızca bu önbellekten okur, veritabanına hiç gitmez. Admin bir şey kaydettiğinde aynı istek içinde `updateTag('menu')` çağrılır. Önbellek o an boşalır ve bir sonraki istek yeni veriyi veritabanından bir kez alıp önbelleğe koyar. Böylece hem kesin güncellik hem hız sağlanır: değişiklik kayıt biter bitmez görünür, ziyaretçi ise veritabanını hiç beklemez.
- Önbellek yalnızca yeni yayında ve admin kaydında boşalır. Bu iki anın dışında veritabanı ziyaretçi yüzünden hiç uyanmaz. Veritabanına ulaşılamazsa önbellekteki son veri sunulmaya devam eder.
- Vercel'de veri önbelleği kalıcıdır ve bütün örneklerde ortaktır. Hostinger'de tek Node sunucusunda Next.js bunu varsayılan olarak diskte tutar. Birden fazla sunucuya geçilirse ortak önbellek gerekir (Next.js self-hosting belgesi). Tek sunucu varsayılır.

- **Tek kaynak:** menü sayfası ve `/qr/api/menu` aynı `getMenu` fonksiyonundan ve aynı önbellek kaydından beslenir. Tarayıcı ya da CDN tarafında ayrı bir süreli önbellek yoktur (`Cache-Control: private, no-cache`). Bu yüzden ilk ekran ile sonraki yenileme arasında fiyat farkı oluşmaz.
- **Açık duran menü:** sekmeye dönüldüğünde `/qr/api/menu` adresinden veriyi yeniden ister. Sayfa ile aynı önbellekten geldiği için ilk ekran ile sonraki yenileme arasında fiyat farkı oluşmaz. Veri değişmişse ekran sessizce yenilenir.
- **Tükendi ve saat:** her yanıtta sunucunun o anki zamanı bulunur. Telefon kendi saatiyle arasındaki farkı hesaplar ve tükendi süresini sunucu saatine göre değerlendirir. Telefonun saati yanlış olsa da sonuç doğru çıkar.
- **Saat dilimi:** sunucular UTC çalışır. Açılış saati ve "ertesi açılış" hesabı her yerde açıkça `Europe/Istanbul` ile yapılır. Tarihler veritabanında UTC saklanır.
- **Service worker:** yalnızca menü sayfasını, `/qr/api/menu` yanıtını, fontları ve logo dosyalarını saklar. Önce ağa gider. 2,5 saniyede yanıt gelmezse saklanan menüyü gösterir. `/qr/admin` ve diğer `/qr/api/` adreslerine hiç karışmaz. Daha önce hiç açılmamışsa 3.11'deki bağlantı ekranı çıkar.
- **Adres düzeni:** bütün API adresleri `/qr/api/` altındadır: `/qr/api/menu`, `/qr/api/stats`, `/qr/api/health` ve admin için `/qr/api/admin/*`.

### 5.3 3D

Three.js kalır, ama hiçbir şeyi bekletmeyecek şekilde kullanılır.

- **Ne zaman yüklenir:** menü açılıp giriş bittikten sonra, tarayıcı boşta kalınca (`requestIdleCallback`, yoksa 2 sn sonra) düşük öncelikle indirilir. Giriş sırasında, ilk boyamada ve arama yazarken yüklenmez.
- **Kimde yüklenir:** WebGL2 var, veri tasarrufu kapalı, hareket azaltma kapalı ve tarayıcı bağlantı bilgisi veriyorsa bağlantı 2G/3G değil. iOS Safari bellek ve bağlantı bilgisi vermediği için bu iki koşul orada atlanır. Ölçüm, tahminden daha güvenilir olduğu için asıl karar şu testle verilir:
- **Performans testi:** sahne ekran dışında 30 kare çizer. Ortalama kare süresi 28 ms'yi aşarsa 3D o cihazda kapatılır ve karar oturum boyunca hatırlanır. Eşik bilerek yüksek tutulur: 60 Hz ekranda normal kare süresi zaten 16,7 ms'dir, küçük dalgalanmalar güçlü telefonu 2D'ye düşürmemelidir. 90 ve 120 Hz Android ekranlarda kareler daha kısa olduğu için test aynı eşikle doğru çalışır. Böylece zayıf iPhone ya da Android SVG ile devam eder.
- **Nerede kullanılır:** menü üstündeki büyük HOT kabartması ve "Ne içsem?" makaraları (3.1, 3.5). İkisi aynı küçük sahne modülünü paylaşır.
- **Geçiş:** 3D hazır olunca SVG logo ile 3D logo aynı yerde, aynı boyda üst üste konur ve 200 ms'lik yumuşak geçişle değişir. Kullanıcı ekranı kaydırıyorsa değişim kaydırma bitince yapılır.
- **Yapım:** logo ve ikon SVG'leri `SVGLoader` ve `ExtrudeGeometry` ile kabartılır. Malzeme parlak kırmızıdır, gölge yoktur. Sahne görünmezken (ekran dışı ya da sekme arka planda) çizim durur.
- **Bütçe:** Three.js (yalnızca gereken modüller) ve sahne birlikte en fazla 180 KB gzip. Piksel oranı en fazla 2.

### 5.4 Veri modeli

`groups`: `id`, `slug`, `name_tr`, `name_en`, `name_ar`, `color` (red | yellow | pink | blue | green | gray), `sort_order`

`categories`: `id`, `slug`, `group_id`, `name_tr`, `name_en`, `name_ar`, `sort_order`, `is_visible`, `default_in_suggest` (Ne içsem'e dahil varsayılanı), `default_temp` (hot | cold | null)

`products`: `id`, `slug`, `category_id`, `name`, `name_en`, `name_ar` (boşsa `name`), `desc_tr`, `desc_en`, `desc_ar`, `ingredients_tr`, `ingredients_en`, `ingredients_ar`, `kcal` (null olabilir, 0 anlamına gelmez), `allergens` (dizi, 14 kod), `allergens_entered` (bool, "alerjen bilgisi girildi"), `temp` (hot | cold | null → kategoriden gelir), `in_suggest` (bool | null → kategoriden gelir), `image_key`, `image_focus_x`, `image_focus_y` (0–1, varsayılan 0,5), `is_new`, `is_featured`, `is_visible`, `sold_out_until` (null | zaman | "süresiz" için uzak tarih), `sort_order`, `updated_at`, `deleted_at`

`product_variants`: `id`, `product_id`, `label_key` (null = tek fiyat; normal | buyuk | tek | duble | custom), `label_tr`, `label_en`, `label_ar` (yalnızca custom için; diğerleri arayüz sözlüğünden çevrilir, boş dil TR'ye düşer), `price_kurus` (tam sayı), `sort_order`. Her üründe en az bir satır bulunur. Tek fiyat yapısı budur, ayrı `price` sütunu yoktur.

`extras`: `id`, `name_tr`, `name_en`, `name_ar`, `price_kurus`, `scope` (category_id listesi), `sort_order`

`tags`, `product_tags`: `id`, `label_tr`, `label_en`, `label_ar`, `group_color`

`settings` (tek satır): `wifi_ssid`, `wifi_username`, `wifi_password`, `wifi_note_tr/en/ar`, `opening_time`, `footer_note_tr/en/ar`, `last_backup_at`

`menu_snapshots`: `id`, `at`, `reason` (ör. "geri yükleme öncesi"), `data` (JSON, WiFi şifresi hariç). Son 5 kayıt tutulur.

`audit_log`: `id`, `admin_id`, `at`, `entity`, `entity_id`, `action`, `before` (JSON), `after` (JSON). WiFi şifresi alanı yazılmadan önce `"[değiştirildi]"` ile değiştirilir.

`stats_daily`: `date`, `menu_opens`; `stats_hourly`: `date`, `hour`, `opens`; `stats_product`: `date`, `product_id`, `views`

`admins`: `id`, `email`, `password_hash` (argon2id), `created_at`, `last_login_at`; `sessions`: `id_hash`, `admin_id`, `expires_at`; `login_attempts`: `key_hash` (IP + e-posta, birincil anahtar), `fail_count`, `window_started_at`, `locked_until`

Maliyet, COGS ve zam oranı hiçbir tabloda yoktur.

### 5.5 Güvenlik

- Şifre hash'i argon2id. Oturum çerezi HttpOnly, Secure, SameSite=Strict. Veritabanında oturum kimliğinin yalnızca hash'i tutulur.
- Admin işlemlerinde CSRF koruması ve sunucu tarafında doğrulama (zod) yapılır.
- Giriş deneme sınırı uygulanır.
- Yüklenen dosyanın türü içeriğinden doğrulanır. Boyut sınırı vardır. Dosya adı rastgele üretilir. EXIF verisi silinir.
- Güvenlik başlıkları: CSP, X-Content-Type-Options, Referrer-Policy, frame-ancestors 'none'.
- **Arama motoru:** `/qr/admin` ve `/qr/api` altındaki her yanıtta `X-Robots-Tag: noindex, nofollow` başlığı ve admin sayfalarında `noindex` meta etiketi bulunur. `robots.txt` bu iki yolu kapatır. Menünün kendisi (`/qr`) aranabilir kalır.
- Anahtarlar yalnızca barındırma ortam değişkenlerinde durur. Repoda yalnızca `.env.example` bulunur. Şifre ve anahtar sohbete veya AI'a yazılmaz.

### 5.6 Performans bütçesi

- Menü LCP ≤ 2,5 sn (mobil 4G), CLS ≤ 0,1, INP ≤ 200 ms.
- İlk yüklemede JS ≤ 100 KB gzip (3D hariç).
- Fontlar: Türkçe karakterler (ğ Ğ ı İ ş Ş) ve ₺ latin-ext alt kümesinde olduğu için ilk yükleme latin ve latin-ext'i birlikte içerir. İki alt küme tek dosyada birleştirilir, böylece Türkçe harf için ikinci istek ve font sıçraması olmaz. Yüklenen ağırlıkların tamamı budur: Unbounded 800, Montserrat 500 ve 600, toplam ≤ 110 KB. Başka ağırlık yoktur. Readex Pro (400, 600) yalnızca AR seçilince yüklenir.
- Liste fotoğrafı 320 px WebP (yüksek çözünürlüklü ekranda 160 px kareye net basılır), 20–25 KB. Detay fotoğrafı 720 ve 1280 px `srcset` ile verilir.

### 5.7 Barındırma ve maliyet

- Şimdilik Vercel Hobby (ücretsiz). Hobby planı kişisel ve ticari olmayan kullanım içindir. Kafe menüsü canlıya çıkınca ücretli plana ya da Hostinger'e geçilir. Geçiş kararı ve takvimi Enes'tedir.
- Neon ücretsiz planı ayda 100 CU-saat ve 1 GB veri verir. Ücretsiz planda veritabanı 5 dakika boşta kalınca uyur, bu kapatılamaz. Menü okumaları ve site izleme veritabanına dokunmaz. Veritabanını yalnızca admin işlemleri, admin kaydından sonraki ilk menü isteği ve istatistik yazmaları uyandırır. Neon panelinde en büyük işlem gücü 0,25 CU'ya sabitlenir. Kafe açıkken (günde yaklaşık 12 saat) istatistik yazmaları yüzünden hiç uyumasa bile ayda yaklaşık 93 CU-saat eder, gece hiç harcamaz. Bu ayar kurulumda Neon panelinde doğrulanır. Gerekirse istatistik yazması admin'den tek düğmeyle kapatılır.

### 5.8 Devir

- Alan adı, barındırma, veritabanı ve GitHub hesapları için kimin sahip olacağı yayın öncesi Enes ve kafeyle netleşir. Hesapların kafe adına açılması ve Enes'in üye olması önerilir.
- `docs/KULLANIM.md`: ürün ekleme, tükendi, toplu zam, yedek, şifre sıfırlama, taşıma adımları. Kısa, ekran görüntülü, Türkçe.
- Şifreler devirde yüz yüze ya da şifre yöneticisiyle verilir. Repoya ve sohbete yazılmaz.

## 6. İçerik

### 6.1 Kaynak

- Ürün listesi ve fiyatlar `SATIŞ ve MALİYET SON 1.xlsx` dosyasından gelir. Yalnızca "Ürün Adı", "Kategori" ve "Yeni Fiyat" sütunları kullanılır. Maliyet, COGS ve zam oranı okunmaz.
- Excel dosyası repoya konmaz. Dönüştürülmüş liste `db/seed/menu.json` olarak repoya girer. Bu dosyada maliyet sütunu yoktur.
- Ürün fiyatları ve ekstraların kendi fiyatları Excel'deki "Yeni Fiyat" sütunundan olduğu gibi alınır. Ekstralar ürün fiyatına dahil değildir, ayrıca ücretlidir ("+75 ₺" gibi). Küsurlu fiyatlar (176, 198, 231, 253, 187) değiştirilmez. Yalnızca Excel'in hesap kalıntısı temizlenir (229,999999 → 230).
- Gruplar içeriğe göre ayrılır: Cream Frappe ve Matcha & Ube kahve içermediği için Kahvesiz grubundadır. Kruvasan kategorisi (Tatlı Kruvasan dahil) Yiyecek grubundadır.
- Ürün düzeyinde sıcaklık: Kahvesiz İçecekler kategorisi sıcak varsayılır, Portakal Suyu soğuk işaretlenir.
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
| A0 | Gizli repo, `public/yakinda/` taşıma ve `/` yönlendirmesi, Next.js iskeleti, fontlar, logo ve ikon SVG'leri, Excel → `menu.json` dönüştürme | `/` yakında sayfası aynen çalışır, build geçer, seed 129 ürünü yükler |
| A1 | Menü ekranı, arama, detay, WiFi kartı, 3 dil ve RTL, 2D giriş, service worker | 390, 768 ve 1440 px'te ekran görüntüsü kontrolü, gerçek ürün listesiyle |
| A2 | Veritabanı, admin, yükleme, toplu fiyat, geçmiş ve geri al, tükendi, ZIP yedek, istatistik, QR | Bölüm 8 testleri geçer |
| A3 | 3D HOT kabartması ve 3D "Ne içsem?" (tavşan gözü geçişi), performans testi ve SVG yedekleri, alerjen simgeleri, etiket ve rozet seti | 3D bütçe içinde, zayıf cihazda ve iOS'ta test sonucuna göre doğru yol seçilir, menü 3D'yi hiç beklemez |
| A4 | QA, gerçek cihaz testi, yayın, QR baskı testi, `KULLANIM.md` | `/qr` canlıda, 3 telefonda okutuldu |

AI'ların iş bölümü ve devir kuralları her aşamanın uygulama planında yazılır.

## 8. Test

- Sunucu ve istemci mantığı (doğrulama, giriş, oturum, deneme sınırının aynı anda gelen isteklerde doğru sayması, yükleme kontrolü, toplu fiyat hesabı, tükendi süresinin Europe/Istanbul ile hesabı, "Ne içsem?" uygunluk filtresi, WiFi şifresinin geçmişte maskelenmesi, Türkçe arama eşlemesi, seed dönüştürme) için birim testleri yazılır. Test koddan önce yazılır.
- Playwright testleri:
  - Menü: açılış, kategori geçişi, arama (sonuçlu ve sonuçsuz), detay açma ve kapama (geri tuşu dahil), WiFi kopyalama, dil değişimi, AR'de RTL, tükendi görünümü, bağlantısız açılış.
  - Admin: giriş, ürün ekleme, çoğaltma, fotoğraf yükleme (JPEG ile) ve odak noktası, sıralama, tükendi, toplu fiyat önizleme ve uygulama, son değişikliği geri alma, WiFi değiştirme, yedek indirme (ilerleme ve iptal), geri yükleme, fotoğraf yüklemesi yarıda kalırsa menünün değişmemesi, kopya alınamazsa geri yüklemenin başlamaması, geri yüklemede WiFi'ın korunması, çoğaltılmış üründe fotoğrafın silinmemesi.
  - Admin ve API yanıtlarında `noindex` başlığı.
  - Admin kaydından sonra menünün hemen güncellenmesi, `/qr/api/health` isteğinin veritabanına gitmemesi.
- Ekran görüntüsü kontrolü: 390, 768, 1440 px.
- Lighthouse mobil: performans ≥ 85, erişilebilirlik ≥ 95.
- Güvenlik taraması.
- Gerçek cihaz testi, kafe WiFi'ı ve mobil veri ile:
  - iPhone: Safari, %200 metin büyütme, admin'den HEIC fotoğraf yükleme.
  - Orta seviye Android (ör. Samsung Galaxy A serisi): Chrome ve Samsung Internet, sistem yazı ölçeği %130, hareketli gezinme, geri tuşu, Samsung HEIC fotoğrafında uyarı metni.
  - Uygulama içi tarayıcılar: Instagram ve bir QR okuyucu uygulaması içinden açılış, kopyalama yedeği.
  - 3D testi: bir eski ve bir yeni telefonda doğru yolun (3D ya da SVG) seçildiği.
- Playwright'ın Linux tarayıcıları HEIC açamaz. HEIC yalnızca gerçek telefonda test edilir, otomatik testler JPEG kullanır.
- Bulma süresi testi (Bölüm 1, madde 2).

## 9. Kapsam dışı (v1)

- Diğer şube(ler)
- Sipariş ve ödeme
- Otomatik çeviri
- Çok kullanıcılı admin rolleri
- Müzik ve ses
- Ürün videosu
- Basılı menü ve basılı fiyat listesi (kafenin kendi işi)
- Admin'de hata kayıtları ekranı
- Taslak ve yayınla akışı (yerine geçmiş ve son değişikliği geri alma var)
- Geçmişten eski bir kaydı tek tek geri alma

## 10. Riskler

- **Gerçek fotoğraf, açıklama ve alerjen yok.** Menü yazı ağırlıklı başlar, tasarım bunu kaldıracak şekilde kurulur. Alerjenler admin'den girilene kadar gizli kalır.
- **Vercel Hobby ticari kullanıma izin vermez.** Canlıya çıkışta ücretli plana ya da Hostinger'e geçilir.
- **Neon compute süresi.** İstatistik yazmaları sınırı zorlarsa istatistik kapatılır ya da plan yükseltilir.
- **Unbounded genişliği.** Uzun ürün adlarında Montserrat kullanılarak çözülür. Kategori başlıkları dar ekranda iki satıra iner.
- **3D ağırlığı.** 3D yalnızca menü açıldıktan sonra, boşta yüklenir ve performans testini geçen cihazda açılır. Menü ve giriş hiçbir zaman 3D'yi beklemez.

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

_İç not, menüde yazmaz: grup Kahvesiz · renk mavi · soğuk · Ne içsem'e dahil_

| Ürün | Fiyat |
|---|---|
| Chocolate Cream Frappe | Normal 230 ₺ · Büyük 250 ₺ |
| Strawberries & Cream Frappe | Normal 230 ₺ · Büyük 250 ₺ |
| Vanilla Cream Frappe | Normal 230 ₺ · Büyük 250 ₺ |
| Caramel Cream Frappe | Normal 230 ₺ · Büyük 250 ₺ |
| White Mocha Cream Frappe | Büyük 250 ₺ |
| White Chocolate Cream Frappe | Normal 230 ₺ |

### Matcha & Ube (3)

_İç not, menüde yazmaz: grup Kahvesiz · renk mavi · soğuk · Ne içsem'e dahil_

| Ürün | Fiyat |
|---|---|
| Ube Latte | 280 ₺ |
| Ube Vanilya Matcha Latte | 280 ₺ |
| Strawberry Matcha Latte | 280 ₺ |

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

_İç not, menüde yazmaz: grup Kahvesiz · renk mavi · sıcak · Ne içsem'e dahil_

| Ürün | Fiyat |
|---|---|
| Portakal Suyu | 205 ₺ (iç not: soğuk) |
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
| Ekstra shot | +75 ₺ | Sıcak Kahveler, Soğuk Kahveler, Coffee Frappe, Cream Frappe, Matcha & Ube |
| Bitkisel süt | +60 ₺ | Sıcak Kahveler, Soğuk Kahveler, Coffee Frappe, Cream Frappe, Matcha & Ube |
| Sos ve aroma | +50 ₺ | Sıcak Kahveler, Soğuk Kahveler, Coffee Frappe, Cream Frappe, Matcha & Ube |

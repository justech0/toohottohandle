# Too Hot To Handle — QR Menü Tasarım Belgesi (Spec) · Sürüm 2

- Tarih: 2026-10-25 (sürüm 2: gerçek ürün listesi, AI incelemeleri, font ve barındırma kararları işlendi; sürüm 2.1: ikinci AI incelemesi, gerçekçi 3D yolu; sürüm 2.2: basılı liste çıkarıldı, sayfa yeniden üretme yerine kısa önbellek, Android ayrıntıları; sürüm 2.3: önbellek, yedek ve fotoğraf silme ayrıntıları; sürüm 2.4: zamana bağlı önbellek yerine kayıtta geçersiz kılma, iki aşamalı geri yükleme; sürüm 2.5: üçüncü göz incelemesi, Next.js 16 önbellek gerçekleri, ayrı istatistik veritabanı, sadeleştirme)
- Adres: `toohottohandlecoffee.com/qr` (menü), `toohottohandlecoffee.com/qr/admin` (admin)
- Şube: yalnızca Batman (Petrol City AVM)
- Proje yürütücüsü: Enes
- Durum: Onay bekliyor

## 1. Amaç ve başarı ölçütü

Masadaki QR okutulunca açılan, markaya sadık ve hızlı bir menü yapılacak. Kafe menüyü kod bilmeden admin panelinden yönetecek.

Başarı ölçütleri:
1. Menü metni, mobil 4G'de 2,5 saniye içinde okunur hale gelir. Giriş animasyonu bunu geciktirmez. Menü okumaları çoğunlukla önbellekten gelir. Önbellek boşsa (yeni yayın, admin kaydı ya da önbelleğin kendiliğinden temizlenmesi) istek veritabanına gider ve veritabanı uyuyorsa yaklaşık 0,5 sn uzar. Hedef bu durumda da 2,5 sn'dir.
2. Menüyü ilk kez gören biri, örnek 5 ürünün (Caramel Macchiato, Ton Balıklı Sandviç, Lotus Cheesecake, Cool Lime, Fas Nanesi) her birini ortalama 10 saniyede bulur. Ölçüm en az 3 kişiyle, gerçek telefonda yapılır.
3. WiFi kullanıcı adı ve şifresi ayrı ayrı kopyalanır. Kopyalama çalışmazsa metin büyük yazıyla okunabilir.
4. Admin'de kaydedilen değişiklik, kayıt biter bitmez açılan her menüde görünür. Açık duran menüler, sekmeye dönüldüğünde kendini günceller.
5. Menü TR, EN ve AR dillerinde okunur. Arapça sağdan sola akar.
6. Repo gizlidir, repoda şifre veya anahtar bulunmaz. Maliyet verisi repoya, veritabanına ve menüye girmez.
7. Site Vercel'e bağımlı değildir. Hostinger'e geçiş adımları: ortam değişkenlerini aktarmak, yeniden derlemek, fotoğrafları yeni depoya taşımak (depo değişirse) ve DNS'i çevirmek (5.2).

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
- **Grup ve kategori şeridi** (yapışkan, iki ince sıra): üst sıra grup, alt sıra o grubun kategorileri. Her sıra tek satırdır, alt satıra kaymaz, parmakla yatay kaydırılır. Şeritteki sekmeler Montserrat 600 ile yazılır (Unbounded geniş olduğu için şeritte kullanılmaz). Seçili kategori her zaman görünür alana kaydırılır. Liste kaydırıldıkça şeritteki seçim de kendiliğinden değişir. Beş grup (Kahve, Kahvesiz, Yiyecek, Tatlı, Paket & Atıştırmalık) ve altında kategoriler. Menüde yalnızca grup ve kategori adları yazar. Renk adı, sıcaklık gibi iç bilgiler yazmaz, renk yalnızca görsel olarak kullanılır. Seçili kategori kendi grup rengiyle dolar. Kategoriye geçerken dalga o rengin içinden geçer. Ekranda tek baskın hareket bu dalgadır.
- **Öne çıkan:** admin'de "öne çıkan" işaretli en fazla 6 ürün, en üstte büyük kartlarda durur. Elle kaydırılır, kendi kendine kaymaz. Etiketi "Öne çıkan"dır, "en çok satan" yazılmaz.
- **Ürün listesi:** tek sütun liste. Her satırda ad, varsa bir satır açıklama ve sağda fiyat bulunur. Her fiyatın yanında ₺ yazar. İki boylu üründe fiyat "Normal 210 ₺ · Büyük 230 ₺" biçimindedir. Her boy-fiyat çifti ayrı bir kutuda (`<bdi>`) durur, böylece Arapça modda ad ile rakam yer değiştirmez. Fotoğrafı olan ürünün satırında küçük kare fotoğraf görünür. Fotoğrafı olmayan satır da eksik durmaz: menü bir kafe panosu gibi yalnızca yazıyla da tamamlanmış görünür. 768 px üstünde liste iki sütuna geçer.
- **Kategori başlıkları (liste içinde):** Unbounded 800, büyük harf, grup rengi. Kabartma görünümü statik CSS gölgesiyle verilir, hareket etmez.
- **Ekstralar:** yalnızca espresso ve süt bazlı kategorilerin sonunda tek satır: Sıcak Kahveler, Soğuk Kahveler, Coffee Frappe, Cream Frappe, Matcha & Ube. Metin: "Ekstra shot +75 ₺ · Bitkisel süt +60 ₺ · Sos ve aroma +50 ₺". Ekmek Üstü'nde: "Yumurta +30 ₺". Çaylar, Frozen, Meşrubat gibi kategorilerde ekstra satırı çıkmaz. Hangi ekstranın nerede görüneceği admin'den değiştirilebilir.
- **Tükendi:** ürün listede kalır, soluk görünür, fiyat yerine "Tükendi" yazar. "Ne içsem?" onu seçmez. Tükendi süresinin dolup dolmadığı sunucu saatine göre hesaplanır, telefonun saatine güvenilmez (5.2).
- **Alt bilgi:** "Self servis · Servis ücreti alınmaz · Fiyatlara KDV dahildir · Son güncelleme: 25.10.2026". Tarih, menüde görünen herhangi bir şey (ürün, fiyat, ekstra, kategori, alt bilgi) her kaydedildiğinde güncellenen `menu_updated_at` alanından gelir. Alt bilgi metni admin'den değiştirilebilir.

### 3.3 Arama

- Üstten açılır. Yazdıkça ürün adı, açıklama ve içindekilerde arar. Üç dilde çalışır.
- Türkçe harfler eşit sayılır: "fistik" yazan "Fıstıklı"yı bulur (ı/i/İ, ş/s, ç/c, ğ/g, ö/o, ü/u). Diğer aksanlar da Unicode NFD ile temizlenir: "caffe" Caffè Latte'yi, "medellin" Colombia Medellín'i bulur.
- Sonuç yoksa şu metin çıkar: "Aradığını bulamadık. Ekibimiz sana yardımcı olabilir." (EN: "We couldn't find that. Our team is happy to help." AR: "لم نجد ما تبحث عنه. فريقنا يسعده مساعدتك.") Altında aramayı temizle düğmesi bulunur.

### 3.4 Ürün detayı

- Satıra dokununca detay alttan açılır. Açılırken tarayıcı geçmişine bir kayıt eklenir. Telefonun geri tuşu detayı kapatır, menüden çıkarmaz. × düğmesi de `history.back()` ile kapatır, böylece geçmişte fazla kayıt kalmaz ve sonraki geri hareketi doğru çalışır.
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

- **Etiketler:** küçük, köşeleri yuvarlak, ürünün grup rengine göre zeminli kutular (aynı VEGAN etiketi kahvede kırmızı, tatlıda pembe olur). Kafenin çıkartma dilinde, ince beyaz konturlu, Unbounded yazılı. Hazır liste: VEGAN, ŞEKERSİZ, BİTKİSEL SÜT SEÇENEKLİ, SICAK, SOĞUK, ACILI. Admin yenisini ekleyebilir. Bir üründe en fazla 3 etiket görünür.
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
| Veritabanına ulaşılamıyor, önbellek dolu | Menü önbellekten sunulur, ziyaretçi farkı görmez |
| Veritabanına ulaşılamıyor, önbellek boş | Sunucu bu süreçte en son başarıyla okunan menü bellekte duruyorsa onu sunar. O da yoksa: daha önce açan telefon kendi kayıtlı menüsünü gösterir, ilk kez açan "Menüye şu an ulaşamıyoruz. Biraz sonra tekrar dene ya da ekibimize sor." ve "Tekrar dene" görür. Eski fiyatlı bir yedek dosya gösterilmez |

### 3.12 iPhone ve Android farkları

| Konu | iPhone (Safari) | Android (Chrome, Samsung Internet) |
|---|---|---|
| QR'ı okutma | Kamera uygulaması Safari'de açar | Kamera ya da Google Lens çoğunlukla Chrome'da açar. Bazı QR uygulamaları ve Instagram kendi içindeki tarayıcıda açar, menü orada da tam çalışır |
| Geri tuşu | Kenardan kaydırma | Sistem geri tuşu ve geri hareketi. İkisi de yalnızca açık detayı ya da WiFi kartını kapatır |
| WiFi girişi | Giriş penceresi açılır, uygulama değiştirince kapanabilir | "Ağda oturum açın" bildirimi açılır. Kopyala ve yapıştır genelde çalışır, yine de bilgiler okunarak yazılabilecek büyüklükte |
| Kopyalama | Clipboard API çalışır (HTTPS) | Aynı. Uygulama içi tarayıcıda engellenirse seçme yedeği devreye girer |
| Yazı boyutu | Dinamik Yazı | Sistem yazı ölçeği (%130'a kadar sık). İkisinde de düzen bozulmaz |
| Ekran kenarı | Çentik ve alt çubuk için güvenli alan | Hareketli gezinme çubuğu ve kamera deliği için güvenli alan |
| Ekran yenileme | 60 Hz ya da 120 Hz | 60, 90 ya da 120 Hz. 3D koruması ekranın kendi hızına göre ölçer (5.3) |
| Veri tasarrufu | Bilgi vermez | Chrome "Lite/Veri tasarrufu" açıksa 3D yüklenmez |
| Admin'de fotoğraf | Dosya seçici yalnızca JPEG, PNG ve WebP ister. Safari 17'den itibaren HEIC'i kendisi de açabilir. Gerçek cihazda test edilir | HEIC desteği tarayıcıya göre değişir, resmi kaynakla doğrulanamadı. Açılamazsa 4.6'daki uyarı çıkar. Gerçek cihazda test edilir |

## 4. Admin paneli (`/qr/admin`)

Telefonda da rahat kullanılır. Metin fontu Montserrat'tır.

### 4.1 Giriş ve hesap

- E-posta ve şifre ile giriş yapılır. Kayıt sayfası yoktur.
- **İlk kurulum:** geliştirici `npm run admin:create` komutunu çalıştırır. Komut e-postayı ve şifreyi terminalde sorar, şifreyi ekrana basmaz, argon2id hash'ini veritabanına yazar. Tabloda zaten bir admin varsa çalışmaz.
- **Şifre sıfırlama:** tek admin olduğu için e-posta servisi kurulmaz. Geliştirici `npm run admin:reset-password` komutunu çalıştırır. Komut yeni şifreyi aynı şekilde terminalde sorar ve o admin'in bütün oturumlarını kapatır.
- **Deneme sınırı:** sayaç (IP adresi + e-posta) çifti için tutulur. Böylece başka yerden deneyen biri gerçek admin'i kilitleyemez. Kafe WiFi'ında aynı dış IP'yi paylaşan bir müşteri de admin'i dışarıda bırakamaz. IP adresi tek bir `getClientIp()` yardımcısından okunur: Vercel'de platformun koyduğu `x-real-ip`, Hostinger'de sunucu yapılandırmasında güvenilen tek vekil başlığı. Ziyaretçinin gönderdiği başlığa güvenilmez. Sıra şöyledir:
  1. **Deneme hakkı ayrılır (şifre kontrolünden önce):** tek bir `INSERT … ON CONFLICT … DO UPDATE … RETURNING` sorgusu o çiftin sayacını artırır ve kilit durumunu döndürür. 15 dakikalık pencere dolmuşsa sayaç sıfırdan başlar. Pencere içinde 5 denemeyi geçen istek şifre kontrolüne hiç gitmez. Böylece aynı anda gönderilen 100 istekten yalnızca 5'i pahalı argon2id kontrolüne ulaşır.
  2. **E-posta başına üst sınır (IP değiştirmeye karşı):** aynı e-posta için bütün IP'lerden gelen denemeler dakikada 20 ile sınırlanır. Aşılırsa "Çok fazla deneme. 1 dakika sonra tekrar dene." yazar. Bu sınır en fazla 1 dakika sürer, gerçek admin'i uzun süre dışarıda bırakmaz. Ayrıca aynı e-posta için aynı anda yalnızca bir şifre kontrolü çalışır (Postgres advisory lock).
  3. **Şifre argon2id ile doğrulanır.** Yanlışsa 5. denemeden sonra `locked_until` katlanarak uzar (1, 2, 4, 8 dk, en fazla 15 dk).
  4. **Doğruysa** o çiftin sayacı silinir. Admin art arda doğru girişlerle kendini kilitlemez.
- "Tüm cihazlardan çıkış yap" düğmesi bulunur.
- Adımlar `docs/KULLANIM.md` içinde yazılıdır.

### 4.2 Ürünler

- Ekleme, düzenleme, çoğaltma ve sürükleyerek sıralama yapılır.
- **Silme:** çift onay ister ("Ton Balıklı Sandviç silinsin mi?"). Silmeden hemen önce menünün kopyası `menu_snapshots`'a alınır. Hemen fark edilen hata "Son işlemi geri al" ile, daha sonra fark edilen hata kopyaya dönülerek düzeltilir. Ayrı çöp kutusu yoktur. Menüden geçici kaldırmak için "Görünür" anahtarı kullanılır.
- **Fotoğraf dosyası silme kuralı:** her yüklenen dosya önce `storage_objects` tablosuna yazılır (geri yükleme yüklemeleri dahil). Her kayıttan sonra hangi dosyaların hiçbir ürün ve son 5 `menu_snapshots` kopyası tarafından kullanılmadığı hesaplanır. Kullanılmayan dosyaya `orphaned_at` zamanı yazılır, yeniden kullanılırsa silinir. Zamanlanmış iş olmadığı için temizlik admin her giriş yaptığında çalışır ve yalnızca `orphaned_at` 30 günden eski dosyaları siler. Ürün çoğaltılınca iki ürün aynı dosyayı paylaşabilir, kural bunu da kapsar.
- Alanlar: ad (dile göre isteğe bağlı), açıklama (TR/EN/AR), boy ve fiyat listesi (boy seçenekleri: Boy yok (tek fiyat), Normal, Büyük, Tek, Duble; boy adları arayüz sözlüğünden üç dile çevrilir, serbest boy adı yoktur), kategori, fotoğraf, içindekiler (3 dil), alerjenler ve "alerjen bilgisi girildi" anahtarı, kalori (boş bırakılabilir), sıcak/soğuk (kategori varsayılanı / sıcak / soğuk), "Ne içsem'e dahil" (kategori varsayılanı / evet / hayır), etiketler, Yeni, Öne çıkan, Görünür.
- **Tükendi:** ürün satırındaki düğme kısa bir seçim açar ve her seçenek hedef saati açıkça yazar (saatler `Europe/Istanbul`):
  - Gün içinde (açılış saatinden sonra): "Yarın 08:00'e kadar" ve "Ben açana kadar".
  - Gece yarısından açılış saatine kadar: "Bugün 08:00'e kadar", "Yarın 08:00'e kadar" ve "Ben açana kadar". Böylece gece 00:20'de ya da sabah 07:50'de basılan tükendi yanlışlıkla birkaç dakika sonra açılmaz.
- **Kaydedilmemiş değişiklik uyarısı:** sayfadan çıkarken sorar.
- **Fiyat değişikliği onayı:** kaydetmeden önce "210 ₺ → 230 ₺" biçiminde eski ve yeni fiyat gösterilir.

### 4.3 Toplu fiyat güncelleme

- Kategori ya da grup seçilir. Yüzde ya da sabit tutar girilir. Yuvarlama seçilir: yok, en yakın 5 ₺, en yakın 10 ₺.
- Önce önizleme tablosu çıkar (ürün, eski fiyat, yeni fiyat). "Uygula" denince tek seferde kaydedilir. Geçmişe tek kayıt olarak yazılır (`entity: bulk_price`, etkilenen bütün ürünlerin eski ve yeni fiyatı içinde) ve son işlem olduğu sürece tek adımda geri alınabilir.

### 4.4 Değişiklik geçmişi ve geri alma

- Her kayıt geçmişe yazılır: kim, ne zaman, hangi kayıt, önce ve sonra.
- **WiFi şifresi geçmişte maskelenir.** Geçmişe yalnızca "WiFi şifresi değiştirildi" yazılır, eski ya da yeni şifre yazılmaz. Admin şifresi ve oturum bilgisi hiçbir zaman geçmişe girmez.
- Son 100 değişiklik okunabilir liste olarak görünür.
- **Geri al yalnızca son işlem için:** geçmişin en üstündeki tek kayıt (tek ürün düzenlemesi, silme ya da toplu fiyat) geri alınabilir. Üstüne yeni bir değişiklik yapılınca düğme pasifleşir. Böylece sabah yapılan toplu zamı geri almak öğlen elle düzeltilen bir fiyatı bozamaz. Daha eski durumlara dönmek için `menu_snapshots` kopyaları kullanılır (4.9).
- Kayıt doğrudan yayına çıkar. Taslak ve yayınla adımı yoktur.
- Kaydedilen değişiklik, kayıt biter bitmez açılan her menüde görünür.

### 4.5 Kategoriler, etiketler ve ayarlar

- Kategoriler: ad (3 dil), grup, sıralama, görünürlük, "Ne içsem'e dahil" varsayılanı ve varsayılan sıcak/soğuk. Ürün kendi değerini girerse kategorinin varsayılanını geçersiz kılar.
- Ekstralar: ad (3 dil), fiyat, hangi kategorilerde görüneceği.
- Gruplar: ad (3 dil), renk (yalnızca 6 marka renginden).
- Etiketler: hazır liste ve ekleme. Etiketin rengi yoktur. Zemin rengi etiketin takıldığı ürünün grubundan, yazı rengi 2.1'deki kurallardan gelir.
- Ayarlar: WiFi (ağ adı, kullanıcı adı, şifre, yönerge metni), açılış saati, alt bilgi notu (varsayılan: "Self servis · Servis ücreti alınmaz"), istatistik açık/kapalı. Hepsi admin'den girilir.
- Geliştirme ve demo için seed test değerleri koyar: ağ adı `HOT | WIFI`, kullanıcı adı `test`, şifre `test1234`, açılış saati 08:00. Admin ana sayfasında "WiFi test bilgisi kullanılıyor" uyarısı, gerçek bilgi girilene kadar durur.

### 4.6 Fotoğraf yükleme

- Dosya seçici yalnızca JPEG, PNG ve WebP ister (`accept="image/jpeg,image/png,image/webp"`). iPhone galeriden seçilen HEIC fotoğrafı bu durumda genelde JPEG olarak verir; Safari 17'den itibaren HEIC'i kendisi de açabilir. Bu davranış gerçek iPhone'da test edilir.
- Fotoğraf önce telefonda, tarayıcının içinde küçültülür: uzun kenar 1600 px, en fazla 1,5 MB. Önce WebP denenir. Tarayıcı WebP üretemezse standart gereği sessizce PNG döndürür; kod bu durumda (`blob.type !== "image/webp"`) JPEG'e (kalite 0,82) geçer. Böylece Vercel'in 4,5 MB istek sınırına takılmaz.
- Tarayıcı fotoğrafı okuyamazsa (ör. bazı Android telefonlarda HEIC) şu metin çıkar: "Bu fotoğraf açılamadı. Fotoğrafı galeriden JPEG olarak kaydedip tekrar dene." Sunucuya hiç HEIC gelmez. Sunucudaki `sharp` paketi HEIC açamaz.
- Sunucu gelen dosyanın türünü içeriğinden kontrol eder ve `sharp` ile yalnızca WebP üretir: 320, 720 ve 1280 px (1280 px en fazla 400 KB). AVIF üretilmez. Vercel'in görsel servisi kullanılmaz. Paylaşımlı sunucuda iş parçacığı sınırına takılmamak için `sharp.concurrency(1)` ve `sharp.cache(false)` ayarlanır.
- **Dosya adı içerikten gelir:** her dosyanın anahtarı içeriğinin SHA-256 özetidir. Aynı fotoğraf ikinci kez yüklenirse depoya tekrar yazılmaz. Bu, geri yüklemede ve çoğaltmada depo işlem kotasını korur. Dosya adı değişmediği için tarayıcıda 1 yıl önbellekte tutulabilir.
- **Odak noktası:** fotoğraf seçilince önizleme açılır. Liste karesinde ürünün hangi kısmının görüneceği parmakla seçilir (varsayılan: orta). Sunucu kırpma yapmaz. Odak noktası kaydedilir ve tarayıcıda CSS `object-position` ile uygulanır. Odak sonradan değişirse fotoğrafın yeniden işlenmesi gerekmez.
- **Değiştirme ve silme:** fotoğraf değiştirilebilir ya da silinebilir. Silinince ürün fotoğrafsız haline döner. Eski dosyalar 30 gün sonra temizlenir (4.2).

### 4.7 İstatistik

- Bugün, son 7 gün ve son 30 gün için menü açılışı sayısı gösterilir. Açılış, aynı oturumda bir kez sayılır.
- En çok detayı açılan 10 ürün listelenir.
- "Saatlere göre menü açılışı" grafiği bulunur. Bu grafik kafe yoğunluğu ya da müşteri sayısı olarak adlandırılmaz.
- Ziyaretçi takibi için çerez ve kişisel veri kullanılmaz. Yalnızca toplam sayaçlar tutulur. Admin girişi kendi oturum çerezini kullanır.
- Menü açılışı oturumda bir kez gönderilir. Açılan detaylar telefonda biriktirilir. Sayfa arka plana geçince yalnızca henüz gönderilmemiş olanlar tek istekte gönderilir. Gönderim `navigator.sendBeacon` ile yapılır, çünkü iOS Safari arka plana geçen sayfanın normal isteklerini iptal edebilir. Ziyaretçi WiFi'ye bağlanıp geri dönerse aynı sayaçlar ikinci kez gönderilmez.
- **Ayrı veritabanı:** istatistikler menü veritabanında değil, ayrı bir Neon projesinde tutulur. Neon'un ücretsiz kotası proje başınadır. İstatistik yazmaları kendi kotasını bitirse bile menü ve admin etkilenmez, yalnızca o ayın kalan günlerinde istatistik yazılmaz.
- **Kapatma:** ayarlardaki "istatistik açık/kapalı" bilgisi menü verisiyle birlikte önbellekte gelir. Kapalıysa telefon hiç istek göndermez, `/qr/api/stats` de veritabanına dokunmadan 204 döner.

### 4.8 QR

- Sabit adres: `toohottohandlecoffee.com/qr`.
- Admin'den logolu QR SVG olarak indirilir. Ortadaki logo okumayı bozmasın diye hata düzeltme seviyesi H (%30) kullanılır. Kenarda 4 modül boşluk bırakılır. Basılı boyut en az 3 × 3 cm'dir. QR'ın altında kısa adres yazılı durur.
- Basmadan önce gerçek masada en az bir iPhone ve iki Android telefonla okutma testi yapılır.

### 4.9 Yedek

- Admin'de "Yedek indir" düğmesi bir ZIP dosyası indirir. İçinde menü verisi (kategoriler, ürünler, ekstralar, ayarlar; admin hesabı ve WiFi şifresi hariç) JSON olarak ve bütün ürün fotoğrafları (1280 px WebP) bulunur. Böylece depo bozulsa da fotoğraflar geri gelir.
- Hazırlanırken ilerleme ("48 / 129 fotoğraf") ve İptal düğmesi görünür. Boyut fotoğraflara göre değişir. Sunucu 1280 px WebP dosyasını en fazla 400 KB olacak şekilde kaydeder (gerekirse kaliteyi düşürür), bu yüzden 129 fotoğraf en fazla yaklaşık 52 MB, genelde bunun yarısından azdır. Ekranda "Bilgisayardan almak daha hızlıdır" notu bulunur.
- ZIP sunucuda değil tarayıcıda hazırlanır, böylece sunucu yanıt sınırına takılmaz. Fotoğraflar depodan doğrudan değil, admin oturumu isteyen aynı alan adındaki `/qr/api/admin/image/[key]` adresinden tek tek çekilir. Depo farklı bir alan adında olduğu için doğrudan çekmek CORS engeline takılabilir. Bu yol Vercel Blob'da da R2'de de aynı çalışır. Akış halinde ZIP üretiminin iPhone Safari ve Android Chrome'da çalıştığı gerçek cihazda test edilir.
- **Yedekten geri yükleme sırası:** (1) ZIP tarayıcıda açılır ve doğrulanır: JSON biçimi, sürüm, her ürünün fotoğrafının ZIP'te bulunması. Hata varsa hiçbir şey gönderilmez. (2) Yedekteki kategori, ürün ve fotoğraf sayısı gösterilip onay istenir. (3) Fotoğraflar depoya tek tek yüklenir (her biri 4,5 MB sınırının çok altında). Anahtar içerikten geldiği için depoda zaten olan fotoğraf yeniden yazılmaz. Biri bile başarısız olursa işlem durur, menüye dokunulmaz. (4) Hepsi yüklenince JSON bir Server Action ile sunucuya gönderilir. Sunucu önce mevcut menünün kopyasını `menu_snapshots`'a alır, sonra bütün anahtarların depoda var olduğunu kontrol eder ve menüyü tek bir veritabanı işleminde (transaction) değiştirir. Herhangi bir adım hata verirse eski menü olduğu gibi kalır. Yarıda kalan yüklemelerden artan dosyalar `storage_objects`'te kayıtlı olduğu için 30 günlük temizlikte silinir.
- **Geri yüklemeden önce güvence:** tarayıcı indirmesi engellenebileceği için ona güvenilmez. Sunucu, üzerine yazmadan önce mevcut menünün kopyasını veritabanında `menu_snapshots` tablosuna alır. Kopya alınamazsa geri yükleme başlamaz. Son 5 kopya tutulur, admin'den tek dokunuşla geri dönülür. Eski fotoğraflar 30 gün silinmediği için kopyayla birlikte geri gelir.
- **WiFi:** WiFi şifresi yedeğe girmez. Geri yüklemede mevcut WiFi ağ adı, kullanıcı adı ve şifresi olduğu gibi korunur. Ekranda "WiFi bilgileri değiştirilmedi" yazar.
- Neon'un kendi geri dönüş özelliği ücretsiz planda yalnızca son 6 saati kapsar. Akşam yapılan bir hata ertesi sabah Neon'dan geri alınamaz. Bu yüzden asıl güvence `menu_snapshots` ve ZIP yedektir.
- Admin ana sayfasında "Son yedek: 12 gün önce" yazar (`last_backup_at`). 30 günü geçince uyarı kırmızıya döner. Ayda bir yedek almak `docs/KULLANIM.md`'de rutin olarak yazılıdır.

### 4.10 İzleme ve haber verme

- **Site erişilemezse:** ücretsiz bir erişim izleme servisi (ör. UptimeRobot) `/qr/api/health` adresini 5 dakikada bir kontrol eder. Bu adres veritabanına dokunmaz, yalnızca uygulamanın ayakta olduğunu söyler. Böylece izleme, veritabanını gece boyu uyandırmaz. Site açılmazsa Enes'e e-posta gider. Devirden sonra kafenin e-postası da eklenir.
- **Sunucu hataları:** yalnızca barındırmanın kendi panelinde okunur (Vercel'de Logs, Hostinger'de kendi kayıtları). Admin'de ayrı bir hata ekranı yoktur. Kayda şifre ve kişisel veri yazılmaz.
- **Yedek:** otomatik yedek olmadığı için bildirim yerine 4.9'daki son yedek uyarısı kullanılır.

## 5. Teknik mimari

### 5.1 Repo ve klasör düzeni

- Repo `justech0/toohottohandle`, **gizli** olacak (GitHub → Settings → Change visibility → Private).
- Yakında sayfası `public/yakinda/` klasörüne taşınır. `/` adresi `next.config` içindeki rewrite ile bu sayfayı gösterir. Rewrite adres çubuğunu değiştirmediği için sayfadaki göreli yollar (`style.css`, `motion.js`, `assets/...`) `/` köküne göre çözülür ve 404 verir. Bu yüzden `index.html`'in `<head>`'ine tek satır eklenir: `<base href="/yakinda/">`. Sayfada başka değişiklik yapılmaz. A0'da canlı sayfa ile piksel piksel karşılaştırılır.
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

Kural: Vercel'e özel API kullanılmaz. Her şey düz Node.js sunucusunda da çalışır. Next.js sürümü 16'ya sabitlenir ve `cacheComponents: true` açılır.

| Konu | Şimdi (Vercel Hobby) | Hostinger'e geçince |
|---|---|---|
| Uygulama | Next.js 16 App Router + TypeScript. Fonksiyon bölgesi `fra1` (Frankfurt), Neon ile aynı şehir. Vercel'in varsayılanı Washington'dır, değiştirilmezse her veritabanı sorgusu okyanus aşırı gider | `output: "standalone"`, Hostinger Node.js web app (Business veya Cloud plan). Standalone çıktısı `public/` ve `.next/static/` klasörlerini kopyalamaz; derleme betiği bunları `.next/standalone/` içine kopyalar |
| Veritabanı | İki Neon projesi (ücretsiz, Frankfurt): menü/admin ve istatistik. Standart `postgres` sürücüsü + Drizzle ORM | Aynı Neon projeleri, bağlantı adresleri ortam değişkeninde |
| Dosyalar | `lib/storage` adaptörü. Demo döneminde Vercel Blob | Aynı adaptör, S3 uyumlu depo (ör. Cloudflare R2, veri çıkışı ücretsiz). Hostinger'in kendi diski kullanılmaz, çünkü her yayında üzerine yazılıyor. Canlı yayında hangi deponun kullanılacağı 5.7'de |
| Görsel küçültme | Yüklemede `sharp` | Aynı |
| Önbellek | `getMenu` içinde `'use cache: remote'`, `cacheTag('menu')` ve süresi 1 yıl olan özel `cacheLife` profili. Vercel'de Vercel'in çalışma zamanı önbelleğinde durur | Aynı kod. `cacheHandlers` ayarıyla tek Node sürecinin belleğine bağlanır. Bu ayar A0'da Next.js 16 belgesine göre doğrulanır |
| Zamanlanmış iş | Yok. Tükendi süresi okunurken hesaplanır | Aynı |
| İstatistik | Kendi tablolarımız | Aynı |

- Taşıma adımları `docs/KULLANIM.md`'de yazılıdır: ortam değişkenlerini aktar, `standalone` derlemesini ve kopyalama adımını çalıştır, depo değişiyorsa fotoğrafları taşı, DNS'i çevir.
- **Zamana bağlı yenileme yoktur.** Menü verisi (`getMenu`) Next.js önbelleğinde `menu` etiketiyle tutulur ve süresi pratikte dolmaz (1 yıl). Admin kaydı Server Action ile yapılır ve aynı işlemin içinde `updateTag('menu')` çağrılır. Önbellek o an boşalır, sonraki istek yeni veriyi veritabanından bir kez alır. Değişiklik kayıt biter bitmez görünür.
- **Neden Server Action:** `updateTag` yalnızca Server Action içinde çalışır, Route Handler içinde hata verir. Bu yüzden menüyü değiştiren bütün admin işlemleri (ürün, fiyat, toplu fiyat, tükendi, ayarlar, geri al, geri yükleme son adımı) Server Action'dır. Route Handler'lar (`/qr/api/admin/*`) yalnızca fotoğraf yükleme ve indirme gibi menü verisini değiştirmeyen işler yapar. İstisnai olarak Route Handler'dan önbellek boşaltmak gerekirse `revalidateTag('menu', { expire: 0 })` kullanılır.
- **Önbellek kalıcı değildir:** Next.js 16 önbelleği sunucusuz ortamda örnek başına ve geçicidir. `'use cache: remote'` ile Vercel'in paylaşılan çalışma zamanı önbelleğine taşınır, ama o da bölgeseldir ve dolunca eski kayıtları silebilir. Yani ziyaretçi isteği çoğunlukla önbellekten gelir, ama ara sıra veritabanına gider. Bu durumda veritabanı uyuyorsa istek yaklaşık 0,5 sn uzar.
- **Veritabanı hata verirse:** `getMenu` hatayı yakalar ve aynı sunucu sürecinin bellekte tuttuğu son başarılı menüyü döndürür. O da yoksa 3.11'deki davranış geçerlidir. Bu güvence koşulsuz değildir ve belge bunu söz olarak vermez.

- **Tek kaynak:** menü sayfası ve `/qr/api/menu` aynı `getMenu` fonksiyonundan ve aynı önbellek kaydından beslenir. Tarayıcı ya da CDN tarafında ayrı bir süreli önbellek yoktur (`Cache-Control: private, no-cache`). Bu yüzden ilk ekran ile sonraki yenileme arasında fiyat farkı oluşmaz.
- **Açık duran menü:** sekmeye dönüldüğünde `/qr/api/menu` adresinden veriyi yeniden ister. Sayfa ile aynı önbellekten geldiği için ilk ekran ile sonraki yenileme arasında fiyat farkı oluşmaz. Veri değişmişse ekran sessizce yenilenir.
- **Tükendi ve saat:** her yanıtta sunucunun o anki zamanı bulunur. Telefon kendi saatiyle arasındaki farkı hesaplar ve tükendi süresini sunucu saatine göre değerlendirir. Telefonun saati yanlış olsa da sonuç doğru çıkar.
- **Saat dilimi:** sunucular UTC çalışır. Açılış saati ve "ertesi açılış" hesabı her yerde açıkça `Europe/Istanbul` ile yapılır. Tarihler veritabanında UTC saklanır.
- **Service worker:** yalnızca menü sayfasını, `/qr/api/menu` yanıtını, fontları ve logo dosyalarını saklar. Önce ağa gider. 2,5 saniyede yanıt gelmezse saklanan menüyü gösterir. Gelen yanıtı yalnızca `response.ok`, yönlendirme yok (`!response.redirected`) ve uygulamanın kendi `X-THTH-Menu: 1` başlığı varsa kabul eder. Böylece kafe WiFi'ının giriş sayfası (captive portal) menü sanılıp kayıtlı menünün üzerine yazılmaz; böyle bir yanıtta kayıtlı menü gösterilir. `/qr/admin` ve diğer `/qr/api/` adreslerine hiç karışmaz. Daha önce hiç açılmamışsa 3.11'deki bağlantı ekranı çıkar.
- **Adres düzeni:** bütün API adresleri `/qr/api/` altındadır: `/qr/api/menu`, `/qr/api/stats`, `/qr/api/health` ve admin için `/qr/api/admin/*`.

### 5.3 3D

Three.js kalır, ama hiçbir şeyi bekletmeyecek şekilde kullanılır.

- **Ne zaman yüklenir:** menü açılıp giriş bittikten sonra, tarayıcı boşta kalınca (`requestIdleCallback`, iOS'ta olmadığı için yerine 2 sn) düşük öncelikle indirilir. O anda kullanıcı kaydırıyorsa, kaydırma durduktan 500 ms sonraya ertelenir. Sahnenin kurulması (SVG'den kabartma üretme ve ilk çizim) da aynı kurala uyar, böylece kaydırma takılmaz. Giriş sırasında, ilk boyamada ve arama yazarken yüklenmez.
- **Kimde yüklenir:** WebGL2 var, veri tasarrufu kapalı, hareket azaltma kapalı, tarayıcı bilgi veriyorsa bağlantı 2G/3G değil ve işlemci çekirdeği en az 4. Bu bilgileri vermeyen tarayıcıda (ör. Safari) bilinmeyen koşul atlanır, asıl karar aşağıdaki korumayla verilir.
- **Çalışırken koruma (ayrı test sahnesi yok):** gerçek, görünen sahnenin kare süreleri ölçülür. İlk 10 kare (shader derleme) sayılmaz. Sayfa yüklenince 3D'den önce boş sayfada birkaç kare ölçülerek ekranın kendi kare süresi bulunur (60 Hz'de 16,7 ms, 120 Hz'de 8,3 ms). Görünen sahnede 2 saniye boyunca ortalama kare süresi bunun 2 katını ya da 33 ms'yi (30 FPS) aşarsa sahne 200 ms'de SVG'ye döner ve karar oturum boyunca hatırlanır. Sekme arka plandayken (`document.hidden`) ölçüm durur ve geri gelince sıfırdan başlar, böylece WiFi'ye bağlanmak için uygulamadan çıkan müşterinin telefonu yanlışlıkla 2D'ye düşmez. Kabul ölçütü gerçek telefonda görünen sahnenin akıcılığıdır (8).
- **Nerede kullanılır:** menü üstündeki büyük HOT kabartması ve "Ne içsem?" makaraları (3.1, 3.5). İkisi aynı küçük sahne modülünü paylaşır.
- **Geçiş:** 3D hazır olunca SVG logo ile 3D logo aynı yerde, aynı boyda üst üste konur ve 200 ms'lik yumuşak geçişle değişir. Kullanıcı ekranı kaydırıyorsa değişim kaydırma bitince yapılır.
- **Yapım:** logo ve ikon SVG'leri `SVGLoader` ve `ExtrudeGeometry` ile kabartılır. Malzeme parlak kırmızıdır, gölge yoktur. Sahne görünmezken (ekran dışı ya da sekme arka planda) çizim durur.
- **Bütçe:** Three.js (yalnızca gereken modüller) ve sahne birlikte en fazla 180 KB gzip. Piksel oranı en fazla 2.

### 5.4 Veri modeli

`groups`: `id`, `slug`, `name_tr`, `name_en`, `name_ar`, `color` (red | yellow | pink | blue | green | gray), `sort_order`

`categories`: `id`, `slug`, `group_id`, `name_tr`, `name_en`, `name_ar`, `sort_order`, `is_visible`, `default_in_suggest` (Ne içsem'e dahil varsayılanı), `default_temp` (hot | cold | null)

`products`: `id`, `slug`, `category_id`, `name`, `name_en`, `name_ar` (boşsa `name`), `desc_tr`, `desc_en`, `desc_ar`, `ingredients_tr`, `ingredients_en`, `ingredients_ar`, `kcal` (null olabilir, 0 anlamına gelmez), `allergens` (dizi, 14 kod), `allergens_entered` (bool, "alerjen bilgisi girildi"), `temp` (hot | cold | null → kategoriden gelir), `in_suggest` (bool | null → kategoriden gelir), `image_key`, `image_focus_x`, `image_focus_y` (0–1, varsayılan 0,5), `is_new`, `is_featured`, `is_visible`, `sold_out_until` (null | zaman | "süresiz" için uzak tarih), `sort_order`, `updated_at`

`product_variants`: `id`, `product_id`, `label_key` (null = boy yok; normal | buyuk | tek | duble, üç dile arayüz sözlüğünden çevrilir), `price_kurus` (tam sayı), `sort_order`. Her üründe en az bir satır bulunur. Tek fiyat yapısı budur, ayrı `price` sütunu yoktur.

`extras`: `id`, `name_tr`, `name_en`, `name_ar`, `price_kurus`, `scope` (category_id listesi), `sort_order`

`tags`: `id`, `label_tr`, `label_en`, `label_ar` (renk yok, ürünün grubundan gelir); `product_tags`: `product_id`, `tag_id`

`settings` (tek satır): `wifi_ssid`, `wifi_username`, `wifi_password`, `wifi_note_tr/en/ar`, `opening_time`, `footer_note_tr/en/ar`, `stats_enabled`, `menu_updated_at`, `last_backup_at`

`menu_snapshots`: `id`, `at`, `reason` (ör. "geri yükleme öncesi", "silme öncesi", "toplu fiyat öncesi"), `data` (JSON, WiFi şifresi hariç). Son 5 kayıt tutulur.

`storage_objects`: `key` (SHA-256), `size`, `created_at`, `orphaned_at` (null = kullanımda)

`audit_log`: `id`, `admin_id`, `at`, `entity`, `entity_id`, `action`, `before` (JSON), `after` (JSON). WiFi şifresi alanı yazılmadan önce `"[değiştirildi]"` ile değiştirilir.

İstatistik veritabanında (ayrı Neon projesi): `stats_daily`: `date`, `menu_opens`; `stats_hourly`: `date`, `hour`, `opens`; `stats_product`: `date`, `product_id`, `views`

`admins`: `id`, `email`, `password_hash` (argon2id), `created_at`, `last_login_at`; `sessions`: `id_hash`, `admin_id`, `expires_at`; `login_attempts`: `key_hash` (IP + e-posta, birincil anahtar), `fail_count`, `window_started_at`, `locked_until`

Maliyet, COGS ve zam oranı hiçbir tabloda yoktur.

### 5.5 Güvenlik

- Şifre hash'i argon2id. Oturum çerezi HttpOnly, Secure, SameSite=Strict. Veritabanında oturum kimliğinin yalnızca hash'i tutulur.
- Admin işlemlerinde CSRF koruması ve sunucu tarafında doğrulama (zod) yapılır.
- Giriş deneme sınırı uygulanır.
- Yüklenen dosyanın türü içeriğinden doğrulanır. Boyut sınırı vardır. Dosya adı rastgele üretilir. EXIF verisi silinir.
- Güvenlik başlıkları: CSP, X-Content-Type-Options, Referrer-Policy, frame-ancestors 'none'. CSP'de `img-src` ve `connect-src` için `blob:` ve dosya deposunun alan adı izinlidir; aksi halde fotoğraf önizlemesi ve tarayıcıda hazırlanan ZIP engellenir.
- **Arama motoru:** `/qr/admin` ve `/qr/api` altındaki her yanıtta `X-Robots-Tag: noindex, nofollow` başlığı ve admin sayfalarında `noindex` meta etiketi bulunur. `robots.txt` bu yolları kapatmaz: kapatırsa Google sayfaya hiç girmez, `noindex` başlığını göremez ve adres yine arama sonucunda çıkabilir. Asıl koruma admin oturumudur. Menünün kendisi (`/qr`) aranabilir kalır.
- Anahtarlar yalnızca barındırma ortam değişkenlerinde durur. Repoda yalnızca `.env.example` bulunur. Şifre ve anahtar sohbete veya AI'a yazılmaz.

### 5.6 Performans bütçesi

- Menü LCP ≤ 2,5 sn (mobil 4G), CLS ≤ 0,1, INP ≤ 200 ms.
- İlk yüklemede JS ≤ 100 KB gzip (3D hariç).
- Fontlar: Türkçe karakterler (ğ Ğ ı İ ş Ş) ve ₺ latin-ext alt kümesinde olduğu için ilk yükleme latin ve latin-ext'i birlikte içerir. İki alt küme tek dosyada birleştirilir, böylece Türkçe harf için ikinci istek ve font sıçraması olmaz. Yüklenen ağırlıkların tamamı budur: Unbounded 800, Montserrat 500 ve 600, toplam ≤ 110 KB. Başka ağırlık yoktur. Readex Pro (400, 600) yalnızca AR seçilince yüklenir.
- Liste fotoğrafı 320 px WebP (yüksek çözünürlüklü ekranda 160 px kareye net basılır), 20–25 KB. Detay fotoğrafı 720 ve 1280 px `srcset` ile verilir.

### 5.7 Barındırma ve maliyet

- Şimdilik Vercel Hobby (ücretsiz). Hobby planı kişisel ve ticari olmayan kullanım içindir. Kafe menüsü canlıya çıkınca ücretli plana ya da Hostinger'e geçilir. Geçiş kararı ve takvimi Enes'tedir.
- **Neon (menü/admin projesi):** ücretsiz planda proje başına ayda 100 CU-saat ve 1 GB. Veritabanı 5 dakika boşta kalınca uyur, bu kapatılamaz. En büyük işlem gücü panelden 0,25 CU'ya sabitlenir (kurulumda doğrulanır). Bu proje yalnızca admin işlemlerinde ve önbellek boşken gelen menü isteğinde uyanır. Site izleme ve istatistik ona dokunmaz. Aylık kullanım birkaç CU-saatte kalır.
- **Neon (istatistik projesi):** kafe açıkken (günde 12–13 saat) ziyaretler arası 5 dakikayı geçmezse sürekli uyanık kalır: 0,25 × 13 × 31 ≈ 101 CU-saat. Gece bot ve sosyal medya ziyaretleri bunu artırabilir. Yani yoğun aylarda son birkaç gün istatistik yazılamayabilir. Bu bilinçli bir tercihtir: menü ve admin etkilenmez. Admin'de istatistik kapatılabilir.
- **Vercel Blob (demo dönemi):** Hobby'de 1 GB depolama, 10 GB indirme, 10.000 basit ve 2.000 gelişmiş işlem; aşılırsa Blob 30 gün kapanır. Fotoğraflar ekrana gelince yüklenir (`loading="lazy"`) ve içerik özetli adları sayesinde tarayıcıda 1 yıl saklanır. Liste fotoğrafı 20–25 KB olduğundan yeni bir ziyaretçi ortalama yaklaşık 0,8 MB fotoğraf indirir (yaklaşık 25 liste fotoğrafı ve 1–2 detay). Ayda 5.400 yeni ziyarette (günde 300 açılışın %60'ı) yaklaşık 4,3 GB eder, sınırın altında. Günde 1.000 açılışta (ayda 18.000 yeni ziyaret) yaklaşık 14 GB eder ve 10 GB'ı aşar. İlk yükleme 129 × 3 = 387 gelişmiş işlem harcar; aynı fotoğraf ikinci kez yazılmadığı için geri yükleme bunu tekrarlamaz.
- **Canlı yayın:** Vercel Hobby ticari kullanıma izin vermez. Canlıya çıkarken Vercel Pro ya da Hostinger'e geçilir. Fotoğraf deposu olarak Cloudflare R2 önerilir: veri çıkışı ücretsizdir, iki barındırmada da aynı çalışır. R2 için Cloudflare hesabı ve alan adının bir alt adresi (ör. `img.toohottohandlecoffee.com`) gerekir. Karar ve takvim Enes'tedir.

### 5.8 Devir

- Alan adı, barındırma, veritabanı ve GitHub hesapları için kimin sahip olacağı yayın öncesi Enes ve kafeyle netleşir. Hesapların kafe adına açılması ve Enes'in üye olması önerilir.
- `docs/KULLANIM.md`: ürün ekleme, tükendi, toplu zam, yedek, şifre sıfırlama, taşıma adımları. Kısa, ekran görüntülü, Türkçe.
- Şifreler devirde yüz yüze ya da şifre yöneticisiyle verilir. Repoya ve sohbete yazılmaz.

## 6. İçerik

### 6.1 Kaynak

- Ürün listesi ve fiyatlar `SATIŞ ve MALİYET SON 1.xlsx` dosyasından gelir. Yalnızca "Ürün Adı", "Kategori" ve "Yeni Fiyat" sütunları kullanılır. Maliyet, COGS ve zam oranı okunmaz.
- Excel dosyası repoya konmaz. Dönüştürülmüş liste `db/seed/menu.json` olarak repoya girer. Bu dosyada maliyet sütunu yoktur.
- Ürün fiyatları ve ekstraların kendi fiyatları Excel'deki "Yeni Fiyat" sütunundan olduğu gibi alınır. Ekstralar ürün fiyatına dahil değildir, ayrıca ücretlidir ("+75 ₺" gibi). Küsurlu fiyatlar (176, 198, 231, 253, 187) değiştirilmez. Excel'deki 171 fiyatın hepsi aslında tam liradır: Excel'in çarpma hesabı bazılarını 229,99999999999997 gibi kaydetmiş, en büyük sapma 0,00000000000006'dır. Dönüştürme kuralı: değer en yakın kuruşa çevrilir. Bu bir fiyat yuvarlaması değildir, hiçbir fiyat değişmez. Dönüştürme betiği sapma 0,001'i aşarsa durur ve hata verir.
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
| A0 | Gizli repo, Next.js 16 ve önbellek ayarının doğrulanması, `fra1` bölgesi, `public/yakinda/` taşıma (`<base>` ile) ve `/` yönlendirmesi, Next.js iskeleti, fontlar, logo ve ikon SVG'leri, Excel → `menu.json` dönüştürme | `/` yakında sayfası aynen çalışır, build geçer, seed 129 ürünü yükler |
| A1 | Menü ekranı, arama, detay, WiFi kartı, 3 dil ve RTL, 2D giriş, service worker | 390, 768 ve 1440 px'te ekran görüntüsü kontrolü, gerçek ürün listesiyle |
| A2 | Veritabanı (iki Neon projesi), admin (Server Action'lar), yükleme, toplu fiyat, son işlemi geri al, tükendi, kopyalar, ZIP yedek, istatistik, QR | Bölüm 8 testleri geçer |
| A3 | 3D HOT kabartması ve 3D "Ne içsem?" (tavşan gözü geçişi), çalışırken koruma ve SVG yedekleri, alerjen simgeleri, etiket ve rozet seti | 3D bütçe içinde, gerçek telefonlarda akıcı, zayıf cihazda SVG'ye düşer, menü 3D'yi hiç beklemez |
| A4 | QA, gerçek cihaz testi, yayın, QR baskı testi, `KULLANIM.md` | `/qr` canlıda, 3 telefonda okutuldu |

AI'ların iş bölümü ve devir kuralları her aşamanın uygulama planında yazılır.

## 8. Test

- Sunucu ve istemci mantığı (doğrulama, giriş, oturum, deneme hakkının şifre kontrolünden önce ayrılması ve aynı anda gelen 100 istekte yalnızca 5'inin şifre kontrolüne ulaşması, e-posta başına üst sınır, yükleme kontrolü, toplu fiyat hesabı, tükendi seçeneklerinin gece yarısı ve açılış saati çevresinde doğru hedef saati üretmesi (Europe/Istanbul), "Ne içsem?" uygunluk filtresi, WiFi şifresinin geçmişte maskelenmesi, Türkçe ve aksanlı arama eşlemesi, seed dönüştürmenin sapma kontrolü, fotoğraf temizliğinin kopyalarda kullanılan dosyayı silmemesi) için birim testleri yazılır. Test koddan önce yazılır.
- Playwright testleri:
  - Menü: açılış, kategori geçişi, arama (sonuçlu, sonuçsuz, aksanlı), detay açma ve kapama (geri tuşu ve × sonrası geri hareketi dahil), captive portal yanıtında kayıtlı menünün korunması, WiFi kopyalama, dil değişimi, AR'de RTL, tükendi görünümü, bağlantısız açılış.
  - Admin: giriş, ürün ekleme, çoğaltma, fotoğraf yükleme (JPEG ile) ve odak noktası, sıralama, tükendi, toplu fiyat önizleme ve uygulama, son işlemi geri alma ve yeni değişiklikten sonra düğmenin pasifleşmesi, WiFi değiştirme, yedek indirme (ilerleme ve iptal), geri yükleme, fotoğraf yüklemesi yarıda kalırsa menünün değişmemesi, kopya alınamazsa geri yüklemenin başlamaması, geri yüklemede WiFi'ın korunması, çoğaltılmış üründe fotoğrafın silinmemesi.
  - Admin ve API yanıtlarında `noindex` başlığı.
  - Admin kaydından sonra menünün hemen güncellenmesi, `/qr/api/health` isteğinin veritabanına gitmemesi.
- Ekran görüntüsü kontrolü: 390, 768, 1440 px.
- Lighthouse mobil: performans ≥ 85, erişilebilirlik ≥ 95.
- Güvenlik taraması.
- Gerçek cihaz testi, kafe WiFi'ı ve mobil veri ile:
  - iPhone: Safari, %200 metin büyütme, admin'den HEIC fotoğraf yükleme.
  - Orta seviye Android (ör. Samsung Galaxy A serisi): Chrome ve Samsung Internet, sistem yazı ölçeği %130, hareketli gezinme, geri tuşu, Samsung HEIC fotoğrafında uyarı metni.
  - Uygulama içi tarayıcılar: Instagram ve bir QR okuyucu uygulaması içinden açılış, kopyalama yedeği.
  - 3D: bir eski ve bir yeni telefonda (60 ve 120 Hz) görünen sahnenin akıcılığı ve gerektiğinde SVG'ye düşmesi, WiFi'ye bağlanıp dönünce 3D'nin kapanmaması.
  - Yakında sayfası: `/` adresinde bütün dosyaların yüklendiği (404 yok).
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
- Taslak ve yayınla akışı (yerine son işlemi geri alma ve kopyalar var)
- Geçmişten eski bir kaydı tek tek geri alma
- Çöp kutusu (yerine silme öncesi kopya var)
- Serbest boy adları
- Veritabanı ve önbellek aynı anda yokken eski bir menü dosyası göstermek

## 10. Riskler

- **Gerçek fotoğraf, açıklama ve alerjen yok.** Menü yazı ağırlıklı başlar, tasarım bunu kaldıracak şekilde kurulur. Alerjenler admin'den girilene kadar gizli kalır.
- **Vercel Hobby ticari kullanıma izin vermez.** Canlıya çıkışta ücretli plana ya da Hostinger'e geçilir. Günde 1.000 açılışta Blob indirme kotası da aşılır (5.7).
- **Neon compute süresi.** Yalnızca istatistik projesinde sınır zorlanır. Menü ve admin ayrı projede olduğu için etkilenmez.
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

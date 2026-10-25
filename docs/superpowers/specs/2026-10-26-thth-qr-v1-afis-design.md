# THTH QR Menü — Görsel Yön "A · Afiş" (Spec ek, sürüm 3)

- Tarih: 2026-10-26
- Dayanak: Design tuvali "THTH QR Menü Senaryoları", A satırı (Ana sayfa, Kategori, Ürün, Ne içsem). Enes A'yı seçti.
- Bu belge ana spec'in (2026-10-25, v2.6) şu bölümlerini değiştirir: 3.2 Menü ekranı, 3.4 Ürün detayı (yerleşim), 3.5 "Ne içsem?". Değişmeyen her şey ana spec'te geçerli kalır (renkler, fontlar, arama, WiFi, geri tuşu, tükendi kuralı, erişilebilirlik, admin, mimari).

## 1. Neden

v0 menü düz bir listeydi, "A4 kağıdı gibi" bulundu. Marka Instagram'da afiş gibi konuşuyor: parlak 3D kırmızı HOT, dudak/tavşan/yıldız ikonları, beyaz zeminde ürün, yakın çekim doku, yıldız rozet. Menü aynı dili konuşacak.

## 2. Marka varlıkları (ek)

- Logo ve ikonlar resmi PNG'lerden alınır (`toohottohandle-logolar-1.png`, `toohottohandle-iconlar-1.png`), yeniden çizilmez. Alfa kanalı korunur; renk CSS `mask-image` ile token'dan verilir. Böylece tek dosya her renkte kullanılır.
- Fotoğraflar markanın kendi Instagram fotoğraflarıdır (kafe yükledi). Üzerinde yazı olanlar yazısız kırpılır.
- 12 köşeli yıldız fiyat rozeti olarak kullanılır.

## 3. Ana sayfa (menünün üstü)

### 3.1 Vitrin (hero, 360 px)
- Üç slayt sırayla döner, her biri 4 sn: **HOT & FAST**, **HOT & FREE**, **HOT & SHINE**.
- Her slaytta değişenler: arka plan fotoğrafı, vurgu rengi, ikon.
  - FAST: parlak 3D HOT görseli, kırmızı, tavşan.
  - FREE: buzlu içecekte dudak görseli, mavi, dudak.
  - SHINE: gözlükte yansıyan frappe görseli, sarı, yıldız.
- Slogan metni (HOT & FAST…) Unbounded 900, beyaz. Altta küçük nokta göstergesi; noktaya dokununca o slayda geçer.
- Geçiş: 600 ms kararma + hafif büyüme. Hareket azaltma açıksa döngü durur, ilk slayt kalır.
- Vitrin ekran dışındayken ya da sekme arka plandayken döngü durur.
- Sol altta "MENÜ" yazar. Şube adı yazmaz.
- Üst bar vitrinin üstündedir: beyaz logo, arama, WiFi (44 px yarı saydam daireler).
- 3D: ana spec 5.3 aynen geçerli; Three.js geldiğinde FAST slaytındaki HOT kabartması gerçek 3D'ye döner. Bu sürümde görsel resmi render fotoğrafıdır, Three.js sonraki plana kalır.

### 3.2 "Ne içsem?" kartı
- Vitrinin altına 26 px biner. Sarı (`yellow`), 118 px yüksek, yuvarlak 24 px.
- İçerik: beyaz daire içinde tavşan, "NE İÇSEM?" (Unbounded 900), "Kararsız mısın? Tavşan senin için seçsin.", sağda yelpaze gibi üç içecek fotoğrafı, köşede dönen kırmızı yıldız içinde "DOKUN".
- Hareket: tavşan 2,4 sn'de bir zıplar (gölgesiyle), içecek fotoğrafları 4,5 sn'lik döngüde yer değiştirir, kartın üstünden ışık geçer, kart 4 sn'de bir kısa sallanır, yıldız döner, "DOKUN" nabız atar. Hareket azaltma açıksa hepsi durur.
- Kartta gösterilen üç fotoğraf, "Ne içsem?" havuzundan gelir.

### 3.3 Grup afişleri
- 2 sütun fotoğraflı kartlar, 196 px, yuvarlak 18 px. Sol altta grup adı renkli etiket içinde (Unbounded 900).
- Gruplar: Kahve, **Spesiyal** (eski adı Kahvesiz; kategorileri aynen kalır), Yiyecek, Tatlı, Paket & Atıştırmalık (tam genişlik).
- Karta dokunmak o grubun ilk kategorisine kaydırır.
- Grup fotoğrafı admin'den seçilir (A2); bu sürümde seed'de sabittir.

## 4. Menü listesi

- Yapışkan grup + kategori şeridi aynen kalır (ana spec 3.2).
- **Kategori afişi:** her kategori, grup renginde 160 px'lik bir afişle başlar. Kategori adı Unbounded 900, büyük harf, beyaz ya da mürekkep (renk kuralına göre). Sağ üstte yıldız. Kategorinin fotoğrafı varsa afişin zemini olur; yoksa düz renk + büyük ikon.
- **Ürün kartları:** 2 sütun ızgara (telefonda da).
  - Fotoğraflı kart: beyaz, üstte 160 px fotoğraf, altta ad (Montserrat 800, büyük harf) ve kategori adı (küçük, aralıklı).
  - Fotoğrafsız kart: grup renginde, ikon + ad (Unbounded 900) + fiyat; yükseklik 132 px.
  - **Fiyat rozeti:** kırmızı yıldızın içinde beyaz fiyat ("300 ₺"). İki boylu üründe ikinci, daha küçük sarı yıldız yanında durur; içinde boy harfi ve fiyat ("N 180 ₺", "B 200 ₺"; Tek/Duble için "T", "D"). Ekran okuyucu tam metni okur: "Normal 180 ₺, Büyük 200 ₺".
  - Tükendi: rozet yerine mürekkep renkte "Tükendi" etiketi, fotoğraf gri tonlu, kontrast korunur.
- Ekstralar satırı kategori sonunda kalır.
- 360 px'te iki sütun sığar; uzun adlar alt satıra kırılır, yatay kaydırma olmaz.

## 5. Ürün detayı (yerleşim)

- Alttan açılan tam ekran sayfa; geçmiş/geri tuşu davranışı aynen kalır.
- Fotoğraf varsa üstte fotoğraf (yaklaşık 450 px). Instagram 2×2 düzeni ileride ek doku fotoğrafları gelince açılır; bu sürümde tek fotoğraf.
- Altta kırmızı panel (grup rengi), yuvarlak üst köşe 26 px: ad (Unbounded 900, 32 px), sağ üstte büyük beyaz yıldız içinde fiyat; iki boylu üründe iki boy düğme gibi yan yana ("Normal 180 ₺" / "Büyük 200 ₺", seçim yalnızca görsel vurgu).
- Varsa "İÇİNDEKİLER" başlığı ve metni, alerjenler (ana spec 3.8), dudak/tavşan/yıldız süsü, alt notu: "Alerjen bilgisi için ekibimize sorabilirsin." (alerjen girilmemişse).
- Fotoğraf yoksa panel ekranın tamamını kaplar, ikon büyük durur.

## 6. "Ne içsem?" (ana spec 3.5'in yerine)

- Karta dokununca tam ekran sarı katman açılır (geçmişe kayıt eklenir, geri tuşu kapatır).
- Ortada üç kutu, resmi slot kutusu gibi yan yana. Kutuların içinde **dudak, tavşan, yıldız** ikonları slot makarası gibi döner.
- Kutular soldan sağa sırayla yavaşlar (1,4 / 1,9 / 2,4 sn) ve her biri **bir içecek fotoğrafında durur**: üç farklı öneri.
- Durunca her kutunun altında içeceğin adı ve fiyatı çıkar. Kutuya dokunmak o ürünün detayını açar.
- "Tekrar çevir" düğmesi. Büyük kırmızı "ÇEVİR" düğmesi ilk dönüşü başlatır; katman açılır açılmaz bir kez kendiliğinden döner.
- Makine görünümü yok (kol, ampul, kasa yok). Yalnızca üç kutu, tavşan maskotu ve konuşma balonu.
- Havuz: görünür, tükenmemiş, fotoğrafı olan, "Ne içsem'e dahil" (kategori varsayılanı) ürünler. Üç kutu birbirinden farklı ürün seçer. Havuzda 3'ten az ürün varsa kutu sayısı ona iner; hiç yoksa "Şu an önerecek içecek yok. Ekibimize sorabilirsin." yazar.
- Sıcak/Soğuk sorusu bu sürümde yok.
- Hareket azaltma açıksa dönme yok; üç öneri kısa kararmayla belirir.

## 7. Arama ve WiFi

- Davranış aynen kalır. Görünüm yeni dile uyar: arama sonuçları aynı ürün kartlarıyla, 2 sütun.

## 8. Kabul ölçütleri

1. Ana sayfa 390×844'te tuvaldeki A ekranıyla aynı düzende görünür (vitrin, Ne içsem kartı, grup afişleri).
2. Vitrin üç slaytı döndürür; hareket azaltmada durur.
3. Ne içsem: üç ikon döner, üç farklı içecekte durur, kutuya dokununca detay açılır, geri tuşu menüye döner.
4. Kartlar 360 px'te yatay kaydırma yapmaz; iki boylu üründe iki fiyat da görünür.
5. Fotoğraf/ikon dışında hiçbir marka öğesi yeniden çizilmez; logo ve ikonlar resmi PNG'lerden gelir.
6. Mevcut testlerdeki davranışlar (arama, geri tuşu, WiFi kopyalama, tükendi, intro) korunur; görünümle ilgili testler yeni yerleşime göre güncellenir.

## 9. Kapsam dışı (bu adım)

- Three.js sahnesi (ana spec 5.3) — ayrı plan.
- Admin'den grup/kategori fotoğrafı seçme, Ne içsem havuzu ayarı — A2.
- EN/AR — sonraki plan.

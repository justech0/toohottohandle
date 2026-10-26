# v1 Afiş — son inceleme sonucu (2026-10-26)

İnceleme: Opus, 5cd7ae4..6491837. Critical 0, Important 5 — hepsi düzeltildi (27b4d45, testler bcb70c9).

1. Spesiyal afişi ve örnek ube fotoğrafında Instagram yazısı vardı → yazısız orta şerit kırpıldı.
2. Vitrin her 4 sn ekran okuyucuya okunuyordu, durdurulamıyordu → kendi dönerken duyurulmaz, nokta seçilince duyurulur; arama/WiFi/detay açıkken ve odak vitrindeyken durur.
3. Ne içsem "dönerken tekrar dokunma" testi hiç düşemezdi → zorla tıklama + zaman kontrolüyle yeniden yazıldı.
4. Ne içsem odak kaybediyor, sonuçlar okunmuyordu → açılınca odak "Kapat"a, kapanınca kareye; sonuçlar canlı bölgede okunur; kutu etiketi ad + fiyat.
5. Fotoğraflı içecek azken "Tekrar çevir" hep aynı üçünü veriyordu → fotoğraf önceliği kalır, ama havuz yeterliyse bir önceki üç öneri tekrar edilmez.

Sonuç: vitest 47/47, playwright 78/78, vitrin/Ne içsem/intro 3 tekrar 72/72.

## Ertelenen küçükler
- Vitrin noktasına basınca sayaç sıfırlanmıyor (hemen geçebilir).
- Vitrin başlığı ile noktalar dar ekranda birbirine yakın; başlık satır sayısı slayta göre değişiyor.
- Vitrin üstünde karartma yok (SHINE/FREE'de beyaz ikon kontrastı düşük olabilir).
- SHINE görseli yüklenmezse sarı zemin üstünde beyaz yazı.
- Sayfa ortadan açılırsa (geri gelme) hidrasyona kadar üst bar beyaz yazı kağıt zeminde.
- Fotoğraflı iki boylu kartta kategori adı sarı yıldızın altına girebilir (360).
- Fotoğraflı kart adları dar; kelime ortadan kırılabilir (overflow-wrap).
- %200 yazı boyutunda sabit yükseklikli afiş/kare kırpabilir.
- Makara başlangıcı 30 ms zamanlayıcıya dayanıyor (yük altında animasyon atlanabilir).
- Ne içsem sonuçları üç makara durunca birlikte çıkıyor; yerleşim kayıyor.
- Açık Ne içsem + dense ızgara: görsel sıra ≠ DOM sırası; 1440'ta makaralar büyük, 320w görsel bulanık.
- Vitrin görselleri üçü de hemen yükleniyor (~221 KB); ilk sıra grup görselleri lazy.
- İstemciye gereğinden büyük ürün verisi gidiyor (inSuggest, NeIcsem tam kart).
- Kullanılmayan Logo.tsx; lib/brand → app tip içe aktarımı.
- Windows Yüksek Kontrast'ta maskeli ikonlar kaybolur (forced-color-adjust).
- Detayda "İÇİNDEKİLER" başlığı ve fotoğraflıyken ikon süsü yok.
- Vitrin geçişi küçülerek geliyor (spec "hafif büyüme" diyor).
- Test boşlukları: vitrin ekran dışı duraklama, 360'ta iki fiyat görünürlüğü, fotoğrafsız Ne içsem uçtan uca.

## Not
- `shine.webp` (markanın paylaşımı) sağ üstte "Yapay zeka ile üretilmiştir" etiketi taşıyor; vitrinde kırpılıyor.

# Ne içsem: dikey slot davranışını geri getir

- Kaynak: afiş spec bölüm 6 ve kullanıcının yukarıdan aşağı hareket isteği.
- Kök neden: a855863 ile eklenen ne-relief katmanı hareketli şeridin üstünü beyaz arka planla kapatıyor. Şerit ayrıca yukarı yönde ilerliyordu.
- Yalnızca Ne içsem'deki 3D katmanı kaldır; vitrindeki 3D davranışını koru.
- Sonuç şeridin başında olsun. Şerit negatif konumdan sıfıra inerek yukarıdan aşağı aksın.
- 1,4 / 1,9 / 2,4 saniyede durma, aynı içecekte hizalanma, tekrar çevirmede yeni öneri, fotoğraf hatası ve hareket azaltma davranışları korunur.
- Önce tarayıcıda yön ve görünür şerit regresyonunu kırmızı doğrula; sonra düzelt, test/build ve mobil/masaüstü kontrolünü tamamla. Ayrı PR; merge kullanıcıda.

Çalışma sırasında PR #19 main'e alındı. Buradaki 3D katman kaldırması, şerit bulanıklığı, iç gölgeler, hero ikon kaldırması ve Kurabiyeler adı korundu. Son değişiklik yalnızca aşağı yönlü akış ve sonuç sırasıdır.

Güncel main ile doğrulama: 176/176 veritabanlı Vitest; 110/110 Playwright; TypeScript ve üretim build başarılı. Mobil/masaüstü görsel kontrol tamamlandı; aynı içecekte hizalanma, tekrarda farklı öneri ve hareket azaltma geçti.

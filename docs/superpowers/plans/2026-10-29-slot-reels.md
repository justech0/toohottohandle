# Ne içsem: dikey slot davranışını geri getir

- Kaynak: afiş spec bölüm 6 ve kullanıcının yukarıdan aşağı hareket isteği.
- Kök neden: a855863 ile eklenen ne-relief katmanı hareketli şeridin üstünü beyaz arka planla kapatıyor. Şerit ayrıca yukarı yönde ilerliyordu.
- Yalnızca Ne içsem'deki 3D katmanı kaldır; vitrindeki 3D davranışını koru.
- Sonuç şeridin başında olsun. Şerit negatif konumdan sıfıra inerek yukarıdan aşağı aksın.
- 1,4 / 1,9 / 2,4 saniyede durma, aynı içecekte hizalanma, tekrar çevirmede yeni öneri, fotoğraf hatası ve hareket azaltma davranışları korunur.
- Önce tarayıcıda yön ve görünür şerit regresyonunu kırmızı doğrula; sonra düzelt, test/build ve mobil/masaüstü kontrolünü tamamla. Ayrı PR; merge kullanıcıda.

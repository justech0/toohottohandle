# Admin revize incelemesi

Mevcut kırmızı/krem admin tasarımı, resmi marka varlıkları ve fotoğraf hattı korundu. Vitrin, kullanıcılar, Ne içsem, WiFi/istatistik/QR ve katalog ekranlarının dolu hâlleri 390 ve 1440 px genişlikte kontrol edildi; yatay taşma yok. Ekran görüntüleri PR'a eklendi.

Açılır listeler role=combobox/listbox/option, seçili satır, 44 px satırlar, oklar/Enter/Esc, dışarı dokunma ve odağın geri dönmesiyle doğrulandı. Etiketin seçeneğe tıklayınca listeyi yeniden açması engellendi. Fotoğraf seçimi istemci hazır olana kadar kapalı. İlk HTML yüklemesinde hata veren vitrin görselleri de algılanır; açık marka renklerinde koyu metin kullanılır.

Hesap oluşturma ve silme, geçici şifre değişimi, menü kayıtları, fotoğraf referansları, audit e-postaları ve 30 gün/son 25 saklama kuralı gerçek MySQL üzerinde test edildi. WiFi şifreleri ve geçici şifreler audit verisine yazılmaz. WiFi/katalog alanları eşzamanlı kayıtta birbirini ezmez.

## Doğrulama — 2026-10-29

- Node 22.23.4; yerel MySQL, iki ayrı test veritabanı.
- Vitest: 38 dosya, 201/201 test (entegrasyonlar dahil, atlanan yok).
- Playwright: 121/121 test (admin, EN/AR/RTL ve yeni ekranlar dahil, atlanan yok).
- TypeScript ve production build başarılı. 3D gzip 164.3 KB / 180 KB.
- npm audit: 0 açık. Impeccable mekanik kontrolünde bulgu yok.
- 390/1440 px dolu ekranlar görsel olarak kontrol edildi. Liste seçenekleri 44 px; oklar/Enter/Esc/odak ve gizli form değerleri tarayıcıda doğrulandı.
- PNG 1600×1600; bağımsız ZXing decode doğru HTTPS menü adresini okudu.
- Gerçek telefon ve VoiceOver/TalkBack testi yapılmadı. Canlı ortama veya main dalına yazılmadı; merge yok.

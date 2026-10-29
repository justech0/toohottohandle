# A2 — Admin revize

Main tabanı: 14061a3. Mevcut admin tasarımı ve fotoğraf hattı korunur.

1. Önce entegrasyon ve e2e: vitrin CRUD, admin hesapları ve zorunlu şifre değişimi, log saklama, öneri ayarları, erişilebilir açılır liste.
2. Yeni migration: vitrin seed'i, öneri ayarları, geçici şifre bayrağı ve kalıcı audit e-postası.
3. Vitrin, kullanıcılar ve Ne içsem ekranları; mevcut ekranlarda dışarı aktar, loglar, WiFi ve QR düzenlemeleri.
4. Tam veritabanlı Vitest, TypeScript, production build ve Playwright suite. Masaüstü/mobil kontrol.
5. Proje durumu güncellemesi, commit, push ve PR. Merge yok.

Kullanıcı onayıyla i18n-en-ar altyapısı da bu PR kapsamında birleştirildi.

## Uygulama notları

- Vitrin seed'i migration içinde bir kez yüklenir; DB'siz önizleme verisi `db/seed/hero.ts` içinde kalır.
- Audit e-postası her INSERT'te parametreli alt sorguyla yazılır; Hostinger'de ek trigger yetkisi gerekmez.
- WiFi ve katalog kayıtları diğer ekranın alanlarını satır kilidi altında korur.
- ZIP ve menü logları yeni alanları kapsar; eski loglar yeni alanlar yoksa güncel değerleri korur.
- PNG mevcut SVG'nin resmi logosunu kullanır; yeni çizim yapılmadı. 1600×1600 PNG bağımsız ZXing okuyucuyla kontrol edildi.
- Fotoğraf seçimi istemci hazır olana kadar kapalıdır; erken dosya seçiminde olay kaybolmaz.

## Doğrulama — 2026-10-29

- Node 22.23.4; yerel MySQL, iki ayrı test veritabanı.
- Vitest: 38 dosya, 201/201 test (entegrasyonlar dahil, atlanan yok).
- Playwright: 121/121 test (admin, EN/AR/RTL ve yeni ekranlar dahil, atlanan yok).
- TypeScript ve production build başarılı. 3D gzip 164.3 KB / 180 KB.
- npm audit: 0 açık. Impeccable mekanik kontrolünde bulgu yok.
- 390/1440 px dolu ekranlar görsel olarak kontrol edildi. Liste seçenekleri 44 px; oklar/Enter/Esc/odak ve gizli form değerleri tarayıcıda doğrulandı.
- PNG 1600×1600; bağımsız ZXing decode doğru HTTPS menü adresini okudu.
- Gerçek telefon ve VoiceOver/TalkBack testi yapılmadı. Canlı ortama veya main dalına yazılmadı; merge yok.

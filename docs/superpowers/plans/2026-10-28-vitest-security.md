# Vitest güvenlik güncellemesi

- Hostinger taramasındaki Vitest 3.2.6, mocker ve tinypool uyarılarını kapat.
- Önce mevcut bağımlılıklarla npm audit bulgularını doğrula.
- Vitest'i 4.1.12'ye sabitle; bağımlılık kilidini kaydet.
- npm audit, veritabanlı Vitest, TypeScript, üretim build ve Playwright kontrollerini çalıştır.
- Sonucu ayrı PR olarak sun; main ve Hostinger yayınına dokunma.

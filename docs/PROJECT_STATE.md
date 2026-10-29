# Proje durumu — Too Hot To Handle QR menü

Son güncelleme: 2026-10-29. Kurallar ve komutlar: `AGENTS.md`. Sıradaki işlerin hazır promptları: `docs/handoff/PROMPTS.md`.

## Canlıda (Hostinger, `main`)

- `/` yakında sayfası, `/qr` menü (v1 "Afiş" tasarımı: vitrin, grup afişleri, Ne içsem, fiyat çipleri, arama, WiFi, detay).
- MySQL veritabanı: açılışta şema + seed (19 kategori, 129 ürün, 4 ekstra). Menü veritabanından, önbellekli.
- Foto klasörü `THTH_UPLOAD_DIR` deploy sonrası kalıcı (doğrulandı).
- Admin: kurulum (PR #4); ürün düzenleme ve geçmiş (PR #5); ürün işlemleri (PR #7); kategori, grup, ekstra, etiket ve ayar yönetimi (PR #8); güvenli fotoğraf yönetimi (PR #9); toplu fiyat ve menü kopyaları (PR #10); ZIP yedek ve geri yükleme (PR #11); istatistik ve logolu QR (PR #12).
- Alan adı ve HTTPS Hostinger üzerinden çalışıyor (2026-10-29: `/qr` 200 ve `platform: hostinger` doğrulandı). Node.js 22, `.next` çıktısı ve GitHub `main` otomatik yayını etkin.
- PR #17 tamamlandı; renkli tavşan puanları ve başarılı gönderim sonrası TOOHOTT efekti Hostinger'de `62959ea` build'iyle yayında.

## Son tamamlananlar ve yerel araçlar

- PR #17 (`a2-feedback`, merge edildi ve Hostinger'de yayında): Menü sonunda “Söz sende” kartı, temalı konu seçimi, renkli 1–5 tavşan puanı, mesaj, isteğe bağlı ad/iletişim/fotoğraf. Yalnızca admin görür. Başarılı gönderimde beş puana TOOHOTT efekti, düşük puana teşekkür ve iyileştirme mesajı. `/qr/admin/geri-bildirim`: filtre, 30'ar sayfalama, okundu ve kalıcı silme; ana sayfada okunmamış sayısı, son üç mesaj ve son 30 gün ortalaması. Yeni admin tasarımıyla birleştirildi.
- `008_feedback` yeni tablo ekler. Fotoğraflar mevcut `THTH_UPLOAD_DIR/feedback` altında tutulur; yalnızca oturumlu admin okur, silmede dosya da kaldırılır. Menü yedeğine dahil değildir. Oran sınırı tek sunucunun belleğindedir; yeniden başlatmada sıfırlanır.
- PR #13 (`a3-3d`, merge edildi): Resmî SVG kaynaklarından uyarlanabilir 3D HOT ve Ne İçsem kabartmaları; 45 ms kare koruması ve SVG düşüşü.
- Windows veritabanlı testleri için projeye özel Laragon MySQL 3307 yardımcısı eklendi; yerel şifre yalnızca git dışındaki `.env.test.local` dosyasında tutuluyor.

## Sıradaki (sırayla)

1. Yalnızca Hostinger yapılandırması (`a2-hostinger-only`) ve eski sağlayıcının hesap bağlantısını kapatma.
2. Ertelenen küçükler (`docs/superpowers/plans/2026-10-26-v1-review-todo.md`)
3. EN + AR (RTL)
4. Eski sağlayıcının hesap tarafındaki Git/alan adı bağlantısının kaldırıldığını doğrula; site ve DNS Hostinger'de çalışıyor.

## Açık konular

- `a2-hostinger-only`: kullanılmayan `vercel.json` kaldırıldı, yerel sağlayıcı metaverisi git dışında tutuldu ve aktif yayın belgeleri Hostinger'e göre düzeltildi. Uygulama, veritabanı ve dosya deposu değişmedi. Hesap tarafındaki bağlantı kaldırma işlemi ayrıca erişim gerektirir.
- Belirsiz fotoğraflar hangi ürün: matcha içecek, gözlüklü frappe, portakallı soğuk, tepside fincan, yaban mersinli tart, çörekler.
- Hostinger'de IP başlığı doğrulaması (sahte `x-forwarded-for` ile kilit atlatılamıyor mu) — DNS sonrası, admin hesabı açılınca.
- Güvenlik güncellemesi (`a2-vitest-security`): Vitest 4.1.12'ye sabitlendi; mocker 4.1.12, tinypool bağımlılığı kaldırıldı. Tekrarlanabilir kurulum için package-lock.json eklendi. npm audit: 0 açık; veritabanlı Vitest: 171/171; TypeScript ve üretim build başarılı. Yayın PR merge sonrasında.
`a2-vitest-security` doğrulaması: veritabanlı Playwright 104/104 geçti (2026-10-28).

Geri bildirim ilk doğrulaması (2026-10-29): Vitest 176/176 (veritabanı dahil), Playwright 106/106; TypeScript/build ve 3D bütçesi başarılı, npm audit 0 açık. Sonraki revizyon ve yayın aşağıda kayıtlıdır.

PR #17 form revizyonu ve main çakışma çözümü: 176/176 veritabanlı test, 109/109 tarayıcı testi, TypeScript/build başarılı (2026-10-29).

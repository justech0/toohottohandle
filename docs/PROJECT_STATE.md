# Proje durumu — Too Hot To Handle QR menü

Son güncelleme: 2026-10-27. Kurallar ve komutlar: `AGENTS.md`. Sıradaki işlerin hazır promptları: `docs/handoff/PROMPTS.md`.

## Canlıda (Hostinger, `main`)

- `/` yakında sayfası, `/qr` menü (v1 "Afiş" tasarımı: vitrin, grup afişleri, Ne içsem, fiyat çipleri, arama, WiFi, detay).
- MySQL veritabanı: açılışta şema + seed (19 kategori, 129 ürün, 4 ekstra). Menü veritabanından, önbellekli.
- Foto klasörü `THTH_UPLOAD_DIR` deploy sonrası kalıcı (doğrulandı).
- Admin: kurulum (kayıttaki kodla), giriş, kilit, sıfırlama, çıkış (PR #4); ürün listesi/düzenleme, fiyat onayı, geçmiş, son işlemi geri al (PR #5).
- DNS hâlâ Vercel'i gösteriyor; alan adı bağlanınca SSL + HTTPS yönlendirmesi açılacak.

## Bekleyen PR

- `a2-4-catalog`: kategori, grup, ekstra, etiket ve ayar yönetimi; ürün etiketleri; WiFi geçmiş maskelemesi ve test WiFi uyarısı. PR açılacak.
- Windows veritabanlı testleri için projeye özel Laragon MySQL 3307 yardımcısı var; yerel şifre yalnızca git dışındaki `.env.test.local` dosyasında tutuluyor.

## Sıradaki (sırayla)

1. 5 — fotoğraf yükleme
2. Geri bildirim (HVK uyarlaması, yalnızca admin görür) — prompt 12
3. 6 — toplu fiyat + menü kopyaları
4. 7 — ZIP yedek / geri yükleme
5. 8 — istatistik + logolu QR
6. Ertelenen küçükler (`docs/superpowers/plans/2026-10-26-v1-review-todo.md`)
7. EN + AR (RTL)
8. 3D (A3)
9. DNS + SSL + Vercel'den alan adını kaldırma (Enes'le)

## Açık konular

- Belirsiz fotoğraflar hangi ürün: matcha içecek, gözlüklü frappe, portakallı soğuk, tepside fincan, yaban mersinli tart, çörekler.
- Hostinger'de IP başlığı doğrulaması (sahte `x-forwarded-for` ile kilit atlatılamıyor mu) — DNS sonrası, admin hesabı açılınca.
- Build uyarısı: vitest'in alt paketlerinde (tinypool) kritik açık; yalnızca test aracı. `vitest` 3.2.7'ye yükselt.

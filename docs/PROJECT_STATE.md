# Proje durumu — Too Hot To Handle QR menü

Son güncelleme: 2026-10-28. Kurallar ve komutlar: `AGENTS.md`. Sıradaki işlerin hazır promptları: `docs/handoff/PROMPTS.md`.

## Canlıda (Hostinger, `main`)

- `/` yakında sayfası, `/qr` menü (v1 "Afiş" tasarımı: vitrin, grup afişleri, Ne içsem, fiyat çipleri, arama, WiFi, detay).
- MySQL veritabanı: açılışta şema + seed (19 kategori, 129 ürün, 4 ekstra). Menü veritabanından, önbellekli.
- Foto klasörü `THTH_UPLOAD_DIR` deploy sonrası kalıcı (doğrulandı).
- Admin: kurulum (PR #4); ürün düzenleme ve geçmiş (PR #5); ürün işlemleri (PR #7); kategori, grup, ekstra, etiket ve ayar yönetimi (PR #8); güvenli fotoğraf yönetimi (PR #9); toplu fiyat ve menü kopyaları (PR #10); ZIP yedek ve geri yükleme (PR #11); istatistik ve logolu QR (PR #12).
- DNS hâlâ Vercel'i gösteriyor; alan adı bağlanınca SSL + HTTPS yönlendirmesi açılacak.

## Bekleyen PR

- PR #13 (`a3-3d`): Resmî SVG kaynaklarından uyarlanabilir 3D HOT ve Ne İçsem kabartmaları; 45 ms kare koruması ve SVG düşüşü.
- Windows veritabanlı testleri için projeye özel Laragon MySQL 3307 yardımcısı eklendi; yerel şifre yalnızca git dışındaki `.env.test.local` dosyasında tutuluyor.

## Sıradaki (sırayla)

1. Geri bildirim (HVK uyarlaması, yalnızca admin görür) — prompt 12
2. Ertelenen küçükler (`docs/superpowers/plans/2026-10-26-v1-review-todo.md`)
3. EN + AR (RTL)
4. DNS + SSL + Vercel'den alan adını kaldırma (Enes'le)

## Açık konular

- Belirsiz fotoğraflar hangi ürün: matcha içecek, gözlüklü frappe, portakallı soğuk, tepside fincan, yaban mersinli tart, çörekler.
- Hostinger'de IP başlığı doğrulaması (sahte `x-forwarded-for` ile kilit atlatılamıyor mu) — DNS sonrası, admin hesabı açılınca.
- Build uyarısı: vitest'in alt paketlerinde (tinypool) kritik açık; yalnızca test aracı. `vitest` 3.2.7'ye yükselt.

# Proje durumu — Too Hot To Handle QR menü

Son güncelleme: 2026-10-26. Kurallar ve komutlar: `AGENTS.md`. Sıradaki işlerin hazır promptları: `docs/handoff/PROMPTS.md`.

## Canlıda (Hostinger, `main`)

- `/` yakında sayfası, `/qr` menü (v1 "Afiş" tasarımı: vitrin, grup afişleri, Ne içsem, fiyat çipleri, arama, WiFi, detay).
- MySQL veritabanı: açılışta şema + seed (19 kategori, 129 ürün, 4 ekstra). Menü veritabanından, önbellekli.
- Foto klasörü `THTH_UPLOAD_DIR` deploy sonrası kalıcı (doğrulandı).
- Admin: kurulum (kayıttaki kodla), giriş, kilit, sıfırlama, çıkış (PR #4).
- DNS hâlâ Vercel'i gösteriyor; alan adı bağlanınca SSL + HTTPS yönlendirmesi açılacak.

## Bekleyen PR

- #5 `a2-3-products`: ürün listesi, ürün düzenleme, fiyat onayı, geçmiş, son işlemi geri al.

## Sıradaki (sırayla)

1. 3b — tükendi, görünür anahtarı, ekle / çoğalt / sil (kopya ile) / sıralama
2. 4 — kategoriler, gruplar, ekstralar, etiketler, ayarlar (WiFi, açılış saati, alt not)
3. 5 — fotoğraf yükleme
4. 6 — toplu fiyat + menü kopyaları
5. 7 — ZIP yedek / geri yükleme
6. 8 — istatistik + logolu QR
7. Ertelenen küçükler (`docs/superpowers/plans/2026-10-26-v1-review-todo.md`)
8. EN + AR (RTL)
9. 3D (A3)
10. DNS + SSL + Vercel'den alan adını kaldırma (Enes'le)

## Açık konular

- Belirsiz fotoğraflar hangi ürün: matcha içecek, gözlüklü frappe, portakallı soğuk, tepside fincan, yaban mersinli tart, çörekler.
- Hostinger'de IP başlığı doğrulaması (sahte `x-forwarded-for` ile kilit atlatılamıyor mu) — DNS sonrası, admin hesabı açılınca.
- Build uyarısı: vitest'in alt paketlerinde (tinypool) kritik açık; yalnızca test aracı. `vitest` 3.2.7'ye yükselt.

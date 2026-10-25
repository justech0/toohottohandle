# Proje durumu — Too Hot To Handle QR menü

Son güncelleme: 2026-10-25

## Bitti (dal: `qr-menu`)

Plan: `docs/superpowers/plans/2026-10-25-thth-qr-v0-gorunur-menu.md`

- Next.js 16 iskeleti; yakında sayfası `public/yakinda/` altında, `/` adresinde aynen çalışıyor.
- Excel'den seed: 19 kategori, 129 ürün, 4 ekstra (`db/seed/menu.json`, maliyet verisi yok). Dönüştürücü: `scripts/excel_to_seed.py`.
- `/qr` menüsü: grup ve kategori şeritleri, liste, iki boylu fiyatlar, ekstralar, alt bilgi.
- Arama (Türkçe ve aksan duyarsız), ürün detayı (geri tuşu doğru), WiFi kartı (ayrı kopyalama, izin yoksa metni seçer), 2D giriş animasyonu.
- Testler: Vitest birim + Playwright uçtan uca. Çalıştırma ortamı Vercel sandbox `thth-qr-dev` (bu oturumun container'ında npm kapalı).

## Sıradaki

1. A2: Neon veritabanı ve admin paneli (Server Action'lar, `updateTag('menu')`).
2. EN/AR dil ve RTL, service worker, istatistik.
3. 3D HOT ve "Ne içsem?".
4. `main`'e birleştirme ve Vercel framework ayarının Next.js yapılması (kullanıcı onayıyla).

## Notlar

- Repo hâlâ herkese açık; gizli yapılmalı.
- `main` ve canlı site bu dalda değişmedi.

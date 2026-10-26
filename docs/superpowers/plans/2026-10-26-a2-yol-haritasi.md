# A2 ve sonrası — yol haritası (Hostinger)

- Tarih: 2026-10-26
- Dayanak: ana spec bölüm 4 (admin) ve 5 (mimari). Enes'in kararları (2026-10-26): barındırma Hostinger Business, veritabanı **Hostinger MySQL**, fotoğraflar **Hostinger diski**. Sıra: admin + backend, ertelenen küçükler, EN + AR, 3D. "Ağır ağır ilerleyelim": her dilim ayrı plan, ayrı PR, Enes onayıyla merge.
- DNS sonra bağlanır. O zamana kadar canlı kontrol Vercel sandbox önizlemesinde ve Hostinger sunucusuna IP ile yapılır.

## Spec'ten sapmalar (Hostinger'e göre)

| Konu | Spec | Şimdi | Neden |
|---|---|---|---|
| Veritabanı | Neon Postgres + Drizzle | Hostinger MySQL (127.0.0.1:3306) + Drizzle `mysql2` | Planda var, ücretsiz, aynı sunucu, uyumaz. `hosting_databases_setup-website` bağlantıyı ortam değişkenlerine yazar, şifre sohbete hiç gelmez |
| `INSERT … ON CONFLICT … RETURNING` | Postgres | `INSERT … ON DUPLICATE KEY UPDATE` + aynı işlemde `SELECT` | MySQL'de RETURNING yok |
| Fotoğraf deposu | Vercel Blob / R2 | Alan adı klasöründe deploy dışı bir klasör (`THTH_UPLOAD_DIR`). `/qr/img/[key]` Node'dan, 1 yıl önbellekli verilir | Deploy yalnızca `nodejs/` sürümlerini ve `public_html`'i değiştirir. İlk dilimde canlıda doğrulanır: dosya yaz → yeniden deploy → dosya duruyor mu |
| Önbellek | `'use cache: remote'` | `'use cache'` (tek Node süreci, bellekte) | Hostinger'de tek süreç var |
| argon2id | — | `@node-rs/argon2` (hazır ikili, derleme yok) | Hostinger build'inde derleyici gerekmesin |
| Testte veritabanı | Neon dalı | Vercel sandbox'ta yerel MariaDB | Gerçek bağlantı bilgisi teste girmez |
| Yedek ZIP | depodan `/qr/api/admin/image/[key]` | aynı yol, diskten | — |

Değişmeyenler: Server Action + `updateTag('menu')`, geçmiş ve son işlemi geri al, kopyalar (25), tükendi saatleri (Europe/Istanbul), deneme sınırı kuralları, güvenlik başlıkları, istatistik toplu yazma, maliyet verisi hiçbir yerde yok.

## Dilimler

Her dilim: kısa plan → testler önce → uygulama → sandbox'ta tam test → PR → Enes merge → Hostinger otomatik deploy.

1. **Veritabanı temeli.** Şema (5.4, MySQL), migration, `menu.json` → veritabanı seed, `getMenu` veritabanından okur (veritabanı yoksa seed dosyasından, testler ve önizleme bozulmaz), `/qr/api/health`. Hostinger'de veritabanı kurulumu ve disk kalıcılık denemesi.
2. **Giriş.** `admin:create` / `admin:reset-password` komutları, giriş sayfası, oturum, deneme sınırı, "tüm cihazlardan çıkış".
3. **Ürünler.** Liste, ekle/düzenle/çoğalt/sil (çift onay), sıralama, görünür, tükendi seçenekleri, fiyat onayı, geçmiş, son işlemi geri al, kaydedilmemiş değişiklik uyarısı.
4. **Kategoriler, gruplar, ekstralar, etiketler, ayarlar** (WiFi maskeli geçmiş, açılış saati, alt not, istatistik anahtarı).
5. **Fotoğraf.** Tarayıcıda küçültme, `sharp` ile 320/720/1280 WebP, içerik özetli ad, odak noktası, 30 gün sonra temizlik. Grup ve kategori fotoğrafı seçimi.
6. **Toplu fiyat** ve **menü kopyaları** (geri dönme).
7. **ZIP yedek ve geri yükleme.**
8. **İstatistik ve logolu QR SVG.**

Sonra: ertelenen küçükler (`2026-10-26-v1-review-todo.md`), EN + AR (RTL), 3D (A3).

## Enes'ten gerekenler (sırası gelince)

- Dilim 1 sonunda: hPanel'de veritabanı oluşturma onayı (ben API ile kurarım, şifre sohbete gelmez).
- Dilim 2 sonunda: `admin:create` komutunu Hostinger'de çalıştırmak için SSH ya da hPanel terminali; admin e-postası. Şifreyi kendin girersin.
- Belirsiz fotoğrafların hangi ürün olduğu (matcha, gözlüklü frappe, portakallı soğuk, tepside fincan, yaban mersinli tart, çörekler).

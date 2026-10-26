# AGENTS.md — bu repoda çalışan her yapay zeka için kurallar

Too Hot To Handle kafesinin QR menüsü ve admin paneli. Tek Next.js uygulaması. Sahibi: Enes.
Önce şunları oku: `docs/PROJECT_STATE.md` (durum), `docs/superpowers/plans/2026-10-26-a2-yol-haritasi.md` (sıra ve Hostinger kararları),
`docs/superpowers/specs/2026-10-25-thth-qr-menu-design.md` (ana spec) ve `docs/superpowers/specs/2026-10-26-thth-qr-v1-afis-design.md` (görsel yön).

## Değişmez kurallar

1. **Gizli bilgi yok.** Şifre, anahtar, `DATABASE_URL` değeri sohbete, koda, commit'e, loga yazılmaz. Repoda yalnızca `.env.example`.
2. **Maliyet verisi yok.** Excel (`SATIŞ ve MALİYET…xlsx`) repoya girmez. Maliyet, COGS, zam oranı hiçbir dosyada, tabloda, ekranda yok.
3. **`main`e doğrudan push ve merge yok.** Her iş ayrı dal (`a2-…`) + PR. Merge'ü Enes yapar. `main`e merge = Hostinger'de otomatik canlı yayın.
4. **Marka varlıkları yeniden çizilmez.** Logo/ikonlar `public/qr/brand/*.png` (resmi dosyalardan, `scripts/brand_assets.py`). Emoji yok. Karanlık/ay teması yok.
5. **Test önce yazılır**, kırmızı görülür, sonra kod. PR'dan önce tam suite yeşil olmalı.
6. Kullanıcıyla Türkçe, kısa konuş. Kod yorumları Türkçe olabilir.

## Yığın

Next.js 16.4 (App Router, `cacheComponents: true`), React 19, TypeScript, MySQL/MariaDB (`mysql2`, el yazımı SQL, ORM yok),
`@node-rs/argon2`, Vitest 3, Playwright 1.64 (Pixel 7, 390×844). Node 22.

| Yer | Ne |
|---|---|
| `db/migrations.ts` | Şema adımları (`001_menu`, `002_auth`, `003_audit`…). Yayındaki adım değiştirilmez, yenisi eklenir. Açılışta kendiliğinden uygulanır. |
| `lib/db/` | havuz (`client.ts`), migrate/seed/okuma (`setup.ts`), satır tipleri (`rows.ts`) |
| `lib/menu/getMenu.ts` | Menü: `DATABASE_URL` varsa veritabanı (`'use cache'` + `cacheTag('menu')`), yoksa `db/seed/menu.json` |
| `lib/auth/` | giriş çekirdeği, kilit, tek kullanımlık kod, oturum çerezi |
| `lib/admin/` | admin iş mantığı (saf doğrulama + veritabanı işlemleri) |
| `app/qr/` | menü; `app/qr/admin/` admin; `app/qr/api/` API |
| `instrumentation.ts` → `lib/boot.ts` | açılışta migrate + seed + kurulum/sıfırlama kodu (sunucu kaydına) |

## Tuzaklar (bunlara takıldık)

- **cacheComponents:** cookie/DB okuyan her bileşen `<Suspense>` içinde olmalı ve başında `await connection()` çağırmalı; yoksa build sırasında veri statik HTML'e gömülür.
- **Server Action:** menüyü değiştiren her action önce `requireAdmin()`, sonunda `updateTag('menu')` çağırır. Menü verisini değiştiren iş Route Handler'da yapılmaz (`updateTag` orada çalışmaz).
- **Formlar:** çok alanlı formda `<form action={...}>` kullanma; React hata sonrası formu boşaltır. `onSubmit` → `startTransition(() => action(new FormData(form)))` (örnek: `app/qr/admin/_components/ProductForm.tsx`).
- **Modül durumu:** Next açılış kodunu ve sayfaları ayrı paketlerde yükleyebilir. Paylaşılan bellek durumu `globalThis` üzerinde tutulur (örnek: `lib/auth/oneTimeCode.ts`).
- **MySQL:** `RETURNING` yok (`ON DUPLICATE KEY UPDATE` + `SELECT`). `groups` ayrılmış kelime, tablo adı `menu_groups`. Saatler UTC (`timezone: "Z"`), hesaplar `Europe/Istanbul`.
- **Geçmiş:** her admin değişikliği `audit_log`'a tek satır (önce/sonra JSON). Yalnızca en üstteki işlem geri alınır (`lib/admin/products.ts` → `undoLast`). Yeni işlem türü eklersen `undoLast`'a da ekle ya da açıkça "geri alınamaz" yap. WiFi şifresi geçmişe maskeli yazılır.

## Hostinger (canlı)

- Business plan, site `toohottohandlecoffee.com` (Node.js Web App). GitHub `main` dalından **otomatik deploy**. DNS henüz Vercel'de; test için sunucu IP'si `92.113.23.76` (`curl --resolve toohottohandlecoffee.com:80:92.113.23.76 http://toohottohandlecoffee.com/qr`).
- Ortam değişkenleri: `DATABASE_URL` (+ `DB_*`, Hostinger yazdı, değeri kimse bilmiyor), `THTH_UPLOAD_DIR` (kalıcı foto klasörü, deploy silmez).
- **Hostinger API ile ortam değişkenlerini "replace" etme**: tam küme ister, veritabanı şifresi bilinmediği için silinir. Yeni değişken gerekirse Enes hPanel'den tek tek ekler.
- **Hostinger'de `main` dışı bir daldan build başlatma**: otomatik deploy dalını o dala çeviriyor. Doğrulama yerel/sandbox'ta yapılır.
- Admin ilk kurulumu: sunucu kaydında `[admin] Kurulum kodu: XXXX-XXXX-XXXX` → `/qr/admin/kurulum`. Şifre sıfırlama: `THTH_UPLOAD_DIR` içine `admin-sifirla` adlı boş dosya + uygulamayı yeniden başlat → kayıtta kod → `/qr/admin/sifirla`.

## Yerelde çalıştırma ve test

```bash
npm install
npm run dev                      # veritabanısız: menü seed dosyasından
npx vitest run                   # birim testler; entegrasyon testleri TEST_DATABASE_URL yoksa atlanır
npx tsc --noEmit -p . && npm run build
```

Veritabanlı test (MariaDB 10.6+ ya da MySQL 8; boş iki veritabanı: `thth_test`, `thth_dev`):

Windows/Laragon: önce `. .\scripts\test-db.ps1` çalıştır. Script 3307'deki proje test sunucusunu gerekirse başlatır ve `.env.test.local` değişkenlerini yükler.

```bash
export TEST_DATABASE_URL=mysql://USER:PASS@127.0.0.1:3306/thth_test
npx vitest run                                   # entegrasyon dahil
# sunucuyu boş thth_dev ile aç, kaydı dosyaya yaz:
DATABASE_URL=mysql://USER:PASS@127.0.0.1:3306/thth_dev THTH_SAMPLE_PHOTOS=1 THTH_UPLOAD_DIR=/tmp/thth-up npx next start -p 3000 > /tmp/server.log 2>&1 &
E2E_DB=1 E2E_SERVER_LOG=/tmp/server.log npx playwright test   # admin akışları dahil, tam suite
```

Her e2e koşusundan önce `thth_dev` boşaltılır (admin testleri kurulumdan başlar). Test admin bilgisi `tests/e2e/helpers/admin.ts`.

## İş akışı

1. `main`den dal aç: `git checkout -b a2-<n>-<konu>`.
2. Yapacağın dilimin spec bölümünü oku; kısa planı `docs/superpowers/plans/` altına yaz.
3. Test → kod → tam suite yeşil → PR (başlıkta dilim adı, gövdede ne değişti + test sayıları).
4. `docs/PROJECT_STATE.md`'yi güncelle. Enes'e PR linkini ver, merge'ü o yapar.

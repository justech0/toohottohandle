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

- `a2-slot-reels`: Ne içsem şeridi yukarıdan aşağı kayacak şekilde düzeltildi; üç kutu 1,4 / 1,9 / 2,4 saniyede aynı içecekte hizalanır. PR #19'daki Kurabiyeler adı, slot gölgeleri ve bulanıklık korundu. Plan: `docs/superpowers/plans/2026-10-29-slot-reels.md`.
- `a2-hostinger-only`: kullanılmayan `vercel.json` kaldırıldı, yerel sağlayıcı metaverisi git dışında tutuldu ve aktif yayın belgeleri Hostinger'e göre düzeltildi. Uygulama, veritabanı ve dosya deposu değişmedi. Hesap tarafındaki bağlantı kaldırma işlemi ayrıca erişim gerektirir.
- Belirsiz fotoğraflar hangi ürün: matcha içecek, gözlüklü frappe, portakallı soğuk, tepside fincan, yaban mersinli tart, çörekler.
- Hostinger'de IP başlığı doğrulaması (sahte `x-forwarded-for` ile kilit atlatılamıyor mu) — DNS sonrası, admin hesabı açılınca.
- Güvenlik güncellemesi (`a2-vitest-security`): Vitest 4.1.12'ye sabitlendi; mocker 4.1.12, tinypool bağımlılığı kaldırıldı. Tekrarlanabilir kurulum için package-lock.json eklendi. npm audit: 0 açık; veritabanlı Vitest: 171/171; TypeScript ve üretim build başarılı. Yayın PR merge sonrasında.
`a2-vitest-security` doğrulaması: veritabanlı Playwright 104/104 geçti (2026-10-28).

Geri bildirim ilk doğrulaması (2026-10-29): Vitest 176/176 (veritabanı dahil), Playwright 106/106; TypeScript/build ve 3D bütçesi başarılı, npm audit 0 açık. Sonraki revizyon ve yayın aşağıda kayıtlıdır.

PR #17 form revizyonu ve main çakışma çözümü: 176/176 veritabanlı test, 109/109 tarayıcı testi, TypeScript/build başarılı (2026-10-29).

Dikey slot düzeltmesi (2026-10-29): 176/176 veritabanlı test ve 110/110 tarayıcı testi, TypeScript/build başarılı. Yeni main'deki görsel düzenlemeler korunarak ayrı PR hazırlandı.

QR alt adres temizliği (a2-qr-without-caption): admin önizlemesi ve indirilen SVG'deki görünür alt adres kaldırıldı; QR hedefi, logo ve hata düzeltme korundu. 176/176 veritabanlı test ve üretim build başarılı.

## A2 — Admin revize (PR, henüz canlıda değil)

- `a2-admin-revize`, güncel main (`14061a3`) üzerinden açıldı. Kullanıcı onayıyla `i18n-en-ar` altyapısı da dahil edildi.
- Vitrin slaytları veritabanında: metin, fotoğraf/odak, altı marka rengi, ikon, sıra, ekleme/silme/gizleme. Mevcut üç slayt migration ile bir kez yazılır.
- Kullanıcılar: admin oluşturma/listeleme/silme, geçici şifreyi ilk girişte değiştirme, kendini/son admini silme koruması. Audit e-postaları hesap silinse de kalır.
- Dışarı aktar yalnız ZIP indirir. ZIP geri yükleme arayüzü/uçları, yedek yaşı uyarısı ve sistem-yedek kartı kaldırıldı. Loglardan önceki menüye dönüş korunur; vitrin ve öneri ayarları da arşivlenir.
- Loglar ve audit kayıtları girişte 30 gün kuralıyla temizlenir; her tablonun son 25 kaydı korunur.
- WiFi ve istatistik ayarları QR ekranında; katalog bölüm düğmeleri ve tüm admin açılır listeleri marka stilinde, klavyeyle kullanılabilir.
- Ne içsem: kategori havuzu veya işaretlenen ürünler, fotoğraf önceliği anahtarı ve sessionStorage ile son beş öneriyi tekrar etmeme. Beşten küçük havuzda en eski öneri yeniden kullanılabilir.
- SVG yanında 1600×1600 logolu PNG indirme; PNG mevcut resmi logolu SVG'den üretildi ve bağımsız QR okuyucuyla doğru adrese çözüldü. Dil adları Türkçe / English / العربية.
- Canlı migration: `009_admin_revision`; yeni ortam değişkeni gerekmez. Vitrin, hesap ve öneri işlemleri geçmişte açıkça geri alınamazdır.

Admin revize doğrulaması (2026-10-29, Node 22.23.4): 201/201 veritabanlı Vitest, 121/121 veritabanlı Playwright, TypeScript/build ve 164.3 KB 3D bütçesi başarılı; npm audit 0 açık. 390/1440 px ekranlar ve bağımsız PNG QR decode kontrol edildi. PR hazır; merge ve canlı yayın yapılmadı.

### Admin revize ek istekler (2026-11-03, aynı dal, commit yok)

- Admin yan menü: Genel Bakış en üstte, Loglar en altta (Genel Bakış kutularında da Loglar sonda).
- Vitrin ikonu kaldırıldı: menü, admin vitrin formu ve `010_hero_no_icon` ile `hero_slides.icon` sütunu. Diğer slayt ayarları korunur; eski kopya/ZIP'teki `icon` yok sayılır.
- Ne içsem: ürün başı olasılık Normal / 2 / 3 / 5 kat (`011_suggest_weight`, `products.suggest_weight`). Ağırlıklı seçim; fotoğraf önceliği ve son-5 kuralı korunur. Eski kopyalarda ağırlık 1 sayılır.
- Geri bildirim admin: sıkı kartlar, geniş ekranda ızgara, 72 px foto önizleme.
- "Söz sende": menü sonundaki sarı kart yerine sağ altta sabit baloncuk (kırmızı, sarı daire içinde tavşan). Açık katmanlarda görünmez ve tıklanmaz.
- Toplu fiyat: "Tüm menü" kapsamı ve her zaman görünen tam fiyat listesi; önizleme aynı listede eski → yeni.

Doğrulama (2026-11-03): Vitest 207/207 (veritabanı dahil), Playwright 123/123 (veritabanlı), TypeScript ve üretim build başarılı.

## A2 — Toplu ürün yükleme (`a2-toplu-urun`)

- HVK örneğindeki `import-products.php` akışı baz alınarak `/qr/admin/toplu-urun` ekranı eklendi.
- CSV (`category_name, product_name, description, price, image_url, sort_order`) ve JSON dizisiyle toplu ürün yükleme desteklenir; bozuk satırlar satır numarasıyla atlanıp raporlanır, olmayan kategoriler seçilen grup altında otomatik oluşturulur.
- Aktarım öncesi otomatik menü kopyası (`toplu ürün yükleme öncesi`) alınır, `audit_log`'a `bulk_import` kaydı düşülür ve `undoLast` ile tek tıkla geri alınabilir.
- Admin yan menüde "Geri Bildirim" üzerinde okunmamış geri bildirim sayısı bildirim baloncuğu olarak gösterilir; `/qr/admin/geri-bildirim` açıldığında okunmamış kayıtlar otomatik okundu işaretlenir ve baloncuk kaybolur.
- Doğrulama (2026-11-06): Vitest 211/211 (veritabanı dahil), Playwright E2E, TypeScript ve üretim build başarılı.

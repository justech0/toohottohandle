# QR v0 — final review sonucu (2026-10-25)

İnceleme: Opus, tüm dal (cde4ae3..7e9dabe). Critical 0, Important 5.

## Düzeltilenler (commit 9f01b08, testler 87b7cd3)
1. Arama veya WiFi açıkken geri tuşu menüden çıkıyordu → her katman geçmişe kayıt ekler, kapatma history.back(); yenilemede eski kayıt temizlenir. (back.spec.ts)
2. WiFi kartında kapatma yoktu → 44px "Kapat" düğmesi. (wifi.spec.ts)
3. Giriş hidrasyondan önce yarım görünüyor, geç boyamada kesiliyordu; azaltılmış harekette dalga titriyordu → beyaz logo ayrımı tamamen CSS, kaldırma animationend ile, azaltılmış hareket @media içinde. (intro.spec.ts) Task 10 ruling'i (performance.now ile kaldırma) bununla geçersiz.
4. Tükendi satırı kontrastı 3.2:1 → opaklık kaldırıldı, ad ink-soft. (list.spec.ts)
5. Geniş ekranda son kategoriler seçili kalmıyordu → sekmeye basınca seçim kullanıcı kaydırana kadar korunur. (list.spec.ts, 768 ve 1440)

Sonuç: vitest 31/31, playwright 43/43; intro/back/list 3 tekrar 60/60.

## Ertelenen küçükler
- Çift kapatma (× iki kez) iki kez geri gider.
- Kapanınca odak geri dönmüyor; aramada odak tuzağı yok.
- Detayda kaydırma kilidi/overscroll yok; tutamaç var ama kaydırıp kapatma yok.
- Şerit, liste ve arama çubuğunda safe-area boşluğu yok (iPhone yatay).
- html'de suppressHydrationWarning yok (dev uyarısı).
- Android dokunma vurgusu rengi.
- "Geç" 4.0:1; arama placeholder rengi.
- Font rolleri: detay başlığı ve SSID Unbounded, WiFi değerleri sistem monospace.
- 560px altında boylar alt alta, "·" gizli; "Kopyalandı" green-text değil; logo tepe ortaya gidiyor, sol logoya değil.
- Sayfada h1 yok.
- Şerit offsetLeft hesabı (.strip__row position:relative).
- Test boşlukları: WebKit projesi yok; gerçek tükendi verisiyle render testi yok.

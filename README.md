# Too Hot To Handle

QR menü ve özel yönetim paneli. Next.js 16, Node.js 22, MySQL; Hostinger Node.js Web App üzerinde çalışır.

- Canlı menü: https://toohottohandlecoffee.com/qr
- Yönetim: https://toohottohandlecoffee.com/qr/admin
- Yayın kaynağı: GitHub `justech0/toohottohandle`, `main` dalı. Merge sonrası Hostinger otomatik derler ve yayınlar.
- Derleme: `npm ci` ve `npm run build`; çıktı `.next`, paket yöneticisi npm. Sunucu yapılandırmasını Hostinger yönetir.
- Veritabanı `DATABASE_URL` ile bağlanır. Yüklenen fotoğraflar mevcut `THTH_UPLOAD_DIR` altında kalıcıdır. Bu değerler depoya yazılmaz veya topluca değiştirilmez.

Yerel çalıştırma: `npm ci`, `npm run dev`. Veritabanı olmadan menü seed dosyasından okunur; admin için yerel MySQL gerekir. Veritabanlı test ve yayın kuralları `AGENTS.md` içindedir.

Uygulamada başka bir barındırma sağlayıcısının SDK'sı veya çalışma zamanı API'si kullanılmaz. `docs/superpowers/` altındaki eski tarihli planlar tarihçedir; güncel çalışma ve yayın kaynağı `AGENTS.md` ve `docs/PROJECT_STATE.md` dosyalarıdır.

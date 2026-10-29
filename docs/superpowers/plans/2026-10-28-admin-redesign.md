# Admin Paneli Tasarım Güncellemesi (Too Hot Admin 2.0)

- **Dal:** `admin-redesign` (taban: `origin/main`)
- **Hedef:** Kullanıcı dostu, modern, masaüstünde genişleyen, mobilde ergonomik, Too Hot To Handle marka kimliğine (Unbounded + Montserrat, Paper & Ink, Crimson) tam uyumlu admin paneli arayüzü.
- **Kritik Kural:** Emojili tasarım kesinlikle YOK. Yalnızca şık SVG ikonlar, marka vektörleri ve tipografik hiyerarşi.

## Mevcut Sorunlar
1. 520px dar sütuna hapsedilmiş düzen (Masaüstünde %70 boş alan israfı).
2. Her ürün satırında 5 açık buton (129 ürün × 5 = 645 butonluk devasa görsel kirlilik).
3. Sayfalar arası sürekli ana menüye dönmeyi zorunlu kılan navigasyon kopukluğu.
4. Soluk gri/tel kafes görünümü; Too Hot To Handle'ın enerjik kafe ruhuna aykırılık.

## Yapılacak Değişiklikler

### 1. App Shell & Navigasyon (`app/qr/admin/layout.tsx`, `admin.css`)
- **Masaüstü (≥ 900px):**
  - Sol tarafta sabit şık **Sidebar**: Too Hot To Handle logosu, tek tip SVG ikonlu navigasyon linkleri:
    - Genel Bakış (Dashboard)
    - Ürünler & Stok
    - Katalog & Menü
    - Afiş Fotoğrafları
    - Toplu Fiyat
    - Kopyalar
    - Yedek
    - İstatistik & QR
  - Alt kısımda admin e-posta rozeti ve çıkış düğmesi.
- **Mobil (< 900px):**
  - Üstte sabit şık bar: Marka logosu, sayfa başlığı, menü butonu.
  - Altta sabit **Bottom Navigation Bar**: Genel Bakış, Ürünler, Katalog, Diğer (drawer/menü).
  - 48px dokunma hedefleri, sıfır yatay taşma.

### 2. Yönetim Ana Sayfası (`app/qr/admin/page.tsx`)
- Üstte hoş geldiniz başlığı ve kafe durumu.
- **3 KPI Özet Kartı:**
  - Aktif Menü (toplam ürün, stokta, tükendi sayısı)
  - Günlük Trafik (ziyaretçi/görüntülenme sayısı)
  - Sistem & Yedek Durumu (son yedek zamanı ve durumu)
- **Son Değişiklik & Tek Tıkla Geri Al (Undo Card):**
  - Net durum kartı, zaman damgası ve `data-testid="undo"` butonu.
- **Hızlı Erişim Grid Kartları:**
  - İkonlu, ferah, renkli kartlar ile bölümlere doğrudan tek tıkla geçiş.

### 3. Ürünler Ekranı İyileştirmesi (`app/qr/admin/urunler/`)
- Arama ve yatay kaydırılabilir kategori filtre hapları (`.adm-cat-pill`).
- Ürün satırlarında görsel iyileştirme:
  - Küçük ürün fotoğrafı veya kategori sembolü.
  - Ürün adı, porsiyon fiyatları (Normal / Büyük).
  - Her satırda tek ana eylem: **"Tükendi / Stokta"** anahtarı (renkli chip).
  - İkincil eylemler (Çoğalt, Sırala, Sil) düzenli bir işlem grubunda (`.adm-op` 44px korumalı).

### 4. Stil & Marka Uyumu (`app/qr/admin/admin.css`)
- `--c-paper` (#F3ECE6) zemin, `--c-white` kartlar, `--c-ink` metinler, `--c-red` (#DC2524) aksanlar.
- Başlıklarda `Unbounded 800`, metin ve etiketlerde `Montserrat 500/600`.
- Kontrast oranları ≥ 4.5:1, odak halkaları (2px solid outline) eksiksiz.
- E2E ve birim testlerindeki tüm `data-testid`, `.adm-op`, `.adm-crumb a` seçicileri ve yükseklik/kontrast şartları korunur.


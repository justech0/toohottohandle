"""Marka görsellerini public/qr altına hazırlar (yalnızca geliştirme, tek seferlik).

Kullanım: python3 scripts/brand_assets.py <uploads-klasörü>
<uploads-klasörü> içinde: toohot/hot, toohot/hottir, toohottohandlecofee/toohottohandlecoffee,
tohoottohandle.batman/toohottohandle.batman bulunur.

Logo ve ikonlar resmi PNG'lerden kesilir; yeniden çizilmez, yalnızca alfa korunup beyaza boyanır
(renk sitede CSS mask ile token'dan verilir).
"""
import glob
import os
import sys

from PIL import Image

ROOT = sys.argv[1]
OUT = os.path.join(os.path.dirname(__file__), "..", "public", "qr")


def white(im):
    a = im.getchannel("A")
    c = Image.new("RGBA", im.size, (255, 255, 255, 255))
    c.putalpha(a)
    return c


def trim(im):
    box = im.getchannel("A").point(lambda v: 255 if v > 20 else 0).getbbox()
    return im.crop(box)


def save_webp(im, path, width, max_kb):
    im = im.convert("RGB")
    if im.width > width:
        im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    q = 82
    while True:
        im.save(path, "WEBP", quality=q, method=6)
        if os.path.getsize(path) <= max_kb * 1024 or q <= 50:
            break
        q -= 4
    print(path, im.size, os.path.getsize(path) // 1024, "KB")


def crop(im, box):
    w, h = im.size
    return im.crop((int(box[0] * w), int(box[1] * h), int(box[2] * w), int(box[3] * h)))


os.makedirs(os.path.join(OUT, "brand"), exist_ok=True)
os.makedirs(os.path.join(OUT, "hero"), exist_ok=True)
os.makedirs(os.path.join(OUT, "groups"), exist_ok=True)
os.makedirs(os.path.join(OUT, "img"), exist_ok=True)

# Logo
logo = trim(Image.open(os.path.join(ROOT, "toohot/hot/toohottohandle-logolar-1.png")).convert("RGBA"))
logo.thumbnail((1400, 400))
white(logo).save(os.path.join(OUT, "brand", "logo.png"), optimize=True)

# İkonlar: 2973 px karede üçlü kutu; koordinatlar 1000 ölçeğinde, kutu çizgisinden 12 içeride
icons = Image.open(os.path.join(ROOT, "toohot/hottir/toohottohandle-iconlar-1.png")).convert("RGBA")
s = icons.width / 1000
for name, (x0, x1) in {"lips": (215, 405), "rabbit": (405, 595), "star": (595, 785)}.items():
    ic = trim(icons.crop((int((x0 + 12) * s), int((413 + 12) * s), int((x1 - 12) * s), int((583 - 12) * s))))
    ic.thumbnail((400, 400))
    white(ic).save(os.path.join(OUT, "brand", f"{name}.png"), optimize=True)

ig = sorted(glob.glob(os.path.join(ROOT, "toohottohandlecofee/toohottohandlecoffee/*.jpg"))) + sorted(
    glob.glob(os.path.join(ROOT, "tohoottohandle.batman/toohottohandle.batman/*.jpg"))
)
ig_open = lambda i, box=None: crop(Image.open(ig[i]), box) if box else Image.open(ig[i])

# Vitrin
save_webp(ig_open(20), os.path.join(OUT, "hero", "fast.webp"), 780, 120)
save_webp(ig_open(2), os.path.join(OUT, "hero", "free.webp"), 780, 120)
save_webp(ig_open(12), os.path.join(OUT, "hero", "shine.webp"), 780, 120)

# Grup afişleri
TL = (0, 0, 0.5, 0.45)
# Ube fotoğrafında "TOO HOT" ve "UBE" yazıları yanlarda; ortadaki şerit yazısız (spec v3 2)
UBE = (0.3, 0, 0.81, 1)
save_webp(ig_open(34), os.path.join(OUT, "groups", "kahve.webp"), 600, 70)
save_webp(ig_open(33, UBE), os.path.join(OUT, "groups", "spesiyal.webp"), 600, 70)
save_webp(ig_open(7, TL), os.path.join(OUT, "groups", "yiyecek.webp"), 600, 70)
save_webp(ig_open(22), os.path.join(OUT, "groups", "tatli.webp"), 600, 70)
save_webp(ig_open(38, (0, 0, 1, 0.75)), os.path.join(OUT, "groups", "paket.webp"), 600, 70)

# Örnek ürün fotoğrafları (yalnızca THTH_SAMPLE_PHOTOS=1)
SAMPLES = {
    "ube-latte": (33, UBE),
    "ube-vanilya-matcha-latte": (4, (0, 0.22, 1, 1)),
    "caramel-frappe": (12, None),
    "morning-sando": (8, TL),
    "italy-sando": (9, TL),
    "ton-balikli-sandvic": (7, TL),
    "karisik-sarkuteri-sandvic": (13, (0.1, 0.3, 0.9, 0.75)),
}
for slug, (i, box) in SAMPLES.items():
    im = ig_open(i, box)
    for w, kb in ((320, 30), (720, 90), (1280, 400)):
        save_webp(im, os.path.join(OUT, "img", f"ornek-{slug}-{w}.webp"), w, kb)

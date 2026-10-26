"""Fiyat listesi (Excel) -> db/seed/menu.json.

Kullanım: python3 scripts/excel_to_seed.py <fiyat-listesi.xlsx> <db/seed/menu.json>
Yalnızca "Ürün Adı", "Kategori" ve "Yeni Fiyat" sütunları okunur. Maliyet sütunları okunmaz ve çıktıya girmez.
"""
import json
import re
import sys
import unicodedata

import openpyxl

# Excel kategori -> (menu kategorisi slug)
CAT_MAP = {
    "SICAK KAHVELER": "sicak-kahveler",
    "SOĞUK KAHVELER": "soguk-kahveler",
    "SIGNATURES": "signatures",
    "MATCHA & UBE": "matcha-ube",
    "COFFE FRAPPE": "coffee-frappe",
    "CREAM FRAPPE": "cream-frappe",
    "FROZEN FUSION&ICE SHAKEN": "frozen",
    "Ice Shaken": "ice-shaken",
    "KAHVESİZ İÇECEKLER": "kahvesiz",
    "Tea's": "caylar",
    "MEŞRUBAT": "mesrubat",
    "EKMEKÜSTÜ": "ekmek-ustu",
    "SANDWICH": "sandvic",
    "KRUVASAN": "kruvasan",
    "MAGNOLIA": "magnolia",
    "MONO TATLILAR": "tatlilar",
    "COOKIES": "cookies",
    "PAKET KAHVELER": "paket-kahve",
    "Kasa Önü": "kasa-onu",
    "EXTRA (ekstra malzemeler)": "_ekstra",
}

# (slug, ad TR, grup, renk, sicaklik, ne-icsem)
CATS = [
    ("sicak-kahveler", "Sıcak Kahveler", "Kahve", "red", "hot", True),
    ("soguk-kahveler", "Soğuk Kahveler", "Kahve", "red", "cold", True),
    ("signatures", "Signatures", "Kahve", "red", "cold", True),
    ("coffee-frappe", "Coffee Frappe", "Kahve", "red", "cold", True),
    ("cream-frappe", "Cream Frappe", "Spesiyal", "blue", "cold", True),
    ("matcha-ube", "Matcha & Ube", "Spesiyal", "blue", "cold", True),
    ("frozen", "Frozen", "Spesiyal", "blue", "cold", True),
    ("ice-shaken", "Ice Shaken", "Spesiyal", "blue", "cold", True),
    ("kahvesiz", "Kahvesiz İçecekler", "Spesiyal", "blue", "hot", True),
    ("caylar", "Çaylar", "Spesiyal", "blue", "hot", True),
    ("mesrubat", "Meşrubat", "Spesiyal", "blue", "cold", False),
    ("ekmek-ustu", "Ekmek Üstü", "Yiyecek", "green", None, False),
    ("sandvic", "Sandviç & Börek", "Yiyecek", "green", None, False),
    ("kruvasan", "Kruvasan", "Yiyecek", "green", None, False),
    ("magnolia", "Magnolia", "Tatlı", "pink", None, False),
    ("tatlilar", "Tatlılar", "Tatlı", "pink", None, False),
    ("cookies", "Cookies", "Tatlı", "pink", None, False),
    ("paket-kahve", "Paket Kahve", "Paket & Atıştırmalık", "gray", None, False),
    ("kasa-onu", "Kasa Önü", "Paket & Atıştırmalık", "gray", None, False),
]

# Ham ad (normalize edilmis, kucuk) -> (urun anahtari, boy)
# boy: None = tek fiyat, "Normal" / "Büyük" / "Tek" / "Duble"
SIZE_OVERRIDES = {
    # Coffee Frappe
    "caramel frappe büyük": ("Caramel Frappe", "Büyük"),
    "caramel frappe": ("Caramel Frappe", "Normal"),
    "espresso frappe büyük": ("Espresso Frappe", "Büyük"),
    "espresso frappe": ("Espresso Frappe", "Normal"),
    "mocha frappe büyük": ("Mocha Frappe", "Büyük"),
    "mocha frappe": ("Mocha Frappe", "Normal"),
    "coconut mocha frappe büyük": ("Coconut Mocha Frappe", "Büyük"),
    "coconut mocha frappe": ("Coconut Mocha Frappe", "Normal"),
    "white mocha frappe büyük": ("White Mocha Frappe", "Büyük"),
    "white chocolate frappe": ("White Chocolate Frappe", "Normal"),
    # Cream Frappe
    "chocalate cream frappe büyük": ("Chocolate Cream Frappe", "Büyük"),
    "chocalate cream frappe 12": ("Chocolate Cream Frappe", "Normal"),
    "strawberries&cream frappe büyük": ("Strawberries & Cream Frappe", "Büyük"),
    "strawberries&cream frappe 12oz": ("Strawberries & Cream Frappe", "Normal"),
    "vanilya cream frappe büyük": ("Vanilla Cream Frappe", "Büyük"),
    "vanilla cream frappe 12oz": ("Vanilla Cream Frappe", "Normal"),
    "caramel cream frappe büyük": ("Caramel Cream Frappe", "Büyük"),
    "caramel cream frappe 12oz": ("Caramel Cream Frappe", "Normal"),
    "white mocha cream büyük": ("White Mocha Cream Frappe", "Büyük"),
    "white chocolaate cream frappe 12oz": ("White Chocolate Cream Frappe", "Normal"),
    # Frozen
    "mango frozen büyük": ("Mango Frozen", "Büyük"),
    "mango frozen": ("Mango Frozen", "Normal"),
    "rasberry frozen büyük": ("Raspberry Frozen", "Büyük"),
    "rasberry frozen": ("Raspberry Frozen", "Normal"),
    "strawberry frozen büyük": ("Strawberry Frozen", "Büyük"),
    "strawberry frozen": ("Strawberry Frozen", "Normal"),
    "melonberry frozen büyük": ("Melonberry Frozen", "Büyük"),
    "melonberry twist frozen": ("Melonberry Twist Frozen", "Normal"),
    "coollime frozen büyük": ("Cool Lime Frozen", "Büyük"),
    "coollime frozen": ("Cool Lime Frozen", "Normal"),
    "berry hibiskus frozen büyük": ("Berry Hibiscus Frozen", "Büyük"),
    "berry hibiskus frozen": ("Berry Hibiscus Frozen", "Normal"),
    "orange mango frozen büyük": ("Orange Mango Frozen", "Büyük"),
    "orange mango frozen": ("Orange Mango Frozen", "Normal"),
    # Ice Shaken
    "cool lime": ("Cool Lime", "Normal"),
    "cool lime büyük": ("Cool Lime", "Büyük"),
    "berry hibiskus": ("Berry Hibiscus", "Normal"),
    "berry hibiskus büyük": ("Berry Hibiscus", "Büyük"),
    "orange mango": ("Orange Mango", "Normal"),
    "orange mango büyük": ("Orange Mango", "Büyük"),
    # Kahvesiz
    "sicak çikolata büyük": ("Sıcak Çikolata", "Büyük"),
    "sicak çikolata": ("Sıcak Çikolata", "Normal"),
    "chai tea latte büyük": ("Chai Tea Latte", "Büyük"),
    "chai tea latte": ("Chai Tea Latte", "Normal"),
    # Sicak kahveler
    "espresso": ("Espresso", "Tek"),
    "espresso double": ("Espresso", "Duble"),
    "türk kahvesi": ("Türk Kahvesi", "Tek"),
    "türk kahvesi duble": ("Türk Kahvesi", "Duble"),
    "filtre kahve": ("Filtre Kahve", "Normal"),
    "filtre kahve büyük": ("Filtre Kahve", "Büyük"),
    "caffe americano": ("Caffè Americano", "Normal"),
    "caffe americano büyük": ("Caffè Americano", "Büyük"),
    "cappuccino": ("Cappuccino", "Normal"),
    "cappucino büyük": ("Cappuccino", "Büyük"),
    "caffe latte": ("Caffè Latte", "Normal"),
    "latte büyük": ("Caffè Latte", "Büyük"),
    "flat white": ("Flat White", "Normal"),
    "flat white büyük": ("Flat White", "Büyük"),
    "caramel macchiato": ("Caramel Macchiato", "Normal"),
    "caramel macchiato büyük": ("Caramel Macchiato", "Büyük"),
    "caffe mocha": ("Caffè Mocha", "Normal"),
    "caffe mocha büyük": ("Caffè Mocha", "Büyük"),
    "white chocolate mocha": ("White Chocolate Mocha", "Normal"),
    "white chocolate mocha büyük": ("White Chocolate Mocha", "Büyük"),
    "cortado": ("Cortado", None),
    # Soguk kahveler (12 = Normal, 16 = Büyük)
    "ice americano 12": ("Iced Americano", "Normal"),
    "ice americano 16 oz": ("Iced Americano", "Büyük"),
    "ice latte 12": ("Iced Latte", "Normal"),
    "ice latte 16": ("Iced Latte", "Büyük"),
    "ice flat white 12": ("Iced Flat White", "Normal"),
    "ice flatwhite 16": ("Iced Flat White", "Büyük"),
    "ice caramel macchiato 12": ("Iced Caramel Macchiato", "Normal"),
    "ice caramel macchiato": ("Iced Caramel Macchiato", "Büyük"),
    "ice mocha 12": ("Iced Mocha", "Normal"),
    "ice mocha 16": ("Iced Mocha", "Büyük"),
    "ice white mocha 12": ("Iced White Chocolate Mocha", "Normal"),
    "ice white mocha 16": ("Iced White Chocolate Mocha", "Büyük"),
    "ice filtre 12": ("Iced Filtre Kahve", "Normal"),
    "ice filtre 16": ("Iced Filtre Kahve", "Büyük"),
}

# Tek urunlerde ad duzeltmeleri
NAME_FIX = {
    "mont blanc": "Mont Blanc",
    "chocalate cloud espresso": "Chocolate Cloud Espresso",
    "strawberry foam cold brew": "Strawberry Foam Cold Brew",
    "citrus berry cloud": "Citrus Berry Cloud",
    "blue garden": "Blue Garden",
    "ube latte": "Ube Latte",
    "ube vanilya matcha latte": "Ube Vanilya Matcha Latte",
    "strawberry matcha latte": "Strawberry Matcha Latte",
    "fistikli cookie": "Fıstıklı Cookie",
    "rocher cookie": "Rocher Cookie",
    "triple chocolate": "Triple Chocolate Cookie",
    "chocolate chip": "Chocolate Chip Cookie",
    "caprese": "Caprese",
    "avokado-ricotta": "Avokado & Ricotta",
    "norwegian": "Norwegian",
    "garden": "Garden",
    "füme et-yumurta": "Füme Et & Yumurta",
    "portakal suyu": "Portakal Suyu",
    "balli süt": "Ballı Süt",
    "sahlep": "Sahlep",
    "züber": "Züber",
    "ofresko strawberry": "Ofresko Strawberry",
    "ofresko melon": "Ofresko Melon",
    "ofresko green apple": "Ofresko Green Apple",
    "ofresko fig": "Ofresko Fig",
    "ofreso black mulberry": "Ofresko Black Mulberry",
    "mini oreo": "Mini Oreo",
    "cips sade": "Cips Sade",
    "cips acili": "Cips Acılı",
    "cips mantar": "Cips Mantar",
    "züber kids": "Züber Kids",
    "züber granola": "Züber Granola",
    "züber cips": "Züber Cips",
    "kruvasan sade": "Sade Kruvasan",
    "kruvasan sandviç": "Kruvasan Sandviç",
    "kruvasan tatli": "Tatlı Kruvasan",
    "orman meyveli magnolia": "Orman Meyveli Magnolia",
    "çikolatali magnolia": "Çikolatalı Magnolia",
    "fistikli magnolia": "Fıstıklı Magnolia",
    "kola": "Kola",
    "fanta": "Fanta",
    "kutu kola vanilya": "Kutu Kola Vanilya",
    "kutu kola cherry": "Kutu Kola Cherry",
    "su": "Su",
    "meyve suyu": "Meyve Suyu",
    "beyoğlu gazoz": "Beyoğlu Gazoz",
    "fuse tea": "Fuse Tea",
    "redbull": "Red Bull",
    "soda premium": "Premium Soda",
    "cheescake": "Cheesecake",
    "çikolatali kardelen": "Çikolatalı Kardelen",
    "rulo pasta": "Rulo Pasta",
    "vişneli brownie": "Vişneli Brownie",
    "mousse pasta": "Mousse Pasta",
    "yabanmersini pasta": "Yaban Mersinli Pasta",
    "çilek pasta": "Çilekli Pasta",
    "bowl": "Bowl",
    "karamel pasta": "Karamelli Pasta",
    "lotus cheescake": "Lotus Cheesecake",
    "fistikli cheescake": "Fıstıklı Cheesecake",
    "beyaz kardelen": "Beyaz Kardelen",
    "brownie": "Brownie",
    "türk kahvesi 200 gr": "Türk Kahvesi · 200 g",
    "colombia medellin 200 gr": "Colombia Medellín · 200 g",
    "espresso roast 200 gr": "Espresso Roast · 200 g",
    "ethiophia sidamo 200 gr": "Ethiopia Sidamo · 200 g",
    "aç demle kahve": "Aç Demle Kahve",
    "peynirli börek": "Peynirli Börek",
    "ispanakli börek": "Ispanaklı Börek",
    "füme somon sandwich": "Füme Somonlu Sandviç",
    "summer sandwich": "Summer Sandviç",
    "ton balikli sandwich": "Ton Balıklı Sandviç",
    "hindi füme sandwich": "Hindi Füme Sandviç",
    "karişik şarküteri sandwich": "Karışık Şarküteri Sandviç",
    "akdeniz sandwich": "Akdeniz Sandviç",
    "morning sando": "Morning Sando",
    "italy sando": "Italy Sando",
    "fincan çay": "Fincan Çay",
    "çay": "Çay",
    "fas nanesi": "Fas Nanesi",
    "hibiscus": "Hibiscus",
    "relax": "Relax",
    "wake up": "Wake Up",
    "nar-baharat": "Nar & Baharat",
    "kiş çayi": "Kış Çayı",
}

PRODUCT_TEMP = {"Portakal Suyu": "cold"}
EXTRA_SCOPE = ["sicak-kahveler", "soguk-kahveler", "coffee-frappe", "cream-frappe", "matcha-ube"]
EXTRA_NAMES = {"shot": "Ekstra shot", "bitkisel süt": "Bitkisel süt", "sos ve aroma": "Sos ve aroma", "yumurta": "Yumurta"}
SKIP = {"demo ürün"}

TR_LOWER = str.maketrans({"I": "ı", "İ": "i"})


def norm(s):
    s = s.replace("\xa0", " ").strip()
    s = re.sub(r"\s+", " ", s)
    s = s.translate(TR_LOWER).lower()
    # Excel buyuk harf girislerindeki i/ı karisikligini esitle
    s = s.replace("ı", "i") if False else s
    return s


def key(s):
    # karsilastirma icin: turkce noktali/noktasiz i farkini yok say
    return norm(s).replace("ı", "i").replace("i̇", "i")


SIZE_K = {key(k): v for k, v in SIZE_OVERRIDES.items()}
NAME_K = {key(k): v for k, v in NAME_FIX.items()}
EXTRA_K = {key(k): v for k, v in EXTRA_NAMES.items()}


GROUPS = [
    ("kahve", "Kahve", "red"),
    ("spesiyal", "Spesiyal", "blue"),
    ("yiyecek", "Yiyecek", "green"),
    ("tatli", "Tatlı", "pink"),
    ("paket", "Paket & Atıştırmalık", "gray"),
]
GROUP_SLUG = {name: slug for slug, name, _ in GROUPS}
SIZE_KEY = {None: None, "Normal": "normal", "Büyük": "buyuk", "Tek": "tek", "Duble": "duble"}
SIZE_ORDER = {None: 0, "normal": 0, "tek": 0, "buyuk": 1, "duble": 1}
EXTRA_SLUG = {"Ekstra shot": "ekstra-shot", "Bitkisel süt": "bitkisel-sut", "Sos ve aroma": "sos-ve-aroma", "Yumurta": "yumurta"}


def slugify(s):
    s = s.translate(TR_LOWER).lower().replace("ı", "i")
    s = "".join(c for c in unicodedata.normalize("NFD", s) if not unicodedata.combining(c))
    return re.sub(r"[^a-z0-9]+", "-", s).strip("-")


def to_kurus(value, label):
    v = float(value)
    if abs(v - round(v, 2)) > 0.001:
        raise SystemExit(f"Fiyat beklenmedik ondalık içeriyor: {label} = {value!r}")
    return int(round(v * 100))


def main(src, out):
    ws = openpyxl.load_workbook(src, data_only=True)["Data"]
    header = [c.value for c in next(ws.iter_rows(min_row=1, max_row=1))]
    i_name, i_cat, i_price = header.index("Ürün Adı"), header.index("Kategori"), header.index("Yeni Fiyat")
    skip = {key(x) for x in SKIP}
    products, extras = {}, []
    for r in ws.iter_rows(min_row=2, values_only=True):
        raw, cat_raw, price_raw = r[i_name], r[i_cat], r[i_price]
        if not raw:
            continue
        k = key(raw)
        if k in skip:
            continue
        kurus = to_kurus(price_raw, raw)
        if k in EXTRA_K:
            extras.append((EXTRA_K[k], kurus, k == key("yumurta")))
            continue
        cat = CAT_MAP.get(cat_raw.strip() if isinstance(cat_raw, str) else cat_raw) or CAT_MAP.get(cat_raw)
        if cat is None:
            raise SystemExit(f"Bilinmeyen kategori: {cat_raw!r}")
        if k in SIZE_K:
            name, size = SIZE_K[k]
        elif k in NAME_K:
            name, size = NAME_K[k], None
        else:
            name, size = raw.strip(), None
        products.setdefault((cat, name), []).append({"key": SIZE_KEY[size], "priceKurus": kurus})

    out_groups = [{"slug": s, "nameTr": n, "color": c} for s, n, c in GROUPS]
    out_cats, out_products = [], []
    for slug, name_tr, group, _color, temp, suggest in CATS:
        out_cats.append({"slug": slug, "nameTr": name_tr, "group": GROUP_SLUG[group], "defaultTemp": temp, "defaultInSuggest": suggest})
        for (cat, name), variants in products.items():
            if cat != slug:
                continue
            variants.sort(key=lambda v: SIZE_ORDER[v["key"]])
            out_products.append({"slug": slugify(name), "name": name, "category": slug, "temp": PRODUCT_TEMP.get(name, temp), "variants": variants})
    out_extras = [{"slug": EXTRA_SLUG[n], "nameTr": n, "priceKurus": p, "categories": ["ekmek-ustu"] if egg else EXTRA_SCOPE} for n, p, egg in extras]
    settings = {
        "wifiSsid": "HOT | WIFI", "wifiUsername": "test", "wifiPassword": "test1234",
        "wifiNoteTr": "HOT | WIFI ağına bağlanın. Açılan giriş ekranına bu bilgileri yazın.",
        "openingTime": "08:00", "footerNoteTr": "Self servis · Servis ücreti alınmaz",
        "statsEnabled": True, "menuUpdatedAt": "2026-10-25T00:00:00+03:00",
    }
    data = {"groups": out_groups, "categories": out_cats, "products": out_products, "extras": out_extras, "settings": settings}
    with open(out, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=1)
        f.write("\n")
    print(f"{len(out_cats)} kategori, {len(out_products)} ürün, {len(out_extras)} ekstra")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])

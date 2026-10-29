import type { Language } from "./types";

export interface I18nDictionary {
  nav: {
    search: string;
    wifi: string;
    langSelect: string;
    close: string;
  };
  hero: {
    menu: string;
  };
  neIcsem: {
    title: string;
    again: string;
    ourPick: string;
    empty: string;
    reelSpinning: (k: number) => string;
  };
  product: {
    soldOut: string;
    ingredients: string;
    allergenNote: string;
    size: string;
  };
  wifi: {
    dialogLabel: string;
    ssid: string;
    username: string;
    password: string;
    copy: string;
    copied: string;
    copyFailed: string;
    copyAria: (field: string) => string;
  };
  search: {
    dialogLabel: string;
    placeholder: string;
    empty: string;
    clear: string;
  };
  footer: {
    vat: string;
    lastUpdated: string;
  };
  languages: {
    tr: string;
    en: string;
    ar: string;
  };
}

export const DICTIONARY: Record<Language, I18nDictionary> = {
  tr: {
    nav: {
      search: "Ara",
      wifi: "WiFi",
      langSelect: "Dil seçimi",
      close: "Kapat",
    },
    hero: {
      menu: "MENÜ",
    },
    neIcsem: {
      title: "Ne içsem?",
      again: "Tekrar çevir",
      ourPick: "Önerimiz:",
      empty: "Şu an önerecek içecek yok. Ekibimize sorabilirsin.",
      reelSpinning: (k) => `${k}. kutu dönüyor`,
    },
    product: {
      soldOut: "Tükendi",
      ingredients: "İÇİNDEKİLER",
      allergenNote: "Alerjen bilgisi için ekibimize sorabilirsin.",
      size: "Boy",
    },
    wifi: {
      dialogLabel: "WiFi bilgileri",
      ssid: "Ağ",
      username: "Kullanıcı adı",
      password: "Şifre",
      copy: "Kopyala",
      copied: "Kopyalandı",
      copyFailed: "Kopyalanamadı. Metne basılı tutup kopyalayın.",
      copyAria: (label) => `${label} kopyala`,
    },
    search: {
      dialogLabel: "Arama",
      placeholder: "Ürün ara",
      empty: "Aradığını bulamadık. Ekibimiz sana yardımcı olabilir.",
      clear: "Aramayı temizle",
    },
    footer: {
      vat: "Fiyatlara KDV dahildir",
      lastUpdated: "Son güncelleme:",
    },
    languages: {
      tr: "Türkçe",
      en: "English",
      ar: "العربية",
    },
  },
  en: {
    nav: {
      search: "Search",
      wifi: "WiFi",
      langSelect: "Language selection",
      close: "Close",
    },
    hero: {
      menu: "MENU",
    },
    neIcsem: {
      title: "What to drink?",
      again: "Spin again",
      ourPick: "Our recommendation:",
      empty: "No drink suggestions right now. Ask our team.",
      reelSpinning: (k) => `Reel ${k} is spinning`,
    },
    product: {
      soldOut: "Sold Out",
      ingredients: "INGREDIENTS",
      allergenNote: "Ask our team for allergen information.",
      size: "Size",
    },
    wifi: {
      dialogLabel: "WiFi information",
      ssid: "Network",
      username: "Username",
      password: "Password",
      copy: "Copy",
      copied: "Copied",
      copyFailed: "Could not copy. Tap and hold text to copy.",
      copyAria: (label) => `Copy ${label}`,
    },
    search: {
      dialogLabel: "Search",
      placeholder: "Search products",
      empty: "Couldn't find what you're looking for. Our team can help.",
      clear: "Clear search",
    },
    footer: {
      vat: "VAT included in prices",
      lastUpdated: "Last updated:",
    },
    languages: {
      tr: "Türkçe",
      en: "English",
      ar: "العربية",
    },
  },
  ar: {
    nav: {
      search: "بحث",
      wifi: "واي فاي",
      langSelect: "اختيار اللغة",
      close: "إغلاق",
    },
    hero: {
      menu: "القائمة",
    },
    neIcsem: {
      title: "ماذا أشرب؟",
      again: "أعد التدوير",
      ourPick: "اقتراحنا:",
      empty: "لا توجد اقتراحات حالياً. يمكنك سؤال فريقنا.",
      reelSpinning: (k) => `الخانة ${k} تدور`,
    },
    product: {
      soldOut: "نفدت الكمية",
      ingredients: "المكونات",
      allergenNote: "يمكنك سؤال فريقنا للحصول على معلومات مسببات الحساسية.",
      size: "الحجم",
    },
    wifi: {
      dialogLabel: "معلومات الواي فاي",
      ssid: "الشبكة",
      username: "اسم المستخدم",
      password: "كلمة المرور",
      copy: "نسخ",
      copied: "تم النسخ",
      copyFailed: "فشل النسخ. اضغط مع الاستمرار على النص للنسخ.",
      copyAria: (label) => `نسخ ${label}`,
    },
    search: {
      dialogLabel: "بحث",
      placeholder: "ابحث عن منتج",
      empty: "لم نجد ما تبحث عنه. يمكن لفريقنا مساعدتك.",
      clear: "مسح البحث",
    },
    footer: {
      vat: "الأسعار تشمل ضريبة القيمة المضافة",
      lastUpdated: "آخر تحديث:",
    },
    languages: {
      tr: "Türkçe",
      en: "English",
      ar: "العربية",
    },
  },
};

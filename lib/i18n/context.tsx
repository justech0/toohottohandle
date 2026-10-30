"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Language } from "./types";
import { DICTIONARY, type I18nDictionary } from "./dictionary";

interface LanguageContextValue {
  lang: Language;
  setLang: (next: Language) => void;
  t: I18nDictionary;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: "tr",
  setLang: () => {},
  t: DICTIONARY.tr,
});

let readexLoaded = false;
export function loadReadexPro() {
  if (typeof window === "undefined" || readexLoaded) return;
  readexLoaded = true;
  import("@fontsource/readex-pro/400.css").catch(() => {});
  import("@fontsource/readex-pro/600.css").catch(() => {});
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>("tr");

  const applyLang = (next: Language) => {
    setLangState(next);
    try {
      localStorage.setItem("thth-lang", next);
    } catch {}

    if (typeof document !== "undefined") {
      if (next === "ar") {
        document.documentElement.setAttribute("dir", "rtl");
        document.documentElement.setAttribute("lang", "ar");
        loadReadexPro();
      } else {
        document.documentElement.setAttribute("dir", "ltr");
        document.documentElement.setAttribute("lang", next);
      }
    }
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem("thth-lang");
      if (saved === "ar" || saved === "en" || saved === "tr") {
        applyLang(saved);
      } else if (typeof document !== "undefined") {
        document.documentElement.setAttribute("dir", "ltr");
        document.documentElement.setAttribute("lang", "tr");
      }
    } catch {}
  }, []);

  return (
    <LanguageContext.Provider value={{ lang, setLang: applyLang, t: DICTIONARY[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

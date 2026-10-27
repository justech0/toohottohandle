"use client";

import { formatDateTr } from "@/lib/format/date";
import type { MenuSettings } from "@/lib/menu/types";
import { useLanguage } from "@/lib/i18n/context";
import { resolveText } from "@/lib/i18n/resolve";

export function Footer({ settings }: { settings: MenuSettings }) {
  const { lang, setLang, t } = useLanguage();
  const note = resolveText(lang, settings.footerNoteAr, settings.footerNoteEn, settings.footerNoteTr);

  return (
    <footer className="menu-footer">
      <div className="menu-footer__note" data-testid="menu-footer">
        {`${note} · ${t.footer.vat} · ${t.footer.lastUpdated} ${formatDateTr(settings.menuUpdatedAt)}`}
      </div>
      <div className="menu-footer__langs" role="group" aria-label={t.nav.langSelect}>
        <button
          type="button"
          data-lang="tr"
          className={`footer-lang-btn ${lang === "tr" ? "footer-lang-btn--active" : ""}`}
          aria-pressed={lang === "tr"}
          onClick={() => setLang("tr")}
        >
          TR
        </button>
        <button
          type="button"
          data-lang="en"
          className={`footer-lang-btn ${lang === "en" ? "footer-lang-btn--active" : ""}`}
          aria-pressed={lang === "en"}
          onClick={() => setLang("en")}
        >
          EN
        </button>
        <button
          type="button"
          data-lang="ar"
          className={`footer-lang-btn ${lang === "ar" ? "footer-lang-btn--active" : ""}`}
          aria-pressed={lang === "ar"}
          onClick={() => setLang("ar")}
        >
          AR
        </button>
      </div>
    </footer>
  );
}

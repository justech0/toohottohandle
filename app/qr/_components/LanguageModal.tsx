"use client";

import { useRef } from "react";
import { useDialogFocus } from "./useDialogFocus";
import { CloseIcon } from "./Icons";
import { useLanguage } from "@/lib/i18n/context";
import type { Language } from "@/lib/i18n/types";

const OPTIONS: { code: Language; label: string; nativeName: string }[] = [
  { code: "tr", label: "TR", nativeName: "Türkçe" },
  { code: "en", label: "EN", nativeName: "English" },
  { code: "ar", label: "AR", nativeName: "العربية" },
];

export function LanguageModal({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const { lang, setLang, t } = useLanguage();
  useDialogFocus(ref, onClose);

  const handleSelect = (code: Language) => {
    setLang(code);
    onClose();
  };

  return (
    <>
      <div className="wifi-backdrop" onClick={onClose} aria-hidden="true" />
      <div
        ref={ref}
        className="wifi lang-modal"
        data-testid="lang-modal"
        role="dialog"
        aria-modal="true"
        aria-label={t.nav.langSelect}
      >
        <button type="button" className="icon-btn wifi__close" aria-label={t.nav.close} onClick={onClose}>
          <CloseIcon />
        </button>
        <p className="lang-modal__title">{t.nav.langSelect}</p>
        <div className="lang-modal__list" role="radiogroup" aria-label={t.nav.langSelect}>
          {OPTIONS.map((opt) => {
            const active = lang === opt.code;
            return (
              <button
                key={opt.code}
                type="button"
                className={`lang-option ${active ? "lang-option--active" : ""}`}
                data-lang={opt.code}
                data-testid={`lang-option-${opt.code}`}
                role="radio"
                aria-checked={active}
                onClick={() => handleSelect(opt.code)}
              >
                <span className="lang-option__code">{opt.label}</span>
                <span className="lang-option__name">{opt.nativeName}</span>
                {active ? <span className="lang-option__check" aria-hidden="true">✓</span> : null}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}

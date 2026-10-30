import type { Language } from "./types";

/**
 * Fallback kuralı: AR → EN → TR, EN → TR, TR → TR (Spec 3.9).
 * Boş veya yalnızca boşluktan oluşan dizgeler yok sayılır.
 */
export function resolveText(
  lang: Language,
  ar?: string | null,
  en?: string | null,
  tr?: string | null,
): string {
  const clean = (s?: string | null) => (s && s.trim() ? s.trim() : null);
  const a = clean(ar);
  const e = clean(en);
  const t = clean(tr) ?? "";

  if (lang === "ar") {
    return a ?? e ?? t;
  }
  if (lang === "en") {
    return e ?? t;
  }
  return t;
}

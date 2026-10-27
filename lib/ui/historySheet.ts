/**
 * Açılan her katman (arama, WiFi, ürün detayı) tarayıcı geçmişine bir kayıt ekler.
 * Kapatma her zaman history.back() ile yapılır; ekranda ne açık olduğu geçmiş kaydından okunur.
 */
export type Overlay = "search" | "wifi" | "lang";
export type NavState = { overlay: Overlay | null; sheet: string | null };

export function navFromState(state: unknown): NavState {
  const s = state && typeof state === "object" ? (state as Record<string, unknown>) : {};
  return {
    overlay: s.overlay === "search" || s.overlay === "wifi" || s.overlay === "lang" ? s.overlay : null,
    sheet: typeof s.sheet === "string" ? s.sheet : null,
  };
}

export function pushNav(patch: Partial<NavState>): void {
  history.pushState({ ...(history.state ?? {}), ...patch }, "");
}

export function closeNav(): void {
  const n = navFromState(history.state);
  if (n.overlay || n.sheet) history.back();
}

/** Sayfa yenilenince eski kayıtta kalan katman bilgisini siler; yoksa geri tuşu eski paneli açar. */
export function clearStaleNav(): void {
  const s = history.state as Record<string, unknown> | null;
  if (!s || (!("overlay" in s) && !("sheet" in s))) return;
  const rest = { ...s };
  delete rest.overlay;
  delete rest.sheet;
  history.replaceState(rest, "");
}

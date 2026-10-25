/** Detay paneli tarayıcı geçmişine bir kayıt ekler; kapatma her zaman history.back() ile yapılır. */
export function openSheetHistory(slug: string): void {
  history.pushState({ ...(history.state ?? {}), sheet: slug }, "");
}

export function closeSheetHistory(): void {
  if (history.state?.sheet) history.back();
}

export function sheetFromState(state: unknown): string | null {
  return state && typeof state === "object" && "sheet" in state && typeof (state as { sheet: unknown }).sheet === "string"
    ? (state as { sheet: string }).sheet
    : null;
}

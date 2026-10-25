/** Panoya kopyalar; izin yoksa metni seçili bırakır ki kullanıcı basılı tutup kopyalayabilsin. */
export async function copyText(text: string, fallbackEl: HTMLElement): Promise<"copied" | "selected"> {
  try {
    await navigator.clipboard.writeText(text);
    return "copied";
  } catch {
    const range = document.createRange();
    range.selectNodeContents(fallbackEl);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
    return "selected";
  }
}

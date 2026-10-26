const fmt = new Intl.DateTimeFormat("tr-TR", { timeZone: "Europe/Istanbul", day: "2-digit", month: "2-digit", year: "numeric" });

/** "25.10.2026" — her zaman Europe/Istanbul saatine göre. */
export function formatDateTr(iso: string): string {
  return fmt.format(new Date(iso));
}

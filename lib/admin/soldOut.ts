export interface SoldOutOption {
  label: string;
  until: string;
}

const ISTANBUL_OFFSET_MS = 3 * 60 * 60 * 1000;
const MANUAL_UNTIL = "2099-12-31T00:00:00.000Z";

function openingParts(openingTime: string): { hour: number; minute: number } {
  const match = /^(\d{2}):(\d{2})$/.exec(openingTime);
  const hour = Number(match?.[1]);
  const minute = Number(match?.[2]);
  if (!match || hour > 23 || minute > 59) throw new Error("Açılış saati geçersiz.");
  return { hour, minute };
}

function istanbulDate(now: Date): { year: number; month: number; day: number; hour: number; minute: number } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(now);
  const part = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((value) => value.type === type)?.value);
  return { year: part("year"), month: part("month"), day: part("day"), hour: part("hour"), minute: part("minute") };
}

function openingIso(local: { year: number; month: number; day: number }, plusDays: number, opening: { hour: number; minute: number }): string {
  const localDay = new Date(Date.UTC(local.year, local.month - 1, local.day + plusDays));
  return new Date(Date.UTC(localDay.getUTCFullYear(), localDay.getUTCMonth(), localDay.getUTCDate(), opening.hour, opening.minute) - ISTANBUL_OFFSET_MS).toISOString();
}

/** İstanbul açılışına göre tükendi seçenekleri; Türkiye'de yaz/kış saati yoktur. */
export function soldOutOptions(now: Date, openingTime: string): SoldOutOption[] {
  const opening = openingParts(openingTime);
  const local = istanbulDate(now);
  const beforeOpening = local.hour < opening.hour || (local.hour === opening.hour && local.minute < opening.minute);
  const options: SoldOutOption[] = [];
  if (beforeOpening) options.push({ label: `Bugün ${openingTime}'e kadar`, until: openingIso(local, 0, opening) });
  options.push({ label: `Yarın ${openingTime}'e kadar`, until: openingIso(local, 1, opening) });
  options.push({ label: "Ben açana kadar", until: MANUAL_UNTIL });
  return options;
}

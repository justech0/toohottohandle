import { randomInt, timingSafeEqual } from "node:crypto";

/**
 * Tek kullanımlık kurulum / sıfırlama kodu. Yalnızca bu sürecin belleğinde durur, sunucu kaydına yazılır.
 * Okunması kolay alfabe: 0/O, 1/I yok.
 */
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
type Kind = "setup" | "reset";
// Next.js açılış kodunu (instrumentation) ve sayfaları ayrı paketlerde yükleyebilir; ortak depo globalThis'te.
const g = globalThis as typeof globalThis & { __ththCodes?: Map<Kind, string> };
const codes = (g.__ththCodes ??= new Map<Kind, string>());

export function issueCode(kind: Kind): string {
  const part = () => Array.from({ length: 4 }, () => ALPHABET[randomInt(ALPHABET.length)]).join("");
  const code = `${part()}-${part()}-${part()}`;
  codes.set(kind, code);
  return code;
}

export function hasCode(kind: Kind): boolean {
  return codes.has(kind);
}

export function takeCode(kind: Kind, input: string): boolean {
  const code = codes.get(kind);
  if (!code) return false;
  const a = Buffer.from(code);
  const b = Buffer.from(input.trim().toUpperCase());
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  codes.delete(kind);
  return true;
}

/** Arama için metni sadeleştirir: Türkçe küçük harf, ı→i, aksanlar silinir, boşluklar teklenir. */
export function normalizeForSearch(s: string): string {
  return s
    .toLocaleLowerCase("tr")
    .replace(/ı/g, "i")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Ziyaretçi IP'si. Hostinger'de uygulama tek bir vekilin arkasındadır; vekil x-forwarded-for'un sonuna
 * gerçek bağlantı adresini ekler. Ziyaretçinin kendi yazdığı önceki değerlere güvenilmez (spec 4.1).
 */
export function clientIp(headers: Headers): string {
  const xff = headers.get("x-forwarded-for");
  if (xff) {
    const last = xff.split(",").map((s) => s.trim()).filter(Boolean).pop();
    if (last) return last;
  }
  return headers.get("x-real-ip")?.trim() || "unknown";
}

/**
 * Aynı site mi? Hostinger vekili TLS'i sonlandırır: request.url iç adres (http://0.0.0.0:3000) olur,
 * tarayıcının Origin'i https'tir. Bu yüzden yalnızca host karşılaştırılır.
 */
export function isSameOrigin(request: Request): boolean {
  const ownHost = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? new URL(request.url).host;
  if (request.headers.get("sec-fetch-site") === "cross-site") return false;
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === ownHost;
  } catch {
    return false;
  }
}

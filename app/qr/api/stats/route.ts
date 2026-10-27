import { getMenu } from "@/lib/menu/getMenu";
import { hasDb } from "@/lib/db/client";
import { getStatsBuffer } from "@/lib/stats/server";
import { MAX_STATS_BODY_BYTES, StatsInputError, parseStatsPayload } from "@/lib/stats/core";

const empty = (status: number) => new Response(null, { status });

async function readLimitedBody(request: Request): Promise<string> {
  const declared = Number(request.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > MAX_STATS_BODY_BYTES) throw new StatsInputError("İstatistik isteği çok büyük.", 413);
  if (!request.body) return "";
  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let size = 0;
  let text = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_STATS_BODY_BYTES) {
      await reader.cancel();
      throw new StatsInputError("İstatistik isteği çok büyük.", 413);
    }
    text += decoder.decode(value, { stream: true });
  }
  return text + decoder.decode();
}

export async function POST(request: Request): Promise<Response> {
  if (!hasDb()) return empty(204);
  // Proxy TLS'i sonlandırınca request.url http, Origin https olabilir; bu yüzden yalnızca host karşılaştırılır.
  const ownHost = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? new URL(request.url).host;
  const origin = request.headers.get("origin");
  const fetchSite = request.headers.get("sec-fetch-site");
  let originHost: string | null = null;
  try { originHost = origin ? new URL(origin).host : null; } catch { return empty(403); }
  if ((originHost && originHost !== ownHost) || fetchSite === "cross-site") return empty(403);

  const menu = await getMenu();
  if (!menu.settings.statsEnabled) return empty(204);

  try {
    const body = JSON.parse(await readLimitedBody(request)) as unknown;
    const accepted = parseStatsPayload(body, new Set(menu.products.map((product) => product.id)));
    getStatsBuffer().enqueue(accepted);
    return empty(204);
  } catch (error) {
    if (error instanceof StatsInputError) return empty(error.status);
    return empty(400);
  }
}

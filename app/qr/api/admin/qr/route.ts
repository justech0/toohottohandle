import { requireAdmin } from "@/lib/auth/session";
import { generateBrandedQrSvg } from "@/lib/qr/generate";

export async function GET(request: Request): Promise<Response> {
  await requireAdmin();
  const download = new URL(request.url).searchParams.get("indir") === "1";
  const headers = new Headers({
    "Content-Type": "image/svg+xml; charset=utf-8",
    "Cache-Control": "private, no-store",
    "X-Content-Type-Options": "nosniff",
  });
  if (download) headers.set("Content-Disposition", 'attachment; filename="toohottohandle-qr.svg"');
  return new Response(await generateBrandedQrSvg(), { headers });
}

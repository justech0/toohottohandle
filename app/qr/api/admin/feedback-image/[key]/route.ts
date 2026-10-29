import { readFile } from "node:fs/promises";
import type { RowDataPacket } from "mysql2/promise";
import { currentAdmin } from "@/lib/auth/session";
import { getPool } from "@/lib/db/client";
import { FEEDBACK_IMAGE_KEY, feedbackImagePath } from "@/lib/feedback/images";

export async function GET(_: Request, { params }: { params: Promise<{ key: string }> }): Promise<Response> {
  const headers = { "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff", "X-Robots-Tag": "noindex, nofollow" };
  const admin = await currentAdmin();
  if (!admin || admin.mustChangePassword) return new Response(null, { status: 401, headers });
  const { key } = await params;
  if (!FEEDBACK_IMAGE_KEY.test(key)) return new Response(null, { status: 404, headers });
  const [[row]] = await getPool().execute<RowDataPacket[]>("SELECT id FROM feedbacks WHERE image_key = ? LIMIT 1", [key]);
  if (!row) return new Response(null, { status: 404, headers });
  try { return new Response(new Uint8Array(await readFile(feedbackImagePath(key))), { headers: { ...headers, "Content-Type": "image/webp" } }); }
  catch { return new Response(null, { status: 404, headers }); }
}

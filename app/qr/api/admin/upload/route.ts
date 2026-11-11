import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { getPool } from "@/lib/db/client";
import { imageContentType } from "@/lib/storage/images";
import { processAndStoreImage } from "@/lib/storage/processImage";
import { isSameOrigin } from "@/lib/http/sameOrigin";

const MAX_UPLOAD = 1_500_000;

const error = (message: string, status = 400) => NextResponse.json({ error: message }, { status });

export async function POST(request: Request): Promise<Response> {
  await requireAdmin();
  if (!isSameOrigin(request)) return error("İstek kaynağı geçersiz.", 403);

  let form: FormData;
  try { form = await request.formData(); } catch { return error("Fotoğraf okunamadı."); }
  const value = form.get("file");
  if (!(value instanceof File)) return error("Fotoğraf seç.");
  if (value.size < 1 || value.size > MAX_UPLOAD) return error("Fotoğraf en fazla 1,5 MB olabilir.");

  const bytes = Buffer.from(await value.arrayBuffer());
  if (!imageContentType(bytes)) return error("Yalnızca JPEG, PNG veya WebP yüklenebilir.");
  try {
    const stored = await processAndStoreImage(bytes);
    await getPool().query(
      "INSERT INTO storage_objects (`key`, size, orphaned_at) VALUES (?, ?, CURRENT_TIMESTAMP(3)) ON DUPLICATE KEY UPDATE size = VALUES(size), orphaned_at = IF(orphaned_at IS NULL, NULL, CURRENT_TIMESTAMP(3))",
      [stored.key, stored.size],
    );
    return NextResponse.json({ key: stored.key });
  } catch {
    return error("Fotoğraf işlenemedi. JPEG olarak kaydedip tekrar dene.");
  }
}

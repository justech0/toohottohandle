import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { getPool } from "@/lib/db/client";
import { HASH_KEY, MAX_BACKUP_IMAGE_BYTES } from "@/lib/admin/backupSchema";
import { restoreAndStoreImage } from "@/lib/storage/processImage";

const error = (message: string, status = 400) => NextResponse.json({ error: message }, { status });

export async function POST(request: Request): Promise<Response> {
  await requireAdmin();
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return error("İstek kaynağı geçersiz.", 403);
  let form: FormData;
  try { form = await request.formData(); } catch { return error("Yedek fotoğrafı okunamadı."); }
  const key = String(form.get("key") ?? "");
  const file = form.get("file");
  if (!HASH_KEY.test(key) || !(file instanceof File) || file.size < 1 || file.size > MAX_BACKUP_IMAGE_BYTES) return error("Yedek fotoğrafı geçersiz.");
  try {
    const stored = await restoreAndStoreImage(Buffer.from(await file.arrayBuffer()), key);
    await getPool().query(
      "INSERT INTO storage_objects (`key`, size, orphaned_at) VALUES (?, ?, CURRENT_TIMESTAMP(3)) ON DUPLICATE KEY UPDATE size = VALUES(size), orphaned_at = IF(orphaned_at IS NULL, NULL, CURRENT_TIMESTAMP(3))",
      [stored.key, stored.size],
    );
    return NextResponse.json({ key: stored.key });
  } catch {
    return error("Yedek fotoğrafı doğrulanamadı.");
  }
}

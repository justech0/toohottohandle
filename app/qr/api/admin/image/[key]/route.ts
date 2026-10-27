import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { SOURCE_IMAGE_KEY } from "@/lib/admin/backupSchema";
import { readBackupSourceImage } from "@/lib/storage/backupImages";

export async function GET(_: Request, { params }: { params: Promise<{ key: string }> }): Promise<Response> {
  await requireAdmin();
  const { key } = await params;
  if (!SOURCE_IMAGE_KEY.test(key)) return new NextResponse("Bulunamadı", { status: 404 });
  try {
    const bytes = await readBackupSourceImage(key);
    return new NextResponse(new Uint8Array(bytes), {
      headers: {
        "Content-Type": "image/webp",
        "Content-Length": String(bytes.length),
        "Content-Disposition": `attachment; filename="${key}-1280.webp"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return new NextResponse("Bulunamadı", { status: 404 });
  }
}

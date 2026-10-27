import { readImage, type ImageWidth } from "@/lib/storage/images";

const FILE = /^([a-f0-9]{64})-(320|720|1280)\.webp$/;

export async function GET(_: Request, { params }: { params: Promise<{ file: string }> }): Promise<Response> {
  const match = FILE.exec((await params).file);
  if (!match) return new Response("Bulunamadı", { status: 404 });
  try {
    const bytes = await readImage(match[1], Number(match[2]) as ImageWidth);
    return new Response(new Uint8Array(bytes), {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Bulunamadı", { status: 404 });
  }
}

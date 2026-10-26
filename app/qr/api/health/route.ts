import { connection } from "next/server";
import { storageSince } from "@/lib/storage/disk";

const startedAt = new Date().toISOString();

/** Ayakta mı? Veritabanına dokunmaz (izleme servisi veritabanını uyandırmasın, spec 4.10). */
export async function GET() {
  await connection();
  return Response.json(
    { ok: true, startedAt, storageSince: await storageSince() },
    { headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" } },
  );
}

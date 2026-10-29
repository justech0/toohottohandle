"use server";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { clientIp } from "@/lib/auth/clientIp";
import { getPool, hasDb } from "@/lib/db/client";
import { FeedbackGuard, parseFeedback } from "@/lib/feedback/input";
import { createFeedback } from "@/lib/feedback/store";
import { removeFeedbackImage, storeFeedbackImage } from "@/lib/feedback/images";

const runtime = globalThis as typeof globalThis & { feedbackGuard?: FeedbackGuard };
const hash = (s: string) => createHash("sha256").update(s).digest("hex");
export async function submitFeedback(form: FormData): Promise<{ ok: boolean; error?: string }> {
  const raw = Object.fromEntries(["topic", "rating", "message", "name", "contact", "lang"].map((key) => [key, form.get(key)]));
  let input;
  try { input = parseFeedback(raw); } catch (e) { return { ok: false, error: (e as Error).message }; }
  const generic = { ok: false, error: "Şu anda gönderilemedi. Biraz sonra tekrar dene." };
  if (!hasDb()) return generic;
  const file = form.get("photo");
  if (file instanceof File && file.size > 1_500_000) return { ok: false, error: "Fotoğraf en fazla 1,5 MB olabilir." };
  const messageHash = hash(input.message.toLocaleLowerCase("tr-TR"));
  runtime.feedbackGuard ??= new FeedbackGuard();
  if (!runtime.feedbackGuard.accept(hash(clientIp(await headers())), messageHash, String(form.get("website") ?? ""))) return generic;
  let key: string | null = null;
  try {
    if (file instanceof File && file.size > 0) {
      key = await storeFeedbackImage(Buffer.from(await file.arrayBuffer()));
    }
    await createFeedback(getPool(), input, key);
    return { ok: true };
  } catch {
    runtime.feedbackGuard.release(messageHash);
    if (key) await removeFeedbackImage(key).catch(() => {});
    return generic;
  }
}

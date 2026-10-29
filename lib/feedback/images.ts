import { randomBytes } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { imageContentType, uploadDirectory } from "@/lib/storage/images";
import { bounded1280Webp } from "@/lib/storage/processImage";

export const FEEDBACK_IMAGE_KEY = /^[a-f0-9]{48}$/;
export function feedbackImagePath(key: string): string {
  if (!FEEDBACK_IMAGE_KEY.test(key)) throw new Error("Geçersiz fotoğraf.");
  return path.join(uploadDirectory(), "feedback", `${key}.webp`);
}
export async function storeFeedbackImage(bytes: Buffer): Promise<string> {
  if (!bytes.length || bytes.length > 1_500_000 || !imageContentType(bytes)) throw new Error("Geçersiz fotoğraf.");
  const output = await bounded1280Webp(bytes);
  const key = randomBytes(24).toString("hex");
  const target = feedbackImagePath(key);
  await mkdir(path.dirname(target), { recursive: true, mode: 0o750 });
  await writeFile(target, output, { flag: "wx", mode: 0o600 });
  return key;
}
export async function removeFeedbackImage(key: string): Promise<void> {
  try { await unlink(feedbackImagePath(key)); } catch (e) { if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e; }
}

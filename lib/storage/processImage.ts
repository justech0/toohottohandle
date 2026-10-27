import sharp from "sharp";
import { imageContentType, sha256Key, writeImageOnce } from "./images";

sharp.concurrency(1);
sharp.cache(false);

const resize = (input: Buffer, width: number, quality: number) =>
  sharp(input, { limitInputPixels: 2_560_000 })
    .rotate()
    .resize({ width, height: width, fit: "inside", withoutEnlargement: true })
    .webp({ quality, effort: 4 })
    .toBuffer();

export async function bounded1280Webp(input: Buffer): Promise<Buffer> {
  for (const quality of [82, 74, 66, 58, 50, 42, 34]) {
    const output = await resize(input, 1280, quality);
    if (output.length <= 400_000) return output;
  }
  throw new Error("Fotoğraf 400 KB sınırına indirilemedi.");
}

export async function processAndStoreImage(input: Buffer): Promise<{ key: string; size: number }> {
  const large = await bounded1280Webp(input);
  const key = sha256Key(large);
  const [small, medium] = await Promise.all([resize(input, 320, 80), resize(input, 720, 80)]);
  await Promise.all([
    writeImageOnce(key, 320, small),
    writeImageOnce(key, 720, medium),
    writeImageOnce(key, 1280, large),
  ]);
  return { key, size: large.length };
}

/** Yedekteki 1280 WebP'yi byte-byte korur; anahtar bu dosyanın özetidir. */
export async function restoreAndStoreImage(input: Buffer, expectedKey: string): Promise<{ key: string; size: number }> {
  if (input.length < 1 || input.length > 400_000 || imageContentType(input) !== "webp" || sha256Key(input) !== expectedKey) {
    throw new Error("Yedek fotoğrafı doğrulanamadı.");
  }
  const metadata = await sharp(input, { limitInputPixels: 2_560_000 }).metadata();
  if (metadata.format !== "webp" || !metadata.width || !metadata.height || metadata.width > 1280 || metadata.height > 1280 || (metadata.pages ?? 1) !== 1) {
    throw new Error("Yedek fotoğrafı doğrulanamadı.");
  }
  const [small, medium] = await Promise.all([resize(input, 320, 80), resize(input, 720, 80)]);
  await Promise.all([
    writeImageOnce(expectedKey, 320, small),
    writeImageOnce(expectedKey, 720, medium),
    writeImageOnce(expectedKey, 1280, input),
  ]);
  return { key: expectedKey, size: input.length };
}

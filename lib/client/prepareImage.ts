const MAX_EDGE = 1600;
const MAX_BYTES = 1_500_000;
export const PHOTO_OPEN_ERROR = "Bu fotoğraf açılamadı. Fotoğrafı galeriden JPEG olarak kaydedip tekrar dene.";

const blobFromCanvas = (canvas: HTMLCanvasElement, type: string, quality: number) =>
  new Promise<Blob>((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error(PHOTO_OPEN_ERROR)), type, quality));

const load = (file: File) => new Promise<HTMLImageElement>((resolve, reject) => {
  const url = URL.createObjectURL(file);
  const image = new Image();
  image.onload = () => { URL.revokeObjectURL(url); resolve(image); };
  image.onerror = () => { URL.revokeObjectURL(url); reject(new Error(PHOTO_OPEN_ERROR)); };
  image.src = url;
});

export async function prepareImage(file: File): Promise<File> {
  let image: HTMLImageElement;
  try { image = await load(file); } catch { throw new Error(PHOTO_OPEN_ERROR); }
  if (!image.naturalWidth || !image.naturalHeight) throw new Error(PHOTO_OPEN_ERROR);

  let scale = Math.min(1, MAX_EDGE / Math.max(image.naturalWidth, image.naturalHeight));
  for (let attempt = 0; attempt < 8; attempt++) {
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error(PHOTO_OPEN_ERROR);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    let blob = await blobFromCanvas(canvas, "image/webp", 0.86);
    if (blob.type !== "image/webp") blob = await blobFromCanvas(canvas, "image/jpeg", 0.82);
    if (blob.size <= MAX_BYTES) return new File([blob], `foto.${blob.type === "image/webp" ? "webp" : "jpg"}`, { type: blob.type });
    scale *= 0.82;
  }
  throw new Error("Fotoğraf 1,5 MB sınırına indirilemedi.");
}

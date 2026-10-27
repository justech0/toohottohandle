import { readFile } from "node:fs/promises";
import path from "node:path";
import QRCode from "qrcode";

export const QR_URL = "https://toohottohandlecoffee.com/qr";
export const QR_SHORT_ADDRESS = "toohottohandlecoffee.com/qr";
export const QR_ERROR_LEVEL = "H" as const;
export const QR_MARGIN = 4;

function modulePath(size: number, get: (row: number, col: number) => number): string {
  let pathData = "";
  for (let row = 0; row < size; row++) {
    let start = -1;
    for (let col = 0; col <= size; col++) {
      const dark = col < size && Boolean(get(row, col));
      if (dark && start < 0) start = col;
      if (!dark && start >= 0) {
        pathData += `M${start + QR_MARGIN} ${row + QR_MARGIN}h${col - start}v1H${start + QR_MARGIN}z`;
        start = -1;
      }
    }
  }
  return pathData;
}

export function renderBrandedQrSvg(logoDataUrl: string): string {
  const code = QRCode.create(QR_URL, { errorCorrectionLevel: QR_ERROR_LEVEL });
  const qrSize = code.modules.size + QR_MARGIN * 2;
  const captionHeight = 8;
  const plateWidth = qrSize * 0.3;
  const plateHeight = qrSize * 0.105;
  const plateX = (qrSize - plateWidth) / 2;
  const plateY = (qrSize - plateHeight) / 2;
  const inset = qrSize * 0.018;
  const logoInset = qrSize * 0.024;
  const pathData = modulePath(code.modules.size, (row, col) => code.modules.get(row, col));

  return `<svg xmlns="http://www.w3.org/2000/svg" width="40mm" height="${(40 * (qrSize + captionHeight) / qrSize).toFixed(2)}mm" viewBox="0 0 ${qrSize} ${qrSize + captionHeight}" role="img" aria-labelledby="title desc" data-error-correction="${QR_ERROR_LEVEL}" data-margin="${QR_MARGIN}">
  <title id="title">Too Hot To Handle menü QR kodu</title>
  <desc id="desc">${QR_SHORT_ADDRESS} adresini açar</desc>
  <rect width="${qrSize}" height="${qrSize + captionHeight}" fill="#fff"/>
  <path d="${pathData}" fill="#16120f"/>
  <rect x="${plateX}" y="${plateY}" width="${plateWidth}" height="${plateHeight}" rx="${inset * 1.2}" fill="#fff"/>
  <rect x="${plateX + inset}" y="${plateY + inset}" width="${plateWidth - inset * 2}" height="${plateHeight - inset * 2}" rx="${inset * .65}" fill="#DC2524"/>
  <image href="${logoDataUrl}" x="${plateX + logoInset}" y="${plateY + logoInset}" width="${plateWidth - logoInset * 2}" height="${plateHeight - logoInset * 2}" preserveAspectRatio="xMidYMid meet"/>
  <text x="${qrSize / 2}" y="${qrSize + 4.6}" text-anchor="middle" font-family="Arial, sans-serif" font-size="2.7" font-weight="700" fill="#16120f">${QR_SHORT_ADDRESS}</text>
</svg>`;
}

export async function generateBrandedQrSvg(): Promise<string> {
  const logo = await readFile(path.join(process.cwd(), "public", "qr", "brand", "logo.png"));
  return renderBrandedQrSvg(`data:image/png;base64,${logo.toString("base64")}`);
}

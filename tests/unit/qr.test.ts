import { readFile } from "node:fs/promises";
import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { QR_ERROR_LEVEL, QR_MARGIN, QR_SHORT_ADDRESS, QR_URL, renderBrandedQrSvg } from "@/lib/qr/generate";

describe("logolu QR", () => {
  it("H hata düzeltme, dört modül kenar ve gömülü logo ile adressiz kare QR üretir", () => {
    const svg = renderBrandedQrSvg("data:image/png;base64,dGVzdA==");
    expect(QR_ERROR_LEVEL).toBe("H");
    expect(QR_MARGIN).toBe(4);
    expect(QR_URL).toBe("https://toohottohandlecoffee.com/qr");
    expect(svg).toContain('data-error-correction="H"');
    expect(svg).toContain('data-margin="4"');
    expect(svg).toContain("data:image/png;base64,dGVzdA==");
    expect(svg).toContain(QR_SHORT_ADDRESS);
    expect(svg).toContain('width="40mm"');
    expect(svg).toContain('height="40mm"');
    expect(svg).not.toContain("<text");
    const viewBox = svg.match(/viewBox="0 0 (\d+) (\d+)"/)!;
    expect(viewBox[1]).toBe(viewBox[2]);
  });
  it("ships a square PNG export with a readable print resolution", async () => {
    const bytes = await readFile("public/qr/brand/qr-logolu.png");
    const metadata = await sharp(bytes).metadata();
    expect(metadata.format).toBe("png");
    expect(metadata.width).toBeGreaterThanOrEqual(1200);
    expect(metadata.width).toBe(metadata.height);
  });

});


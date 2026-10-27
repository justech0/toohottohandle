import { describe, expect, it } from "vitest";
import { QR_ERROR_LEVEL, QR_MARGIN, QR_SHORT_ADDRESS, QR_URL, renderBrandedQrSvg } from "@/lib/qr/generate";

describe("logolu QR", () => {
  it("H hata düzeltme, dört modül kenar, gömülü logo ve kısa adres üretir", () => {
    const svg = renderBrandedQrSvg("data:image/png;base64,dGVzdA==");
    expect(QR_ERROR_LEVEL).toBe("H");
    expect(QR_MARGIN).toBe(4);
    expect(QR_URL).toBe("https://toohottohandlecoffee.com/qr");
    expect(svg).toContain('data-error-correction="H"');
    expect(svg).toContain('data-margin="4"');
    expect(svg).toContain("data:image/png;base64,dGVzdA==");
    expect(svg).toContain(QR_SHORT_ADDRESS);
    expect(svg).toContain('width="40mm"');
  });
});


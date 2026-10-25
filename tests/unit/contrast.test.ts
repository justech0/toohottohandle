import { describe, it, expect } from "vitest";
import { textOn, COLORS } from "@/lib/design/textOn";
import type { GroupColor } from "@/lib/menu/types";

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrast(a: string, b: string): number {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

describe("textOn", () => {
  it("uses white only on red and blue", () => {
    expect(textOn("red")).toBe("white");
    expect(textOn("blue")).toBe("white");
    for (const c of ["pink", "yellow", "green", "gray"] as GroupColor[]) expect(textOn(c)).toBe("ink");
  });
  it("always reaches 4.5:1 contrast", () => {
    for (const c of ["red", "yellow", "pink", "blue", "green", "gray"] as GroupColor[]) {
      expect(contrast(COLORS[c], COLORS[textOn(c)])).toBeGreaterThanOrEqual(4.5);
    }
  });
});

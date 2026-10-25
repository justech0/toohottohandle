import { describe, it, expect } from "vitest";
import { LOCKUP_LETTERS, HOT_PATH, LOCKUP_VIEWBOX } from "@/lib/brand/lockup";

describe("official lockup data", () => {
  it("copies the 11 letter paths and the HOT path from the coming-soon page", () => {
    expect(LOCKUP_LETTERS).toHaveLength(11);
    expect(HOT_PATH.d.startsWith("M290.2 688.1")).toBe(true);
    expect(HOT_PATH.transform).toBe("translate(544 71) scale(0.55475)");
    expect(LOCKUP_VIEWBOX).toBe("62 64 1206 858");
  });
});

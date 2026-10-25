import { describe, it, expect } from "vitest";
import { waveOffset, WAVE } from "@/lib/motion/hotWave";

describe("waveOffset", () => {
  it("keeps the official wavy HOT shape at phase 0 (never a straightened HOT)", () => {
    for (const y of [0, 104, 250, 500, 688]) expect(waveOffset(y, 0)).toBeCloseTo(0, 10);
  });
  it("never moves a point more than twice the logo's own amplitude", () => {
    for (let y = 0; y <= 700; y += 7) for (let t = 0; t < 7; t += 0.37) expect(Math.abs(waveOffset(y, t))).toBeLessThanOrEqual(2 * WAVE.A + 1e-9);
  });
  it("clamps the T bar region to y = 104", () => {
    for (const t of [0.5, 1.7, 3.1]) expect(waveOffset(50, t)).toBeCloseTo(waveOffset(104, t), 10);
  });
  it("uses the coming-soon page constants", () => {
    expect(WAVE).toEqual({ A: 22.8, lambda: 277.5, P: 4.79, yMin: 104 });
  });
});

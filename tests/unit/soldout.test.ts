import { describe, it, expect } from "vitest";
import { isSoldOut } from "@/lib/menu/soldout";

describe("isSoldOut", () => {
  it("is false without a sold-out time", () => {
    expect(isSoldOut(null, "2026-10-25T20:00:00+03:00")).toBe(false);
  });
  it("compares instants, not local clock text", () => {
    expect(isSoldOut("2026-10-26T08:00:00+03:00", "2026-10-26T04:59:59Z")).toBe(true);
    expect(isSoldOut("2026-10-26T08:00:00+03:00", "2026-10-26T05:00:00Z")).toBe(false);
  });
});

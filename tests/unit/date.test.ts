import { describe, it, expect } from "vitest";
import { formatDateTr } from "@/lib/format/date";

describe("formatDateTr", () => {
  it("formats in Europe/Istanbul time", () => {
    expect(formatDateTr("2026-10-24T22:30:00Z")).toBe("25.10.2026");
    expect(formatDateTr("2026-10-25T00:00:00+03:00")).toBe("25.10.2026");
  });
});

import { describe, expect, it } from "vitest";
import { soldOutOptions } from "@/lib/admin/soldOut";

describe("soldOutOptions", () => {
  const labels = (at: string) => soldOutOptions(new Date(at), "08:00").map((option) => option.label);
  const until = (at: string, label: string) => soldOutOptions(new Date(at), "08:00").find((option) => option.label === label)?.until;

  it("offers today's and tomorrow's opening at 00:20 Istanbul time", () => {
    expect(labels("2026-10-26T21:20:00.000Z")).toEqual(["Bugün 08:00'e kadar", "Yarın 08:00'e kadar", "Ben açana kadar"]);
    expect(until("2026-10-26T21:20:00.000Z", "Bugün 08:00'e kadar")).toBe("2026-10-27T05:00:00.000Z");
  });

  it("keeps today's opening available at 07:50 Istanbul time", () => {
    expect(labels("2026-10-27T04:50:00.000Z")).toEqual(["Bugün 08:00'e kadar", "Yarın 08:00'e kadar", "Ben açana kadar"]);
    expect(until("2026-10-27T04:50:00.000Z", "Yarın 08:00'e kadar")).toBe("2026-10-28T05:00:00.000Z");
  });

  it("starts tomorrow-only choices exactly at opening", () => {
    expect(labels("2026-10-27T05:00:00.000Z")).toEqual(["Yarın 08:00'e kadar", "Ben açana kadar"]);
  });

  it("uses next day's opening at 23:59 Istanbul time", () => {
    expect(until("2026-10-27T20:59:00.000Z", "Yarın 08:00'e kadar")).toBe("2026-10-28T05:00:00.000Z");
  });

  it("uses Turkey's fixed UTC+03:00 offset for winter and summer", () => {
    expect(until("2026-01-15T04:50:00.000Z", "Bugün 08:00'e kadar")).toBe("2026-01-15T05:00:00.000Z");
    expect(until("2026-07-15T04:50:00.000Z", "Bugün 08:00'e kadar")).toBe("2026-07-15T05:00:00.000Z");
  });

  it("keeps the manual choice until 2099-12-31", () => {
    expect(until("2026-10-27T05:00:00.000Z", "Ben açana kadar")).toBe("2099-12-31T00:00:00.000Z");
  });
});

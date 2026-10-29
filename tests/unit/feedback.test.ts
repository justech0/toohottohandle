import { describe, expect, it } from "vitest";
import { parseFeedback, FeedbackGuard } from "@/lib/feedback/input";

const valid = { topic: "taste", rating: "4", message: "Kahve çok güzeldi.", name: "", contact: "", website: "", lang: "tr" };

describe("geri bildirim doğrulaması", () => {
  it("requires a topic, integer rating, and bounded message", () => {
    expect(parseFeedback(valid)).toMatchObject({ rating: 4, name: null, contact: null });
    for (const patch of [{ topic: "bad" }, { rating: "0" }, { rating: "1.5" }, { rating: "6" }, { message: " " }, { message: "a".repeat(1001) }, { name: "a".repeat(81) }, { contact: "a".repeat(121) }, { contact: "invalid" }, { lang: "xx" }]) {
      expect(() => parseFeedback({ ...valid, ...patch })).toThrow();
    }
    expect(parseFeedback({ ...valid, contact: "+90 555 123 45 67" }).contact).toBe("+90 555 123 45 67");
    expect(parseFeedback({ ...valid, contact: "a@example.com" }).contact).toBe("a@example.com");
  });

  it("rejects honeypots, duplicates for ten minutes, and more than five hourly attempts", () => {
    const guard = new FeedbackGuard();
    expect(guard.accept("ip", "same", "bot", 0)).toBe(false);
    expect(guard.accept("ip", "same", "", 0)).toBe(true);
    expect(guard.accept("other", "same", "", 1)).toBe(false);
    expect(guard.accept("other", "same", "", 600_001)).toBe(true);
    for (let i = 0; i < 4; i++) expect(guard.accept("ip", `different-${i}`, "", 1000)).toBe(true);
    expect(guard.accept("ip", "sixth", "", 1000)).toBe(false);
    expect(guard.accept("ip", "sixth", "", 3_600_001)).toBe(true);
  });
  it("allows a retry after a storage failure without resetting the hourly quota", () => {
    const guard = new FeedbackGuard();
    expect(guard.accept("ip", "message", "", 0)).toBe(true);
    guard.release("message");
    expect(guard.accept("ip", "message", "", 1)).toBe(true);
  });
});

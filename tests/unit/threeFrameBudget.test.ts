import { describe, expect, it } from "vitest";
import { FrameBudget } from "@/lib/three/frameBudget";

function feed(budget: FrameBudget, step: number, duration: number) {
  let now = 0;
  let result = budget.sample(now);
  for (let i = 0; i < 10; i += 1) result = budget.sample((now += step));
  while (now < duration + step * 10) result = budget.sample((now += step));
  return result;
}

describe("FrameBudget", () => {
  it("ignores the first 10 shader warm-up frames and accepts 45 ms", () => {
    expect(feed(new FrameBudget(), 45, 2_100)).toBe("pass");
  });

  it("falls back when the visible scene averages above 45 ms for two seconds", () => {
    expect(feed(new FrameBudget(), 46, 2_100)).toBe("fallback");
  });

  it("starts the two-second measurement again after visibility reset", () => {
    const budget = new FrameBudget();
    for (let i = 0; i < 30; i += 1) budget.sample(i * 50);
    budget.reset();
    expect(budget.sample(10_000)).toBe("measuring");
    expect(budget.sample(10_050)).toBe("measuring");
  });
});

import { describe, it, expect } from "vitest";
import { normalizeForSearch } from "@/lib/text/normalize";

describe("normalizeForSearch", () => {
  it.each([
    ["FISTIKLI", "fistikli"],
    ["İÇECEK", "icecek"],
    ["Caffè Latte", "caffe latte"],
    ["Colombia Medellín", "colombia medellin"],
    ["  Ballı   Süt ", "balli sut"],
  ])("%s → %s", (input, expected) => {
    expect(normalizeForSearch(input)).toBe(expected);
  });
});

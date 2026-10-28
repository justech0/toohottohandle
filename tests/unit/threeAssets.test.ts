import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("3D brand SVG sources", () => {
  it.each(["hot", "lips", "rabbit", "star"])("uses a real path-only %s SVG", (name) => {
    const svg = readFileSync(resolve(`public/qr/brand/${name}.svg`), "utf8");
    expect(svg).toContain("<path");
    expect(svg).not.toMatch(/<(?:image|script|foreignObject)\b/i);
  });
});

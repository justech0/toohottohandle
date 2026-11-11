import { describe, it, expect } from "vitest";
import config from "@/next.config";

describe("next.config güvenlik ve alan adı", () => {
  it("sends security headers on every page", async () => {
    const rules = await config.headers!();
    const all = rules.find((r) => r.source === "/:path*")!;
    const h = Object.fromEntries(all.headers.map((x) => [x.key, x.value]));
    expect(h["X-Frame-Options"]).toBe("DENY");
    expect(h["Content-Security-Policy"]).toBe("frame-ancestors 'none'");
    expect(h["X-Content-Type-Options"]).toBe("nosniff");
    expect(h["Referrer-Policy"]).toBe("strict-origin-when-cross-origin");
    expect(h["Strict-Transport-Security"]).toBe("max-age=31536000");
    expect(h["Permissions-Policy"]).toContain("camera=()");
  });

  it("keeps noindex on admin and api", async () => {
    const rules = await config.headers!();
    expect(rules.filter((r) => r.headers.some((x) => x.key === "X-Robots-Tag")).map((r) => r.source)).toEqual(
      expect.arrayContaining(["/qr/admin", "/qr/admin/:path*", "/qr/api/:path*"]),
    );
  });

  it("sends www to the bare domain, keeping the path", async () => {
    const rules = await config.redirects!();
    expect(rules).toContainEqual({
      source: "/:path*",
      has: [{ type: "host", value: "www.toohottohandlecoffee.com" }],
      destination: "https://toohottohandlecoffee.com/:path*",
      permanent: true,
    });
  });
});

import { describe, it, expect } from "vitest";
import { isSameOrigin } from "@/lib/http/sameOrigin";

const req = (headers: Record<string, string>, url = "http://0.0.0.0:3000/qr/api/admin/upload") => new Request(url, { method: "POST", headers });

describe("isSameOrigin", () => {
  it("accepts the public https origin behind the host's proxy", () => {
    expect(isSameOrigin(req({ origin: "https://toohottohandlecoffee.com", host: "toohottohandlecoffee.com" }))).toBe(true);
    expect(isSameOrigin(req({ origin: "https://toohottohandlecoffee.com", "x-forwarded-host": "toohottohandlecoffee.com", host: "0.0.0.0:3000" }))).toBe(true);
  });
  it("accepts a request without Origin unless the browser says cross-site", () => {
    expect(isSameOrigin(req({ host: "toohottohandlecoffee.com" }))).toBe(true);
    expect(isSameOrigin(req({ host: "toohottohandlecoffee.com", "sec-fetch-site": "cross-site" }))).toBe(false);
  });
  it("refuses another site and a broken Origin", () => {
    expect(isSameOrigin(req({ origin: "https://evil.example", host: "toohottohandlecoffee.com" }))).toBe(false);
    expect(isSameOrigin(req({ origin: "not a url", host: "toohottohandlecoffee.com" }))).toBe(false);
  });
});

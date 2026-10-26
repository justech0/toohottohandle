import { describe, it, expect } from "vitest";
import { lockMinutes } from "@/lib/auth/lockout";
import { clientIp } from "@/lib/auth/clientIp";
import { serial } from "@/lib/auth/serial";
import { issueCode, takeCode } from "@/lib/auth/oneTimeCode";

describe("lockMinutes (spec 4.1)", () => {
  it("does not lock before the 5th wrong try", () => {
    for (const n of [0, 1, 2, 3, 4]) expect(lockMinutes(n)).toBeNull();
  });
  it("doubles from 1 minute and stops at 15", () => {
    expect([5, 6, 7, 8, 9, 10, 30].map(lockMinutes)).toEqual([1, 2, 4, 8, 15, 15, 15]);
  });
});

describe("clientIp", () => {
  const h = (o: Record<string, string>) => new Headers(o);
  it("trusts only the last x-forwarded-for hop (added by the host's proxy)", () => {
    expect(clientIp(h({ "x-forwarded-for": "6.6.6.6, 203.0.113.9" }))).toBe("203.0.113.9");
  });
  it("falls back to x-real-ip, then unknown", () => {
    expect(clientIp(h({ "x-real-ip": "198.51.100.2" }))).toBe("198.51.100.2");
    expect(clientIp(h({}))).toBe("unknown");
  });
});

describe("serial", () => {
  it("runs one job at a time, in order", async () => {
    let running = 0;
    let peak = 0;
    const order: number[] = [];
    const job = (i: number) => serial(async () => {
      running++;
      peak = Math.max(peak, running);
      await new Promise((r) => setTimeout(r, 5));
      order.push(i);
      running--;
    });
    await Promise.all([1, 2, 3, 4].map(job));
    expect(peak).toBe(1);
    expect(order).toEqual([1, 2, 3, 4]);
  });
  it("keeps going after a job throws", async () => {
    await expect(serial(async () => { throw new Error("x"); })).rejects.toThrow("x");
    await expect(serial(async () => 7)).resolves.toBe(7);
  });
});

describe("one-time codes", () => {
  it("accepts the issued code once", () => {
    const code = issueCode("setup");
    expect(code).toMatch(/^[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}$/);
    expect(takeCode("setup", "WRONG-CODE-XXXX")).toBe(false);
    expect(takeCode("setup", code.toLowerCase())).toBe(true);
    expect(takeCode("setup", code)).toBe(false);
  });
  it("keeps setup and reset codes apart", () => {
    const s = issueCode("setup");
    issueCode("reset");
    expect(takeCode("reset", s)).toBe(false);
  });
});

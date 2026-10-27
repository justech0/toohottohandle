import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { deletableObjectKeys, imageContentType, sha256Key } from "@/lib/storage/images";

describe("fotoğraf deposu", () => {
  it("uses the 1280 WebP bytes as the SHA-256 key", () => {
    const bytes = Buffer.from("1280-webp-test");
    expect(sha256Key(bytes)).toBe(createHash("sha256").update(bytes).digest("hex"));
  });

  it("accepts only JPEG, PNG and WebP file signatures", () => {
    expect(imageContentType(Buffer.from([0xff, 0xd8, 0xff, 0x00]))).toBe("jpeg");
    expect(imageContentType(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))).toBe("png");
    expect(imageContentType(Buffer.from("RIFF0000WEBP"))).toBe("webp");
    expect(imageContentType(Buffer.from("GIF89a"))).toBeNull();
  });

  it("deletes only 30-day-old orphans absent from current menu and last 25 snapshots", () => {
    const now = new Date("2026-10-27T12:00:00.000Z");
    const old = "a".repeat(64);
    const recent = "b".repeat(64);
    const active = "c".repeat(64);
    const archived = "d".repeat(64);
    const rows = [
      { key: old, orphanedAt: "2026-09-01T00:00:00.000Z" },
      { key: recent, orphanedAt: "2026-10-10T00:00:00.000Z" },
      { key: active, orphanedAt: "2026-09-01T00:00:00.000Z" },
      { key: archived, orphanedAt: "2026-09-01T00:00:00.000Z" },
    ];
    expect(deletableObjectKeys(rows, new Set([active]), new Set([archived]), now)).toEqual([old]);
  });
});

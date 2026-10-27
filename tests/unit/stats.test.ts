import { afterEach, describe, expect, it, vi } from "vitest";
import {
  MAX_PRODUCT_IDS, STATS_FLUSH_INTERVAL_MS, StatsCounterBuffer, parseStatsPayload, statsBucket,
} from "@/lib/stats/core";

describe("istatistik doğrulama", () => {
  it("bilinmeyen ürünleri atar ve aynı ürünü istek başına bir kez sayar", () => {
    expect(parseStatsPayload({ menuOpen: true, productIds: [2, 2, 999, 1] }, new Set([1, 2]))).toEqual({
      menuOpen: true,
      productIds: [2, 1],
    });
  });

  it("hatalı gövdeyi ve ürün sınırını reddeder", () => {
    expect(() => parseStatsPayload({}, new Set())).toThrow("İstatistik isteği geçersiz.");
    expect(() => parseStatsPayload({ menuOpen: "evet", productIds: [] }, new Set())).toThrow("İstatistik isteği geçersiz.");
    expect(() => parseStatsPayload({ menuOpen: false, productIds: [0] }, new Set())).toThrow("İstatistik isteği geçersiz.");
    expect(() => parseStatsPayload({ menuOpen: false, productIds: Array.from({ length: MAX_PRODUCT_IDS + 1 }, (_, i) => i + 1) }, new Set())).toThrow("İstatistik isteği çok büyük.");
  });

  it("tarihi Europe/Istanbul gün ve saatine böler", () => {
    expect(statsBucket(new Date("2026-01-01T21:30:00.000Z"))).toEqual({ date: "2026-01-02", hour: 0 });
  });
});

describe("istatistik tamponu", () => {
  afterEach(() => vi.useRealTimers());

  it("500 sayaçta tek toplu yazma başlatır", async () => {
    const writes: unknown[] = [];
    const buffer = new StatsCounterBuffer(async (batch) => { writes.push(batch); });
    for (let i = 0; i < 500; i++) buffer.enqueue({ menuOpen: true, productIds: [] }, new Date("2026-10-27T08:00:00.000Z"));
    await buffer.waitForActiveFlush();
    expect(writes).toHaveLength(1);
    expect(writes[0]).toMatchObject({ total: 500, daily: [{ date: "2026-10-27", count: 500 }] });
    expect(buffer.snapshot().total).toBe(0);
    buffer.dispose();
  });

  it("ilk sayaçtan 20 dakika sonra yazar", async () => {
    vi.useFakeTimers();
    const writes: unknown[] = [];
    const buffer = new StatsCounterBuffer(async (batch) => { writes.push(batch); });
    buffer.enqueue({ menuOpen: false, productIds: [1] }, new Date("2026-10-27T08:00:00.000Z"));
    await vi.advanceTimersByTimeAsync(STATS_FLUSH_INTERVAL_MS - 1);
    expect(writes).toHaveLength(0);
    await vi.advanceTimersByTimeAsync(1);
    await buffer.waitForActiveFlush();
    expect(writes).toHaveLength(1);
    buffer.dispose();
  });

  it("yazma başarısız olursa sayaçları geri koyar", async () => {
    const buffer = new StatsCounterBuffer(async () => { throw new Error("db kapalı"); });
    buffer.enqueue({ menuOpen: true, productIds: [1] }, new Date("2026-10-27T08:00:00.000Z"));
    await expect(buffer.flush()).rejects.toThrow("db kapalı");
    expect(buffer.snapshot()).toMatchObject({ total: 2, daily: [{ date: "2026-10-27", count: 1 }] });
    buffer.dispose();
  });

  it("eşikteki yazma hatasından sonra sıkı döngüye girmez ve süre sonunda yeniden dener", async () => {
    vi.useFakeTimers();
    const writer = vi.fn().mockRejectedValueOnce(new Error("db kapalı")).mockResolvedValue(undefined);
    const buffer = new StatsCounterBuffer(writer, 2, 1_000, () => {});
    buffer.enqueue({ menuOpen: true, productIds: [1] }, new Date("2026-10-27T08:00:00.000Z"));
    await Promise.resolve();
    await Promise.resolve();
    expect(writer).toHaveBeenCalledTimes(1);
    expect(buffer.snapshot().total).toBe(2);
    await vi.advanceTimersByTimeAsync(999);
    expect(writer).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1);
    await buffer.waitForActiveFlush();
    expect(writer).toHaveBeenCalledTimes(2);
    expect(buffer.snapshot().total).toBe(0);
    buffer.dispose();
  });

  it("rapor devam eden yazmayı bekler ve yazılan sayacı tampondan tekrar eklemez", async () => {
    let release!: () => void;
    const writing = new Promise<void>((resolve) => { release = resolve; });
    const buffer = new StatsCounterBuffer(() => writing, 1);
    buffer.enqueue({ menuOpen: true, productIds: [] });
    const reader = vi.fn(async (pending: { total: number }) => pending.total);
    const report = buffer.withStableSnapshot(reader);
    await Promise.resolve();
    expect(reader).not.toHaveBeenCalled();
    release();
    expect(await report).toBe(0);
    expect(reader).toHaveBeenCalledTimes(1);
    buffer.dispose();
  });
});


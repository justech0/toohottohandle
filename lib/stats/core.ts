export const MAX_STATS_BODY_BYTES = 16_384;
export const MAX_PRODUCT_IDS = 250;
export const STATS_FLUSH_COUNT = 500;
export const STATS_FLUSH_INTERVAL_MS = 20 * 60 * 1_000;

export interface AcceptedStats {
  menuOpen: boolean;
  productIds: number[];
}

export interface DailyCount { date: string; count: number }
export interface HourlyCount extends DailyCount { hour: number }
export interface ProductCount extends DailyCount { productId: number }
export interface StatsBatch {
  total: number;
  daily: DailyCount[];
  hourly: HourlyCount[];
  products: ProductCount[];
}

export class StatsInputError extends Error {
  constructor(message: string, readonly status = 400) {
    super(message);
  }
}

export function parseStatsPayload(value: unknown, knownProductIds: ReadonlySet<number>): AcceptedStats {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new StatsInputError("İstatistik isteği geçersiz.");
  const input = value as Record<string, unknown>;
  if (typeof input.menuOpen !== "boolean" || !Array.isArray(input.productIds)) throw new StatsInputError("İstatistik isteği geçersiz.");
  const rawIds = input.productIds as unknown[];
  if (rawIds.length > MAX_PRODUCT_IDS) throw new StatsInputError("İstatistik isteği çok büyük.", 413);
  if (rawIds.some((id) => !Number.isSafeInteger(id) || Number(id) < 1)) throw new StatsInputError("İstatistik isteği geçersiz.");
  return {
    menuOpen: input.menuOpen === true,
    productIds: [...new Set(rawIds as number[])].filter((id) => knownProductIds.has(id)),
  };
}

const istanbulParts = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/Istanbul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  hourCycle: "h23",
});

export function statsBucket(at = new Date()): { date: string; hour: number } {
  const parts = Object.fromEntries(istanbulParts.formatToParts(at).map((part) => [part.type, part.value]));
  return { date: `${parts.year}-${parts.month}-${parts.day}`, hour: Number(parts.hour) };
}

type MapBatch = {
  total: number;
  daily: Map<string, number>;
  hourly: Map<string, number>;
  products: Map<string, number>;
};

const emptyMapBatch = (): MapBatch => ({ total: 0, daily: new Map(), hourly: new Map(), products: new Map() });
export const emptyStatsBatch = (): StatsBatch => ({ total: 0, daily: [], hourly: [], products: [] });
const add = (map: Map<string, number>, key: string, amount: number) => map.set(key, (map.get(key) ?? 0) + amount);

const serialize = (batch: MapBatch): StatsBatch => ({
  total: batch.total,
  daily: [...batch.daily].map(([date, count]) => ({ date, count })),
  hourly: [...batch.hourly].map(([key, count]) => {
    const [date, hour] = key.split("|");
    return { date, hour: Number(hour), count };
  }),
  products: [...batch.products].map(([key, count]) => {
    const [date, productId] = key.split("|");
    return { date, productId: Number(productId), count };
  }),
});

const merge = (target: MapBatch, source: MapBatch) => {
  target.total += source.total;
  for (const [key, count] of source.daily) add(target.daily, key, count);
  for (const [key, count] of source.hourly) add(target.hourly, key, count);
  for (const [key, count] of source.products) add(target.products, key, count);
};

type Timer = ReturnType<typeof setTimeout>;

export class StatsCounterBuffer {
  private pending = emptyMapBatch();
  private inFlight: MapBatch | null = null;
  private timer: Timer | null = null;
  private activeFlush: Promise<void> | null = null;
  private thresholdPaused = false;
  private reportReaders = 0;

  constructor(
    private readonly writer: (batch: StatsBatch) => Promise<void>,
    private readonly threshold = STATS_FLUSH_COUNT,
    private readonly intervalMs = STATS_FLUSH_INTERVAL_MS,
    private readonly onBackgroundError: (error: unknown) => void = () => {},
  ) {}

  enqueue(stats: AcceptedStats, at = new Date()): void {
    const count = Number(stats.menuOpen) + stats.productIds.length;
    if (count === 0) return;
    const bucket = statsBucket(at);
    if (stats.menuOpen) {
      add(this.pending.daily, bucket.date, 1);
      add(this.pending.hourly, `${bucket.date}|${bucket.hour}`, 1);
    }
    for (const productId of stats.productIds) add(this.pending.products, `${bucket.date}|${productId}`, 1);
    this.pending.total += count;
    if (this.pending.total >= this.threshold && !this.thresholdPaused && this.reportReaders === 0) this.triggerFlush();
    else this.ensureTimer();
  }

  snapshot(): StatsBatch {
    const combined = emptyMapBatch();
    merge(combined, this.pending);
    if (this.inFlight) merge(combined, this.inFlight);
    return serialize(combined);
  }

  async flush(): Promise<void> {
    if (this.activeFlush) return this.activeFlush;
    if (this.pending.total === 0) return;
    this.clearTimer();
    const batch = this.pending;
    this.pending = emptyMapBatch();
    this.inFlight = batch;
    const work = (async () => {
      try {
        await this.writer(serialize(batch));
        this.thresholdPaused = false;
      } catch (error) {
        merge(this.pending, batch);
        this.thresholdPaused = true;
        throw error;
      } finally {
        this.inFlight = null;
        this.activeFlush = null;
        if (this.reportReaders === 0) {
          if (this.pending.total >= this.threshold && !this.thresholdPaused) this.triggerFlush();
          else this.ensureTimer();
        }
      }
    })();
    this.activeFlush = work;
    return work;
  }

  async waitForActiveFlush(): Promise<void> {
    while (this.activeFlush) await this.activeFlush;
  }

  /** Rapor DB'yi okurken otomatik flush'ı durdurur; tampon ve DB aynı sayaçları iki kez içermez. */
  async withStableSnapshot<T>(reader: (pending: StatsBatch) => Promise<T>): Promise<T> {
    this.reportReaders++;
    this.clearTimer();
    try {
      await this.waitForActiveFlush().catch(() => {});
      return await reader(this.snapshot());
    } finally {
      this.reportReaders--;
      if (this.reportReaders === 0) {
        if (this.pending.total >= this.threshold && !this.thresholdPaused) this.triggerFlush();
        else this.ensureTimer();
      }
    }
  }

  dispose(): void {
    this.clearTimer();
  }

  private triggerFlush(): void {
    this.clearTimer();
    void this.flush().catch(this.onBackgroundError);
  }

  private ensureTimer(): void {
    if (this.timer || this.pending.total === 0 || this.reportReaders > 0) return;
    this.timer = setTimeout(() => {
      this.timer = null;
      this.thresholdPaused = false;
      this.triggerFlush();
    }, this.intervalMs);
    (this.timer as NodeJS.Timeout).unref?.();
  }

  private clearTimer(): void {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
  }
}


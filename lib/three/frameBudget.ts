export type FrameBudgetResult = "measuring" | "pass" | "fallback";

const WARMUP_FRAMES = 10;
const SAMPLE_MS = 2_000;
const MAX_AVERAGE_MS = 45;

export class FrameBudget {
  private warmup = 0;
  private startedAt: number | null = null;
  private previousAt: number | null = null;
  private total = 0;
  private count = 0;
  private result: FrameBudgetResult = "measuring";

  sample(now: number): FrameBudgetResult {
    if (this.result !== "measuring") return this.result;
    if (this.warmup < WARMUP_FRAMES) {
      this.warmup += 1;
      return this.result;
    }
    if (this.startedAt === null) {
      this.startedAt = now;
      this.previousAt = now;
      return this.result;
    }
    this.total += now - this.previousAt!;
    this.count += 1;
    this.previousAt = now;
    if (now - this.startedAt >= SAMPLE_MS) {
      this.result = this.total / this.count > MAX_AVERAGE_MS ? "fallback" : "pass";
    }
    return this.result;
  }

  reset() {
    this.warmup = 0;
    this.startedAt = null;
    this.previousAt = null;
    this.total = 0;
    this.count = 0;
    this.result = "measuring";
  }
}

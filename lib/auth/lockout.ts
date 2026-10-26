/** 5. yanlıştan itibaren kilit: 1, 2, 4, 8, en fazla 15 dakika (spec 4.1). */
export const LOCK_AFTER = 5;

export function lockMinutes(failCount: number): number | null {
  if (failCount < LOCK_AFTER) return null;
  return Math.min(2 ** (failCount - LOCK_AFTER), 15);
}

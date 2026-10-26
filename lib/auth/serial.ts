/** Bu süreçte aynı anda tek iş: şifre kontrolü sırayla yapılır (spec 4.1, madde 2). */
const g = globalThis as typeof globalThis & { __ththSerial?: { tail: Promise<unknown> } };
const q = (g.__ththSerial ??= { tail: Promise.resolve() });

export function serial<T>(job: () => Promise<T>): Promise<T> {
  const run = q.tail.then(job, job);
  q.tail = run.catch(() => {});
  return run;
}

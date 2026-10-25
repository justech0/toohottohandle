/** Yakında sayfasındaki HOT dalgası. Birimler logo birimidir (HOT_VIEWBOX). */
export const WAVE = { A: 22.8, lambda: 277.5, P: 4.79, yMin: 104 } as const;
const K = (2 * Math.PI) / WAVE.lambda;

/** t: dalga fazı (radyan). Faz 0'da resmi logo şekli aynen korunur. */
export function waveOffset(y: number, t: number): number {
  const ky = K * Math.max(y, WAVE.yMin) + WAVE.P;
  return WAVE.A * (Math.sin(ky + t) - Math.sin(ky));
}

/** "M x y x y … Z" biçimindeki yolu en fazla 5 birimlik adımlarla sıklaştırır. */
export function densifyPath(d: string): number[][] {
  return d
    .split("M")
    .map((chunk) => chunk.replace(/Z/gi, "").trim())
    .filter(Boolean)
    .map((chunk) => {
      const n = chunk.split(/[\s,]+/).map(Number);
      const pts: [number, number][] = [];
      for (let i = 0; i + 1 < n.length; i += 2) pts.push([n[i], n[i + 1]]);
      const dense: number[] = [];
      for (let j = 0; j < pts.length; j++) {
        const a = pts[j];
        const b = pts[(j + 1) % pts.length];
        const steps = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 5));
        for (let s = 0; s < steps; s++) dense.push(a[0] + ((b[0] - a[0]) * s) / steps, a[1] + ((b[1] - a[1]) * s) / steps);
      }
      return dense;
    });
}

export function hotPathAt(subs: number[][], t: number): string {
  let out = "";
  for (const p of subs) {
    out += "M";
    for (let i = 0; i < p.length; i += 2) {
      const y = p[i + 1];
      out += `${i ? " " : ""}${(p[i] + waveOffset(y, t)).toFixed(1)} ${y.toFixed(1)}`;
    }
    out += "Z";
  }
  return out;
}

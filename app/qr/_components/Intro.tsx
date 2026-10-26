"use client";

import { useEffect, useRef, useState } from "react";
import { HOT_PATH, LOCKUP_LETTERS, LOCKUP_VIEWBOX } from "@/lib/brand/lockup";
import { densifyPath, hotPathAt } from "@/lib/motion/hotWave";

const KEY = "thth-intro-seen";
const SAFETY = 3000; // ms: animasyon olayı hiç gelmezse (arka plan sekmesi vb.) yine de kaldır

function LockupSvg({ hotRef }: { hotRef: React.RefObject<SVGPathElement | null> }) {
  return (
    <svg viewBox={LOCKUP_VIEWBOX} fill="currentColor" fillRule="evenodd" aria-hidden="true">
      {LOCKUP_LETTERS.map((l, i) => <path key={i} transform={l.transform} d={l.d} />)}
      <path ref={hotRef} transform={HOT_PATH.transform} d={HOT_PATH.d} />
    </svg>
  );
}

/**
 * Giriş (spec 3.1). Tüm akış CSS'te ve ilk boyamada başlar; JavaScript gelmeden de doğru görünür.
 * Burası yalnızca HOT dalgasını oynatır ve CSS kapanışı bitince katmanı kaldırır.
 */
export function Intro() {
  const [gone, setGone] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const hotTop = useRef<SVGPathElement>(null);
  const hotBottom = useRef<SVGPathElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || document.documentElement.classList.contains("intro-seen")) {
      setGone(true);
      return;
    }
    try { sessionStorage.setItem(KEY, "1"); } catch {}
    if (getComputedStyle(root).visibility === "hidden") {
      setGone(true); // hidrasyondan önce bitmiş
      return;
    }

    const onEnd = (e: AnimationEvent) => {
      if (e.target === root) setGone(true);
    };
    root.addEventListener("animationend", onEnd);
    const safety = window.setTimeout(() => setGone(true), SAFETY);

    let frame = 0;
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const subs = densifyPath(HOT_PATH.d);
      const t0 = performance.now();
      const tick = () => {
        const d = hotPathAt(subs, ((performance.now() - t0) / 1000) * ((2 * Math.PI) / 1.4));
        hotTop.current?.setAttribute("d", d);
        hotBottom.current?.setAttribute("d", d);
        frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    }
    return () => {
      root.removeEventListener("animationend", onEnd);
      window.clearTimeout(safety);
      cancelAnimationFrame(frame);
    };
  }, []);

  if (gone) return null;
  return (
    <div ref={rootRef} className="intro" data-testid="intro" onClick={() => setGone(true)}>
      <div className="intro__flood" />
      <div className="intro__logo intro__logo--top"><LockupSvg hotRef={hotTop} /></div>
      <div className="intro__logo--bottom" aria-hidden="true">
        <div className="intro__logo"><LockupSvg hotRef={hotBottom} /></div>
      </div>
      <button type="button" className="intro__skip" onClick={() => setGone(true)}>Geç</button>
    </div>
  );
}

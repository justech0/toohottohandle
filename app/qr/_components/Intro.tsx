"use client";

import { useEffect, useRef, useState } from "react";
import { HOT_PATH, LOCKUP_LETTERS, LOCKUP_VIEWBOX } from "@/lib/brand/lockup";
import { densifyPath, hotPathAt } from "@/lib/motion/hotWave";

const KEY = "thth-intro-seen";
const TOTAL = 1150; // ms, sayfa açılışından; spec 3.1: en fazla 1,2 sn
const REDUCED_TOTAL = 300;

function LockupSvg({ hotRef }: { hotRef: React.RefObject<SVGPathElement | null> }) {
  return (
    <svg viewBox={LOCKUP_VIEWBOX} fill="currentColor" fillRule="evenodd" aria-hidden="true">
      {LOCKUP_LETTERS.map((l, i) => <path key={i} transform={l.transform} d={l.d} />)}
      <path ref={hotRef} transform={HOT_PATH.transform} d={HOT_PATH.d} />
    </svg>
  );
}

export function Intro() {
  const [gone, setGone] = useState(false);
  const [reduced, setReduced] = useState(false);
  const floodRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const hotTop = useRef<SVGPathElement>(null);
  const hotBottom = useRef<SVGPathElement>(null);

  useEffect(() => {
    if (document.documentElement.classList.contains("intro-seen")) {
      setGone(true);
      return;
    }
    try { sessionStorage.setItem(KEY, "1"); } catch {}

    // Süre sayfanın açılışından (performance.now) sayılır; görsel akış CSS'tedir, hidrasyonu beklemez.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setReduced(true);
      const id = window.setTimeout(() => setGone(true), Math.max(0, REDUCED_TOTAL - performance.now()));
      return () => window.clearTimeout(id);
    }

    const subs = densifyPath(HOT_PATH.d);
    let frame = 0;
    const tick = () => {
      const ms = performance.now();
      if (ms >= TOTAL) {
        setGone(true);
        return;
      }
      const flood = floodRef.current?.getBoundingClientRect();
      const box = topRef.current?.getBoundingClientRect();
      if (flood && box && topRef.current && bottomRef.current) {
        const cut = Math.min(Math.max(flood.top - box.top, 0), box.height);
        topRef.current.style.clipPath = `inset(0 0 ${box.height - cut}px 0)`;
        bottomRef.current.style.clipPath = `inset(${cut}px 0 0 0)`;
      }
      const d = hotPathAt(subs, (ms / 1000) * ((2 * Math.PI) / 1.4));
      hotTop.current?.setAttribute("d", d);
      hotBottom.current?.setAttribute("d", d);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  if (gone) return null;
  const cls = reduced ? "intro intro--reduced" : "intro";
  return (
    <div className={cls} data-testid="intro" onClick={() => setGone(true)}>
      <div ref={floodRef} className="intro__flood" />
      <div ref={topRef} className="intro__logo intro__logo--top"><LockupSvg hotRef={hotTop} /></div>
      <div ref={bottomRef} className="intro__logo intro__logo--bottom"><LockupSvg hotRef={hotBottom} /></div>
      <button type="button" className="intro__skip" onClick={() => setGone(true)}>Geç</button>
    </div>
  );
}

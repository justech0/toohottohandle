"use client";

import { useEffect, useRef, useState } from "react";
import { HERO_INTERVAL_MS, HERO_SLIDES } from "@/lib/brand/hero";
import { BrandIcon } from "./BrandIcon";

/**
 * Vitrin (spec v3 3.1). Yalnızca ekranda, sekme önde ve hareket azaltma kapalıyken döner.
 * Görünürlüğü html[data-hero-visible] ile üst bara bildirir (saydam / dolu bar).
 */
export function HeroSlides() {
  const [index, setIndex] = useState(0);
  const ref = useRef<HTMLElement>(null);
  const slide = HERO_SLIDES[index];

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const html = document.documentElement;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let visible = true;
    let timer = 0;
    const sync = () => {
      window.clearInterval(timer);
      timer = 0;
      if (!reduced && visible && !document.hidden) {
        timer = window.setInterval(() => setIndex((i) => (i + 1) % HERO_SLIDES.length), HERO_INTERVAL_MS);
      }
    };
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.intersectionRatio >= 0.3;
        html.dataset.heroVisible = String(visible);
        sync();
      },
      { threshold: [0, 0.3, 1] },
    );
    io.observe(root);
    document.addEventListener("visibilitychange", sync);
    sync();
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
      window.clearInterval(timer);
      delete html.dataset.heroVisible;
    };
  }, []);

  return (
    <section ref={ref} className={`hero hero--${slide.color}`} data-testid="hero" data-active={slide.key} aria-label="Vitrin">
      {HERO_SLIDES.map((s, k) => (
        <div key={s.key} className="hero__slide" data-on={k === index} aria-hidden={k !== index}>
          <img
            src={s.image}
            alt=""
            decoding="async"
            fetchPriority={k === 0 ? "high" : "low"}
            onError={(e) => {
              e.currentTarget.style.visibility = "hidden";
            }}
          />
        </div>
      ))}
      <div className="hero__shade" aria-hidden="true" />
      <BrandIcon name={slide.icon} className="hero__icon" />
      <div className="hero__text">
        <p className="hero__menu">MENÜ</p>
        <p className="hero__title" data-testid="hero-title" aria-live="polite">{slide.title}</p>
      </div>
      <div className="hero__dots">
        {HERO_SLIDES.map((s, k) => (
          <button
            key={s.key}
            type="button"
            className="hero__dot"
            aria-label={`${k + 1}. slayt`}
            aria-current={k === index ? "true" : undefined}
            onClick={() => setIndex(k)}
          />
        ))}
      </div>
    </section>
  );
}

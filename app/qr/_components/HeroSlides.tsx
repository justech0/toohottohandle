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
  // Kendi kendine dönerken ekran okuyucuya duyurulmaz; ziyaretçi bir slayt seçince duyurulur (WCAG 2.2.2).
  const [announce, setAnnounce] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const resetTimer = useRef<() => void>(() => {});
  const slide = HERO_SLIDES[index];

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const html = document.documentElement;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let visible = true;
    let focused = false;
    let timer = 0;
    const sync = () => {
      window.clearInterval(timer);
      timer = 0;
      // Arama, WiFi ya da ürün detayı açıkken (html[data-overlay]) ve odak vitrindeyken durur.
      if (!reduced && visible && !focused && !document.hidden && !html.dataset.overlay) {
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
    const mo = new MutationObserver(sync);
    mo.observe(html, { attributes: true, attributeFilter: ["data-overlay"] });
    const onFocusIn = () => {
      focused = true;
      sync();
    };
    const onFocusOut = (e: FocusEvent) => {
      if (root.contains(e.relatedTarget as Node | null)) return;
      focused = false;
      sync();
    };
    root.addEventListener("focusin", onFocusIn);
    root.addEventListener("focusout", onFocusOut);
    document.addEventListener("visibilitychange", sync);
    resetTimer.current = sync;
    sync();
    return () => {
      io.disconnect();
      mo.disconnect();
      root.removeEventListener("focusin", onFocusIn);
      root.removeEventListener("focusout", onFocusOut);
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
        <p className="hero__title" data-testid="hero-title" aria-live={announce ? "polite" : "off"}>{slide.title}</p>
      </div>
      <div className="hero__dots">
        {HERO_SLIDES.map((s, k) => (
          <button
            key={s.key}
            type="button"
            className="hero__dot"
            aria-label={`${k + 1}. slayt`}
            aria-current={k === index ? "true" : undefined}
            onClick={() => {
              setAnnounce(true);
              setIndex(k);
              resetTimer.current();
            }}
          />
        ))}
      </div>
    </section>
  );
}

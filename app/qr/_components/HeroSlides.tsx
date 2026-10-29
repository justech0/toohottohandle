"use client";

import { BrandIcon } from "./BrandIcon";
import { useLanguage } from "@/lib/i18n/context";
import { useEffect, useRef, useState } from "react";
import { HERO_INTERVAL_MS, type HeroSlide } from "@/lib/brand/hero";
import { Relief } from "./three/Relief";

/**
 * Vitrin (spec v3 3.1). Yalnızca ekranda, sekme önde ve hareket azaltma kapalıyken döner.
 * Görünürlüğü html[data-hero-visible] ile üst bara bildirir (saydam / dolu bar).
 */
export function HeroSlides({ slides }: { slides: readonly HeroSlide[] }) {
  const { t } = useLanguage();
  const [index, setIndex] = useState(0);
  // Kendi kendine dönerken ekran okuyucuya duyurulmaz; ziyaretçi bir slayt seçince duyurulur (WCAG 2.2.2).
  const [announce, setAnnounce] = useState(false);
  const [failedImages, setFailedImages] = useState<string[]>([]);
  const ref = useRef<HTMLElement>(null);
  const activeIndex = slides.length ? index % slides.length : 0;
  const slide = slides[activeIndex];

  useEffect(() => {
    const root = ref.current;
    if (!root) { document.documentElement.dataset.heroVisible = "false"; return () => { delete document.documentElement.dataset.heroVisible; }; }
    // HTML görseli istemci hazır olmadan hata verebilir; error olayı tekrar gelmez.
    const broken = [...root.querySelectorAll<HTMLImageElement>("img[data-slide-key]")].filter(img => img.complete && img.naturalWidth === 0);
    if (broken.length) {
      broken.forEach(img => { img.style.visibility = "hidden"; });
      setFailedImages(current => [...new Set([...current, ...broken.map(img => img.dataset.slideKey!)])]);
    }
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
        timer = window.setInterval(() => setIndex((i) => (i + 1) % slides.length), HERO_INTERVAL_MS);
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
  }, [slides.length]);

  if (!slide) return null;
  const plainLight = !["red", "blue"].includes(slide.color) && (!slide.image || failedImages.includes(slide.key));
  return (
    <section ref={ref} className={`hero hero--${slide.color}`} data-testid="hero" data-active={slide.key} data-plain={plainLight} aria-label="Vitrin">
      {slides.map((s, k) => (
        <div key={s.key} className={`hero__slide${s.image === "/qr/hero/fast.webp" ? " hero__slide--hot" : ""}`} data-on={k === activeIndex} aria-hidden={k !== activeIndex}>
          {s.image === "/qr/hero/fast.webp" ? (
            <Relief asset="hot" active={k === activeIndex} interactive className="hot-relief" testId="hot-relief" />
          ) : s.image ? (
            <img
              src={s.image}
              data-slide-key={s.key}
              style={{ objectPosition: `${(s.focusX ?? 0.5) * 100}% ${(s.focusY ?? 0.5) * 100}%` }}
              alt=""
              decoding="async"
              fetchPriority="low"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.style.visibility = "hidden";
                setFailedImages(current => current.includes(s.key) ? current : [...current, s.key]);
              }}
            />
          ) : null}
        </div>
      ))}
      <BrandIcon name={slide.icon} className="hero__icon" />
      <div className="hero__shade" aria-hidden="true" />
      <div className="hero__text">
        <p className="hero__menu">{t.hero.menu}</p>
        <p className="hero__title" data-testid="hero-title" aria-live={announce ? "polite" : "off"}>{slide.title}</p>
      </div>
      <div className="hero__dots">
        {slides.map((s, k) => (
          <button
            key={s.key}
            type="button"
            className="hero__dot"
            aria-label={`${k + 1}. slayt`}
            aria-current={k === activeIndex ? "true" : undefined}
            onClick={() => {
              setAnnounce(true);
              setIndex(k);
            }}
          />
        ))}
      </div>
    </section>
  );
}

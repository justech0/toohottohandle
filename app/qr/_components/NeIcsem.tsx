"use client";

import { useEffect, useRef, useState } from "react";
import { pickSuggestions } from "@/lib/menu/suggest";
import { imageSrc } from "@/lib/menu/image";
import { BrandIcon } from "./BrandIcon";
import { CloseIcon } from "./Icons";
import type { CardProduct } from "./clientTypes";

const ICONS = ["lips", "rabbit", "star"] as const;
const SPINS = 4; // her makarada 4 tur ikon, sonra sonuç
const FRAMES = ICONS.length * SPINS + 1;
const DURATIONS = [1400, 1900, 2400];

/**
 * Ne içsem (spec v3 6): kare yerinde açılır, üç kutuda dudak/tavşan/yıldız slot gibi döner,
 * her kutu bir içecekte durur. Yeni sayfa ya da geçmiş kaydı yok. Sonuca dokununca MenuClient detayı açar.
 */
export function NeIcsem({ pool }: { pool: CardProduct[] }) {
  const [open, setOpen] = useState(false);
  const [picks, setPicks] = useState<CardProduct[]>([]);
  const [phase, setPhase] = useState<"idle" | "reset" | "spin" | "done">("idle");
  const timers = useRef<number[]>([]);
  const lastPicks = useRef<CardProduct[]>([]);
  const squareRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef(false);
  const spinning = phase === "reset" || phase === "spin";

  // Açılınca odak panele (Kapat), kapanınca kareye döner.
  useEffect(() => {
    if (open) closeRef.current?.focus();
    else if (returnFocus.current) {
      returnFocus.current = false;
      squareRef.current?.focus();
    }
  }, [open]);

  const clear = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };
  useEffect(() => clear, []);

  const spin = () => {
    if (spinning) return;
    clear();
    const next = pickSuggestions(pool, 3, Math.random, lastPicks.current);
    lastPicks.current = next;
    setPicks(next);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPhase("done");
      return;
    }
    setPhase("reset");
    timers.current.push(window.setTimeout(() => setPhase("spin"), 30));
    timers.current.push(window.setTimeout(() => setPhase("done"), 30 + DURATIONS[DURATIONS.length - 1] + 80));
  };

  if (!open) {
    return (
      <NeIcsemSquare
        ref={squareRef}
        onClick={() => {
          setOpen(true);
          spin();
        }}
      />
    );
  }

  return (
    <div className="ne-open" data-testid="neicsem-open">
      <div className="ne-open__head">
        <BrandIcon name="rabbit" className="ne-open__rabbit" />
        <p className="ne-open__title">Ne içsem?</p>
        <button
          ref={closeRef}
          type="button"
          className="icon-btn ne-open__close"
          aria-label="Kapat"
          onClick={() => {
            returnFocus.current = true;
            clear();
            setPhase("idle");
            setOpen(false);
          }}
        >
          <CloseIcon />
        </button>
      </div>
      {pool.length === 0 ? (
        <p className="ne-open__empty">Şu an önerecek içecek yok. Ekibimize sorabilirsin.</p>
      ) : (
        <>
          <div className="ne-reels">
            {picks.map((p, k) => {
              const y = phase === "reset" ? 0 : -((FRAMES - 1) / FRAMES) * 100;
              const style = {
                transform: `translateY(${y}%)`,
                transition: phase === "spin" ? `transform ${DURATIONS[k]}ms cubic-bezier(.12,.75,.2,1)` : "none",
              };
              return (
                <div key={k} className="ne-col">
                  <button
                    type="button"
                    className="ne-reel"
                    data-testid="neicsem-reel"
                    data-open-product={phase === "done" ? p.slug : undefined}
                    aria-label={phase === "done" ? `${p.name}, ${p.full}` : `${k + 1}. kutu dönüyor`}
                    aria-disabled={phase !== "done"}
                  >
                    <span className="ne-strip" style={style}>
                      {Array.from({ length: FRAMES - 1 }, (_, i) => (
                        <span key={i} className="ne-frame">
                          <BrandIcon name={ICONS[(i + k) % ICONS.length]} className="ne-frame__icon" />
                        </span>
                      ))}
                      <span className="ne-frame ne-frame--result" data-color={p.groupColor}>
                        <BrandIcon name={p.groupIcon} className="ne-frame__icon" />
                        {p.imageKey ? (
                          <img
                            src={imageSrc(p.imageKey, 320)}
                            alt=""
                            decoding="async"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : null}
                      </span>
                    </span>
                  </button>
                  {phase === "done" ? (
                    <div className="ne-result" aria-hidden="true">
                      <p className="ne-result__name" data-testid="neicsem-name">{p.name}</p>
                      <p className="ne-result__price">{p.full}</p>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
          <p className="sr-only" aria-live="polite" data-testid="neicsem-live">
            {phase === "done" ? `Önerilerimiz: ${picks.map((p) => p.name).join(", ")}` : ""}
          </p>
          <button type="button" className="ne-again" onClick={spin} aria-disabled={spinning}>
            Tekrar çevir
          </button>
        </>
      )}
    </div>
  );
}

/** Ne içsem karesinin kapalı hali: tavşanlı sarı kare (spec v3 3.2). */
function NeIcsemSquare({ onClick, ref }: { onClick: () => void; ref: React.Ref<HTMLButtonElement> }) {
  return (
    <button ref={ref} type="button" className="ne-tile" data-testid="neicsem-tile" onClick={onClick} aria-expanded={false}>
      <span className="ne-tile__disc"><BrandIcon name="rabbit" className="ne-rabbit" /></span>
      <span className="ne-tile__label">Ne içsem?</span>
    </button>
  );
}

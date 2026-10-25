"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { GroupColor } from "@/lib/menu/types";

type StripGroup = { slug: string; nameTr: string; color: GroupColor };
type StripCategory = { slug: string; nameTr: string; group: string };

export function CategoryStrip({ groups, categories }: { groups: StripGroup[]; categories: StripCategory[] }) {
  const [active, setActive] = useState(categories[0]?.slug ?? "");
  const rootRef = useRef<HTMLDivElement>(null);
  const catRowRef = useRef<HTMLDivElement>(null);
  const activeGroup = categories.find((c) => c.slug === active)?.group ?? groups[0]?.slug;
  const groupColor = groups.find((g) => g.slug === activeGroup)?.color ?? "red";

  const headerBottom = useCallback(() => {
    const sticky = rootRef.current?.closest(".sticky") as HTMLElement | null;
    return sticky ? sticky.getBoundingClientRect().bottom : 0;
  }, []);

  // Sekmeye basılınca seçim, kullanıcı kendisi kaydırana kadar korunur.
  // Sayfa sonu kısa kalınca son bölümler başlığın altına gelemez; yoksa seçim geri kayardı.
  const jumpRef = useRef<string | null>(null);

  const jumpTo = useCallback(
    (slug: string) => {
      const el = document.getElementById(`cat-${slug}`);
      if (!el) return;
      jumpRef.current = slug;
      setActive(slug);
      window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - headerBottom() + 1, behavior: "auto" });
    },
    [headerBottom],
  );

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      if (jumpRef.current) {
        setActive(jumpRef.current);
        return;
      }
      const limit = headerBottom() + 8;
      let current = categories[0]?.slug ?? "";
      for (const c of categories) {
        const el = document.getElementById(`cat-${c.slug}`);
        if (el && el.getBoundingClientRect().top <= limit) current = c.slug;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const release = () => {
      jumpRef.current = null;
    };
    const inputs = ["wheel", "touchstart", "pointerdown", "keydown"] as const;
    window.addEventListener("scroll", onScroll, { passive: true });
    for (const t of inputs) window.addEventListener(t, release, { passive: true });
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      for (const t of inputs) window.removeEventListener(t, release);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [categories, headerBottom]);

  useEffect(() => {
    const row = catRowRef.current;
    const tab = row?.querySelector<HTMLElement>('[aria-current="true"]');
    if (row && tab) row.scrollTo({ left: tab.offsetLeft - (row.clientWidth - tab.offsetWidth) / 2 });
  }, [active]);

  return (
    <nav className="strip" ref={rootRef} aria-label="Menü bölümleri" data-color={groupColor}>
      <div className="strip__row strip__row--groups">
        {groups.map((g) => (
          <button
            key={g.slug}
            type="button"
            className="tab tab--group"
            data-testid="group-tab"
            aria-current={g.slug === activeGroup ? "true" : undefined}
            onClick={() => {
              const first = categories.find((c) => c.group === g.slug);
              if (first) jumpTo(first.slug);
            }}
          >
            {g.nameTr}
          </button>
        ))}
      </div>
      <div className="strip__row strip__row--cats" ref={catRowRef}>
        {categories
          .filter((c) => c.group === activeGroup)
          .map((c) => (
            <button
              key={c.slug}
              type="button"
              className="tab tab--cat"
              data-testid="category-tab"
              aria-current={c.slug === active ? "true" : undefined}
              onClick={() => jumpTo(c.slug)}
            >
              {c.nameTr}
            </button>
          ))}
      </div>
    </nav>
  );
}

"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { clearStaleNav, closeNav, navFromState, pushNav, type Overlay } from "@/lib/ui/historySheet";
import { ProductSheet } from "./ProductSheet";
import { WifiCard } from "./WifiCard";
import type { MenuSettings } from "@/lib/menu/types";
import type { CardProduct } from "./clientTypes";
import { SearchOverlay } from "./SearchOverlay";
import { SearchIcon, WifiIcon } from "./Icons";

/** Üst bardaki düğmeler ve açılan paneller. Liste sunucuda üretilir, burası yalnızca etkileşimi yönetir. */
export function MenuClient({ products, settings }: { products: CardProduct[]; settings: MenuSettings }) {
  const [panel, setPanel] = useState<Overlay | null>(null);
  const [sheet, setSheet] = useState<string | null>(null);
  const productViews = useRef(new Set<number>());
  const productIdBySlug = useMemo(() => new Map(products.map((product) => [product.slug, product.id])), [products]);
  const close = useCallback(() => closeNav(), []);
  const open = (p: Overlay) => {
    pushNav({ overlay: p, sheet: null });
    setPanel(p);
  };

  useEffect(() => {
    clearStaleNav();
    const onClick = (e: MouseEvent) => {
      const btn = (e.target as HTMLElement | null)?.closest<HTMLElement>("[data-open-product]");
      const slug = btn?.dataset.openProduct;
      if (!slug) return;
      if (settings.statsEnabled) {
        const productId = productIdBySlug.get(slug);
        if (productId) productViews.current.add(productId);
      }
      pushNav({ sheet: slug });
      setSheet(slug);
    };
    const onPop = (e: PopStateEvent) => {
      const n = navFromState(e.state);
      setPanel(n.overlay);
      setSheet(n.sheet);
    };
    document.addEventListener("click", onClick);
    window.addEventListener("popstate", onPop);
    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener("popstate", onPop);
    };
  }, [productIdBySlug, settings.statsEnabled]);

  useEffect(() => {
    if (!settings.statsEnabled) return;
    const sentKey = "thth-stats-menu-open-sent-v1";
    let menuOpen = false;
    try { menuOpen = sessionStorage.getItem(sentKey) !== "1"; } catch { menuOpen = true; }

    const send = () => {
      const productIds = [...productViews.current];
      if (!menuOpen && productIds.length === 0) return;
      const body = new Blob([JSON.stringify({ menuOpen, productIds })], { type: "application/json" });
      if (!navigator.sendBeacon("/qr/api/stats", body)) return;
      for (const id of productIds) productViews.current.delete(id);
      if (menuOpen) {
        menuOpen = false;
        try { sessionStorage.setItem(sentKey, "1"); } catch {}
      }
    };
    const onVisibility = () => { if (document.visibilityState === "hidden") send(); };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", send);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", send);
    };
  }, [settings.statsEnabled]);

  // Açık katman varken vitrin durur (HeroSlides html[data-overlay]'i izler).
  useEffect(() => {
    const html = document.documentElement;
    if (panel || sheet) html.dataset.overlay = panel ?? "sheet";
    else delete html.dataset.overlay;
  }, [panel, sheet]);

  const sheetProduct = sheet ? products.find((p) => p.slug === sheet) : undefined;

  return (
    <>
      <div className="topbar__actions">
        <button type="button" className="icon-btn" aria-label="Ara" onClick={() => open("search")}>
          <SearchIcon />
        </button>
        {settings.wifiSsid ? (
          <button type="button" className="icon-btn" aria-label="WiFi" onClick={() => (panel === "wifi" ? close() : open("wifi"))}>
            <WifiIcon />
          </button>
        ) : null}
      </div>
      {panel === "search" ? <SearchOverlay products={products} onClose={close} paused={Boolean(sheetProduct)} /> : null}
      {panel === "wifi" ? <WifiCard settings={settings} onClose={close} /> : null}
      {sheetProduct ? <ProductSheet product={sheetProduct} onClose={close} /> : null}
    </>
  );
}

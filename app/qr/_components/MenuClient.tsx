"use client";

import { useCallback, useEffect, useState } from "react";
import { closeSheetHistory, openSheetHistory, sheetFromState } from "@/lib/ui/historySheet";
import { ProductSheet } from "./ProductSheet";
import { WifiCard } from "./WifiCard";
import type { MenuSettings } from "@/lib/menu/types";
import type { ClientProduct } from "./clientTypes";
import { SearchOverlay } from "./SearchOverlay";
import { SearchIcon, WifiIcon } from "./Icons";

type Panel = "search" | "wifi" | null;

/** Üst bardaki düğmeler ve açılan paneller. Liste sunucuda üretilir, burası yalnızca etkileşimi yönetir. */
export function MenuClient({ products, settings }: { products: ClientProduct[]; settings: MenuSettings }) {
  const [panel, setPanel] = useState<Panel>(null);
  const close = useCallback(() => setPanel(null), []);
  const [sheet, setSheet] = useState<string | null>(null);
  const closeSheet = useCallback(() => closeSheetHistory(), []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const btn = (e.target as HTMLElement | null)?.closest<HTMLElement>("[data-open-product]");
      const slug = btn?.dataset.openProduct;
      if (!slug) return;
      openSheetHistory(slug);
      setSheet(slug);
    };
    const onPop = (e: PopStateEvent) => setSheet(sheetFromState(e.state));
    document.addEventListener("click", onClick);
    window.addEventListener("popstate", onPop);
    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener("popstate", onPop);
    };
  }, []);

  const sheetProduct = sheet ? products.find((p) => p.slug === sheet) : undefined;

  return (
    <>
      <div className="topbar__actions">
        <button type="button" className="icon-btn" aria-label="Ara" onClick={() => setPanel("search")}>
          <SearchIcon />
        </button>
        {settings.wifiSsid ? (
          <button type="button" className="icon-btn" aria-label="WiFi" onClick={() => setPanel(panel === "wifi" ? null : "wifi")}>
            <WifiIcon />
          </button>
        ) : null}
      </div>
      {panel === "search" ? <SearchOverlay products={products} onClose={close} paused={Boolean(sheetProduct)} /> : null}
      {panel === "wifi" ? <WifiCard settings={settings} onClose={close} /> : null}
      {sheetProduct ? <ProductSheet product={sheetProduct} onClose={closeSheet} /> : null}
    </>
  );
}

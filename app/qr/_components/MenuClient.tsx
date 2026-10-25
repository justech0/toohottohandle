"use client";

import { useCallback, useState } from "react";
import type { MenuSettings } from "@/lib/menu/types";
import type { ClientProduct } from "./clientTypes";
import { SearchOverlay } from "./SearchOverlay";
import { SearchIcon, WifiIcon } from "./Icons";

type Panel = "search" | "wifi" | null;

/** Üst bardaki düğmeler ve açılan paneller. Liste sunucuda üretilir, burası yalnızca etkileşimi yönetir. */
export function MenuClient({ products, settings }: { products: ClientProduct[]; settings: MenuSettings }) {
  const [panel, setPanel] = useState<Panel>(null);
  const close = useCallback(() => setPanel(null), []);

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
      {panel === "search" ? <SearchOverlay products={products} onClose={close} /> : null}
    </>
  );
}

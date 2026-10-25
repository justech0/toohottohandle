"use client";

import { useRef, useState } from "react";
import { copyText } from "@/lib/ui/copyText";
import type { MenuSettings } from "@/lib/menu/types";
import { useDialogFocus } from "./useDialogFocus";
import { CloseIcon } from "./Icons";

function CopyField({ label, value, id }: { label: string; value: string; id: "username" | "password" }) {
  const valueRef = useRef<HTMLSpanElement>(null);
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  return (
    <div className="wifi__field">
      <span className="wifi__label">{label}</span>
      <div className="wifi__line">
        <span ref={valueRef} className="wifi__value" data-testid={`wifi-${id}`} dir="ltr">{value}</span>
        <button
          type="button"
          className="wifi__copy"
          data-testid={`copy-${id}`}
          aria-label={`${label} kopyala`}
          onClick={async () => {
            const r = await copyText(value, valueRef.current!);
            setState(r === "copied" ? "copied" : "failed");
            if (r === "copied") setTimeout(() => setState("idle"), 1800);
          }}
        >
          {state === "copied" ? "Kopyalandı" : "Kopyala"}
        </button>
      </div>
      {state === "failed" ? <p className="wifi__error" role="status">Kopyalanamadı. Metne basılı tutup kopyalayın.</p> : null}
    </div>
  );
}

export function WifiCard({ settings, onClose }: { settings: MenuSettings; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useDialogFocus(ref, onClose);
  return (
    <>
      <div className="wifi-backdrop" onClick={onClose} aria-hidden="true" />
      <div ref={ref} className="wifi" data-testid="wifi-card" role="dialog" aria-modal="true" aria-label="WiFi bilgileri">
        <button type="button" className="icon-btn wifi__close" aria-label="Kapat" onClick={onClose}>
          <CloseIcon />
        </button>
        <p className="wifi__ssid"><span className="wifi__label">Ağ</span><strong dir="ltr">{settings.wifiSsid}</strong></p>
        <CopyField label="Kullanıcı adı" value={settings.wifiUsername} id="username" />
        <CopyField label="Şifre" value={settings.wifiPassword} id="password" />
        <p className="wifi__note">{settings.wifiNoteTr}</p>
      </div>
    </>
  );
}

"use client";

import { useRef, useState } from "react";
import { copyText } from "@/lib/ui/copyText";
import type { MenuSettings } from "@/lib/menu/types";
import { useDialogFocus } from "./useDialogFocus";
import { CloseIcon } from "./Icons";
import { useLanguage } from "@/lib/i18n/context";
import { resolveText } from "@/lib/i18n/resolve";

function CopyField({
  label,
  value,
  id,
  copyLabel,
  copiedLabel,
  failedLabel,
  ariaCopy,
}: {
  label: string;
  value: string;
  id: "username" | "password";
  copyLabel: string;
  copiedLabel: string;
  failedLabel: string;
  ariaCopy: string;
}) {
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
          aria-label={ariaCopy}
          onClick={async () => {
            const r = await copyText(value, valueRef.current!);
            setState(r === "copied" ? "copied" : "failed");
            if (r === "copied") setTimeout(() => setState("idle"), 1800);
          }}
        >
          {state === "copied" ? copiedLabel : copyLabel}
        </button>
      </div>
      {state === "failed" ? <p className="wifi__error" role="status">{failedLabel}</p> : null}
    </div>
  );
}

export function WifiCard({ settings, onClose }: { settings: MenuSettings; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const { lang, t } = useLanguage();
  useDialogFocus(ref, onClose);
  const note = resolveText(lang, settings.wifiNoteAr, settings.wifiNoteEn, settings.wifiNoteTr);

  return (
    <>
      <div className="wifi-backdrop" onClick={onClose} aria-hidden="true" />
      <div ref={ref} className="wifi" data-testid="wifi-card" role="dialog" aria-modal="true" aria-label={t.wifi.dialogLabel}>
        <button type="button" className="icon-btn wifi__close" aria-label={t.nav.close} onClick={onClose}>
          <CloseIcon />
        </button>
        <p className="wifi__ssid"><span className="wifi__label">{t.wifi.ssid}</span><strong dir="ltr">{settings.wifiSsid}</strong></p>
        <CopyField
          label={t.wifi.username}
          value={settings.wifiUsername}
          id="username"
          copyLabel={t.wifi.copy}
          copiedLabel={t.wifi.copied}
          failedLabel={t.wifi.copyFailed}
          ariaCopy={t.wifi.copyAria(t.wifi.username)}
        />
        <CopyField
          label={t.wifi.password}
          value={settings.wifiPassword}
          id="password"
          copyLabel={t.wifi.copy}
          copiedLabel={t.wifi.copied}
          failedLabel={t.wifi.copyFailed}
          ariaCopy={t.wifi.copyAria(t.wifi.password)}
        />
        <p className="wifi__note">{note}</p>
      </div>
    </>
  );
}

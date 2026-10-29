"use client";

import { useEffect, useRef, useState } from "react";
import type { BackupBundle } from "@/lib/admin/backupSchema";
import { createStoredBackupZip } from "@/lib/admin/backupZip";

type Work = "idle" | "download" | "read" | "upload" | "apply";

const messageOf = (error: unknown, fallback: string) => error instanceof DOMException && error.name === "AbortError"
  ? "İşlem iptal edildi."
  : error instanceof Error ? error.message : fallback;

export function BackupManager({ bundle }: { bundle: BackupBundle }) {
  const abortRef = useRef<AbortController | null>(null);
  const [work, setWork] = useState<Work>("idle");
  const [progress, setProgress] = useState({ done: 0, total: bundle.backup.images.length });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const busy = work !== "idle";
  useEffect(() => setReady(true), []);

  const cancel = () => abortRef.current?.abort();

  const download = async () => {
    const controller = new AbortController();
    abortRef.current = controller;
    setWork("download"); setError(null); setSuccess(null);
    const sourceByKey = new Map(bundle.sources.map((source) => [source.key, source.sourceKey]));
    try {
      const blob = await createStoredBackupZip(bundle.backup, async (key) => {
        const sourceKey = sourceByKey.get(key);
        if (!sourceKey) throw new Error("Fotoğraf kaynağı bulunamadı. ZIP hazırlanmadı.");
        const response = await fetch(`/qr/api/admin/image/${encodeURIComponent(sourceKey)}`, { cache: "no-store", signal: controller.signal });
        if (!response.ok) throw new Error("Fotoğraflar indirilemedi. ZIP hazırlanmadı.");
        return new Uint8Array(await response.arrayBuffer());
      }, (done, total) => setProgress({ done, total }), controller.signal);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `thth-menu-${new Date().toISOString().slice(0, 10)}.zip`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1_000);
      setSuccess("ZIP indirildi.");
    } catch (caught) {
      setError(messageOf(caught, "ZIP hazırlanamadı."));
    } finally {
      abortRef.current = null;
      setWork("idle");
    }
  };

  return (
    <div className="adm-backup-stack">
      <section className="adm-card" aria-labelledby="download-title">
        <h2 id="download-title" className="adm-card__title">ZIP indir</h2>
        <p className="adm-note">Menü verisi ve 1280 px fotoğraflar tek ZIP dosyasına alınır. WiFi şifresi ve admin hesabı eklenmez.</p>
        <p className="adm-note">Bilgisayardan almak daha hızlıdır.</p>
        {work === "download" ? <p role="status" aria-live="polite" className="adm-progress">{progress.done} / {progress.total} fotoğraf</p> : null}
        <div className="adm-row">
          <button type="button" className="adm-btn adm-btn--main" disabled={!ready || busy} onClick={download}>{work === "download" ? "Hazırlanıyor…" : "ZIP indir"}</button>
          {work === "download" ? <button type="button" className="adm-btn" onClick={cancel}>İptal</button> : null}
        </div>
      </section>

      {error ? <p className="adm-error" role="alert">{error}</p> : null}
      {success ? <p className="adm-ok" role="status">{success}</p> : null}
    </div>
  );
}

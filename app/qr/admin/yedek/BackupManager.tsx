"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { BackupBundle, BackupFile } from "@/lib/admin/backupSchema";
import { MAX_BACKUP_BYTES } from "@/lib/admin/backupSchema";
import { createStoredBackupZip, readStoredBackupZip } from "@/lib/admin/backupZip";
import { markBackupDownloadedAction, restoreBackupAction } from "./actions";

type Work = "idle" | "download" | "read" | "upload" | "apply";

const messageOf = (error: unknown, fallback: string) => error instanceof DOMException && error.name === "AbortError"
  ? "İşlem iptal edildi."
  : error instanceof Error ? error.message : fallback;

export function BackupManager({ bundle }: { bundle: BackupBundle }) {
  const router = useRouter();
  const abortRef = useRef<AbortController | null>(null);
  const restoreRef = useRef<Awaited<ReturnType<typeof readStoredBackupZip>> | null>(null);
  const [work, setWork] = useState<Work>("idle");
  const [progress, setProgress] = useState({ done: 0, total: bundle.backup.images.length });
  const [candidate, setCandidate] = useState<BackupFile | null>(null);
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
        if (!sourceKey) throw new Error("Fotoğraf kaynağı bulunamadı. Yedek hazırlanmadı.");
        const response = await fetch(`/qr/api/admin/image/${encodeURIComponent(sourceKey)}`, { cache: "no-store", signal: controller.signal });
        if (!response.ok) throw new Error("Fotoğraflar indirilemedi. Yedek hazırlanmadı.");
        return new Uint8Array(await response.arrayBuffer());
      }, (done, total) => setProgress({ done, total }), controller.signal);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `thth-menu-${new Date().toISOString().slice(0, 10)}.zip`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1_000);
      const result = await markBackupDownloadedAction();
      if (!result.ok) setError(result.error ?? "Yedek tarihi kaydedilemedi.");
      else setSuccess("Yedek indirildi.");
      router.refresh();
    } catch (caught) {
      setError(messageOf(caught, "Yedek hazırlanamadı."));
    } finally {
      abortRef.current = null;
      setWork("idle");
    }
  };

  const chooseRestore = async (file: File | undefined) => {
    restoreRef.current = null; setCandidate(null); setError(null); setSuccess(null);
    if (!file) return;
    if (file.size < 1 || file.size > MAX_BACKUP_BYTES) { setError("ZIP en fazla 100 MB olabilir."); return; }
    setWork("read");
    try {
      const parsed = await readStoredBackupZip(new Uint8Array(await file.arrayBuffer()));
      restoreRef.current = parsed;
      setCandidate(parsed.backup);
    } catch (caught) {
      setError(messageOf(caught, "ZIP açılamadı."));
    } finally {
      setWork("idle");
    }
  };

  const restore = async () => {
    const selected = restoreRef.current;
    if (!selected) return;
    const controller = new AbortController();
    abortRef.current = controller;
    setWork("upload"); setError(null); setSuccess(null); setProgress({ done: 0, total: selected.backup.images.length });
    try {
      for (let index = 0; index < selected.backup.images.length; index++) {
        controller.signal.throwIfAborted();
        const image = selected.backup.images[index];
        const bytes = selected.photos.get(image.key);
        if (!bytes) throw new Error("Fotoğraflar yüklenemedi. Menü değiştirilmedi.");
        const form = new FormData();
        form.set("key", image.key);
        const copy = new Uint8Array(bytes.length);
        copy.set(bytes);
        form.set("file", new File([copy.buffer], `${image.key}-1280.webp`, { type: "image/webp" }));
        const response = await fetch("/qr/api/admin/restore-image", { method: "POST", body: form, signal: controller.signal });
        if (!response.ok) throw new Error("Fotoğraflar yüklenemedi. Menü değiştirilmedi.");
        setProgress({ done: index + 1, total: selected.backup.images.length });
      }
      setWork("apply");
      const result = await restoreBackupAction(JSON.stringify(selected.backup));
      if (!result.ok) throw new Error(result.error ?? "Yedek geri yüklenemedi. Menü değiştirilmedi.");
      setSuccess("Yedek geri yüklendi. WiFi bilgileri değiştirilmedi.");
      restoreRef.current = null;
      setCandidate(null);
      router.refresh();
    } catch (caught) {
      setError(messageOf(caught, "Yedek geri yüklenemedi. Menü değiştirilmedi."));
    } finally {
      abortRef.current = null;
      setWork("idle");
    }
  };

  return (
    <div className="adm-backup-stack">
      <section className="adm-card" aria-labelledby="download-title">
        <h2 id="download-title" className="adm-card__title">Yedek indir</h2>
        <p className="adm-note">Menü verisi ve 1280 px fotoğraflar tek ZIP dosyasına alınır. WiFi şifresi ve admin hesabı eklenmez.</p>
        <p className="adm-note">Bilgisayardan almak daha hızlıdır.</p>
        {work === "download" ? <p role="status" aria-live="polite" className="adm-progress">{progress.done} / {progress.total} fotoğraf</p> : null}
        <div className="adm-row">
          <button type="button" className="adm-btn adm-btn--main" disabled={!ready || busy} onClick={download}>{work === "download" ? "Hazırlanıyor…" : "Yedek indir"}</button>
          {work === "download" ? <button type="button" className="adm-btn" onClick={cancel}>İptal</button> : null}
        </div>
      </section>

      <section className="adm-card" aria-labelledby="restore-title">
        <h2 id="restore-title" className="adm-card__title">Yedeği geri yükle</h2>
        <label className="adm-field">ZIP yedeği
          <input type="file" accept=".zip,application/zip" disabled={!ready || busy} onChange={(event) => void chooseRestore(event.target.files?.[0])} />
        </label>
        {work === "read" ? <p role="status" className="adm-progress">ZIP doğrulanıyor…</p> : null}
        {candidate ? (
          <div className="adm-confirm" data-testid="backup-summary">
            <p className="adm-confirm__title">Yedek doğrulandı</p>
            <p>{candidate.data.categories.length} kategori · {candidate.data.products.length} ürün · {candidate.images.length} fotoğraf</p>
            <p className="adm-note">Önce mevcut menünün kopyası alınır. WiFi bilgileri değiştirilmeyecek.</p>
            {(work === "upload" || work === "apply") ? <p role="status" aria-live="polite" className="adm-progress">{work === "apply" ? "Menü değiştiriliyor…" : `${progress.done} / ${progress.total} fotoğraf`}</p> : null}
            <div className="adm-row">
              <button type="button" className="adm-btn adm-btn--main" disabled={busy} onClick={restore}>Onayla ve geri yükle</button>
              {work === "upload" ? <button type="button" className="adm-btn" onClick={cancel}>İptal</button> : null}
            </div>
          </div>
        ) : null}
      </section>
      {error ? <p className="adm-error" role="alert">{error}</p> : null}
      {success ? <p className="adm-ok" role="status">{success}</p> : null}
    </div>
  );
}

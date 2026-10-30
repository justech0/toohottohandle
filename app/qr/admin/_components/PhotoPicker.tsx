"use client";

import { useEffect, useRef, useState } from "react";
import { imageSrc } from "@/lib/menu/image";
import { PHOTO_OPEN_ERROR, prepareImage } from "@/lib/client/prepareImage";

type Props = {
  initialKey?: string | null; initialFocusX?: number; initialFocusY?: number; label?: string;
  fallbackSrc?: string | null; inputLabel?: string;
};

export function PhotoPicker({
  initialKey = "", initialFocusX = 0.5, initialFocusY = 0.5, label = "Fotoğraf", fallbackSrc = null, inputLabel = "Fotoğraf seç",
}: Props) {
  const [key, setKey] = useState(initialKey ?? "");
  const [useDefault, setUseDefault] = useState(initialKey === null && Boolean(fallbackSrc));
  const [focus, setFocus] = useState({ x: initialFocusX, y: initialFocusY });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const pointer = useRef<number | null>(null);

  const chooseFocus = (element: HTMLElement, clientX: number, clientY: number) => {
    const box = element.getBoundingClientRect();
    setFocus({ x: Math.max(0, Math.min(1, (clientX - box.left) / box.width)), y: Math.max(0, Math.min(1, (clientY - box.top) / box.height)) });
  };

  const upload = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    setError("");
    setMessage("Fotoğraf hazırlanıyor…");
    try {
      const prepared = await prepareImage(file);
      const body = new FormData();
      body.set("file", prepared);
      const response = await fetch("/qr/api/admin/upload", { method: "POST", body });
      const result = await response.json() as { key?: string; error?: string };
      if (!response.ok || !result.key) throw new Error(result.error ?? "Fotoğraf yüklenemedi. Tekrar dene.");
      setKey(result.key);
      setUseDefault(false);
      setFocus({ x: 0.5, y: 0.5 });
      setMessage("Fotoğraf hazır. Odağı fotoğrafa dokunarak seç.");
    } catch (reason) {
      setMessage("");
      setError(reason instanceof Error ? reason.message : PHOTO_OPEN_ERROR);
    } finally {
      setUploading(false);
    }
  };

  return (
    <fieldset className="adm-fieldset adm-photo">
      <legend>{label}</legend>
      <input type="hidden" name="imageKey" value={useDefault ? "__default__" : key} />
      <input type="hidden" name="imageFocusX" value={focus.x} />
      <input type="hidden" name="imageFocusY" value={focus.y} />
      {key || useDefault ? (
        <div
          className="adm-photo__focus"
          data-testid="photo-focus"
          role="img"
          aria-label={`Fotoğraf odağı: yatay yüzde ${Math.round(focus.x * 100)}, dikey yüzde ${Math.round(focus.y * 100)}`}
          onPointerDown={(event) => {
            pointer.current = event.pointerId;
            event.currentTarget.setPointerCapture(event.pointerId);
            chooseFocus(event.currentTarget, event.clientX, event.clientY);
          }}
          onPointerMove={(event) => { if (pointer.current === event.pointerId) chooseFocus(event.currentTarget, event.clientX, event.clientY); }}
          onPointerUp={(event) => { if (pointer.current === event.pointerId) pointer.current = null; }}
          onPointerCancel={() => { pointer.current = null; }}
          onLostPointerCapture={() => { pointer.current = null; }}
        >
          <img src={useDefault ? fallbackSrc! : imageSrc(key, 720)} alt="" style={{ objectPosition: `${focus.x * 100}% ${focus.y * 100}%` }} />
          <span className="adm-photo__target" style={{ left: `${focus.x * 100}%`, top: `${focus.y * 100}%` }} aria-hidden="true" />
        </div>
      ) : <p className="adm-note">Henüz fotoğraf yok.</p>}
      <div className="adm-row">
        <label className="adm-btn adm-btn--link adm-photo__choose">
          {uploading ? "Hazırlanıyor…" : key || useDefault ? "Fotoğrafı değiştir" : "Fotoğraf seç"}
          <input type="file" accept="image/jpeg,image/png,image/webp" aria-label={inputLabel} disabled={!ready || uploading}
            onChange={(event) => { void upload(event.target.files?.[0]); event.currentTarget.value = ""; }} />
        </label>
        {key || useDefault ? <button type="button" className="adm-btn" onClick={() => { setKey(""); setUseDefault(false); setMessage("Fotoğraf kaydedince silinecek."); }}>Fotoğrafı sil</button> : null}
      </div>
      {message ? <p className="adm-ok" role="status">{message}</p> : null}
      {error ? <p className="adm-error" role="alert">{error}</p> : null}
    </fieldset>
  );
}

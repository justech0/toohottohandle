"use client";

import { useActionState } from "react";
import type { PosterPhoto } from "@/lib/admin/photos";
import { groupStyle } from "@/lib/brand/groups";
import { PhotoPicker } from "../_components/PhotoPicker";
import { savePosterPhotoAction, type PosterState } from "./actions";

export function PosterPhotoForm({ item, saved }: { item: PosterPhoto; saved: boolean }) {
  const [state, action, pending] = useActionState<PosterState, FormData>(savePosterPhotoAction, { error: null });
  const fallback = item.target === "group" ? groupStyle(item.slug).image : null;
  return (
    <form id={`${item.target}-${item.id}`} action={action} className="adm-card adm-poster-form">
      <input type="hidden" name="target" value={item.target} />
      <input type="hidden" name="id" value={item.id} />
      <h2 className="adm-card__title">{item.name}</h2>
      {saved ? <p className="adm-ok" role="status">Fotoğraf kaydedildi.</p> : null}
      {state.error ? <p className="adm-error" role="alert">{state.error}</p> : null}
      <PhotoPicker initialKey={item.imageKey} initialFocusX={item.focusX} initialFocusY={item.focusY}
        fallbackSrc={fallback} inputLabel={`${item.name} fotoğrafını seç`} label={`${item.target === "group" ? "Grup" : "Kategori"} afişi`} />
      <button type="submit" className="adm-btn adm-btn--main" disabled={pending} aria-busy={pending}>{pending ? "Kaydediliyor…" : "Afişi kaydet"}</button>
    </form>
  );
}

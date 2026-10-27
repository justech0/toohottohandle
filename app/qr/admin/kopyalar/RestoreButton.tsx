"use client";

import { useActionState, useRef } from "react";
import { restoreSnapshotAction, type RestoreState } from "./actions";

export function RestoreButton({ id, reason }: { id: number; reason: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [state, action, pending] = useActionState<RestoreState, FormData>(restoreSnapshotAction, { error: null });
  return (
    <>
      {state.error ? <p className="adm-error" role="alert">{state.error}</p> : null}
      <button type="button" className="adm-btn" onClick={() => dialog.current?.showModal()}>Bu kopyaya dön</button>
      <dialog ref={dialog} className="adm-dialog" aria-labelledby={`restore-${id}`}>
        <h2 id={`restore-${id}`} className="adm-dialog__title">Bu kopyaya dönülsün mü?</h2>
        <p><strong>{reason}</strong> durumuna dönmeden önce mevcut menünün de kopyası alınacak. WiFi bilgileri değişmeyecek.</p>
        <form action={action} className="adm-dialog__actions">
          <input type="hidden" name="id" value={id} />
          <button type="submit" className="adm-btn adm-btn--main" disabled={pending} aria-busy={pending}>{pending ? "Dönülüyor…" : "Evet, bu kopyaya dön"}</button>
          <button type="button" className="adm-btn" onClick={() => dialog.current?.close()}>Vazgeç</button>
        </form>
      </dialog>
    </>
  );
}

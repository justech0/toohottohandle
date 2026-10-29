"use client";
import { useRef, useState, useTransition } from "react";
import { changeFeedback } from "./actions";

export function FeedbackControls({ id, isRead }: { id: number; isRead: boolean }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const run = (op: "read" | "delete") => startTransition(async () => {
    setError("");
    try { const result = await changeFeedback(id, op); if (result.error) setError(result.error); else dialog.current?.close(); }
    catch { setError("İşlem tamamlanamadı. Tekrar dene."); }
  });
  return <>
    <div className="adm-row">
      {!isRead ? <button className="adm-btn" disabled={pending} onClick={() => run("read")}>Okundu işaretle</button> : <span className="adm-note">Okundu</span>}
      <button className="adm-btn" onClick={() => dialog.current?.showModal()} disabled={pending}>Sil</button>
    </div>
    {error ? <p role="alert" className="adm-error">{error}</p> : null}
    <dialog ref={dialog} className="feedback-delete" aria-labelledby={`delete-feedback-${id}`}>
      <h2 id={`delete-feedback-${id}`}>Geri bildirim silinsin mi?</h2>
      <p>Mesaj ve varsa fotoğraf kalıcı olarak silinir. Bu işlem geri alınamaz.</p>
      <div className="adm-row"><button className="adm-btn" disabled={pending} onClick={() => dialog.current?.close()}>Vazgeç</button><button className="adm-btn adm-btn--main" disabled={pending} onClick={() => run("delete")}>{pending ? "Siliniyor…" : "Kalıcı olarak sil"}</button></div>
      {error ? <p role="alert" className="adm-error">{error}</p> : null}
    </dialog>
  </>;
}

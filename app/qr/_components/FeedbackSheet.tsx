"use client";

import { useEffect, useRef, useState } from "react";
import { FEEDBACK_TOPICS } from "@/lib/feedback/input";
import { prepareImage, PHOTO_OPEN_ERROR } from "@/lib/client/prepareImage";
import { submitFeedback } from "../feedback-actions";
import { BrandIcon } from "./BrandIcon";
import { CloseIcon } from "./Icons";
import { useDialogFocus } from "./useDialogFocus";

export function FeedbackSheet({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [rating, setRating] = useState(0);
  const [length, setLength] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  useDialogFocus(ref, onClose);
  useEffect(() => {
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = old; };
  }, []);

  return (
    <div className="sheet-layer">
      <div className="sheet-backdrop" onClick={onClose} aria-hidden="true" />
      <div ref={ref} className="sheet feedback-sheet" role="dialog" aria-modal="true" aria-labelledby="feedback-title" data-testid="feedback-sheet">
        <button type="button" className="icon-btn sheet__close" aria-label="Kapat" onClick={onClose}><CloseIcon /></button>
        <div className="feedback-sheet__heading">
          <BrandIcon name="rabbit" />
          <h2 id="feedback-title">Nasıldı?<br />Bize yaz.</h2>
          <p>Görüşün sadece ekibimize ulaşır. Menüde yayınlanmaz.</p>
        </div>
        {sent ? <div className="feedback-success" role="status" tabIndex={-1} ref={(el) => el?.focus()}>
          <BrandIcon name="star" />
          <h3>Teşekkürler, ekibimize ulaştı.</h3>
          <p>Paylaştığın her detay bizim için değerli.</p>
          <button type="button" className="feedback-submit" onClick={onClose}>Menüye dön</button>
        </div> : <form className="feedback-form" onSubmit={async (event) => {
          event.preventDefault();
          if (busy) return;
          const data = new FormData(event.currentTarget);
          data.set("lang", ["tr", "en", "ar"].includes(document.documentElement.lang) ? document.documentElement.lang : "tr");
          setBusy(true); setError("");
          try {
            const file = data.get("photo");
            if (file instanceof File && file.size) {
              const prepared = await prepareImage(file);
              if (prepared.size > 1_500_000) throw new Error(PHOTO_OPEN_ERROR);
              data.set("photo", prepared);
            }
            const result = await submitFeedback(data);
            if (result.ok) setSent(true); else setError(result.error || "Gönderilemedi. Tekrar dene.");
          } catch (e) { setError(e instanceof Error && e.message === PHOTO_OPEN_ERROR ? PHOTO_OPEN_ERROR : "Gönderilemedi. Bağlantını kontrol edip tekrar dene."); }
          finally { setBusy(false); }
        }}>
          <label>Konu<select name="topic" required defaultValue=""><option value="" disabled>Ne hakkında yazmak istersin?</option>{Object.entries(FEEDBACK_TOPICS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <fieldset className="feedback-rating"><legend>Deneyimine kaç puan verirsin?</legend><div>
            {[1, 2, 3, 4, 5].map((value) => <label key={value} data-selected={value <= rating}>
              <input type="radio" name="rating" value={value} required checked={rating === value} onChange={() => setRating(value)} aria-label={`${value} puan`} />
              <BrandIcon name="star" /><span>{value}</span>
            </label>)}
          </div></fieldset>
          <label>Mesajın<textarea name="message" required maxLength={1000} rows={4} placeholder="Neyi sevdin, neyi daha iyi yapabiliriz?" onChange={(e) => setLength(e.target.value.length)} aria-describedby="feedback-count" /></label>
          <small id="feedback-count" className="feedback-count">{length}/1000</small>
          <label>Adın <small>(isteğe bağlı)</small><input name="name" maxLength={80} autoComplete="name" placeholder="Boş bırakırsan Misafir" /></label>
          <label>Telefon veya e-posta <small>(isteğe bağlı)</small><input name="contact" maxLength={120} aria-describedby="feedback-contact-note" /></label>
          <small id="feedback-contact-note">Yalnızca sana dönüş yapmak için kullanılır.</small>
          <label>Fotoğraf <small>(isteğe bağlı)</small><input name="photo" type="file" accept="image/jpeg,image/png,image/webp" /></label>
          <small>Tek fotoğraf. JPEG, PNG veya WebP; göndermeden önce küçültülür.</small>
          <div hidden aria-hidden="true"><label>Web sitesi<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
          {error ? <p className="feedback-error" role="alert">{error}</p> : null}
          <button type="submit" className="feedback-submit" disabled={busy}>{busy ? "Gönderiliyor…" : "Ekibe gönder"}</button>
        </form>}
      </div>
    </div>
  );
}

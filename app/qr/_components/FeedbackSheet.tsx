"use client";

import { useEffect, useRef, useState } from "react";
import { FEEDBACK_TOPICS } from "@/lib/feedback/input";
import { prepareImage, PHOTO_OPEN_ERROR } from "@/lib/client/prepareImage";
import { submitFeedback } from "../feedback-actions";
import { BrandIcon } from "./BrandIcon";
import { CloseIcon, PhotoIcon } from "./Icons";
import { useDialogFocus } from "./useDialogFocus";

export function FeedbackSheet({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [rating, setRating] = useState(0);
  const [length, setLength] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [sentRating, setSentRating] = useState(0);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState("");
  const photoInput = useRef<HTMLInputElement>(null);
  const receipt = sentRating === 5
    ? { title: "TOOHOTT!", text: "Beş tavşan, kocaman bir teşekkür! Bu enerjiyi sevdik. Yeniden bekleriz." }
    : sentRating <= 2
      ? { title: "Seni duyduk.", text: "Teşekkür ederiz. Beklentini karşılayamadığımız için üzgünüz. Daha iyi bir deneyim sunmak için görüşünü dikkate alacağız." }
      : { title: "İyi ki paylaştın.", text: "Teşekkür ederiz. Sevdiğin detayları korumak, daha iyisini sunmak için görüşün bize yol gösterecek." };
  useDialogFocus(ref, onClose);
  useEffect(() => {
    if (!photo) { setPhotoUrl(""); return; }
    const url = URL.createObjectURL(photo);
    setPhotoUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);
  useEffect(() => {
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = old; };
  }, []);

  return (
    <div className="sheet-layer">
      <div className="sheet-backdrop" onClick={onClose} aria-hidden="true" />
      <div ref={ref} className="sheet feedback-sheet" role="dialog" aria-modal="true" aria-labelledby="feedback-title" data-testid="feedback-sheet" data-sent-rating={sent ? sentRating : undefined}>
        <button type="button" className="icon-btn sheet__close" aria-label="Kapat" onClick={onClose}><CloseIcon /></button>
        <div className="feedback-sheet__heading">
          <BrandIcon name="rabbit" />
          <h2 id="feedback-title">Söz sende.</h2>
          <p>Görüşlerin doğrudan yöneticilerimize iletilir. Seni dinliyoruz.</p>
        </div>
        {sent ? <div className="feedback-success" role="status" tabIndex={-1} ref={(el) => el?.focus()} data-testid="feedback-receipt" data-rating={sentRating}>
          <div className="feedback-success__art" aria-hidden="true">
            <BrandIcon name="rabbit" className="feedback-success__rabbit" />
            {sentRating === 5 ? <div className="feedback-spark" data-testid="feedback-celebration">{[0, 1, 2, 3].map((i) => <BrandIcon key={i} name="star" className={`feedback-spark__item feedback-spark__item--${i}`} />)}</div> : null}
          </div>
          <h3>{receipt.title}</h3>
          <p>{receipt.text}</p>
          <p className="feedback-success__note">Görüşün yöneticilerimize ulaştı.</p>
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
            if (result.ok) { setSentRating(Number(data.get("rating"))); setSent(true); }
            else setError(result.error || "Gönderilemedi. Tekrar dene.");
          } catch (e) { setError(e instanceof Error && e.message === PHOTO_OPEN_ERROR ? PHOTO_OPEN_ERROR : "Gönderilemedi. Bağlantını kontrol edip tekrar dene."); }
          finally { setBusy(false); }
        }}>
          <fieldset className="feedback-topics"><legend>Ne hakkında yazmak istersin?</legend><div>
            {Object.entries(FEEDBACK_TOPICS).map(([value, label]) => <label key={value}>
              <input type="radio" name="topic" value={value} required /><span>{label}</span>
            </label>)}
          </div></fieldset>
          <fieldset className="feedback-rating" data-rating={rating}><legend>Deneyimine kaç tavşan verirsin?</legend><div>
            {[1, 2, 3, 4, 5].map((value) => <label key={value} data-selected={value <= rating}>
              <input type="radio" name="rating" value={value} required checked={rating === value} onChange={() => setRating(value)} aria-label={`${value} puan`} />
              <BrandIcon name="rabbit" /><span>{value}</span>
            </label>)}
          </div></fieldset>
          <label>Mesajın<textarea name="message" required maxLength={1000} rows={4} placeholder="Neyi sevdin veya neleri daha iyi yapabiliriz?" onChange={(e) => setLength(e.target.value.length)} aria-describedby="feedback-count" /></label>
          <small id="feedback-count" className="feedback-count">{length}/1000</small>
          <label>Adın <small>(isteğe bağlı)</small><input name="name" maxLength={80} autoComplete="name" /></label>
          <label>Telefon veya e-posta <small>(isteğe bağlı)</small><input name="contact" maxLength={120} aria-describedby="feedback-contact-note" /></label>
          <small id="feedback-contact-note">Yalnızca sana dönüş yapmak için kullanılır.</small>
          <div className="feedback-photo-wrap">
            <label className="feedback-photo">
              <input ref={photoInput} name="photo" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setPhoto(event.target.files?.[0] ?? null)} aria-label="Fotoğraf eklemek için dokun" />
              {photoUrl ? <img src={photoUrl} alt="Seçtiğin fotoğrafın önizlemesi" /> : <PhotoIcon />}
              <span><strong>{photo ? "Fotoğrafı değiştir" : "Fotoğraf eklemek için dokun"}</strong><small>{photo ? photo.name : "İsteğe bağlı · JPEG, PNG veya WebP"}</small></span>
            </label>
            {photo ? <button type="button" className="feedback-photo-remove" onClick={() => { setPhoto(null); if (photoInput.current) photoInput.current.value = ""; }}>Fotoğrafı kaldır</button> : null}
          </div>
          <div hidden aria-hidden="true"><label>Web sitesi<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
          {error ? <p className="feedback-error" role="alert">{error}</p> : null}
          <button type="submit" className="feedback-submit" disabled={busy}>{busy ? "Gönderiliyor…" : "Ekibe gönder"}</button>
        </form>}
      </div>
    </div>
  );
}

import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { getPool } from "@/lib/db/client";
import { listSlides, type AdminSlide } from "@/lib/admin/hero";
import { ActionForm } from "../_components/ActionForm";
import { BrandSelect } from "../_components/BrandSelect";
import { PhotoPicker } from "../_components/PhotoPicker";
import { saveSlideAction, deleteSlideAction } from "./actions";

function SlideForm({ slide, order }: { slide?: AdminSlide; order: number }) {
  return <article className="adm-card">
    <h2 className="adm-card__title">{slide?.title ?? "Yeni slayt"}</h2>
    <ActionForm action={saveSlideAction} testId={slide ? `hero-${slide.id}` : "hero-new"}>
      {slide ? <input type="hidden" name="id" value={slide.id} /> : null}
      <label className="adm-field">Yazı<input name="title" defaultValue={slide?.title} maxLength={120} required /></label>
      <div className="adm-row">
        <label className="adm-field">Renk<BrandSelect name="color" defaultValue={slide?.color ?? "red"}>{[["red", "Kırmızı"], ["yellow", "Sarı"], ["pink", "Pembe"], ["blue", "Mavi"], ["green", "Yeşil"], ["gray", "Gri"]].map(([value, label]) => <option key={value} value={value}>{label}</option>)}</BrandSelect></label>
        <label className="adm-field">İkon<BrandSelect name="icon" defaultValue={slide?.icon ?? "rabbit"}><option value="lips">Dudak</option><option value="rabbit">Tavşan</option><option value="star">Yıldız</option></BrandSelect></label>
        <label className="adm-field">Sıra<input name="sortOrder" type="number" defaultValue={slide?.sortOrder ?? order} min={0} max={10000} required /></label>
      </div>
      <PhotoPicker initialKey={slide?.imageKey ?? null} fallbackSrc={slide?.image || null} initialFocusX={slide?.focusX} initialFocusY={slide?.focusY} />
      <div className="adm-checks"><label><input name="isVisible" type="checkbox" defaultChecked={slide?.isVisible ?? true} /> Menüde görünür</label></div>
      <button className="adm-btn adm-btn--main" type="submit">{slide ? "Kaydet" : "Slayt ekle"}</button>
    </ActionForm>
    {slide ? <ActionForm action={deleteSlideAction}><input type="hidden" name="id" value={slide.id} /><button type="submit" className="adm-btn adm-btn--danger">Slaytı sil</button></ActionForm> : null}
  </article>;
}
async function Content() {
  await connection(); await requireAdmin(); const slides = await listSlides(getPool());
  return <div className="adm-form">{slides.map(slide => <SlideForm key={slide.id} slide={slide} order={0} />)}<SlideForm order={slides.length} /></div>;
}
export default function HeroPage() {
  return <><p className="adm-crumb"><Link href="/qr/admin">← Menü yönetimi</Link></p><h1 className="adm-h1">Vitrin</h1><p className="adm-lead">Yazı, fotoğraf, renk ve sıra. Küçük sıra önce görünür. Bu işlemler geri alınamaz.</p><Suspense fallback={<p>Yükleniyor…</p>}><Content /></Suspense></>;
}

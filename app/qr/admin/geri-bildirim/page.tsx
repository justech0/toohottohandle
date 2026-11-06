import { BrandSelect } from "../_components/BrandSelect";
import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { getPool } from "@/lib/db/client";
import { listFeedback, markAllFeedbackRead } from "@/lib/feedback/store";
import { FEEDBACK_TOPICS } from "@/lib/feedback/input";
import { BrandIcon } from "../../_components/BrandIcon";
import { FeedbackControls } from "./FeedbackControls";

type Query = { konu?: string; puan?: string; okunmamis?: string; sayfa?: string };
const when = (date: Date) => new Intl.DateTimeFormat("tr-TR", { timeZone: "Europe/Istanbul", dateStyle: "medium", timeStyle: "short" }).format(new Date(date));
async function Content({ searchParams }: { searchParams: Promise<Query> }) {
  await connection();
  await requireAdmin();
  const pool = getPool();
  const query = await searchParams;
  await markAllFeedbackRead(pool);
  const result = await listFeedback(pool, { topic: query.konu, rating: Number(query.puan), unread: query.okunmamis === "1", page: Number(query.sayfa) });
  const pageLink = (page: number) => {
    const p = new URLSearchParams();
    if (query.konu) p.set("konu", query.konu);
    if (query.puan) p.set("puan", query.puan);
    if (query.okunmamis === "1") p.set("okunmamis", "1");
    p.set("sayfa", String(page));
    return `?${p}`;
  };
  return <>
    <form className="adm-card feedback-filters" method="get">
      <label>Konu<BrandSelect name="konu" defaultValue={query.konu ?? ""}><option value="">Tüm konular</option>{Object.entries(FEEDBACK_TOPICS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</BrandSelect></label>
      <label>Puan<BrandSelect name="puan" defaultValue={query.puan ?? ""}><option value="">Tüm puanlar</option>{[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n} puan</option>)}</BrandSelect></label>
      <label className="adm-row"><input type="checkbox" name="okunmamis" value="1" defaultChecked={query.okunmamis === "1"} /> Yalnızca okunmamış</label>
      <button className="adm-btn adm-btn--main">Filtrele</button><Link className="adm-btn" href="/qr/admin/geri-bildirim">Temizle</Link>
    </form>
    <p className="adm-note">{result.total} geri bildirim · Sayfa {result.page}/{result.pages}</p>
    {!result.items.length ? <section className="adm-card"><h2 className="adm-card__title">Henüz geri bildirim yok</h2><p className="adm-note">Misafirlerin menüden gönderdiği görüşler burada görünür. Filtre kullandıysan temizleyebilirsin.</p></section> : null}
    <div className="feedback-grid">{result.items.map((item) => <article key={item.id} className={`feedback-entry${item.is_read ? " feedback-entry--read" : ""}`} data-testid="feedback-entry">
      <header className="feedback-entry__head">
        <h2 className="feedback-entry__topic">{FEEDBACK_TOPICS[item.topic]}</h2>
        {!item.is_read ? <span className="feedback-unread">Okunmamış</span> : null}
      </header>
      <p className="feedback-entry__meta">
        <span className="feedback-entry__rating" aria-label={`${item.rating} / 5 puan`}>{[1, 2, 3, 4, 5].map((n) => <BrandIcon key={n} name="rabbit" className={n <= item.rating ? "" : "feedback-entry__empty-star"} />)}<b>{item.rating}/5</b></span>
        <span><time dateTime={new Date(item.created_at).toISOString()}>{when(item.created_at)}</time> · {item.name || "Misafir"}</span>
      </p>
      <div className="feedback-entry__body">
        <div className="feedback-entry__text">
          <p className="feedback-entry__message">{item.message.trim()}</p>
          {item.contact ? <p className="feedback-entry__contact">İletişim: {item.contact}</p> : null}
        </div>
        {item.image_key ? <a className="feedback-entry__photo" href={`/qr/api/admin/feedback-image/${item.image_key}`} target="_blank" rel="noopener noreferrer" aria-label="Fotoğrafı büyük aç" title="Fotoğrafı büyük aç"><img src={`/qr/api/admin/feedback-image/${item.image_key}`} alt="Misafirin eklediği fotoğraf" loading="lazy" /></a> : null}
      </div>
      <FeedbackControls id={item.id} isRead={Boolean(item.is_read)} />
    </article>)}</div>
    <nav className="adm-row" aria-label="Geri bildirim sayfaları">{result.page > 1 ? <Link className="adm-btn" href={pageLink(result.page - 1)}>Önceki</Link> : null}{result.page < result.pages ? <Link className="adm-btn" href={pageLink(result.page + 1)}>Sonraki</Link> : null}</nav>
  </>;
}
export default function FeedbackAdmin(props: { searchParams: Promise<Query> }) {
  return <><Link href="/qr/admin" className="feedback-back">Menü yönetimine dön</Link><h1 className="adm-h1">Geri bildirim</h1><p className="adm-lead">Sadece ekibin görür. Misafirler menüden bize yazar.</p><Suspense fallback={<p>Yükleniyor…</p>}><Content {...props} /></Suspense></>;
}

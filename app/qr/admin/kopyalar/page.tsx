import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { getPool } from "@/lib/db/client";
import { listHistory, listMenuSnapshots } from "@/lib/admin/snapshots";
import { RestoreButton } from "./RestoreButton";

const when = (iso: string) => new Intl.DateTimeFormat("tr-TR", {
  timeZone: "Europe/Istanbul", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
}).format(new Date(iso));

async function Content({ searchParams }: { searchParams: Promise<{ donuldu?: string }> }) {
  await connection();
  await requireAdmin();
  const [snapshots, history, query] = await Promise.all([listMenuSnapshots(getPool()), listHistory(getPool()), searchParams]);
  return (
    <>
      {query.donuldu ? <p className="adm-ok" role="status">Kopyaya dönüldü. WiFi bilgileri değiştirilmedi.</p> : null}
      <section className="adm-section" aria-labelledby="copies-title">
        <h2 id="copies-title" className="adm-card__title">Son 25 kopya</h2>
        {snapshots.length ? <ol className="adm-history">{snapshots.map((snapshot) => (
          <li key={snapshot.id} className="adm-card">
            <div><strong>{snapshot.reason}</strong><p className="adm-note">{when(snapshot.at)}</p></div>
            <RestoreButton id={snapshot.id} reason={snapshot.reason} />
          </li>
        ))}</ol> : <p className="adm-card">Henüz menü kopyası yok.</p>}
      </section>
      <section className="adm-section" aria-labelledby="history-title">
        <h2 id="history-title" className="adm-card__title">Son 100 değişiklik</h2>
        {history.length ? <ol className="adm-history">{history.map((item) => (
          <li key={item.id}><span>{item.summary}</span><time dateTime={item.at}>{when(item.at)}</time></li>
        ))}</ol> : <p className="adm-card">Henüz değişiklik yok.</p>}
      </section>
    </>
  );
}

export default function CopiesPage(props: { searchParams: Promise<{ donuldu?: string }> }) {
  return (
    <>
      <p className="adm-crumb"><Link href="/qr/admin">← Menü yönetimi</Link></p>
      <h1 className="adm-h1">Kopyalar</h1>
      <p className="adm-lead">Eski bir menüye dönerken mevcut menü de korunur.</p>
      <Suspense fallback={<p className="adm-note">Yükleniyor…</p>}><Content {...props} /></Suspense>
    </>
  );
}

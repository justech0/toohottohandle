import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { getPool } from "@/lib/db/client";
import { listHistory, listMenuSnapshots } from "@/lib/admin/snapshots";
import { RestoreButton } from "./RestoreButton";

const logReason = (reason: string) => reason.includes("silme") ? "Silme öncesi menü" : reason.includes("toplu fiyat") ? "Fiyat değişikliği öncesi menü" : reason.includes("dönüş") ? "Geri dönüş öncesi menü" : reason;

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
        <h2 id="copies-title" className="adm-card__title">Önceki menüler</h2>
        {snapshots.length ? <ol className="adm-history">{snapshots.map((snapshot) => (
          <li key={snapshot.id} className="adm-card">
            <div><strong>{logReason(snapshot.reason)}</strong><p className="adm-note">{when(snapshot.at)}</p></div>
            <RestoreButton id={snapshot.id} reason={logReason(snapshot.reason)} />
          </li>
        ))}</ol> : <p className="adm-card">Henüz menü kopyası yok.</p>}
      </section>
      <section className="adm-section" aria-labelledby="history-title">
        <h2 id="history-title" className="adm-card__title">Son 100 değişiklik</h2>
        {history.length ? <ol className="adm-history">{history.map((item) => (
          <li key={item.id}><span>{item.summary}</span><span className="adm-note">{item.email}</span><time dateTime={item.at}>{when(item.at)}</time></li>
        ))}</ol> : <p className="adm-card">Henüz değişiklik yok.</p>}
      </section>
    </>
  );
}

export default function CopiesPage(props: { searchParams: Promise<{ donuldu?: string }> }) {
  return (
    <>
      <p className="adm-crumb"><Link href="/qr/admin">← Menü yönetimi</Link></p>
      <h1 className="adm-h1">Loglar</h1>
      <p className="adm-lead">Menü kayıtları ve değişiklik geçmişi. 30 günden eski kayıtlar temizlenir; son 25 kayıt her zaman kalır.</p>
      <Suspense fallback={<p className="adm-note">Yükleniyor…</p>}><Content {...props} /></Suspense>
    </>
  );
}

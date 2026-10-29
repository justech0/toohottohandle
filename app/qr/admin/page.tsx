import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";
import { getPool, hasDb } from "@/lib/db/client";
import { lastChange } from "@/lib/admin/products";
import { catalogData } from "@/lib/admin/catalog";
import { getBackupStatus } from "@/lib/admin/backups";
import { feedbackSummary } from "@/lib/feedback/store";
import { logout, logoutEverywhere } from "./actions";
import { undoLastAction } from "./urunler/actions";

const when = (iso: string) =>
  new Intl.DateTimeFormat("tr-TR", { timeZone: "Europe/Istanbul", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));

async function Content({ searchParams }: { searchParams: Promise<{ geri?: string; toplu?: string }> }) {
  await connection();
  if (!hasDb()) redirect("/qr/admin/giris");
  const admin = await requireAdmin();
  const [last, catalog, backup] = await Promise.all([lastChange(getPool()), catalogData(getPool()), getBackupStatus(getPool())]);
  const query = await searchParams;
  const feedback = await feedbackSummary(getPool());
  const undone = Boolean(query.geri);
  return (
    <>
      <p className="adm-lead" data-testid="admin-email">{admin.email}</p>
      {undone ? <p className="adm-ok" role="status">Son işlem geri alındı.</p> : null}
      {query.toplu ? <p className="adm-ok" role="status">Toplu fiyat uygulandı.</p> : null}
      {catalog.usesTestWifi ? <p className="adm-warning" role="alert">WiFi test bilgisi kullanılıyor</p> : null}
      <p className={`adm-backup-status${backup.stale ? " adm-backup-status--stale" : ""}`}>{backup.label}</p>

      <nav className="adm-card" aria-label="Bölümler">
        <Link href="/qr/admin/urunler" className="adm-btn adm-btn--main adm-btn--block">Ürünler ve fiyatlar</Link>
        <Link href="/qr/admin/katalog" className="adm-btn adm-btn--block">Katalog ve ayarlar</Link>
        <Link href="/qr/admin/fotograflar" className="adm-btn adm-btn--block">Afiş fotoğrafları</Link>
        <Link href="/qr/admin/toplu-fiyat" className="adm-btn adm-btn--block">Toplu fiyat</Link>
        <Link href="/qr/admin/kopyalar" className="adm-btn adm-btn--block">Kopyalar</Link>
        <Link href="/qr/admin/yedek" className="adm-btn adm-btn--block">Yedek</Link>
        <Link href="/qr/admin/istatistik" className="adm-btn adm-btn--block">İstatistik ve QR</Link>
      </nav>

      <section className="adm-card" data-testid="feedback-summary">
        <h2 className="adm-card__title">Geri bildirim</h2>
        <p>{feedback.unread} okunmamış · Son 30 gün: {feedback.average === null ? "Henüz puan yok" : `${feedback.average.toFixed(1)} / 5`}</p>
        {feedback.latest.length ? <ul className="feedback-latest">{feedback.latest.map((item) => <li key={item.id}>{item.message.split("\n")[0].slice(0, 100)}</li>)}</ul> : <p className="adm-note">Misafirlerin görüşleri burada toplanır.</p>}
        <Link href="/qr/admin/geri-bildirim" className="adm-btn adm-btn--block">Geri bildirimleri aç</Link>
      </section>

      <section className="adm-card" aria-labelledby="last-title">
        <h2 id="last-title" className="adm-card__title">Son değişiklik</h2>
        {last ? (
          <>
            <p data-testid="last-change">{last.summary}</p>
            <p className="adm-note">{when(last.at)}</p>
            <form action={undoLastAction}>
              <button type="submit" className="adm-btn" disabled={!last.canUndo} data-testid="undo">
                Son işlemi geri al
              </button>
            </form>
            {!last.canUndo ? <p className="adm-note">Geri alınacak işlem yok.</p> : null}
          </>
        ) : (
          <p className="adm-note">Henüz değişiklik yok.</p>
        )}
      </section>

      <section className="adm-card">
        <div className="adm-row">
          <form action={logout}>
            <button type="submit" className="adm-btn">Çıkış yap</button>
          </form>
          <form action={logoutEverywhere}>
            <button type="submit" className="adm-btn">Tüm cihazlardan çıkış yap</button>
          </form>
        </div>
      </section>
    </>
  );
}

export default function AdminHome(props: { searchParams: Promise<{ geri?: string; toplu?: string }> }) {
  return (
    <>
      <h1 className="adm-h1">Menü yönetimi</h1>
      <Suspense fallback={null}>
        <Content {...props} />
      </Suspense>
    </>
  );
}

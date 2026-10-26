import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";
import { getPool, hasDb } from "@/lib/db/client";
import { lastChange } from "@/lib/admin/products";
import { catalogData } from "@/lib/admin/catalog";
import { logout, logoutEverywhere } from "./actions";
import { undoLastAction } from "./urunler/actions";

const when = (iso: string) =>
  new Intl.DateTimeFormat("tr-TR", { timeZone: "Europe/Istanbul", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));

async function Content({ searchParams }: { searchParams: Promise<{ geri?: string }> }) {
  await connection();
  if (!hasDb()) redirect("/qr/admin/giris");
  const admin = await requireAdmin();
  const [last, catalog] = await Promise.all([lastChange(getPool()), catalogData(getPool())]);
  const undone = Boolean((await searchParams).geri);
  return (
    <>
      <p className="adm-lead" data-testid="admin-email">{admin.email}</p>
      {undone ? <p className="adm-ok" role="status">Son işlem geri alındı.</p> : null}
      {catalog.usesTestWifi ? <p className="adm-warning" role="alert">WiFi test bilgisi kullanılıyor</p> : null}

      <nav className="adm-card" aria-label="Bölümler">
        <Link href="/qr/admin/urunler" className="adm-btn adm-btn--main adm-btn--block">Ürünler ve fiyatlar</Link>
        <Link href="/qr/admin/katalog" className="adm-btn adm-btn--block">Katalog ve ayarlar</Link>
        <p className="adm-note">Fotoğraf ve toplu fiyat sıradaki adımlarda eklenecek.</p>
      </nav>

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

export default function AdminHome(props: { searchParams: Promise<{ geri?: string }> }) {
  return (
    <>
      <h1 className="adm-h1">Menü yönetimi</h1>
      <Suspense fallback={null}>
        <Content {...props} />
      </Suspense>
    </>
  );
}

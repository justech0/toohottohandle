import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { getPool } from "@/lib/db/client";
import { requireAdmin } from "@/lib/auth/session";
import { catalogData } from "@/lib/admin/catalog";
import { CatalogEditor } from "./CatalogEditor";

async function Content({ searchParams }: { searchParams: Promise<{ kaydedildi?: string }> }) {
  await connection();
  await requireAdmin();
  const data = await catalogData(getPool());
  const saved = Boolean((await searchParams).kaydedildi);
  return (
    <>
      {saved ? <p className="adm-ok" role="status">Kaydedildi.</p> : null}
      <nav className="adm-jump" aria-label="Katalog bölümleri">
        <a className="adm-jump__link" href="#groups">Gruplar</a><a className="adm-jump__link" href="#categories">Kategoriler</a><a className="adm-jump__link" href="#extras">Ekstralar</a><a className="adm-jump__link" href="#tags">Etiketler</a><a className="adm-jump__link" href="#settings">Ayarlar</a>
      </nav>
      <CatalogEditor data={data} />
    </>
  );
}

export default function CatalogPage(props: { searchParams: Promise<{ kaydedildi?: string }> }) {
  return (
    <>
      <p className="adm-crumb"><Link href="/qr/admin">← Menü yönetimi</Link></p>
      <h1 className="adm-h1">Katalog ve ayarlar</h1>
      <Suspense fallback={<p className="adm-note">Yükleniyor…</p>}><Content {...props} /></Suspense>
    </>
  );
}

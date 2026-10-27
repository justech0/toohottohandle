import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { getPool } from "@/lib/db/client";
import { posterPhotos } from "@/lib/admin/photos";
import { PosterPhotoForm } from "./PosterPhotoForm";

async function Content({ searchParams }: { searchParams: Promise<{ kaydedildi?: string }> }) {
  await connection();
  await requireAdmin();
  const [items, query] = await Promise.all([posterPhotos(getPool()), searchParams]);
  return (
    <>
      <section className="adm-poster-list" aria-labelledby="groups-title">
        <h2 id="groups-title" className="adm-h2">Grup afişleri</h2>
        {items.groups.map((item) => <PosterPhotoForm key={`g-${item.id}`} item={item} saved={query.kaydedildi === `group-${item.id}`} />)}
      </section>
      <section className="adm-poster-list" aria-labelledby="categories-title">
        <h2 id="categories-title" className="adm-h2">Kategori afişleri</h2>
        {items.categories.map((item) => <PosterPhotoForm key={`c-${item.id}`} item={item} saved={query.kaydedildi === `category-${item.id}`} />)}
      </section>
    </>
  );
}

export default function PhotosPage(props: { searchParams: Promise<{ kaydedildi?: string }> }) {
  return (
    <>
      <p className="adm-crumb"><Link href="/qr/admin">← Yönetim</Link></p>
      <h1 className="adm-h1">Afiş fotoğrafları</h1>
      <p className="adm-lead">Grup ve kategori afişlerinde görünecek alanı fotoğrafa dokunarak seç.</p>
      <Suspense fallback={<p className="adm-note">Yükleniyor…</p>}><Content {...props} /></Suspense>
    </>
  );
}

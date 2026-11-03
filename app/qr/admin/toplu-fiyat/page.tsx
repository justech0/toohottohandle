import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { getPool } from "@/lib/db/client";
import { allPrices, bulkPriceOptions } from "@/lib/admin/bulkPrice";
import { BulkPriceForm } from "./BulkPriceForm";

async function Content() {
  await connection();
  await requireAdmin();
  const pool = getPool();
  const [options, list] = await Promise.all([bulkPriceOptions(pool), allPrices(pool)]);
  return <BulkPriceForm {...options} list={list} />;
}

export default function BulkPricePage() {
  return (
    <>
      <p className="adm-crumb"><Link href="/qr/admin">← Menü yönetimi</Link></p>
      <h1 className="adm-h1">Toplu fiyat</h1>
      <p className="adm-lead">Tüm fiyatlar aşağıda. Yüzde ya da tutar gir, önizle, sonra tek işlemde uygula.</p>
      <Suspense fallback={<p className="adm-note">Yükleniyor…</p>}><Content /></Suspense>
    </>
  );
}

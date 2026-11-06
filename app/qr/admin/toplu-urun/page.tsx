import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { getPool } from "@/lib/db/client";
import { bulkImportOptions } from "@/lib/admin/bulkImport";
import { BulkImportForm } from "./BulkImportForm";

async function Content() {
  await connection();
  await requireAdmin();
  const { groups } = await bulkImportOptions(getPool());
  return <BulkImportForm groups={groups} />;
}

export default function BulkImportPage() {
  return (
    <>
      <p className="adm-crumb">
        <Link href="/qr/admin">← Menü yönetimi</Link>
      </p>
      <h1 className="adm-h1">Toplu Ürün Yükle</h1>
      <p className="adm-lead">CSV veya JSON ile hızlı ürün aktarımı yapın.</p>
      <Suspense fallback={<p className="adm-note">Yükleniyor…</p>}>
        <Content />
      </Suspense>
    </>
  );
}


import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { getPool } from "@/lib/db/client";
import { createBackupBundle } from "@/lib/admin/backups";
import { BackupManager } from "./BackupManager";

async function Content() {
  await connection();
  await requireAdmin();
  try {
    return <BackupManager bundle={await createBackupBundle(getPool())} />;
  } catch {
    return <p className="adm-error" role="alert">Yedek bilgileri hazırlanamadı. Fotoğraf deposunu kontrol edip tekrar dene.</p>;
  }
}

export default function BackupPage() {
  return (
    <>
      <p className="adm-crumb"><Link href="/qr/admin">← Menü yönetimi</Link></p>
      <h1 className="adm-h1">Yedek</h1>
      <p className="adm-lead">Menüyü fotoğraflarıyla indir veya eski bir ZIP yedeğine dön.</p>
      <Suspense fallback={<p className="adm-note">Yedek bilgileri hazırlanıyor…</p>}><Content /></Suspense>
    </>
  );
}

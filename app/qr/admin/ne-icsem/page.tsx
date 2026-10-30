import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import type { RowDataPacket } from "mysql2/promise";
import { requireAdmin } from "@/lib/auth/session";
import { getPool } from "@/lib/db/client";
import { SuggestForm } from "./SuggestForm";
async function Content() {
  await connection(); await requireAdmin(); const pool = getPool();
  const [[settings]] = await pool.query<RowDataPacket[]>("SELECT suggest_mode, suggest_prefer_photos FROM settings WHERE id=1");
  const [rows] = await pool.query<RowDataPacket[]>("SELECT p.id, p.name, p.in_suggest, c.name_tr AS category FROM products p JOIN categories c ON c.id=p.category_id ORDER BY c.sort_order, c.id, p.sort_order, p.id");
  return <SuggestForm mode={settings.suggest_mode} preferPhotos={Boolean(settings.suggest_prefer_photos)} products={rows.map(p => ({ id: p.id, name: p.name, category: p.category, selected: p.in_suggest === 1 }))} />;
}
export default function SuggestPage() { return <><p className="adm-crumb"><Link href="/qr/admin">← Menü yönetimi</Link></p><h1 className="adm-h1">Ne içsem</h1><p className="adm-lead">Öneri havuzunu seç. Son beş öneri, havuz yeterliyse aynı oturumda tekrarlanmaz. Ayar değişiklikleri geri alınamaz.</p><Suspense fallback={<p>Yükleniyor…</p>}><Content /></Suspense></>; }

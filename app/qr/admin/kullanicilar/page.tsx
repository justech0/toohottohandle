import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { getPool } from "@/lib/db/client";
import { listAdmins } from "@/lib/admin/users";
import { ActionForm } from "../_components/ActionForm";
import { createAdminAction, deleteAdminAction } from "./actions";
async function Content() {
  await connection(); const actor = await requireAdmin(); const admins = await listAdmins(getPool());
  return <>
    <section className="adm-card"><h2 className="adm-card__title">Yeni admin</h2><ActionForm action={createAdminAction} reset>
      <label className="adm-field">E-posta<input name="email" type="email" maxLength={190} required autoComplete="off" /></label>
      <label className="adm-field">Geçici şifre<input name="password" type="password" minLength={10} maxLength={200} required autoComplete="new-password" /></label>
      <p className="adm-note">İlk girişte şifresini değiştirmesi gerekir. Geçici şifreyi kendisine ilet.</p>
      <button type="submit" className="adm-btn adm-btn--main">Admin oluştur</button>
    </ActionForm></section>
    <ul className="adm-history">{admins.map(admin => <li key={admin.id} className="adm-card" data-testid="admin-row"><strong>{admin.email}</strong><p className="adm-note">{admin.mustChangePassword ? "İlk girişte şifre değişecek" : "Aktif"}</p><ActionForm action={deleteAdminAction}><input type="hidden" name="id" value={admin.id} /><button type="submit" className="adm-btn adm-btn--danger" disabled={admin.id === actor.adminId || admins.length <= 1}>Sil</button></ActionForm></li>)}</ul>
  </>;
}
export default function UsersPage() { return <><p className="adm-crumb"><Link href="/qr/admin">← Menü yönetimi</Link></p><h1 className="adm-h1">Kullanıcılar</h1><p className="adm-lead">Kendi hesabın ve son admin silinemez. Hesap işlemleri geri alınamaz.</p><Suspense fallback={<p>Yükleniyor…</p>}><Content /></Suspense></>; }

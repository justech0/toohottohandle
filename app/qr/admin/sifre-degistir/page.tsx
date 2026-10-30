import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { currentAdmin } from "@/lib/auth/session";
import { ActionForm } from "../_components/ActionForm";
import { changePasswordAction } from "./actions";
async function Content() {
  await connection(); const admin = await currentAdmin(); if (!admin) redirect("/qr/admin/giris"); if (!admin.mustChangePassword) redirect("/qr/admin");
  return <section className="adm-card"><h1 className="adm-h1">Şifreni değiştir</h1><p className="adm-lead">Devam etmek için geçici şifren yerine yeni bir şifre belirle.</p><ActionForm action={changePasswordAction}>
    <label className="adm-field">Mevcut şifre<input name="current" type="password" autoComplete="current-password" required /></label>
    <label className="adm-field">Yeni şifre<input name="password" type="password" minLength={10} maxLength={200} autoComplete="new-password" required /></label>
    <label className="adm-field">Yeni şifre tekrar<input name="again" type="password" minLength={10} maxLength={200} autoComplete="new-password" required /></label>
    <button className="adm-btn adm-btn--main" type="submit">Şifreyi değiştir</button>
  </ActionForm></section>;
}
export default function PasswordPage() { return <Suspense fallback={<p>Yükleniyor…</p>}><Content /></Suspense>; }

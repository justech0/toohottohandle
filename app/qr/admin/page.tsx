import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";
import { hasDb } from "@/lib/db/client";
import { logout, logoutEverywhere } from "./actions";

async function Content() {
  await connection();
  if (!hasDb()) redirect("/qr/admin/giris");
  const admin = await requireAdmin();
  return (
    <>
      <p className="adm-lead" data-testid="admin-email">{admin.email}</p>
      <section className="adm-card">
        <p className="adm-note">Ürün, fiyat ve ayar ekranları sıradaki adımlarda bu sayfaya eklenecek.</p>
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

export default function AdminHome() {
  return (
    <>
      <h1 className="adm-h1">Menü yönetimi</h1>
      <Suspense fallback={null}>
        <Content />
      </Suspense>
    </>
  );
}

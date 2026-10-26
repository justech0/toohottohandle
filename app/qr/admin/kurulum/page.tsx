import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { countAdmins } from "@/lib/auth/core";
import { getPool, hasDb } from "@/lib/db/client";
import { setup } from "../actions";
import { AuthForm } from "../_components/AuthForm";

/** İlk admin hesabı. Admin varsa giriş sayfasına gider. Kod yalnızca sunucu kaydındadır. */
async function Content() {
  await connection();
  if (!hasDb() || (await countAdmins(getPool())) > 0) redirect("/qr/admin/giris");
  return (
    <AuthForm
      action={setup}
      submit="Hesabı oluştur"
      fields={[
        { name: "code", label: "Kurulum kodu", type: "text", autoComplete: "one-time-code", hint: "Sunucu kaydında \"[admin] Kurulum kodu\" satırında yazar." },
        { name: "email", label: "E-posta", type: "email", autoComplete: "username" },
        { name: "password", label: "Şifre (en az 10 karakter)", type: "password", autoComplete: "new-password" },
        { name: "password2", label: "Şifre (tekrar)", type: "password", autoComplete: "new-password" },
      ]}
    />
  );
}

export default function SetupPage() {
  return (
    <>
      <h1 className="adm-h1">Kurulum</h1>
      <p className="adm-lead">Tek admin hesabını oluştur. Bu sayfa yalnızca bir kez açılır.</p>
      <Suspense fallback={null}>
        <Content />
      </Suspense>
    </>
  );
}

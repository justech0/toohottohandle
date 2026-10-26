import { Suspense } from "react";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { hasCode } from "@/lib/auth/oneTimeCode";
import { resetPassword } from "../actions";
import { AuthForm } from "../_components/AuthForm";

/** Yalnızca sunucu bir sıfırlama kodu ürettiyse açılır (lib/auth/resetFlag.ts). */
async function Content() {
  await connection();
  if (!hasCode("reset")) notFound();
  return (
    <AuthForm
      action={resetPassword}
      submit="Şifreyi değiştir"
      fields={[
        { name: "code", label: "Sıfırlama kodu", type: "text", autoComplete: "one-time-code", hint: "Sunucu kaydında \"[admin] Şifre sıfırlama kodu\" satırında yazar." },
        { name: "password", label: "Yeni şifre (en az 10 karakter)", type: "password", autoComplete: "new-password" },
        { name: "password2", label: "Yeni şifre (tekrar)", type: "password", autoComplete: "new-password" },
      ]}
    />
  );
}

export default function ResetPage() {
  return (
    <>
      <h1 className="adm-h1">Şifre sıfırla</h1>
      <p className="adm-lead">Yeni şifre bütün cihazlardaki oturumları kapatır.</p>
      <Suspense fallback={null}>
        <Content />
      </Suspense>
    </>
  );
}

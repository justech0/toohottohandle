import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { countAdmins } from "@/lib/auth/core";
import { currentAdmin } from "@/lib/auth/session";
import { getPool, hasDb } from "@/lib/db/client";
import { login } from "../actions";
import { AuthForm } from "../_components/AuthForm";

async function Content({ searchParams }: { searchParams: Promise<{ sifirlandi?: string }> }) {
  await connection();
  if (!hasDb()) return <p className="adm-error">Veritabanı bağlı değil.</p>;
  if ((await countAdmins(getPool())) === 0) redirect("/qr/admin/kurulum");
  if (await currentAdmin()) redirect("/qr/admin");
  const { sifirlandi } = await searchParams;
  return (
    <>
      {sifirlandi ? <p className="adm-ok">Şifren değişti. Yeni şifrenle giriş yap.</p> : null}
      <AuthForm
        action={login}
        submit="Giriş yap"
        fields={[
          { name: "email", label: "E-posta", type: "email", autoComplete: "username" },
          { name: "password", label: "Şifre", type: "password", autoComplete: "current-password" },
        ]}
      />
    </>
  );
}

export default function LoginPage(props: { searchParams: Promise<{ sifirlandi?: string }> }) {
  return (
    <>
      <h1 className="adm-h1">Giriş</h1>
      <p className="adm-lead">Menüyü düzenlemek için giriş yap.</p>
      <Suspense fallback={null}>
        <Content {...props} />
      </Suspense>
    </>
  );
}

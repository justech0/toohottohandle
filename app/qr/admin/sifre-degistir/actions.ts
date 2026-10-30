"use server";
import { redirect } from "next/navigation";
import { currentAdmin, setSessionCookie } from "@/lib/auth/session";
import { createSession } from "@/lib/auth/core";
import { changeTemporaryPassword } from "@/lib/admin/users";
import { getPool } from "@/lib/db/client";
export async function changePasswordAction(form: FormData) {
  const admin = await currentAdmin(); if (!admin) redirect("/qr/admin/giris");
  if (!admin.mustChangePassword) redirect("/qr/admin");
  if (form.get("password") !== form.get("again")) return { error: "Şifreler aynı değil." };
  try { await changeTemporaryPassword(getPool(), admin.adminId, String(form.get("current") ?? ""), String(form.get("password") ?? "")); }
  catch (error) { return { error: (error as Error).message }; }
  const session = await createSession(getPool(), admin.adminId); await setSessionCookie(session.token, session.expires);
  redirect("/qr/admin");
}

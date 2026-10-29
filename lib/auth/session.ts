import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getPool } from "@/lib/db/client";
import { findSession } from "./core";

export const COOKIE = "thth_admin";

export async function setSessionCookie(token: string, expires: Date): Promise<void> {
  (await cookies()).set(COOKIE, token, { httpOnly: true, secure: true, sameSite: "strict", path: "/qr", expires });
}

export async function clearSessionCookie(): Promise<void> {
  (await cookies()).delete({ name: COOKIE, path: "/qr" });
}

export async function sessionToken(): Promise<string | null> {
  return (await cookies()).get(COOKIE)?.value ?? null;
}

export async function currentAdmin(): Promise<{ adminId: number; email: string; mustChangePassword: boolean } | null> {
  const token = await sessionToken();
  return token ? findSession(getPool(), token) : null;
}

/** Oturum yoksa giriş sayfasına gönderir. */
export async function requireAdmin(): Promise<{ adminId: number; email: string; mustChangePassword: boolean }> {
  const admin = await currentAdmin();
  if (!admin) redirect("/qr/admin/giris");
  if (admin.mustChangePassword) redirect("/qr/admin/sifre-degistir");
  return admin;
}

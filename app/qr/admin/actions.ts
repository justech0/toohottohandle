"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getPool } from "@/lib/db/client";
import { clientIp } from "@/lib/auth/clientIp";
import {
  MIN_PASSWORD, attemptLogin, countAdmins, createFirstAdmin, createSession, deleteAllSessions, deleteSession, resetOnlyAdminPassword,
} from "@/lib/auth/core";
import { takeCode } from "@/lib/auth/oneTimeCode";
import { clearResetRequest } from "@/lib/auth/resetFlag";
import { clearSessionCookie, requireAdmin, sessionToken, setSessionCookie } from "@/lib/auth/session";
import { cleanupHistory } from "@/lib/admin/history";
import { cleanupOrphanedImages } from "@/lib/storage/images";

/** Hata olunca e-posta ve kod geri gelir; şifreler asla geri gönderilmez. */
export type FormState = { error: string | null; values?: Record<string, string> };

const text = (f: FormData, k: string) => String(f.get(k) ?? "");
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function checkNewPassword(pw: string, again: string): string | null {
  if (pw.length < MIN_PASSWORD) return `Şifre en az ${MIN_PASSWORD} karakter olmalı.`;
  if (pw.length > 200) return "Şifre en fazla 200 karakter olabilir.";
  if (pw !== again) return "Şifreler aynı değil.";
  return null;
}

async function startSession(adminId: number): Promise<void> {
  const { token, expires } = await createSession(getPool(), adminId);
  await setSessionCookie(token, expires);
}

export async function login(_: FormState, f: FormData): Promise<FormState> {
  const email = text(f, "email");
  const password = text(f, "password");
  const values = { email };
  if (!email || !password) return { error: "E-posta ve şifreyi yaz.", values };
  const r = await attemptLogin(getPool(), { ip: clientIp(await headers()), email, password: password.slice(0, 200) });
  if (!r.ok) {
    return { error: r.reason === "locked" ? `Çok fazla yanlış deneme. ${r.minutes} dakika sonra tekrar dene.` : "E-posta ya da şifre yanlış.", values };
  }
  await cleanupHistory(getPool());
  await startSession(r.adminId);
  await cleanupOrphanedImages(getPool()).catch((error) => console.error("[storage] yetim fotoğraf temizliği başarısız", (error as Error).message));
  redirect("/qr/admin");
}

export async function setup(_: FormState, f: FormData): Promise<FormState> {
  const email = text(f, "email").trim();
  const values = { email, code: text(f, "code") };
  if (!EMAIL.test(email)) return { error: "Geçerli bir e-posta yaz.", values };
  const bad = checkNewPassword(text(f, "password"), text(f, "password2"));
  if (bad) return { error: bad, values };
  if ((await countAdmins(getPool())) > 0) return { error: "Admin hesabı zaten var. Giriş sayfasını kullan." };
  if (!takeCode("setup", text(f, "code"))) return { error: "Kurulum kodu geçersiz. Sunucu kaydındaki son kodu kullan.", values };
  const id = await createFirstAdmin(getPool(), email, text(f, "password"));
  await startSession(id);
  redirect("/qr/admin");
}

export async function resetPassword(_: FormState, f: FormData): Promise<FormState> {
  const values = { code: text(f, "code") };
  const bad = checkNewPassword(text(f, "password"), text(f, "password2"));
  if (bad) return { error: bad, values };
  if (!takeCode("reset", text(f, "code"))) return { error: "Sıfırlama kodu geçersiz. Sunucu kaydındaki son kodu kullan.", values };
  await resetOnlyAdminPassword(getPool(), text(f, "password"));
  await clearResetRequest();
  await clearSessionCookie();
  redirect("/qr/admin/giris?sifirlandi=1");
}

export async function logout(): Promise<void> {
  const token = await sessionToken();
  if (token) await deleteSession(getPool(), token);
  await clearSessionCookie();
  redirect("/qr/admin/giris");
}

export async function logoutEverywhere(): Promise<void> {
  const admin = await requireAdmin();
  await deleteAllSessions(getPool(), admin.adminId);
  await clearSessionCookie();
  redirect("/qr/admin/giris");
}

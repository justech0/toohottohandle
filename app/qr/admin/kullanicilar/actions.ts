"use server";
import { requireAdmin } from "@/lib/auth/session";
import { getPool } from "@/lib/db/client";
import { createAdmin, deleteAdmin } from "@/lib/admin/users";
export async function createAdminAction(form: FormData) {
  const admin = await requireAdmin();
  try { await createAdmin(getPool(), admin.adminId, String(form.get("email") ?? ""), String(form.get("password") ?? "")); }
  catch (error) { return { error: (error as Error).message }; }
  return {};
}
export async function deleteAdminAction(form: FormData) {
  const admin = await requireAdmin();
  try { await deleteAdmin(getPool(), admin.adminId, Number(form.get("id"))); }
  catch (error) { return { error: (error as Error).message }; }
  return {};
}

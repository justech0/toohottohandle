"use server";
import { updateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth/session";
import { getPool } from "@/lib/db/client";
import { saveSuggestSettings } from "@/lib/admin/suggestions";
export async function saveSuggestAction(form: FormData) {
  const admin = await requireAdmin();
  try { await saveSuggestSettings(getPool(), admin.adminId, { mode: String(form.get("suggestMode")), preferPhotos: form.get("preferPhotos") === "on", productIds: form.getAll("productIds").map(Number) }); }
  catch (error) { return { error: (error as Error).message }; }
  updateTag("menu"); return {};
}

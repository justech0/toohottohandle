"use server";
import { updateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth/session";
import { getPool } from "@/lib/db/client";
import { saveSuggestSettings } from "@/lib/admin/suggestions";
const weightsOf = (form: FormData) => Object.fromEntries([...form.entries()].filter(([key]) => /^weight-\d+$/.test(key)).map(([key, value]) => [Number(key.slice(7)), Number(value)]));
export async function saveSuggestAction(form: FormData) {
  const admin = await requireAdmin();
  try { await saveSuggestSettings(getPool(), admin.adminId, { mode: String(form.get("suggestMode")), preferPhotos: form.get("preferPhotos") === "on", productIds: form.getAll("productIds").map(Number), weights: weightsOf(form) }); }
  catch (error) { return { error: (error as Error).message }; }
  updateTag("menu"); return {};
}

"use server";
import { updateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth/session";
import { getPool } from "@/lib/db/client";
import { saveSlide, deleteSlide } from "@/lib/admin/hero";

export async function saveSlideAction(form: FormData) {
  const admin = await requireAdmin();
  try {
    const rawKey = String(form.get("imageKey") ?? "");
    await saveSlide(getPool(), admin.adminId, form.get("id") ? Number(form.get("id")) : null, {
      title: String(form.get("title") ?? ""), imageKey: rawKey === "__default__" ? null : rawKey,
      color: String(form.get("color")), icon: String(form.get("icon")), sortOrder: Number(form.get("sortOrder")),
      isVisible: form.get("isVisible") === "on", focusX: Number(form.get("imageFocusX")), focusY: Number(form.get("imageFocusY")),
    });
  } catch (error) { return { error: (error as Error).message }; }
  updateTag("menu"); return {};
}
export async function deleteSlideAction(form: FormData) {
  const admin = await requireAdmin();
  try { await deleteSlide(getPool(), admin.adminId, Number(form.get("id"))); }
  catch (error) { return { error: (error as Error).message }; }
  updateTag("menu"); return {};
}

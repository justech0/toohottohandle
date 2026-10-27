"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";
import { getPool } from "@/lib/db/client";
import { savePosterPhoto, type PhotoTarget } from "@/lib/admin/photos";

export type PosterState = { error: string | null };

export async function savePosterPhotoAction(_: PosterState, form: FormData): Promise<PosterState> {
  const admin = await requireAdmin();
  const target = String(form.get("target"));
  const id = Number(form.get("id"));
  if (target !== "group" && target !== "category") return { error: "Afiş türü geçersiz." };
  try {
    await savePosterPhoto(
      getPool(), admin.adminId, target as PhotoTarget, id, String(form.get("imageKey") ?? ""),
      Number(form.get("imageFocusX")), Number(form.get("imageFocusY")),
    );
  } catch (error) {
    const safe = new Set(["Afiş bulunamadı.", "Fotoğraf odağı geçersiz.", "Fotoğraf anahtarı geçersiz.", "Fotoğraf bulunamadı. Tekrar yükle."]);
    return { error: error instanceof Error && safe.has(error.message) ? error.message : "Fotoğraf kaydedilemedi. Tekrar dene." };
  }
  updateTag("menu");
  redirect(`/qr/admin/fotograflar?kaydedildi=${target}-${id}#${target}-${id}`);
}

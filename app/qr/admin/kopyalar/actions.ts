"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";
import { getPool } from "@/lib/db/client";
import { restoreMenuSnapshot } from "@/lib/admin/snapshots";

export type RestoreState = { error: string | null };

export async function restoreSnapshotAction(_: RestoreState, form: FormData): Promise<RestoreState> {
  const admin = await requireAdmin();
  const id = Number(form.get("id"));
  if (!Number.isInteger(id) || id < 1) return { error: "Menü kopyası bulunamadı." };
  try {
    await restoreMenuSnapshot(getPool(), admin.adminId, id);
  } catch (error) {
    const message = error instanceof Error && ["Menü kopyası bulunamadı.", "Menü kopyası bozuk."].includes(error.message)
      ? error.message : "Kopyaya dönülemedi. Menü değiştirilmedi.";
    return { error: message };
  }
  updateTag("menu");
  revalidatePath("/qr");
  redirect("/qr/admin/kopyalar?donuldu=1");
}

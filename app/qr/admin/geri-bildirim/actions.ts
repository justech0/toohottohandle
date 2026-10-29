"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/session";
import { getPool } from "@/lib/db/client";
import { deleteFeedback, markFeedbackRead } from "@/lib/feedback/store";

export async function changeFeedback(id: number, operation: "read" | "delete"): Promise<{ error?: string }> {
  await requireAdmin();
  if (!Number.isSafeInteger(id) || id < 1 || !["read", "delete"].includes(operation)) return { error: "İşlem geçersiz." };
  try {
    if (operation === "read") await markFeedbackRead(getPool(), id);
    else await deleteFeedback(getPool(), id);
    revalidatePath("/qr/admin/geri-bildirim");
    revalidatePath("/qr/admin");
    return {};
  } catch { return { error: "İşlem tamamlanamadı. Tekrar dene." }; }
}

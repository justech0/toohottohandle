"use server";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";
import { getPool } from "@/lib/db/client";
import { catalogData, saveSettings } from "@/lib/admin/catalog";
import { parseSettingsInput } from "@/lib/admin/catalogInput";
import type { CatalogState } from "../katalog/actions";
export async function saveWifiAction(_: CatalogState, form: FormData): Promise<CatalogState> {
 const admin = await requireAdmin();
 const data = await catalogData(getPool());
 const fields = Object.fromEntries(["wifiSsid", "wifiUsername", "wifiPassword", "wifiNoteTr", "wifiNoteEn", "wifiNoteAr", "statsEnabled"].map(k => [k, String(form.get(k) ?? "")]));
 const parsed = parseSettingsInput({ ...Object.fromEntries(Object.entries(data.settings).map(([k,v]) => [k, String(v ?? "")])), statsEnabled: "", ...fields });
 if (!parsed.ok) return { error: parsed.error };
 try { await saveSettings(getPool(), admin.adminId, parsed.value, "wifi"); } catch { return { error: "Ayarlar kaydedilemedi. Tekrar dene." }; }
 updateTag("menu"); redirect("/qr/admin/istatistik?kaydedildi=1#settings");
}

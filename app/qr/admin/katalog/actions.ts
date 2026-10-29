"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { getPool } from "@/lib/db/client";
import { requireAdmin } from "@/lib/auth/session";
import {
  catalogData, addTag, deleteCategory, deleteExtra, deleteGroup, saveCategory, saveExtra, saveGroup, saveSettings,
} from "@/lib/admin/catalog";
import {
  parseCategoryInput, parseExtraInput, parseGroupInput, parseSettingsInput, parseTagInput,
} from "@/lib/admin/catalogInput";

export type CatalogState = { error: string | null };
export type CatalogAction = (state: CatalogState, formData: FormData) => Promise<CatalogState>;

const raw = (formData: FormData, fields: string[]) => Object.fromEntries(fields.map((field) => [field, String(formData.get(field) ?? "")]));
const idOf = (formData: FormData) => {
  const value = Number(formData.get("id"));
  return Number.isInteger(value) && value > 0 ? value : null;
};
const done = (anchor: string): never => {
  updateTag("menu");
  redirect(`/qr/admin/katalog?kaydedildi=1#${anchor}`);
};
const fail = (error: unknown): CatalogState => ({ error: (error as Error).message || "Kaydedilemedi. Tekrar deneyin." });

export async function saveGroupAction(_: CatalogState, formData: FormData): Promise<CatalogState> {
  const parsed = parseGroupInput(raw(formData, ["name", "nameEn", "nameAr", "color", "sortOrder"]));
  if (!parsed.ok) return { error: parsed.error };
  let id: number;
  try {
    const admin = await requireAdmin();
    id = await saveGroup(getPool(), admin.adminId, idOf(formData), parsed.value);
  } catch (error) { return fail(error); }
  return done(`group-${id}`);
}

export async function deleteGroupAction(_: CatalogState, formData: FormData): Promise<CatalogState> {
  const id = idOf(formData);
  if (!id) return { error: "Grup bulunamadı." };
  try {
    const admin = await requireAdmin();
    await deleteGroup(getPool(), admin.adminId, id);
  } catch (error) { return fail(error); }
  return done("groups");
}

export async function saveCategoryAction(_: CatalogState, formData: FormData): Promise<CatalogState> {
  const parsed = parseCategoryInput(raw(formData, ["name", "nameEn", "nameAr", "groupId", "sortOrder", "isVisible", "defaultInSuggest", "defaultTemp"]));
  if (!parsed.ok) return { error: parsed.error };
  let id: number;
  try {
    const admin = await requireAdmin();
    id = await saveCategory(getPool(), admin.adminId, idOf(formData), parsed.value);
  } catch (error) { return fail(error); }
  return done(`category-${id}`);
}

export async function deleteCategoryAction(_: CatalogState, formData: FormData): Promise<CatalogState> {
  const id = idOf(formData);
  if (!id) return { error: "Kategori bulunamadı." };
  try {
    const admin = await requireAdmin();
    await deleteCategory(getPool(), admin.adminId, id);
  } catch (error) { return fail(error); }
  return done("categories");
}

export async function saveExtraAction(_: CatalogState, formData: FormData): Promise<CatalogState> {
  const parsed = parseExtraInput({
    ...raw(formData, ["name", "nameEn", "nameAr", "price"]),
    categoryIds: formData.getAll("categoryIds").map(String),
  });
  if (!parsed.ok) return { error: parsed.error };
  let id: number;
  try {
    const admin = await requireAdmin();
    id = await saveExtra(getPool(), admin.adminId, idOf(formData), parsed.value);
  } catch (error) { return fail(error); }
  return done(`extra-${id}`);
}

export async function deleteExtraAction(_: CatalogState, formData: FormData): Promise<CatalogState> {
  const id = idOf(formData);
  if (!id) return { error: "Ekstra bulunamadı." };
  try {
    const admin = await requireAdmin();
    await deleteExtra(getPool(), admin.adminId, id);
  } catch (error) { return fail(error); }
  return done("extras");
}

export async function addTagAction(_: CatalogState, formData: FormData): Promise<CatalogState> {
  const parsed = parseTagInput(raw(formData, ["name"]));
  if (!parsed.ok) return { error: parsed.error };
  let id: number;
  try {
    const admin = await requireAdmin();
    id = await addTag(getPool(), admin.adminId, parsed.value);
  } catch (error) { return fail(error); }
  return done(`tag-${id}`);
}

export async function saveSettingsAction(_: CatalogState, formData: FormData): Promise<CatalogState> {
  const admin = await requireAdmin();
  const data = await catalogData(getPool());
  const parsed = parseSettingsInput({ ...Object.fromEntries(Object.entries(data.settings).map(([k,v]) => [k, String(v ?? "")])), statsEnabled: data.settings.statsEnabled ? "on" : "", ...raw(formData, ["openingTime", "footerNoteTr", "footerNoteEn", "footerNoteAr"]) });
  if (!parsed.ok) return { error: parsed.error };
  try { await saveSettings(getPool(), admin.adminId, parsed.value, "catalog"); }
  catch (error) { return fail(error); }
  return done("settings");
}

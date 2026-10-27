"use client";

import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { parseProductInput, priceChanges } from "@/lib/admin/productInput";
import type { AdminCategory, AdminTag } from "@/lib/admin/products";
import { saveProductAction, type SaveState } from "../urunler/actions";
import { PhotoPicker } from "./PhotoPicker";

const SIZE_OPTIONS: [string, string, string[]][] = [
  ["none", "Boy yok (tek fiyat)", ["Fiyat (₺)"]],
  ["normal-buyuk", "Normal + Büyük", ["Normal (₺)", "Büyük (₺)"]],
  ["tek-duble", "Tek + Duble", ["Tek (₺)", "Duble (₺)"]],
  ["normal", "Yalnızca Normal", ["Normal (₺)"]],
  ["buyuk", "Yalnızca Büyük", ["Büyük (₺)"]],
  ["tek", "Yalnızca Tek", ["Tek (₺)"]],
  ["duble", "Yalnızca Duble", ["Duble (₺)"]],
];

const readForm = (form: HTMLFormElement) => Object.fromEntries([...new FormData(form).entries()].map(([k, v]) => [k, String(v)]));

/**
 * Ürün düzenleme. Form React'in kendiliğinden sıfırlamasına bırakılmaz (hata sonrası yazılanlar kalır).
 * Fiyat değişiyorsa kaydetmeden önce eski → yeni gösterilir (spec 4.2). Kaydedilmemiş değişiklikte çıkarken sorar.
 */
export function ProductForm({ initial, categories, tags }: { initial: Record<string, string>; categories: AdminCategory[]; tags: AdminTag[] }) {
  const [state, action, pending] = useActionState<SaveState, FormData>(saveProductAction, { error: null });
  const [sizes, setSizes] = useState(initial.sizes);
  const [confirm, setConfirm] = useState<string[] | null>(null);
  const [dirty, setDirty] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const confirmRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  useEffect(() => {
    if (confirm && !confirmRef.current?.open) confirmRef.current?.showModal();
  }, [confirm]);

  const send = () => {
    const fd = new FormData(formRef.current!);
    setConfirm(null);
    setDirty(false);
    startTransition(() => action(fd));
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const now = parseProductInput(readForm(e.currentTarget));
    const was = parseProductInput(initial);
    if (now.ok && was.ok) {
      const changes = priceChanges(was.value.variants, now.value.variants);
      if (changes.length) return setConfirm(changes);
    }
    send();
  };

  const labels = SIZE_OPTIONS.find(([k]) => k === sizes)?.[2] ?? ["Fiyat (₺)"];
  const groups = [...new Set(categories.map((c) => c.groupName))];
  const selectedTags = new Set((initial.tagIds ?? "").split(",").filter(Boolean));

  return (
    <form ref={formRef} className="adm-form" onSubmit={onSubmit} onChange={() => setDirty(true)} noValidate>
      <input type="hidden" name="id" value={initial.id} />
      <p role="alert" className={state.error ? "adm-error" : "sr-only"} data-testid="form-error">{state.error ?? ""}</p>

      <label className="adm-field">Ürün adı<input name="name" defaultValue={initial.name} maxLength={160} required /></label>
      <label className="adm-field">
        Kategori
        <select name="categoryId" defaultValue={initial.categoryId}>
          {groups.map((g) => (
            <optgroup key={g} label={g}>
              {categories.filter((c) => c.groupName === g).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </optgroup>
          ))}
        </select>
      </label>

      <PhotoPicker initialKey={initial.imageKey} initialFocusX={Number(initial.imageFocusX)} initialFocusY={Number(initial.imageFocusY)} label="Ürün fotoğrafı" />

      <fieldset className="adm-fieldset">
        <legend>Boy ve fiyat</legend>
        <label className="adm-field">
          Boy
          <select name="sizes" value={sizes} onChange={(e) => setSizes(e.target.value)}>
            {SIZE_OPTIONS.map(([k, label]) => <option key={k} value={k}>{label}</option>)}
          </select>
        </label>
        <div className="adm-row">
          {labels.map((label, i) => (
            <label key={`${sizes}-${i}`} className="adm-field adm-field--price">
              {label}
              <input name={`price${i}`} inputMode="decimal" defaultValue={initial[`price${i}`]} autoComplete="off" />
            </label>
          ))}
        </div>
      </fieldset>

      <label className="adm-field">Açıklama<textarea name="descTr" defaultValue={initial.descTr} maxLength={1000} rows={3} /></label>
      <label className="adm-field">İçindekiler<textarea name="ingredientsTr" defaultValue={initial.ingredientsTr} maxLength={1000} rows={2} /></label>

      <div className="adm-row">
        <label className="adm-field">
          Sıcak / soğuk
          <select name="temp" defaultValue={initial.temp}>
            <option value="">Kategoriye göre</option>
            <option value="hot">Sıcak</option>
            <option value="cold">Soğuk</option>
          </select>
        </label>
        <label className="adm-field">
          Ne içsem&apos;e dahil
          <select name="inSuggest" defaultValue={initial.inSuggest}>
            <option value="">Kategoriye göre</option>
            <option value="yes">Evet</option>
            <option value="no">Hayır</option>
          </select>
        </label>
      </div>

      <div className="adm-checks">
        <label><input type="checkbox" name="isVisible" defaultChecked={initial.isVisible === "on"} /> Menüde görünür</label>
        <label><input type="checkbox" name="isNew" defaultChecked={initial.isNew === "on"} /> Yeni</label>
        <label><input type="checkbox" name="isFeatured" defaultChecked={initial.isFeatured === "on"} /> Öne çıkan</label>
      </div>

      <fieldset className="adm-fieldset">
        <legend>Etiketler (en fazla 3)</legend>
        <div className="adm-check-grid">
          {tags.map((tag) => (
            <label key={tag.id}><input type="checkbox" name="tagIds" value={tag.id} defaultChecked={selectedTags.has(String(tag.id))} /> {tag.name}</label>
          ))}
        </div>
      </fieldset>

      {confirm ? (
        <dialog ref={confirmRef} className="adm-confirm adm-dialog" aria-labelledby="price-confirm-title" data-testid="price-confirm" onClose={() => setConfirm(null)}>
          <p id="price-confirm-title" className="adm-confirm__title">Fiyat değişiyor</p>
          <ul>{confirm.map((c) => <li key={c}>{c}</li>)}</ul>
          <div className="adm-row">
            <button type="button" className="adm-btn adm-btn--main" onClick={send} autoFocus>Evet, kaydet</button>
            <button type="button" className="adm-btn" onClick={() => confirmRef.current?.close()}>Vazgeç</button>
          </div>
        </dialog>
      ) : (
        <div className="adm-row">
          <button type="submit" className="adm-btn adm-btn--main" disabled={pending} aria-busy={pending}>{pending ? "Kaydediliyor…" : "Kaydet"}</button>
          <Link href="/qr/admin/urunler" className="adm-btn adm-btn--link">Vazgeç</Link>
        </div>
      )}
    </form>
  );
}

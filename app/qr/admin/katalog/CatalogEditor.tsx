"use client";

import { startTransition, useActionState, type ReactNode } from "react";
import type { CatalogData } from "@/lib/admin/catalog";
import type { CatalogAction, CatalogState } from "./actions";
import {
  addTagAction, deleteCategoryAction, deleteExtraAction, deleteGroupAction, saveCategoryAction, saveExtraAction, saveGroupAction, saveSettingsAction,
} from "./actions";

const initialState: CatalogState = { error: null };
const COLORS = ["red", "yellow", "pink", "blue", "green", "gray"];

function ActionForm({ action, children, className = "adm-form", testId }: { action: CatalogAction; children: ReactNode; className?: string; testId?: string }) {
  const [state, submit, pending] = useActionState(action, initialState);
  return (
    <form
      className={className}
      data-testid={testId}
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        startTransition(() => submit(formData));
      }}
      noValidate
    >
      {children}
      <p role="alert" className={state.error ? "adm-error" : "sr-only"}>{state.error ?? ""}</p>
      <input type="hidden" name="pending" value={pending ? "1" : "0"} />
    </form>
  );
}

const SaveButton = ({ children }: { children: ReactNode }) => <button type="submit" className="adm-btn adm-btn--main">{children}</button>;
const DeleteForm = ({ action, id, label }: { action: CatalogAction; id: number; label: string }) => (
  <ActionForm action={action} className="adm-delete">
    <input type="hidden" name="id" value={id} />
    <button type="submit" className="adm-btn adm-btn--danger">{label}</button>
  </ActionForm>
);

export function CatalogEditor({ data }: { data: CatalogData }) {
  return (
    <>
      <section id="groups" className="adm-section" aria-labelledby="groups-title">
        <h2 id="groups-title" className="adm-card__title">Gruplar</h2>
        {data.groups.map((group) => (
          <article className="adm-card" id={`group-${group.id}`} key={group.id}>
            <ActionForm action={saveGroupAction} testId={`group-form-${group.id}`}>
              <input type="hidden" name="id" value={group.id} />
              <label className="adm-field">Grup adı<input name="name" defaultValue={group.name} maxLength={120} required /></label>
              <div className="adm-row">
                <label className="adm-field">Renk<select name="color" defaultValue={group.color}>{COLORS.map((color) => <option key={color}>{color}</option>)}</select></label>
                <label className="adm-field">Sıra<input name="sortOrder" type="number" min="0" max="10000" defaultValue={group.sortOrder} /></label>
              </div>
              <SaveButton>Grubu kaydet</SaveButton>
            </ActionForm>
            <DeleteForm action={deleteGroupAction} id={group.id} label="Grubu sil" />
          </article>
        ))}
        <article className="adm-card">
          <h3 className="adm-subtitle">Yeni grup</h3>
          <ActionForm action={saveGroupAction}>
            <label className="adm-field">Grup adı<input name="name" maxLength={120} required /></label>
            <div className="adm-row">
              <label className="adm-field">Renk<select name="color" defaultValue="red">{COLORS.map((color) => <option key={color}>{color}</option>)}</select></label>
              <label className="adm-field">Sıra<input name="sortOrder" type="number" min="0" max="10000" defaultValue={data.groups.length} /></label>
            </div>
            <SaveButton>Grup ekle</SaveButton>
          </ActionForm>
        </article>
      </section>

      <section id="categories" className="adm-section" aria-labelledby="categories-title">
        <h2 id="categories-title" className="adm-card__title">Kategoriler</h2>
        {data.categories.map((category) => (
          <article className="adm-card" id={`category-${category.id}`} key={category.id}>
            <ActionForm action={saveCategoryAction}>
              <input type="hidden" name="id" value={category.id} />
              <label className="adm-field">Kategori adı<input name="name" defaultValue={category.name} maxLength={120} required /></label>
              <div className="adm-row">
                <label className="adm-field">Grup<select name="groupId" defaultValue={category.groupId}>{data.groups.map((group) => <option key={group.id} value={group.id}>{group.name}</option>)}</select></label>
                <label className="adm-field">Sıra<input name="sortOrder" type="number" min="0" max="10000" defaultValue={category.sortOrder} /></label>
              </div>
              <label className="adm-field">Varsayılan sıcak / soğuk<select name="defaultTemp" defaultValue={category.defaultTemp ?? ""}><option value="">Yok</option><option value="hot">Sıcak</option><option value="cold">Soğuk</option></select></label>
              <div className="adm-checks">
                <label><input name="isVisible" type="checkbox" defaultChecked={category.isVisible} /> Menüde görünür</label>
                <label><input name="defaultInSuggest" type="checkbox" defaultChecked={category.defaultInSuggest} /> Ne içsem varsayılanı</label>
              </div>
              <SaveButton>Kategoriyi kaydet</SaveButton>
            </ActionForm>
            <DeleteForm action={deleteCategoryAction} id={category.id} label="Kategoriyi sil" />
          </article>
        ))}
        <article className="adm-card">
          <h3 className="adm-subtitle">Yeni kategori</h3>
          <ActionForm action={saveCategoryAction}>
            <label className="adm-field">Kategori adı<input name="name" maxLength={120} required /></label>
            <div className="adm-row">
              <label className="adm-field">Grup<select name="groupId">{data.groups.map((group) => <option key={group.id} value={group.id}>{group.name}</option>)}</select></label>
              <label className="adm-field">Sıra<input name="sortOrder" type="number" min="0" max="10000" defaultValue={data.categories.length} /></label>
            </div>
            <label className="adm-field">Varsayılan sıcak / soğuk<select name="defaultTemp"><option value="">Yok</option><option value="hot">Sıcak</option><option value="cold">Soğuk</option></select></label>
            <div className="adm-checks"><label><input name="isVisible" type="checkbox" defaultChecked /> Menüde görünür</label><label><input name="defaultInSuggest" type="checkbox" /> Ne içsem varsayılanı</label></div>
            <SaveButton>Kategori ekle</SaveButton>
          </ActionForm>
        </article>
      </section>

      <section id="extras" className="adm-section" aria-labelledby="extras-title">
        <h2 id="extras-title" className="adm-card__title">Ekstralar</h2>
        {data.extras.map((extra) => (
          <article className="adm-card" id={`extra-${extra.id}`} key={extra.id}>
            <ActionForm action={saveExtraAction}>
              <input type="hidden" name="id" value={extra.id} />
              <div className="adm-row">
                <label className="adm-field">Ekstra adı<input name="name" defaultValue={extra.name} maxLength={120} required /></label>
                <label className="adm-field">Fiyat (₺)<input name="price" inputMode="decimal" defaultValue={(extra.priceKurus / 100).toLocaleString("tr-TR", { maximumFractionDigits: 2 })} /></label>
              </div>
              <CategoryChecks categories={data.categories} selected={extra.categoryIds} />
              <SaveButton>Ekstrayı kaydet</SaveButton>
            </ActionForm>
            <DeleteForm action={deleteExtraAction} id={extra.id} label="Ekstrayı sil" />
          </article>
        ))}
        <article className="adm-card">
          <h3 className="adm-subtitle">Yeni ekstra</h3>
          <ActionForm action={saveExtraAction}>
            <div className="adm-row"><label className="adm-field">Ekstra adı<input name="name" maxLength={120} required /></label><label className="adm-field">Fiyat (₺)<input name="price" inputMode="decimal" /></label></div>
            <CategoryChecks categories={data.categories} selected={[]} />
            <SaveButton>Ekstra ekle</SaveButton>
          </ActionForm>
        </article>
      </section>

      <section id="tags" className="adm-card" aria-labelledby="tags-title">
        <h2 id="tags-title" className="adm-card__title">Etiketler</h2>
        <ul className="adm-pills">{data.tags.map((tag) => <li id={`tag-${tag.id}`} key={tag.id} className="adm-tag">{tag.name}</li>)}</ul>
        <ActionForm action={addTagAction}>
          <label className="adm-field">Yeni etiket<input name="name" maxLength={80} required /></label>
          <SaveButton>Etiket ekle</SaveButton>
        </ActionForm>
      </section>

      <section id="settings" className="adm-card" aria-labelledby="settings-title">
        <h2 id="settings-title" className="adm-card__title">Ayarlar</h2>
        <ActionForm action={saveSettingsAction} testId="settings-form">
          <div className="adm-row"><label className="adm-field">Ağ adı<input name="wifiSsid" defaultValue={data.settings.wifiSsid} maxLength={120} /></label><label className="adm-field">Kullanıcı adı<input name="wifiUsername" defaultValue={data.settings.wifiUsername} maxLength={120} /></label></div>
          <label className="adm-field">Yeni WiFi şifresi<input name="wifiPassword" type="password" maxLength={255} autoComplete="new-password" aria-describedby="wifi-password-note" /></label>
          <p id="wifi-password-note" className="adm-note">Değiştirmeyecekseniz boş bırakın. Mevcut şifre gösterilmez.</p>
          <label className="adm-field">WiFi yönergesi<textarea name="wifiNoteTr" defaultValue={data.settings.wifiNoteTr} maxLength={2000} rows={3} /></label>
          <div className="adm-row"><label className="adm-field">Açılış saati<input name="openingTime" type="time" defaultValue={data.settings.openingTime} /></label><label className="adm-field">Alt bilgi notu<input name="footerNoteTr" defaultValue={data.settings.footerNoteTr} maxLength={255} /></label></div>
          <div className="adm-checks"><label><input name="statsEnabled" type="checkbox" defaultChecked={data.settings.statsEnabled} /> İstatistik açık</label></div>
          <SaveButton>Ayarları kaydet</SaveButton>
        </ActionForm>
      </section>
    </>
  );
}

function CategoryChecks({ categories, selected }: { categories: CatalogData["categories"]; selected: number[] }) {
  return (
    <fieldset className="adm-fieldset">
      <legend>Görüneceği kategoriler</legend>
      <div className="adm-check-grid">
        {categories.map((category) => <label key={category.id}><input type="checkbox" name="categoryIds" value={category.id} defaultChecked={selected.includes(category.id)} /> {category.name}</label>)}
      </div>
    </fieldset>
  );
}

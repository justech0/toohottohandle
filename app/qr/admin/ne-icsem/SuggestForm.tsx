"use client";
import { useState } from "react";
import { BrandSelect } from "../_components/BrandSelect";
import { ActionForm } from "../_components/ActionForm";
import { saveSuggestAction } from "./actions";
export function SuggestForm({ mode, preferPhotos, products }: { mode: string; preferPhotos: boolean; products: { id: number; name: string; category: string; selected: boolean }[] }) {
  const [current, setCurrent] = useState(mode);
  return <ActionForm action={saveSuggestAction}>
    <label className="adm-field">Mod<BrandSelect name="suggestMode" value={current} onChange={setCurrent}><option value="random">Rastgele</option><option value="selected">Seçtiklerim</option></BrandSelect></label>
    <div className="adm-checks"><label><input name="preferPhotos" type="checkbox" defaultChecked={preferPhotos} /> Fotoğraflı ürünlere öncelik ver</label></div>
    <p className="adm-note">{current === "random" ? "Havuz, kategorilerdeki Ne içsem ayarından gelir." : "Yalnız işaretlediğin ürünler önerilir. Gizli ve tükenmiş ürünler önerilmez."}</p>
    <fieldset className="adm-fieldset" hidden={current !== "selected"}><legend>Önerilecek ürünler</legend><div className="adm-check-grid">{products.map(p => <label key={p.id}><input name="productIds" type="checkbox" value={p.id} defaultChecked={p.selected} aria-label={p.name} /><span>{p.name}<small className="adm-note"> · {p.category}</small></span></label>)}</div></fieldset>
    <button type="submit" className="adm-btn adm-btn--main">Kaydet</button>
  </ActionForm>;
}

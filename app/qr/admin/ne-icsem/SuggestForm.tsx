"use client";
import { useState } from "react";
import { BrandSelect } from "../_components/BrandSelect";
import { ActionForm } from "../_components/ActionForm";
import { saveSuggestAction } from "./actions";

type Product = { id: number; name: string; category: string; selected: boolean; weight: number };
const LEVELS = [[1, "Normal"], [2, "2 kat"], [3, "3 kat"], [5, "5 kat"]] as const;

export function SuggestForm({ mode, preferPhotos, products }: { mode: string; preferPhotos: boolean; products: Product[] }) {
  const [current, setCurrent] = useState(mode);
  const categories = [...new Set(products.map(p => p.category))];
  return <ActionForm action={saveSuggestAction}>
    <label className="adm-field">Mod<BrandSelect name="suggestMode" value={current} onChange={setCurrent}><option value="random">Rastgele</option><option value="selected">Seçtiklerim</option></BrandSelect></label>
    <div className="adm-checks"><label><input name="preferPhotos" type="checkbox" defaultChecked={preferPhotos} /> Fotoğraflı ürünlere öncelik ver</label></div>
    <p className="adm-note">{current === "random" ? "Havuz, kategorilerdeki Ne içsem ayarından gelir." : "Yalnız işaretlediğin ürünler önerilir. Gizli ve tükenmiş ürünler önerilmez."} Olasılık: 2 kat ürün, Normal ürünün iki katı sık çıkar.</p>
    <fieldset className="adm-fieldset"><legend>{current === "selected" ? "Önerilecek ürünler ve olasılık" : "Ürün olasılıkları"}</legend>
      {categories.map(category => <div key={category} className="adm-weight-group">
        <h3 className="adm-weight-group__title">{category}</h3>
        <ul className="adm-weight-list">{products.filter(p => p.category === category).map(p => <li key={p.id} className="adm-weight-row" data-testid="suggest-row">
          {current === "selected"
            ? <label className="adm-weight-row__name"><input name="productIds" type="checkbox" value={p.id} defaultChecked={p.selected} aria-label={p.name} /><span>{p.name}</span></label>
            : <><input type="hidden" name="productIds" value={p.selected ? p.id : ""} disabled={!p.selected} /><span className="adm-weight-row__name">{p.name}</span></>}
          <span className="adm-weight-row__levels" role="radiogroup" aria-label={`${p.name} olasılığı`}>
            {LEVELS.map(([value, label]) => <label key={value} className="adm-weight-pill"><input type="radio" name={`weight-${p.id}`} value={value} defaultChecked={p.weight === value} /><span>{label}</span></label>)}
          </span>
        </li>)}</ul>
      </div>)}
    </fieldset>
    <button type="submit" className="adm-btn adm-btn--main">Kaydet</button>
  </ActionForm>;
}

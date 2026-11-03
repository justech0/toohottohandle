"use client";

import { BrandSelect } from "../_components/BrandSelect";

import { startTransition, useActionState, useState } from "react";
import { formatPrice, variantLabelTr } from "@/lib/format/price";
import type { BulkFormInput, BulkPreviewProduct, PriceListCategory } from "@/lib/admin/bulkPrice";
import { applyBulkAction, previewBulkAction, type ApplyState, type PreviewState } from "./actions";

type Option = { id: number; name: string };
type Props = { groups: Option[]; categories: (Option & { groupName: string })[]; list: PriceListCategory[] };

const prices = (variants: { labelKey: BulkPreviewProduct["variants"][number]["labelKey"]; priceKurus: number }[]) => variants
  .map((variant) => [variantLabelTr(variant.labelKey), formatPrice(variant.priceKurus)].filter(Boolean).join(" "))
  .join(" · ");

export function BulkPriceForm({ groups, categories, list }: Props) {
  const [scope, setScope] = useState<BulkFormInput["scope"]>("category");
  const [scopeId, setScopeId] = useState(String(categories[0]?.id ?? ""));
  const [mode, setMode] = useState<BulkFormInput["mode"]>("percent");
  const [amount, setAmount] = useState("");
  const [rounding, setRounding] = useState<BulkFormInput["rounding"]>("none");
  const [preview, previewAction, previewPending] = useActionState<PreviewState, FormData>(previewBulkAction, { error: null });
  const [applied, applyAction, applyPending] = useActionState<ApplyState, FormData>(applyBulkAction, { error: null });
  const currentKey = JSON.stringify({ scope, scopeId: Number(scopeId), mode, amount, rounding });
  const previewKey = preview.input ? JSON.stringify(preview.input) : "";
  const shown = currentKey === previewKey ? preview : { error: null };
  const options = scope === "group" ? groups : categories;
  const previewById = new Map((shown.items ?? []).map((item) => [item.id, item]));

  const fields = (
    <>
      <label className="adm-field">Kapsam
        <BrandSelect name="scope" aria-label="Kapsam" value={scope} onChange={(event) => {
          const next = event as BulkFormInput["scope"];
          setScope(next);
          setScopeId(next === "all" ? "0" : String((next === "group" ? groups : categories)[0]?.id ?? ""));
        }}>
          <option value="all">Tüm menü</option><option value="category">Kategori</option><option value="group">Grup</option>
        </BrandSelect>
      </label>
      {scope !== "all" ? <label className="adm-field">{scope === "group" ? "Grup" : "Kategori"}
        <BrandSelect name="scopeId" aria-label={scope === "group" ? "Grup" : "Kategori"} value={scopeId} onChange={(event) => setScopeId(event)}>
          {options.map((option) => <option key={option.id} value={option.id}>{"groupName" in option ? `${option.groupName} · ${option.name}` : option.name}</option>)}
        </BrandSelect>
      </label> : null}
      <label className="adm-field">Değişim türü
        <BrandSelect name="mode" aria-label="Değişim türü" value={mode} onChange={(event) => setMode(event as BulkFormInput["mode"])}>
          <option value="percent">Yüzde</option><option value="fixed">Sabit tutar</option>
        </BrandSelect>
      </label>
      <label className="adm-field">{mode === "percent" ? "Yüzde" : "Tutar (₺)"}
        <input name="amount" aria-label={mode === "percent" ? "Yüzde" : "Tutar (₺)"} value={amount} onChange={(event) => setAmount(event.target.value)} inputMode="decimal" placeholder={mode === "percent" ? "Örn. 10 veya -5" : "Örn. 15 veya -10"} required />
      </label>
      <label className="adm-field">Yuvarlama
        <BrandSelect name="rounding" aria-label="Yuvarlama" value={rounding} onChange={(event) => setRounding(event as BulkFormInput["rounding"])}>
          <option value="none">Yok</option><option value="5">En yakın 5 ₺</option><option value="10">En yakın 10 ₺</option>
        </BrandSelect>
      </label>
    </>
  );

  return (
    <>
      <form className="adm-form adm-card" onSubmit={(event) => {
        event.preventDefault();
        startTransition(() => previewAction(new FormData(event.currentTarget)));
      }} noValidate>
        {fields}
        {shown.error ? <p className="adm-error" role="alert">{shown.error}</p> : null}
        <button type="submit" className="adm-btn adm-btn--main" disabled={previewPending} aria-busy={previewPending}>{previewPending ? "Hazırlanıyor…" : "Önizle"}</button>
      </form>

      {shown.items && shown.expected ? (
        <section className="adm-card adm-bulk-apply" aria-labelledby="bulk-preview-title">
          <h2 id="bulk-preview-title" className="adm-card__title">Önizleme · {shown.items.length} ürün</h2>
          <p className="adm-note">Yeni fiyatlar aşağıdaki listede kırmızı görünür. Uygulamadan önce menünün kopyası alınır.</p>
          <form className="adm-apply" onSubmit={(event) => {
            event.preventDefault();
            startTransition(() => applyAction(new FormData(event.currentTarget)));
          }}>
            <input type="hidden" name="scope" value={shown.input!.scope} />
            <input type="hidden" name="scopeId" value={shown.input!.scopeId} />
            <input type="hidden" name="mode" value={shown.input!.mode} />
            <input type="hidden" name="amount" value={shown.input!.amount} />
            <input type="hidden" name="rounding" value={shown.input!.rounding} />
            <input type="hidden" name="expected" value={shown.expected} />
            {applied.error ? <p className="adm-error" role="alert">{applied.error}</p> : null}
            <button type="submit" className="adm-btn adm-btn--main" disabled={applyPending} aria-busy={applyPending}>{applyPending ? "Uygulanıyor…" : "Uygula"}</button>
          </form>
        </section>
      ) : null}

      <section className="adm-section" aria-labelledby="bulk-list-title">
        <h2 id="bulk-list-title" className="adm-card__title">Tüm fiyatlar</h2>
        {list.map((category) => (
          <div key={category.id} className="adm-price-group">
            <h3 className="adm-price-group__title">{category.groupName} · {category.name}</h3>
            <div className="adm-table-wrap">
              <table className="adm-table adm-price-table" data-previewing={previewById.size ? "true" : undefined}>
                <tbody>{category.products.map((product) => {
                  const next = previewById.get(product.id);
                  return (
                    <tr key={product.id} data-testid="bulk-row" data-in-preview={next ? "true" : undefined}>
                      <th scope="row">{product.name}</th>
                      <td>{prices(product.variants)}</td>
                      <td className="adm-price-table__next">{next ? <><span aria-hidden="true">→ </span><span className="sr-only">Yeni: </span>{prices(next.variants.map((variant) => ({ labelKey: variant.labelKey, priceKurus: variant.newPriceKurus })))}</> : null}</td>
                    </tr>
                  );
                })}</tbody>
              </table>
            </div>
          </div>
        ))}
      </section>
    </>
  );
}

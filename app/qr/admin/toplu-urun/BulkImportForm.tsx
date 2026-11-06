"use client";

import { startTransition, useActionState, useState } from "react";
import type { BulkImportOptionGroup } from "@/lib/admin/bulkImport";
import { BrandSelect } from "../_components/BrandSelect";
import { AdminIcon } from "../_components/AdminIcon";
import { importProductsAction, type ImportState } from "./actions";

export function BulkImportForm({ groups }: { groups: BulkImportOptionGroup[] }) {
  const [groupId, setGroupId] = useState(String(groups[0]?.id ?? ""));
  const [state, action, pending] = useActionState<ImportState, FormData>(importProductsAction, {
    error: null,
    report: null,
  });

  return (
    <>
      <form
        className="adm-form adm-card"
        onSubmit={(event) => {
          event.preventDefault();
          const formData = new FormData(event.currentTarget);
          startTransition(() => action(formData));
        }}
        noValidate
      >
        {groups.length > 0 ? (
          <label className="adm-field">
            Yeni kategoriler için grup
            <BrandSelect
              name="groupId"
              aria-label="Yeni kategoriler için grup"
              value={groupId}
              onChange={(next) => setGroupId(next)}
            >
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </BrandSelect>
          </label>
        ) : null}

        <label className="adm-field">
          Dosya Seç (.csv veya .json)
          <input
            type="file"
            name="file"
            accept=".csv,.json,text/csv,application/json"
            required
          />
        </label>

        <div className="adm-import-notes">
          <p className="adm-note">CSV kolonları: category_name, product_name, description, price, image_url, sort_order</p>
          <p className="adm-note">Bozuk satırlar atlanır ve raporlanır; kategori yoksa otomatik oluşturulur.</p>
        </div>

        {state.error ? (
          <p className="adm-error" role="alert">
            {state.error}
          </p>
        ) : null}

        <button
          type="submit"
          className="adm-btn adm-btn--main"
          disabled={pending}
          aria-busy={pending}
        >
          {pending ? "Aktarılıyor…" : "İçe Aktar"}
        </button>
      </form>

      {state.report ? (
        <>
          <div className="adm-ok" role="status">
            <AdminIcon name="check" size={18} />
            <span>İçe aktarma tamamlandı.</span>
          </div>

          <section className="adm-card adm-import-report" data-testid="import-results" aria-label="İçe Aktarma Sonucu">
            <p className="adm-import-report__stat">
              Okunan satır: <strong>{state.report.read}</strong>
            </p>
            <p className="adm-import-report__stat adm-import-report__stat--inserted">
              Eklenen ürün: <strong>{state.report.inserted}</strong>
            </p>
            <p className="adm-note">
              Yeni kategoriler: {state.report.createdCategories.length ? state.report.createdCategories.join(", ") : "Yok"}
            </p>
            {state.report.skipped.length > 0 ? (
              <ul className="adm-import-skipped" data-testid="import-skipped">
                {state.report.skipped.map((skip, index) => (
                  <li key={index}>{skip}</li>
                ))}
              </ul>
            ) : null}
          </section>
        </>
      ) : null}
    </>
  );
}


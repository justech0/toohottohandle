"use client";

import { useActionState, useRef } from "react";
import type { SoldOutOption } from "@/lib/admin/soldOut";
import { productOperationAction, type OperationState } from "../actions";

interface Props {
  id: number;
  name: string;
  visible: boolean;
  soldOut: boolean;
  soldOutChoices: SoldOutOption[];
  first: boolean;
  last: boolean;
}

const initialState: OperationState = { error: null };

export function ProductOperations({ id, name, visible, soldOut, soldOutChoices, first, last }: Props) {
  const [state, action, pending] = useActionState(productOperationAction, initialState);
  const stockDialog = useRef<HTMLDialogElement>(null);
  const deleteDialog = useRef<HTMLDialogElement>(null);

  return (
    <div className="adm-item__operations">
      <p role="alert" className={state.error ? "adm-error adm-item__error" : "sr-only"}>{state.error ?? ""}</p>
      <div className="adm-item__ops">
        {soldOut ? (
          <form action={action}>
            <input type="hidden" name="id" value={id} />
            <input type="hidden" name="operation" value="sold-out" />
            <button className="adm-op adm-op--stock" type="submit" disabled={pending} data-testid={`product-soldout-${id}`}>Tekrar satışta</button>
          </form>
        ) : (
          <button className="adm-op adm-op--stock" type="button" disabled={pending} onClick={() => stockDialog.current?.showModal()} data-testid={`product-soldout-${id}`}>Tükendi</button>
        )}

        <form action={action}>
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="operation" value="visibility" />
          <input type="hidden" name="visible" value={visible ? "false" : "true"} />
          <button className="adm-op adm-switch" type="submit" role="switch" aria-checked={visible} disabled={pending} data-testid={`product-visible-${id}`}>Görünür</button>
        </form>

        <form action={action}>
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="operation" value="duplicate" />
          <button className="adm-op" type="submit" disabled={pending} data-testid={`product-duplicate-${id}`}>Çoğalt</button>
        </form>

        <form action={action} className="adm-order" aria-label={`${name} sıralama`}>
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="operation" value="move" />
          <button className="adm-op" type="submit" name="direction" value="up" disabled={pending || first} aria-label={`${name} yukarı taşı`} data-testid={`product-up-${id}`}>Yukarı</button>
          <button className="adm-op" type="submit" name="direction" value="down" disabled={pending || last} aria-label={`${name} aşağı taşı`} data-testid={`product-down-${id}`}>Aşağı</button>
        </form>

        <button className="adm-op adm-op--danger" type="button" disabled={pending} onClick={() => deleteDialog.current?.showModal()} data-testid={`product-delete-${id}`}>Sil</button>
      </div>

      <dialog ref={stockDialog} className="adm-dialog" aria-labelledby={`sold-out-title-${id}`}>
        <form action={action}>
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="operation" value="sold-out" />
          <h2 id={`sold-out-title-${id}`} className="adm-dialog__title">{name} tükendi</h2>
          <p className="adm-note">Ne zamana kadar?</p>
          <div className="adm-dialog__choices">
            {soldOutChoices.map((choice) => (
              <button key={choice.until} className="adm-btn" type="submit" name="until" value={choice.until} disabled={pending}>{choice.label}</button>
            ))}
          </div>
        </form>
        <form method="dialog"><button className="adm-btn adm-btn--quiet" type="submit">Vazgeç</button></form>
      </dialog>

      <dialog ref={deleteDialog} className="adm-dialog" aria-labelledby={`delete-title-${id}`}>
        <h2 id={`delete-title-${id}`} className="adm-dialog__title">{name} silinsin mi?</h2>
        <p className="adm-note">Silmeden önce menü kopyası alınır. Son işlemi geri alabilirsin.</p>
        <div className="adm-dialog__actions">
          <form action={action}>
            <input type="hidden" name="id" value={id} />
            <input type="hidden" name="operation" value="delete" />
            <button className="adm-btn adm-btn--danger" type="submit" disabled={pending} data-testid={`product-delete-confirm-${id}`}>Evet, sil</button>
          </form>
          <form method="dialog"><button className="adm-btn" type="submit">Vazgeç</button></form>
        </div>
      </dialog>
    </div>
  );
}

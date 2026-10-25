"use client";

import { useRef } from "react";
import type { ClientProduct } from "./clientTypes";
import { CloseIcon } from "./Icons";
import { useDialogFocus } from "./useDialogFocus";
import { imageSrc, imageSrcSet } from "@/lib/menu/image";

export function ProductSheet({ product, onClose }: { product: ClientProduct; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useDialogFocus(ref, onClose);
  return (
    <div className="sheet-layer">
      <div className="sheet-backdrop" onClick={onClose} aria-hidden="true" />
      <div ref={ref} className="sheet" data-testid="product-sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-title">
        <div className="sheet__grip" aria-hidden="true" />
        <button type="button" className="icon-btn sheet__close" aria-label="Kapat" onClick={onClose}>
          <CloseIcon />
        </button>
        {product.imageKey ? (
          <img
            className="sheet__img"
            src={imageSrc(product.imageKey, 720)}
            srcSet={imageSrcSet(product.imageKey)}
            sizes="(min-width: 640px) 600px, 100vw"
            alt={product.name}
            decoding="async"
          />
        ) : null}
        <p className="sheet__cat">{product.categoryName}</p>
        <h2 id="sheet-title" className="sheet__title">{product.name}</h2>
        {product.descTr ? <p className="sheet__desc" data-testid="sheet-desc">{product.descTr}</p> : null}
        <ul className="sheet__prices">
          {product.parts.map((p) => (
            <li key={p} className={product.soldOut ? "sheet__price price--out" : "sheet__price"}><bdi>{p}</bdi></li>
          ))}
        </ul>
      </div>
    </div>
  );
}

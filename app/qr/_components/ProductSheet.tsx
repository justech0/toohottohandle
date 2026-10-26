"use client";

import { useRef, useState } from "react";
import type { CardProduct } from "./clientTypes";
import { CloseIcon } from "./Icons";
import { useDialogFocus } from "./useDialogFocus";
import { imageSrc, imageSrcSet } from "@/lib/menu/image";
import { BrandIcon } from "./BrandIcon";

/** Ürün detayı (spec v3 5): üstte fotoğraf, altta grup renginde panel. Geçmiş davranışı MenuClient'ta. */
export function ProductSheet({ product, onClose }: { product: CardProduct; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(0);
  useDialogFocus(ref, onClose);
  const photo = product.imageKey;
  const single = !product.soldOut && product.stars.length === 1 ? product.stars[0] : null;
  const singleLabel = single ? product.sizes[0].replace(single.price, "").trim() : "";

  return (
    <div className="sheet-layer">
      <div className="sheet-backdrop" onClick={onClose} aria-hidden="true" />
      <div ref={ref} className="sheet" data-testid="product-sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-title">
        <button type="button" className="icon-btn sheet__close" aria-label="Kapat" onClick={onClose}>
          <CloseIcon />
        </button>
        {photo ? (
          <img
            className="sheet__img"
            src={imageSrc(photo, 720)}
            srcSet={imageSrcSet(photo)}
            sizes="(min-width: 640px) 600px, 100vw"
            alt={product.name}
            decoding="async"
          />
        ) : null}
        <div className={photo ? "sheet__panel" : "sheet__panel sheet__panel--full"} data-testid="sheet-panel" data-color={product.groupColor}>
          {photo ? null : <BrandIcon name={product.groupIcon} className="sheet__icon" />}
          <p className="sheet__cat">{product.categoryName}</p>
          <div className="sheet__head">
            <h2 id="sheet-title" className="sheet__title">{product.name}</h2>
            {single ? (
              <span className="sheet__star">
                <span className="star__bg" aria-hidden="true" />
                <span className="sheet__star-txt" data-testid="sheet-price">
                  {singleLabel ? <small>{singleLabel} </small> : null}
                  <bdi>{single.price}</bdi>
                </span>
              </span>
            ) : null}
          </div>
          {product.soldOut ? <p className="sheet__out">Tükendi</p> : null}
          {!product.soldOut && product.sizes.length > 1 ? (
            <div className="sheet__sizes" role="group" aria-label="Boy">
              {product.sizes.map((s, i) => (
                <button key={s} type="button" className="sheet__size" data-testid="sheet-size" aria-pressed={i === size} onClick={() => setSize(i)}>
                  <bdi>{s}</bdi>
                </button>
              ))}
            </div>
          ) : null}
          {product.descTr ? <p className="sheet__desc" data-testid="sheet-desc">{product.descTr}</p> : null}
          <p className="sheet__note">Alerjen bilgisi için ekibimize sorabilirsin.</p>
        </div>
      </div>
    </div>
  );
}

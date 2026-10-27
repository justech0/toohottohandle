"use client";

import { useRef, useState } from "react";
import type { CardProduct } from "./clientTypes";
import { CloseIcon } from "./Icons";
import { useDialogFocus } from "./useDialogFocus";
import { imageSrc, imageSrcSet } from "@/lib/menu/image";
import { BrandIcon } from "./BrandIcon";
import { useLanguage } from "@/lib/i18n/context";
import { resolveText } from "@/lib/i18n/resolve";

/** Ürün detayı (spec v3 5): üstte fotoğraf, altta grup renginde panel. Geçmiş davranışı MenuClient'ta. */
export function ProductSheet({ product, onClose }: { product: CardProduct; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(0);
  const { lang, t } = useLanguage();
  useDialogFocus(ref, onClose);

  const displayName = resolveText(lang, product.nameAr, product.nameEn, product.name);
  const displayDesc = resolveText(lang, product.descAr, product.descEn, product.descTr);
  const displayCategory = resolveText(lang, product.categoryNameAr, product.categoryNameEn, product.categoryName);

  const photo = product.imageKey;
  const single = !product.soldOut && product.stars.length === 1 ? product.stars[0] : null;
  const singleLabel = single ? product.sizes[0].replace(single.price, "").trim() : "";

  return (
    <div className="sheet-layer">
      <div className="sheet-backdrop" onClick={onClose} aria-hidden="true" />
      <div ref={ref} className="sheet" data-testid="product-sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-title">
        <button type="button" className="icon-btn sheet__close" aria-label={t.nav.close} onClick={onClose}>
          <CloseIcon />
        </button>
        {photo ? (
          <img
            className="sheet__img"
            src={imageSrc(photo, 720)}
            srcSet={imageSrcSet(photo)}
            sizes="(min-width: 640px) 600px, 100vw"
            alt={displayName}
            style={{ objectPosition: `${product.imageFocusX * 100}% ${product.imageFocusY * 100}%` }}
            decoding="async"
          />
        ) : null}
        <div className={photo ? "sheet__panel" : "sheet__panel sheet__panel--full"} data-testid="sheet-panel" data-color={product.groupColor}>
          {photo ? (
            <BrandIcon name={product.groupIcon} className="sheet__icon sheet__icon--watermark" />
          ) : (
            <BrandIcon name={product.groupIcon} className="sheet__icon" />
          )}
          <p className="sheet__cat">{displayCategory}</p>
          <div className="sheet__head">
            <h2 id="sheet-title" className="sheet__title">{displayName}</h2>
            {single ? (
              <span className="sheet__tag">
                {singleLabel ? <small>{singleLabel}</small> : null}
                <span data-testid="sheet-price"><bdi>{single.price}</bdi></span>
              </span>
            ) : null}
          </div>
          {product.soldOut ? <p className="sheet__out">{t.product.soldOut}</p> : null}
          {!product.soldOut && product.sizes.length > 1 ? (
            <div className="sheet__sizes" role="group" aria-label={t.product.size}>
              {product.sizes.map((s, i) => (
                <button key={s} type="button" className="sheet__size" data-testid="sheet-size" aria-pressed={i === size} onClick={() => setSize(i)}>
                  <bdi>{s}</bdi>
                </button>
              ))}
            </div>
          ) : null}
          {displayDesc ? (
            <div className="sheet__ingredients">
              <h3 className="sheet__section-title">{t.product.ingredients}</h3>
              <p className="sheet__desc" data-testid="sheet-desc">{displayDesc}</p>
            </div>
          ) : null}
          {product.tags.length ? <div className="sheet__labels" data-testid="product-tags">{product.tags.slice(0, 3).map((tag) => <span key={tag}>{tag}</span>)}</div> : null}
          <p className="sheet__note">{t.product.allergenNote}</p>
        </div>
      </div>
    </div>
  );
}

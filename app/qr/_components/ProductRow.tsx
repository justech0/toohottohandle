import type { MenuProduct } from "@/lib/menu/types";
import { priceLabel } from "@/lib/menu/soldout";
import { PriceTag } from "./PriceTag";
import { RowImage } from "./RowImage";

export function ProductRow({ product, serverNow }: { product: MenuProduct; serverNow: string }) {
  const price = priceLabel(product, serverNow);
  return (
    <li data-testid="product-row" data-slug={product.slug} className={price.soldOut ? "row row--out" : "row"}>
      <button type="button" className="row__btn" data-open-product={product.slug}>
        {product.imageKey ? <RowImage imageKey={product.imageKey} /> : null}
        <span className="row__name">{product.name}</span>
        <PriceTag parts={price.parts} soldOut={price.soldOut} />
      </button>
    </li>
  );
}

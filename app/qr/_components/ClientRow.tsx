import type { ClientProduct } from "./clientTypes";
import { PriceTag } from "./PriceTag";
import { RowImage } from "./RowImage";

export function ClientRow({ product }: { product: ClientProduct }) {
  return (
    <li data-testid="product-row" data-slug={product.slug} className={product.soldOut ? "row row--out" : "row"}>
      <button type="button" className="row__btn" data-open-product={product.slug}>
        {product.imageKey ? <RowImage imageKey={product.imageKey} /> : null}
        <span className="row__name">{product.name}</span>
        <PriceTag parts={product.parts} soldOut={product.soldOut} />
      </button>
    </li>
  );
}

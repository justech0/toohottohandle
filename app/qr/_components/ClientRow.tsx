import type { ClientProduct } from "./clientTypes";
import { PriceTag } from "./PriceTag";

export function ClientRow({ product }: { product: ClientProduct }) {
  return (
    <li data-testid="product-row" data-slug={product.slug} className={product.soldOut ? "row row--out" : "row"}>
      <button type="button" className="row__btn" data-open-product={product.slug}>
        <span className="row__name">{product.name}</span>
        <PriceTag parts={product.parts} soldOut={product.soldOut} />
      </button>
    </li>
  );
}

import { imageSrc } from "@/lib/menu/image";
import { BrandIcon } from "./BrandIcon";
import { PriceChips } from "./PriceChips";
import type { CardProduct } from "./clientTypes";

/** Ürün kartı (spec v3 4). Hem sunucu listesinde hem aramada kullanılır; dokununca MenuClient detayı açar. */
export function ProductCard({ p }: { p: CardProduct }) {
  const photo = Boolean(p.imageKey);
  const cls = ["card", photo ? "card--photo" : "card--plain", p.soldOut ? "card--out" : ""].filter(Boolean).join(" ");
  return (
    <li data-testid="product-row" data-slug={p.slug} className="cards__item">
      <button type="button" data-open-product={p.slug} className={cls} data-color={p.groupColor}>
        {photo ? (
          <img
            className="card__img"
            src={imageSrc(p.imageKey!, 320)}
            srcSet={`${imageSrc(p.imageKey!, 320)} 320w, ${imageSrc(p.imageKey!, 720)} 720w`}
            sizes="(min-width: 768px) 30vw, 50vw"
            alt=""
            loading="lazy"
            decoding="async"
          />
        ) : (
          <BrandIcon name={p.groupIcon} className="card__icon" />
        )}
        <span className="card__name">{p.name}</span>
        {photo ? <span className="card__cat">{p.categoryName}</span> : null}
        <span className="sr-only" data-testid="price-full">{p.full}</span>
        {p.soldOut ? <span className="card__out" aria-hidden="true">Tükendi</span> : <PriceChips p={p} />}
      </button>
    </li>
  );
}

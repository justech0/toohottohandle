import type { CardProduct } from "./clientTypes";

/** Sade fiyat kutucukları: boy adı küçük harfle üstte, fiyat altında. Tam metin kartta sr-only. */
export function PriceChips({ p }: { p: Pick<CardProduct, "stars" | "sizes"> }) {
  return (
    <span className="card__prices" aria-hidden="true">
      {p.stars.map((s, i) => {
        const label = p.stars.length > 1 ? (p.sizes[i] ?? "").replace(s.price, "").trim() : "";
        return (
          <span key={i} className="chip">
            {label ? <small>{label}</small> : null}
            <bdi>{s.price}</bdi>
          </span>
        );
      })}
    </span>
  );
}

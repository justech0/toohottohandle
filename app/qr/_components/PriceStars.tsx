import type { PriceStar } from "@/lib/menu/badges";

/** Kırmızı yıldız içinde fiyat; ikinci boy küçük sarı yıldızda. Görsel süs, tam metin sr-only'de. */
export function PriceStars({ stars }: { stars: PriceStar[] }) {
  const two = stars.length > 1;
  return (
    <span className="stars" aria-hidden="true">
      {stars.map((s, i) => (
        <span key={i} className={i === 0 ? "star star--main" : "star star--alt"}>
          <span className="star__bg" />
          <span className="star__txt">
            {two && s.short ? <small>{s.short}</small> : null}
            <bdi>{s.price}</bdi>
          </span>
        </span>
      ))}
    </span>
  );
}

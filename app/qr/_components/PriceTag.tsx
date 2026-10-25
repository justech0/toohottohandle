import { Fragment } from "react";

export function PriceTag({ parts, soldOut }: { parts: string[]; soldOut: boolean }) {
  return (
    <span className={soldOut ? "price price--out" : "price"}>
      {parts.map((p, i) => (
        <Fragment key={i}>
          {i > 0 ? <span className="price__sep" aria-hidden="true">·</span> : null}
          <bdi>{p}</bdi>
        </Fragment>
      ))}
    </span>
  );
}

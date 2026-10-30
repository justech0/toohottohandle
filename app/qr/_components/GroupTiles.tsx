import type { ReactNode } from "react";
import type { MenuGroup } from "@/lib/menu/types";
import { groupStyle } from "@/lib/brand/groups";
import { BrandIcon } from "./BrandIcon";
import { imageSrc } from "@/lib/menu/image";

/**
 * Grup afişleri (spec v3 3.3). İkinci hücre "Ne içsem?" karesidir.
 * Linkler JS yokken çapa ile, JS varken CategoryStrip'in data-jump yakalayıcısıyla kaydırır.
 */
export function GroupTiles({ groups, firstCategoryOf, neIcsem }: { groups: MenuGroup[]; firstCategoryOf: Record<string, string>; neIcsem: ReactNode }) {
  const tiles = groups.map((g, idx) => {
    const st = groupStyle(g.slug);
    const image = g.imageKey === null ? st.image : g.imageKey ? imageSrc(g.imageKey, 720) : null;
    const first = firstCategoryOf[g.slug];
    const isAboveFold = idx === 0;
    return (
      <a key={g.slug} href={`#cat-${first}`} data-jump={first} data-testid="group-tile" className="gtile" data-color={g.color}>
        {image ? (
          <img
            src={image}
            alt=""
            loading={isAboveFold ? "eager" : "lazy"}
            fetchPriority={isAboveFold ? "high" : "auto"}
            decoding="async"
            className="gtile__img"
            style={{ objectPosition: `${g.imageFocusX * 100}% ${g.imageFocusY * 100}%` }}
          />
        ) : (
          <BrandIcon name={st.icon} className="gtile__icon" />
        )}
        <span className="gtile__label">{g.nameTr}</span>
      </a>
    );
  });
  return (
    <nav className="gtiles" aria-label="Gruplar">
      {tiles[0]}
      {neIcsem}
      {tiles.slice(1)}
    </nav>
  );
}

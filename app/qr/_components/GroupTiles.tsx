import type { ReactNode } from "react";
import type { MenuGroup } from "@/lib/menu/types";
import { groupStyle } from "@/lib/brand/groups";
import { BrandIcon } from "./BrandIcon";

/**
 * Grup afişleri (spec v3 3.3). İkinci hücre "Ne içsem?" karesidir.
 * Linkler JS yokken çapa ile, JS varken CategoryStrip'in data-jump yakalayıcısıyla kaydırır.
 */
export function GroupTiles({ groups, firstCategoryOf, neIcsem }: { groups: MenuGroup[]; firstCategoryOf: Record<string, string>; neIcsem: ReactNode }) {
  const tiles = groups.map((g) => {
    const st = groupStyle(g.slug);
    const first = firstCategoryOf[g.slug];
    return (
      <a key={g.slug} href={`#cat-${first}`} data-jump={first} data-testid="group-tile" className="gtile" data-color={g.color}>
        {st.image ? <img src={st.image} alt="" loading="lazy" decoding="async" className="gtile__img" /> : <BrandIcon name={st.icon} className="gtile__icon" />}
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

/** Ne içsem karesinin durağan hali (Task 6'da NeIcsem bileşeni kullanır). */
export function NeIcsemSquare({ onClick, expanded }: { onClick?: () => void; expanded?: boolean }) {
  return (
    <button type="button" className="ne-tile" data-testid="neicsem-tile" onClick={onClick} aria-expanded={expanded}>
      <span className="ne-tile__disc"><BrandIcon name="rabbit" className="ne-rabbit" /></span>
      <span className="ne-tile__label">Ne içsem?</span>
    </button>
  );
}

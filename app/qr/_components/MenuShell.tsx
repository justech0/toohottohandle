import type { MenuData } from "@/lib/menu/types";
import { BrandIcon } from "./BrandIcon";
import { HeroSlides } from "./HeroSlides";
import { GroupTiles } from "./GroupTiles";
import { NeIcsem } from "./NeIcsem";
import { suggestPool } from "@/lib/menu/suggest";
import { Footer } from "./Footer";
import { ProductCard } from "./ProductCard";
import { CategoryPoster } from "./CategoryPoster";
import { ExtrasLine } from "./ExtrasLine";
import { CategoryStrip } from "./CategoryStrip";
import { MenuClient } from "./MenuClient";
import { Intro } from "./Intro";
import type { CardProduct } from "./clientTypes";
import { priceLabel } from "@/lib/menu/soldout";
import { priceBadges } from "@/lib/menu/badges";
import { groupStyle } from "@/lib/brand/groups";

export function MenuShell({ menu }: { menu: MenuData }) {
  const visible = menu.products.filter((p) => p.isVisible);
  const sections = menu.groups.flatMap((g) =>
    menu.categories
      .filter((c) => c.group === g.slug && c.isVisible)
      .map((c) => ({ group: g, category: c, items: visible.filter((p) => p.category === c.slug) }))
      .filter((s) => s.items.length > 0),
  );
  const cards: Record<string, CardProduct> = {};
  for (const { group, category, items } of sections) {
    for (const p of items) {
      const badges = priceBadges(p, menu.serverNow);
      cards[p.slug] = {
        id: p.id,
        slug: p.slug,
        name: p.name,
        descTr: p.descTr,
        categoryName: category.nameTr,
        groupColor: group.color,
        groupIcon: groupStyle(group.slug).icon,
        imageKey: p.imageKey,
        imageFocusX: p.imageFocusX,
        imageFocusY: p.imageFocusY,
        soldOut: badges.soldOut,
        full: badges.full,
        stars: badges.stars,
        sizes: priceLabel(p, menu.serverNow).parts,
        tags: p.tags,
      };
    }
  }
  const clientProducts = Object.values(cards);
  const groupsWithItems = menu.groups.filter((g) => sections.some((s) => s.group.slug === g.slug));

  return (
    <div className="menu">
      <Intro />
      <header className="topbar">
        <span className="topbar__logo"><BrandIcon name="logo" label="Too Hot To Handle" /></span>
        <MenuClient products={clientProducts} settings={menu.settings} />
      </header>
      <HeroSlides />
      <GroupTiles
        groups={groupsWithItems}
        firstCategoryOf={Object.fromEntries(groupsWithItems.map((g) => [g.slug, sections.find((x) => x.group.slug === g.slug)!.category.slug]))}
        neIcsem={<NeIcsem pool={suggestPool(visible, menu.categories, menu.serverNow).map((p) => cards[p.slug]).filter(Boolean)} />}
      />
      <div className="sticky">
        <CategoryStrip
          groups={groupsWithItems.map(({ slug, nameTr, color }) => ({ slug, nameTr, color }))}
          categories={sections.map((s) => ({ slug: s.category.slug, nameTr: s.category.nameTr, group: s.group.slug }))}
        />
      </div>
      <main className="list">
        {sections.map(({ group, category, items }) => (
          <section key={category.slug} id={`cat-${category.slug}`} className="cat" data-color={group.color}>
            <CategoryPoster name={category.nameTr} color={group.color} icon={groupStyle(group.slug).icon}
              imageKey={category.imageKey} focusX={category.imageFocusX} focusY={category.imageFocusY} />
            <ul className="cards">
              {items.map((p) => (
                <ProductCard key={p.slug} p={cards[p.slug]} />
              ))}
            </ul>
            <ExtrasLine extras={menu.extras.filter((e) => e.categories.includes(category.slug))} />
          </section>
        ))}
      </main>
      <Footer settings={menu.settings} />
    </div>
  );
}

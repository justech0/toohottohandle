import type { MenuData } from "@/lib/menu/types";
import { BrandIcon } from "./BrandIcon";
import { HeroSlides } from "./HeroSlides";
import { GroupTiles, NeIcsemSquare } from "./GroupTiles";
import { Footer } from "./Footer";
import { ProductRow } from "./ProductRow";
import { ExtrasLine } from "./ExtrasLine";
import { CategoryStrip } from "./CategoryStrip";
import { MenuClient } from "./MenuClient";
import { Intro } from "./Intro";
import type { ClientProduct } from "./clientTypes";
import { priceLabel } from "@/lib/menu/soldout";

export function MenuShell({ menu }: { menu: MenuData }) {
  const visible = menu.products.filter((p) => p.isVisible);
  const sections = menu.groups.flatMap((g) =>
    menu.categories
      .filter((c) => c.group === g.slug)
      .map((c) => ({ group: g, category: c, items: visible.filter((p) => p.category === c.slug) }))
      .filter((s) => s.items.length > 0),
  );
  const clientProducts: ClientProduct[] = sections.flatMap(({ category, items }) =>
    items.map((p) => {
      const price = priceLabel(p, menu.serverNow);
      return { slug: p.slug, name: p.name, descTr: p.descTr, categoryName: category.nameTr, parts: price.parts, soldOut: price.soldOut, imageKey: p.imageKey };
    }),
  );
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
        neIcsem={<NeIcsemSquare />}
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
            <h2 className="cat__title">{category.nameTr}</h2>
            <ul className="cat__list">
              {items.map((p) => (
                <ProductRow key={p.slug} product={p} serverNow={menu.serverNow} />
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

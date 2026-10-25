import type { MenuData } from "@/lib/menu/types";
import { Logo } from "./Logo";
import { Footer } from "./Footer";
import { ProductRow } from "./ProductRow";
import { ExtrasLine } from "./ExtrasLine";
import { CategoryStrip } from "./CategoryStrip";
import { SearchIcon, WifiIcon } from "./Icons";

export function MenuShell({ menu }: { menu: MenuData }) {
  const visible = menu.products.filter((p) => p.isVisible);
  const sections = menu.groups.flatMap((g) =>
    menu.categories
      .filter((c) => c.group === g.slug)
      .map((c) => ({ group: g, category: c, items: visible.filter((p) => p.category === c.slug) }))
      .filter((s) => s.items.length > 0),
  );
  const groupsWithItems = menu.groups.filter((g) => sections.some((s) => s.group.slug === g.slug));

  return (
    <div className="menu">
      <div className="sticky">
        <header className="topbar">
          <Logo className="topbar__logo" />
          <div className="topbar__actions">
            <button type="button" className="icon-btn" aria-label="Ara" data-action="search">
              <SearchIcon />
            </button>
            {menu.settings.wifiSsid ? (
              <button type="button" className="icon-btn" aria-label="WiFi" data-action="wifi">
                <WifiIcon />
              </button>
            ) : null}
          </div>
        </header>
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

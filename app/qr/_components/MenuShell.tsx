import type { MenuData } from "@/lib/menu/types";
import { priceLabel } from "@/lib/menu/soldout";
import { Logo } from "./Logo";
import { Footer } from "./Footer";

export function MenuShell({ menu }: { menu: MenuData }) {
  const visible = menu.products.filter((p) => p.isVisible);
  return (
    <div className="menu">
      <header className="topbar">
        <Logo className="topbar__logo" />
        <div className="topbar__actions">
          <button type="button" className="icon-btn" aria-label="Ara" />
          {menu.settings.wifiSsid ? <button type="button" className="icon-btn" aria-label="WiFi" /> : null}
        </div>
      </header>
      <main>
        {menu.groups.map((g) =>
          menu.categories
            .filter((c) => c.group === g.slug)
            .map((c) => {
              const items = visible.filter((p) => p.category === c.slug);
              if (items.length === 0) return null;
              return (
                <section key={c.slug} id={`cat-${c.slug}`} className="cat" data-group={g.slug} data-color={g.color}>
                  <h2 className="cat__title">{c.nameTr}</h2>
                  <ul className="cat__list">
                    {items.map((p) => (
                      <li key={p.slug} data-testid="product-row" data-slug={p.slug} className="row">
                        <span className="row__name">{p.name}</span>
                        <span className="row__price">{priceLabel(p, menu.serverNow).parts.join(" · ")}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              );
            }),
        )}
      </main>
      <Footer settings={menu.settings} />
    </div>
  );
}

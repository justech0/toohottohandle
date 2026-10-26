import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { getPool } from "@/lib/db/client";
import { requireAdmin } from "@/lib/auth/session";
import { adminProductList } from "@/lib/admin/products";
import { formatPrice, variantLabelTr } from "@/lib/format/price";
import { ProductFilter } from "../_components/ProductFilter";

async function Content({ searchParams }: { searchParams: Promise<{ kaydedildi?: string }> }) {
  await connection();
  await requireAdmin();
  const { categories, products } = await adminProductList(getPool());
  const saved = Number((await searchParams).kaydedildi);
  const now = Date.now();
  return (
    <>
      {saved ? <p className="adm-ok" role="status">Kaydedildi. Menüde hemen görünür.</p> : null}
      <ProductFilter />
      {categories.map((c) => {
        const list = products.filter((p) => p.categoryId === c.id);
        if (!list.length) return null;
        return (
          <section key={c.id} className="adm-cat" data-cat>
            <h2 className="adm-cat__title">
              {c.name} <span className="adm-note">· {c.groupName}</span>
            </h2>
            <ul className="adm-list">
              {list.map((p) => (
                <li key={p.id} id={`p-${p.id}`} className={`adm-item${p.id === saved ? " adm-item--saved" : ""}`} data-name={p.name.toLocaleLowerCase("tr")}>
                  <Link href={`/qr/admin/urunler/${p.id}`} className="adm-item__link" data-testid="admin-product">
                    <span className="adm-item__name">{p.name}</span>
                    <span className="adm-item__price">
                      {p.variants.map((v) => [variantLabelTr(v.key), formatPrice(v.priceKurus)].filter(Boolean).join(" ")).join(" · ")}
                    </span>
                    {!p.isVisible ? <span className="adm-tag">Gizli</span> : null}
                    {p.soldOutUntil && Date.parse(p.soldOutUntil) > now ? <span className="adm-tag adm-tag--red">Tükendi</span> : null}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </>
  );
}

export default function ProductsPage(props: { searchParams: Promise<{ kaydedildi?: string }> }) {
  return (
    <>
      <p className="adm-crumb"><Link href="/qr/admin">← Menü yönetimi</Link></p>
      <h1 className="adm-h1">Ürünler</h1>
      <Suspense fallback={<p className="adm-note">Yükleniyor…</p>}>
        <Content {...props} />
      </Suspense>
    </>
  );
}

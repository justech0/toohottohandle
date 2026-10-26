import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { getPool } from "@/lib/db/client";
import { requireAdmin } from "@/lib/auth/session";
import { adminProductList } from "@/lib/admin/products";
import { formatPrice, variantLabelTr } from "@/lib/format/price";
import { soldOutOptions } from "@/lib/admin/soldOut";
import { ProductFilter } from "../_components/ProductFilter";
import { ProductOperations } from "./_components/ProductOperations";

const STATUS: Record<string, string> = {
  eklendi: "Ürün eklendi. Menüde hemen görünür.",
  cogaltildi: "Ürün çoğaltıldı.",
  silindi: "Ürün silindi.",
  tukendi: "Tükendi bilgisi güncellendi.",
  satista: "Ürün tekrar satışta.",
  gizlendi: "Ürün menüde gizlendi.",
  gorunur: "Ürün menüde görünür.",
  siralandi: "Ürün sırası güncellendi.",
};

async function Content({ searchParams }: { searchParams: Promise<{ kaydedildi?: string; islem?: string }> }) {
  await connection();
  await requireAdmin();
  const { categories, products, openingTime } = await adminProductList(getPool());
  const query = await searchParams;
  const saved = Number(query.kaydedildi);
  const status = query.islem ? STATUS[query.islem] : saved ? "Kaydedildi. Menüde hemen görünür." : null;
  const now = Date.now();
  const stockChoices = soldOutOptions(new Date(now), openingTime);
  return (
    <>
      {status ? <p className="adm-ok" role="status">{status}</p> : null}
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
              {list.map((p, index) => {
                const soldOut = Boolean(p.soldOutUntil && Date.parse(p.soldOutUntil) > now);
                return (
                <li key={p.id} id={`p-${p.id}`} className={`adm-item${p.id === saved ? " adm-item--saved" : ""}`} data-name={p.name.toLocaleLowerCase("tr")} data-product-id={p.id}>
                  <Link href={`/qr/admin/urunler/${p.id}`} className="adm-item__link" data-testid="admin-product">
                    <span className="adm-item__name">{p.name}</span>
                    <span className="adm-item__price">
                      {p.variants.map((v) => [variantLabelTr(v.key), formatPrice(v.priceKurus)].filter(Boolean).join(" ")).join(" · ")}
                    </span>
                    {!p.isVisible ? <span className="adm-tag">Gizli</span> : null}
                    {soldOut ? <span className="adm-tag adm-tag--red">Tükendi</span> : null}
                  </Link>
                  <ProductOperations
                    id={p.id}
                    name={p.name}
                    visible={p.isVisible}
                    soldOut={soldOut}
                    soldOutChoices={stockChoices}
                    first={index === 0}
                    last={index === list.length - 1}
                  />
                </li>
              )})}
            </ul>
          </section>
        );
      })}
    </>
  );
}

export default function ProductsPage(props: { searchParams: Promise<{ kaydedildi?: string; islem?: string }> }) {
  return (
    <>
      <p className="adm-crumb"><Link href="/qr/admin">← Menü yönetimi</Link></p>
      <div className="adm-heading-row">
        <h1 className="adm-h1">Ürünler</h1>
        <Link href="/qr/admin/urunler/yeni" className="adm-btn adm-btn--main adm-btn--link" data-testid="product-add">Ürün ekle</Link>
      </div>
      <Suspense fallback={<p className="adm-note">Yükleniyor…</p>}>
        <Content {...props} />
      </Suspense>
    </>
  );
}

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
import { AdminIcon } from "../_components/AdminIcon";

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

  const activeCount = products.filter((p) => !(p.soldOutUntil && Date.parse(p.soldOutUntil) > now) && p.isVisible).length;
  const soldOutCount = products.filter((p) => p.soldOutUntil && Date.parse(p.soldOutUntil) > now).length;

  return (
    <>
      {status ? (
        <div className="adm-ok" role="status">
          <AdminIcon name="check" size={18} />
          <span>{status}</span>
        </div>
      ) : null}

      <div className="adm-products-stats-bar">
        <span className="adm-pill-stat">
          Toplam <strong>{products.length}</strong> ürün
        </span>
        <span className="adm-pill-stat adm-pill-stat--green">
          <strong>{activeCount}</strong> satışta
        </span>
        {soldOutCount > 0 ? (
          <span className="adm-pill-stat adm-pill-stat--red">
            <strong>{soldOutCount}</strong> tükendi
          </span>
        ) : null}
      </div>

      <ProductFilter />

      {/* Kategoriye Hızlı Atlama Şeridi */}
      <nav className="adm-jump" aria-label="Kategorilere Hızlı Atlama">
        {categories.map((c) => {
          const count = products.filter((p) => p.categoryId === c.id).length;
          if (count === 0) return null;
          return (
            <a key={c.id} href={`#cat-${c.id}`} className="adm-jump__link">
              <span>{c.name}</span>
              <span className="adm-jump__count">{count}</span>
            </a>
          );
        })}
      </nav>

      {categories.map((c) => {
        const list = products.filter((p) => p.categoryId === c.id);
        if (!list.length) return null;
        return (
          <section key={c.id} id={`cat-${c.id}`} className="adm-cat" data-cat>
            <div className="adm-cat__header">
              <h2 className="adm-cat__title">
                {c.name}
              </h2>
              <span className="adm-cat__group-tag">{c.groupName}</span>
              <span className="adm-cat__count">{list.length} ürün</span>
            </div>

            <ul className="adm-list">
              {list.map((p, index) => {
                const soldOut = Boolean(p.soldOutUntil && Date.parse(p.soldOutUntil) > now);
                return (
                  <li
                    key={p.id}
                    id={`p-${p.id}`}
                    className={`adm-item${p.id === saved ? " adm-item--saved" : ""}${soldOut ? " adm-item--soldout" : ""}`}
                    data-name={p.name.toLocaleLowerCase("tr")}
                    data-product-id={p.id}
                  >
                    <Link href={`/qr/admin/urunler/${p.id}`} className="adm-item__link" data-testid="admin-product">
                      <div className="adm-item__info">
                        <span className="adm-item__name">{p.name}</span>
                        <div className="adm-item__badges">
                          {!p.isVisible ? <span className="adm-tag adm-tag--muted">Gizli</span> : null}
                          {soldOut ? <span className="adm-tag adm-tag--red">Tükendi</span> : null}
                        </div>
                      </div>
                      <div className="adm-item__prices-wrap">
                        <span className="adm-item__price">
                          {p.variants.map((v) => [variantLabelTr(v.key), formatPrice(v.priceKurus)].filter(Boolean).join(" ")).join(" · ")}
                        </span>
                        <AdminIcon name="chevron-right" size={16} className="adm-item__arrow" />
                      </div>
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
                );
              })}
            </ul>
          </section>
        );
      })}
    </>
  );
}

export default function ProductsPage(props: { searchParams: Promise<{ kaydedildi?: string; islem?: string }> }) {
  return (
    <div className="adm-products-view">
      <p className="adm-crumb">
        <Link href="/qr/admin">
          <AdminIcon name="chevron-left" size={16} />
          <span>Menü yönetimi</span>
        </Link>
      </p>

      <div className="adm-heading-row">
        <div>
          <h1 className="adm-h1">Ürünler ve Fiyatlar</h1>
          <p className="adm-subtitle">Menüdeki tüm ürünleri görüntüleyin, stok durumunu değiştirin veya düzenleyin</p>
        </div>
        <Link href="/qr/admin/urunler/yeni" className="adm-btn adm-btn--main adm-btn--link" data-testid="product-add">
          <AdminIcon name="plus" size={18} />
          <span>Yeni Ürün Ekle</span>
        </Link>
      </div>

      <Suspense fallback={<div className="adm-loading" />}>
        <Content {...props} />
      </Suspense>
    </div>
  );
}

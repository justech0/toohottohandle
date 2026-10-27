import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { getPool } from "@/lib/db/client";
import { requireAdmin } from "@/lib/auth/session";
import { adminProductList, adminTags } from "@/lib/admin/products";
import { ProductForm } from "../../_components/ProductForm";

async function Content() {
  await connection();
  await requireAdmin();
  const [{ categories }, tags] = await Promise.all([adminProductList(getPool()), adminTags(getPool())]);
  const initial = {
    id: "", name: "", categoryId: String(categories[0]?.id ?? ""), descTr: "", ingredientsTr: "",
    temp: "", inSuggest: "", isNew: "", isFeatured: "", isVisible: "on", sizes: "none", price0: "", price1: "",
    imageKey: "", imageFocusX: "0.5", imageFocusY: "0.5",
  };
  return <ProductForm initial={initial} categories={categories} tags={tags} />;
}

export default function NewProductPage() {
  return (
    <>
      <p className="adm-crumb"><Link href="/qr/admin/urunler">← Ürünler</Link></p>
      <h1 className="adm-h1">Yeni ürün</h1>
      <Suspense fallback={<p className="adm-note">Yükleniyor…</p>}><Content /></Suspense>
    </>
  );
}

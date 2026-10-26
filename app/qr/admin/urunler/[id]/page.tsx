import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { getPool } from "@/lib/db/client";
import { requireAdmin } from "@/lib/auth/session";
import { adminProductList, loadProductForm } from "@/lib/admin/products";
import { ProductForm } from "../../_components/ProductForm";

async function Content({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  await requireAdmin();
  const id = Number((await params).id);
  const initial = Number.isInteger(id) && id > 0 ? await loadProductForm(getPool(), id) : null;
  if (!initial) notFound();
  const { categories } = await adminProductList(getPool());
  return (
    <>
      <h1 className="adm-h1">{initial.name}</h1>
      <ProductForm initial={initial} categories={categories} />
    </>
  );
}

export default function EditProductPage(props: { params: Promise<{ id: string }> }) {
  return (
    <>
      <p className="adm-crumb"><Link href="/qr/admin/urunler">← Ürünler</Link></p>
      <Suspense fallback={<p className="adm-note">Yükleniyor…</p>}>
        <Content {...props} />
      </Suspense>
    </>
  );
}

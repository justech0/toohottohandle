import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { BrandIcon } from "../_components/BrandIcon";
import { AdminSidebar, AdminBottomNav } from "./_components/AdminNav";
import { AdminIcon } from "./_components/AdminIcon";
import "./admin.css";

export const metadata: Metadata = {
  title: "Too Hot To Handle · Admin",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="adm">
      <Suspense fallback={<aside className="adm-sidebar" aria-hidden="true" />}>
        <AdminSidebar />
      </Suspense>
      <div className="adm-content">
        <header className="adm-bar">
          <Link href="/qr/admin" className="adm-bar__home-link">
            <BrandIcon name="logo" label="Too Hot To Handle" />
          </Link>
          <span className="adm-bar__title">Admin</span>
          <Link href="/qr" target="_blank" rel="noopener noreferrer" className="adm-bar__live-link" aria-label="Canlı menüyü aç">
            <AdminIcon name="eye" size={17} />
            <span>Menü</span>
          </Link>
        </header>
        <main className="adm-main">{children}</main>
        <Suspense fallback={null}>
          <AdminBottomNav />
        </Suspense>
      </div>
    </div>
  );
}

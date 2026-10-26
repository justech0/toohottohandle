import type { Metadata } from "next";
import { BrandIcon } from "../_components/BrandIcon";
import "./admin.css";

export const metadata: Metadata = { title: "Too Hot To Handle · Admin", robots: { index: false, follow: false } };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="adm">
      <header className="adm-bar">
        <BrandIcon name="logo" label="Too Hot To Handle" />
        <span className="adm-bar__title">Admin</span>
      </header>
      <main className="adm-main">{children}</main>
    </div>
  );
}

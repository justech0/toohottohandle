"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandIcon } from "@/app/qr/_components/BrandIcon";
import { AdminIcon, type AdminIconName } from "./AdminIcon";

interface NavItem {
  href: string;
  label: string;
  icon: AdminIconName;
  exact?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/qr/admin", label: "Genel Bakış", icon: "overview", exact: true },
  { href: "/qr/admin/vitrin", label: "Vitrin", icon: "photos" },
  { href: "/qr/admin/ne-icsem", label: "Ne içsem", icon: "products" },
  { href: "/qr/admin/kullanicilar", label: "Kullanıcılar", icon: "overview" },
  { href: "/qr/admin/urunler", label: "Ürünler & Stok", icon: "products" },
  { href: "/qr/admin/katalog", label: "Katalog & Menü", icon: "catalog" },
  { href: "/qr/admin/fotograflar", label: "Afişler", icon: "photos" },
  { href: "/qr/admin/toplu-fiyat", label: "Toplu Fiyat", icon: "bulk" },
  { href: "/qr/admin/toplu-urun", label: "Toplu Ürün Yükle", icon: "plus" },
  { href: "/qr/admin/yedek", label: "Dışarı aktar", icon: "backup" },
  { href: "/qr/admin/istatistik", label: "WiFi, istatistik ve QR", icon: "stats" },
  { href: "/qr/admin/geri-bildirim", label: "Geri Bildirim", icon: "feedback" },
  { href: "/qr/admin/kopyalar", label: "Loglar", icon: "copies" },
];

const MOBILE_NAV_ITEMS: NavItem[] = [
  { href: "/qr/admin", label: "Özet", icon: "overview", exact: true },
  { href: "/qr/admin/urunler", label: "Ürünler", icon: "products" },
  { href: "/qr/admin/katalog", label: "Katalog", icon: "catalog" },
  { href: "/qr/admin/istatistik", label: "İstatistik", icon: "stats" },
];

const AUTH_PATHS = ["/qr/admin/giris", "/qr/admin/kurulum", "/qr/admin/sifirla", "/qr/admin/sifre-degistir"];

export function AdminSidebar({ unreadFeedback = 0 }: { unreadFeedback?: number }) {
  const pathname = usePathname();
  const [dismissedCount, setDismissedCount] = useState<number | null>(null);

  const isCurrent = (item: NavItem) =>
    item.exact ? pathname === item.href : pathname === item.href || pathname?.startsWith(`${item.href}/`);

  const onFeedbackPage = pathname === "/qr/admin/geri-bildirim" || Boolean(pathname?.startsWith("/qr/admin/geri-bildirim/"));
  const onAuthPage = AUTH_PATHS.some((p) => pathname === p || pathname?.startsWith(`${p}/`));

  useEffect(() => {
    if (onFeedbackPage && unreadFeedback > 0) {
      setDismissedCount(unreadFeedback);
    }
  }, [onFeedbackPage, unreadFeedback]);

  const effectiveUnread = onFeedbackPage || onAuthPage || dismissedCount === unreadFeedback ? 0 : unreadFeedback;

  return (
    <aside className="adm-sidebar" aria-label="Yönetim Menüsü">
      <div className="adm-sidebar__brand">
        <Link href="/qr/admin" className="adm-sidebar__logo-link">
          <BrandIcon name="logo" label="Too Hot To Handle" />
        </Link>
        <span className="adm-sidebar__badge">ADMIN</span>
      </div>

      <nav className="adm-sidebar__nav" aria-label="Ana Bölümler">
        <ul className="adm-sidebar__list">
          {NAV_ITEMS.map((item) => {
            const active = isCurrent(item);
            const showUnread = item.href === "/qr/admin/geri-bildirim" && effectiveUnread > 0;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`adm-sidebar__link${active ? " adm-sidebar__link--active" : ""}`}
                  aria-current={active ? "page" : undefined}
                >
                  <AdminIcon name={item.icon} size={19} />
                  <span className="adm-sidebar__label">
                    {item.label}
                    {showUnread ? (
                      <span
                        className="adm-sidebar__unread-badge"
                        data-testid="feedback-unread-badge"
                        aria-label={`${effectiveUnread} okunmamış geri bildirim`}
                      >
                        {effectiveUnread > 99 ? "99+" : effectiveUnread}
                      </span>
                    ) : null}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="adm-sidebar__footer">
        <Link href="/qr" target="_blank" rel="noopener noreferrer" className="adm-sidebar__preview-btn">
          <AdminIcon name="eye" size={17} />
          <span>Canlı Menüyü Aç</span>
        </Link>
      </div>
    </aside>
  );
}

export function AdminBottomNav() {
  const pathname = usePathname();

  const isCurrent = (item: NavItem) =>
    item.exact ? pathname === item.href : pathname === item.href || pathname?.startsWith(`${item.href}/`);

  return (
    <nav className="adm-bottom-nav" aria-label="Mobil Gezinme">
      {MOBILE_NAV_ITEMS.map((item) => {
        const active = isCurrent(item);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`adm-bottom-nav__item${active ? " adm-bottom-nav__item--active" : ""}`}
            aria-current={active ? "page" : undefined}
          >
            <AdminIcon name={item.icon} size={20} />
            <span className="adm-bottom-nav__label">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

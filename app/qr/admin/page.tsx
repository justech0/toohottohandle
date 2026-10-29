import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import type { RowDataPacket } from "mysql2/promise";
import { requireAdmin } from "@/lib/auth/session";
import { getPool, hasDb } from "@/lib/db/client";
import { lastChange } from "@/lib/admin/products";
import { catalogData } from "@/lib/admin/catalog";
import { getBackupStatus } from "@/lib/admin/backups";
import { feedbackSummary } from "@/lib/feedback/store";
import { readStatsReport } from "@/lib/stats/server";
import { logout, logoutEverywhere } from "./actions";
import { undoLastAction } from "./urunler/actions";
import { AdminIcon } from "./_components/AdminIcon";

const when = (iso: string) =>
  new Intl.DateTimeFormat("tr-TR", {
    timeZone: "Europe/Istanbul",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));

async function Content({ searchParams }: { searchParams: Promise<{ geri?: string; toplu?: string }> }) {
  await connection();
  if (!hasDb()) redirect("/qr/admin/giris");
  const admin = await requireAdmin();
  const pool = getPool();

  const [last, catalog, backup, statsReport, [productCounts]] = await Promise.all([
    lastChange(pool),
    catalogData(pool),
    getBackupStatus(pool),
    readStatsReport(pool).catch(() => ({ enabled: false, opens: { today: 0, last7: 0, last30: 0 } })),
    pool.query<RowDataPacket[]>(
      `SELECT 
        COUNT(*) AS total,
        SUM(CASE WHEN sold_out_until IS NOT NULL AND sold_out_until > NOW() THEN 1 ELSE 0 END) AS sold_out,
        SUM(CASE WHEN is_visible = 1 THEN 1 ELSE 0 END) AS visible
       FROM products`,
    ).catch(() => [[{ total: 0, sold_out: 0, visible: 0 } as RowDataPacket]]),
  ]);

  const query = await searchParams;
  const feedback = await feedbackSummary(getPool());
  const undone = Boolean(query.geri);
  const totalProducts = Number(productCounts[0]?.total ?? 0);
  const soldOutProducts = Number(productCounts[0]?.sold_out ?? 0);
  const activeProducts = totalProducts - soldOutProducts;

  return (
    <div className="adm-dashboard">
      <div className="adm-header">
        <div>
          <h1 className="adm-h1">Menü Yönetimi</h1>
          <p className="adm-lead">
            Yönetici: <span className="adm-lead__email" data-testid="admin-email">{admin.email}</span>
          </p>
        </div>
      </div>

      {undone ? (
        <div className="adm-ok" role="status">
          <AdminIcon name="check" size={18} />
          <span>Son işlem geri alındı.</span>
        </div>
      ) : null}

      {query.toplu ? (
        <div className="adm-ok" role="status">
          <AdminIcon name="check" size={18} />
          <span>Toplu fiyat uygulandı.</span>
        </div>
      ) : null}

      {catalog.usesTestWifi ? (
        <div className="adm-warning" role="alert">
          <AdminIcon name="alert" size={18} />
          <span>WiFi test bilgisi kullanılıyor</span>
        </div>
      ) : null}

      {/* KPI Özet Kartları */}
      <section className="adm-kpi-grid" aria-label="Genel Metrikler">
        <Link href="/qr/admin/urunler" className="adm-kpi-card">
          <div className="adm-kpi-card__head">
            <span className="adm-kpi-card__label">Aktif Menü</span>
            <AdminIcon name="products" size={20} className="adm-kpi-card__icon" />
          </div>
          <span className="adm-kpi-card__num">{totalProducts} Ürün</span>
          <span className="adm-kpi-card__sub">
            <span className="adm-dot adm-dot--green" /> {activeProducts} Satışta
            {soldOutProducts > 0 ? (
              <> · <span className="adm-dot adm-dot--red" /> {soldOutProducts} Tükendi</>
            ) : null}
          </span>
        </Link>

        <Link href="/qr/admin/istatistik" className="adm-kpi-card">
          <div className="adm-kpi-card__head">
            <span className="adm-kpi-card__label">Bugün Ziyaret</span>
            <AdminIcon name="stats" size={20} className="adm-kpi-card__icon" />
          </div>
          <span className="adm-kpi-card__num">{statsReport.opens.today}</span>
          <span className="adm-kpi-card__sub">Son 7 günde {statsReport.opens.last7} görüntülenme</span>
        </Link>

        <Link href="/qr/admin/yedek" className="adm-kpi-card">
          <div className="adm-kpi-card__head">
            <span className="adm-kpi-card__label">Sistem & Yedek</span>
            <AdminIcon name="backup" size={20} className="adm-kpi-card__icon" />
          </div>
          <p className={`adm-backup-status${backup.stale ? " adm-backup-status--stale" : ""}`}>
            {backup.label}
          </p>
          <span className="adm-kpi-card__sub">
            {backup.stale ? "Yedek alınması önerilir" : "Menü güvende"}
          </span>
        </Link>
      </section>

      {/* Hızlı Erişim Navigasyon Kartları */}
      <nav className="adm-grid-nav" aria-label="Bölümler">
        <Link href="/qr/admin/urunler" className="adm-nav-tile adm-nav-tile--featured">
          <div className="adm-nav-tile__icon-wrap">
            <AdminIcon name="products" size={24} />
          </div>
          <div className="adm-nav-tile__body">
            <h2 className="adm-nav-tile__title">Ürünler ve fiyatlar</h2>
            <p className="adm-nav-tile__desc">Fiyat güncelleme, tek tıkla tükendi/stokta işaretleme ve yeni ürün ekleme</p>
          </div>
          <AdminIcon name="chevron-right" size={18} className="adm-nav-tile__arrow" />
        </Link>

        <Link href="/qr/admin/katalog" className="adm-nav-tile">
          <div className="adm-nav-tile__icon-wrap">
            <AdminIcon name="catalog" size={24} />
          </div>
          <div className="adm-nav-tile__body">
            <h2 className="adm-nav-tile__title">Katalog ve ayarlar</h2>
            <p className="adm-nav-tile__desc">Gruplar, kategoriler, etiketler, WiFi şifresi ve çalışma saatleri</p>
          </div>
          <AdminIcon name="chevron-right" size={18} className="adm-nav-tile__arrow" />
        </Link>

        <Link href="/qr/admin/fotograflar" className="adm-nav-tile">
          <div className="adm-nav-tile__icon-wrap">
            <AdminIcon name="photos" size={24} />
          </div>
          <div className="adm-nav-tile__body">
            <h2 className="adm-nav-tile__title">Afiş fotoğrafları</h2>
            <p className="adm-nav-tile__desc">Vitrin hero slaytları yükleme ve dokunmatik odak noktası belirleme</p>
          </div>
          <AdminIcon name="chevron-right" size={18} className="adm-nav-tile__arrow" />
        </Link>

        <Link href="/qr/admin/toplu-fiyat" className="adm-nav-tile">
          <div className="adm-nav-tile__icon-wrap">
            <AdminIcon name="bulk" size={24} />
          </div>
          <div className="adm-nav-tile__body">
            <h2 className="adm-nav-tile__title">Toplu fiyat</h2>
            <p className="adm-nav-tile__desc">Tüm menüye veya seçili kategorilere yüzdelik / sabit fiyat güncellemesi</p>
          </div>
          <AdminIcon name="chevron-right" size={18} className="adm-nav-tile__arrow" />
        </Link>

        <Link href="/qr/admin/kopyalar" className="adm-nav-tile">
          <div className="adm-nav-tile__icon-wrap">
            <AdminIcon name="copies" size={24} />
          </div>
          <div className="adm-nav-tile__body">
            <h2 className="adm-nav-tile__title">Kopyalar</h2>
            <p className="adm-nav-tile__desc">Otomatik kaydedilen menü kopyaları ve geçmişe anında geri dönme</p>
          </div>
          <AdminIcon name="chevron-right" size={18} className="adm-nav-tile__arrow" />
        </Link>

        <Link href="/qr/admin/yedek" className="adm-nav-tile">
          <div className="adm-nav-tile__icon-wrap">
            <AdminIcon name="backup" size={24} />
          </div>
          <div className="adm-nav-tile__body">
            <h2 className="adm-nav-tile__title">Yedek</h2>
            <p className="adm-nav-tile__desc">Tüm fotoğrafları ve menü veritabanını tek ZIP olarak indirme / geri yükleme</p>
          </div>
          <AdminIcon name="chevron-right" size={18} className="adm-nav-tile__arrow" />
        </Link>

        <Link href="/qr/admin/istatistik" className="adm-nav-tile">
          <div className="adm-nav-tile__icon-wrap">
            <AdminIcon name="stats" size={24} />
          </div>
          <div className="adm-nav-tile__body">
            <h2 className="adm-nav-tile__title">İstatistik ve QR</h2>
            <p className="adm-nav-tile__desc">Popüler ürünler, saatlik yoğunluk ve baskıya hazır logolu vektör QR kod</p>
          </div>
          <AdminIcon name="chevron-right" size={18} className="adm-nav-tile__arrow" />
        </Link>
      </nav>

      <section className="adm-card" data-testid="feedback-summary">
        <h2 className="adm-card__title">Geri bildirim</h2>
        <p>{feedback.unread} okunmamış · Son 30 gün: {feedback.average === null ? "Henüz puan yok" : `${feedback.average.toFixed(1)} / 5`}</p>
        {feedback.latest.length ? <ul className="feedback-latest">{feedback.latest.map((item) => <li key={item.id}>{item.message.split("\n")[0].slice(0, 100)}</li>)}</ul> : <p className="adm-note">Misafirlerin görüşleri burada toplanır.</p>}
        <Link href="/qr/admin/geri-bildirim" className="adm-btn adm-btn--block">Geri bildirimleri aç</Link>
      </section>

      {/* Son Değişiklik ve Hızlı Geri Al */}
      <section className="adm-card adm-undo-section" aria-labelledby="last-title">
        <div className="adm-undo-section__head">
          <AdminIcon name="undo" size={20} className="adm-undo-section__icon" />
          <h2 id="last-title" className="adm-card__title">Son değişiklik</h2>
        </div>
        {last ? (
          <div className="adm-undo-section__content">
            <div className="adm-undo-section__info">
              <p className="adm-undo-section__summary" data-testid="last-change">{last.summary}</p>
              <p className="adm-note">{when(last.at)}</p>
            </div>
            <form action={undoLastAction} className="adm-undo-section__form">
              <button
                type="submit"
                className="adm-btn adm-btn--main adm-undo-btn"
                disabled={!last.canUndo}
                data-testid="undo"
              >
                <AdminIcon name="undo" size={16} />
                <span>Son işlemi geri al</span>
              </button>
            </form>
            {!last.canUndo ? <p className="adm-note">Geri alınacak işlem yok.</p> : null}
          </div>
        ) : (
          <p className="adm-note">Henüz değişiklik yok.</p>
        )}
      </section>

      {/* Oturum & Güvenlik */}
      <section className="adm-card adm-session-card">
        <h2 className="adm-card__title">Oturum</h2>
        <div className="adm-row">
          <form action={logout}>
            <button type="submit" className="adm-btn adm-btn--outline">
              <AdminIcon name="logout" size={16} />
              <span>Çıkış yap</span>
            </button>
          </form>
          <form action={logoutEverywhere}>
            <button type="submit" className="adm-btn adm-btn--danger-outline">
              <span>Tüm cihazlardan çıkış yap</span>
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

export default function AdminHome(props: { searchParams: Promise<{ geri?: string; toplu?: string }> }) {
  return (
    <Suspense fallback={<div className="adm-loading" />}>
      <Content {...props} />
    </Suspense>
  );
}

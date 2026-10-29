import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";
import { WifiSettings } from "./WifiSettings";
import { catalogData } from "@/lib/admin/catalog";
import { hasDb, getPool } from "@/lib/db/client";
import { getStatsReport, type StatsReport } from "@/lib/stats/server";

function HourlyChart({ values }: { values: number[] }) {
  const max = Math.max(1, ...values);
  const baseline = 150;
  return (
    <svg className="adm-chart" viewBox="0 0 720 184" role="img" aria-label="Saatlere göre menü açılışı">
      <title>Saatlere göre menü açılışı</title>
      <desc>Son 30 gündeki menü açılışlarının saatlere göre toplamı.</desc>
      <line x1="34" y1={baseline} x2="704" y2={baseline} className="adm-chart__axis" />
      {values.map((value, hour) => {
        const height = value ? Math.max(3, value / max * 118) : 0;
        const x = 42 + hour * 27.3;
        return (
          <g key={hour}>
            <rect x={x} y={baseline - height} width="17" height={height} rx="3" className="adm-chart__bar">
              <title>{`${String(hour).padStart(2, "0")}:00 — ${value} açılış`}</title>
            </rect>
            {hour % 4 === 0 ? <text x={x + 8.5} y="170" textAnchor="middle" className="adm-chart__label">{String(hour).padStart(2, "0")}</text> : null}
          </g>
        );
      })}
    </svg>
  );
}

function Report({ report }: { report: StatsReport }) {
  return (
    <div className="adm-stats">
      {!report.enabled ? (
        <p className="adm-warning" role="status">İstatistik kapalı. <Link href="/qr/admin/istatistik#settings">Ayarlardan aç</Link></p>
      ) : null}

      <section className="adm-stat-grid" aria-label="Menü açılışları">
        <article className="adm-stat"><span data-testid="stats-today">{report.opens.today}</span><h2>Bugün</h2></article>
        <article className="adm-stat"><span>{report.opens.last7}</span><h2>Son 7 gün</h2></article>
        <article className="adm-stat"><span>{report.opens.last30}</span><h2>Son 30 gün</h2></article>
      </section>

      <section className="adm-card">
        <h2 className="adm-card__title">En çok açılan ürünler</h2>
        {report.topProducts.length ? (
          <ol className="adm-ranking" data-testid="top-products">
            {report.topProducts.map((product) => <li key={product.productId}><span>{product.name}</span><strong>{product.views}</strong></li>)}
          </ol>
        ) : <p className="adm-note" data-testid="top-products">Henüz ürün detayı açılmadı.</p>}
      </section>

      <section className="adm-card">
        <h2 className="adm-card__title">Saatlere göre menü açılışı</h2>
        <p className="adm-note">Son 30 gün · İstanbul saati</p>
        <HourlyChart values={report.hourly} />
        <table className="sr-only">
          <caption>Saatlere göre menü açılışı, son 30 gün</caption>
          <thead><tr><th scope="col">Saat</th><th scope="col">Açılış</th></tr></thead>
          <tbody>{report.hourly.map((value, hour) => <tr key={hour}><th scope="row">{`${String(hour).padStart(2, "0")}:00`}</th><td>{value}</td></tr>)}</tbody>
        </table>
      </section>

      <section className="adm-card adm-qr">
        <div>
          <h2 className="adm-card__title">Logolu menü QR’ı</h2>
          <p className="adm-note">Baskıda QR alanı en az 3 × 3 cm olmalı. İndirmeden sonra telefonlarla okutma kontrolünü tamamla.</p>
        </div>
        {/* SVG yalnız admin oturumuyla ve no-store olarak gelir. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/qr/api/admin/qr" alt="Logolu menü QR önizlemesi" className="adm-qr__preview" />
        <a className="adm-btn adm-btn--main adm-btn--link" href="/qr/api/admin/qr?indir=1" download>Logolu SVG indir</a>
        <a className="adm-btn adm-btn--link" href="/qr/brand/qr-logolu.png" download="qr-logolu.png">PNG indir</a>
      </section>
    </div>
  );
}

async function Content() {
  await connection();
  if (!hasDb()) redirect("/qr/admin/giris");
  await requireAdmin();
  return <><WifiSettings data={await catalogData(getPool())} /><Report report={await getStatsReport()} /></>;
}

export default function StatsPage() {
  return (
    <>
      <p className="adm-crumb"><Link href="/qr/admin">← Menü yönetimi</Link></p>
      <h1 className="adm-h1">WiFi, istatistik ve QR</h1>
      <p className="adm-lead">Kişisel veri veya çerez tutulmaz.</p>
      <Suspense fallback={<p className="adm-note">Yükleniyor…</p>}><Content /></Suspense>
    </>
  );
}

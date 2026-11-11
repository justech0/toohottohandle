import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: { serverActions: { bodySizeLimit: "2mb" } },
  cacheComponents: true,
  async headers() {
    const noindex = [{ key: "X-Robots-Tag", value: "noindex, nofollow" }];
    // Güvenlik başlıkları: başka site gömemez (admin'e tıklama tuzağı), tür tahmini yok, yalnızca HTTPS.
    const security = [
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Strict-Transport-Security", value: "max-age=31536000" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
    ];
    return [
      { source: "/:path*", headers: security },
      { source: "/qr/admin", headers: noindex },
      { source: "/qr/admin/:path*", headers: noindex },
      { source: "/qr/api/:path*", headers: noindex },
    ];
  },
  // www.toohottohandlecoffee.com tek adrese (yolu koruyarak) kalıcı yönlenir.
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.toohottohandlecoffee.com" }],
        destination: "https://toohottohandlecoffee.com/:path*",
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      { source: "/", destination: "/yakinda/index.html" },
      { source: "/assets/:path*", destination: "/yakinda/assets/:path*" },
    ];
  },
};

export default nextConfig;

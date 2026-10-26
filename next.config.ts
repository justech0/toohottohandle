import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  async headers() {
    const noindex = [{ key: "X-Robots-Tag", value: "noindex, nofollow" }];
    return [
      { source: "/qr/admin", headers: noindex },
      { source: "/qr/admin/:path*", headers: noindex },
      { source: "/qr/api/:path*", headers: noindex },
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

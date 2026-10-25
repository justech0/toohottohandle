import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  async rewrites() {
    return [
      { source: "/", destination: "/yakinda/index.html" },
      { source: "/assets/:path*", destination: "/yakinda/assets/:path*" },
    ];
  },
};

export default nextConfig;

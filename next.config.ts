import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/content/:path*",
        destination: "https://uithub.com/:path*",
      },
    ];
  },
};

export default nextConfig;

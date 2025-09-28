import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: '/customer/fb6fd883-5dd3-43cf-8486-7d4a91688051',
  assetPrefix: '/customer/fb6fd883-5dd3-43cf-8486-7d4a91688051',
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*",
        port: "",
        pathname: "**",
      },
      {
        protocol: "http",
        hostname: "*",
        port: "",
        pathname: "**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: process.env.NEXT_PUBLIC_BACKEND_PORT,
        pathname: "/v1/assets/**",
      },
    ],
    unoptimized: true,
  },
  output: "export",
  trailingSlash: true,
};

export default nextConfig;

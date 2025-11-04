import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Ensure webhook routes don't get redirected
  async rewrites() {
    return [];
  },
  async redirects() {
    return [];
  },
};

export default nextConfig;

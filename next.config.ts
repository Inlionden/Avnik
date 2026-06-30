import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root (a stray lockfile exists in a parent dir).
  turbopack: { root: __dirname },
};

export default nextConfig;

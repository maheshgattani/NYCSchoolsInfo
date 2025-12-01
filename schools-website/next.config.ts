import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  /* config options here */
  reactStrictMode: true,
  transpilePackages: ['@mui/x-data-grid'],
};

export default nextConfig;

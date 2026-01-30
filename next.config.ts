import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable static export for Electron production builds
  output: process.env.ELECTRON_BUILD === 'true' ? 'export' : undefined,

  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },

  // Configure for Electron
  // trailingSlash: true,
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    // ⚠️ This will ignore all TypeScript errors during build
    ignoreBuildErrors: true,
  },
  eslint: {
    // This will ignore ALL ESLint errors during build
    ignoreDuringBuilds: true,
  },
  images: {
    // domains: [
    //   'lh3.googleusercontent.com', // For Google user profile images
    //   'googleusercontent.com',     // Alternative Google domain
    //   '*',
    // ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;

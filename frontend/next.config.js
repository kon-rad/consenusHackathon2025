/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['lh3.googleusercontent.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  typescript: {
    // ⚠️ This will ignore all TypeScript errors during build
    ignoreBuildErrors: true,
  },
  eslint: {
    // This will ignore ALL ESLint errors during build
    ignoreDuringBuilds: true,
  },
  // ... other Next.js config options
}

module.exports = nextConfig 
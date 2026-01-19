/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['images.unsplash.com'],
  },
  // Enable experimental features for better performance
  experimental: {
    optimizePackageImports: ['@react-pdf/renderer'],
  },
  // Temporarily ignore TypeScript errors during build
  // TODO: Fix all type errors and remove this
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig


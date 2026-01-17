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
}

module.exports = nextConfig


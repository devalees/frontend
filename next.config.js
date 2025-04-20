/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost', 'api.example.com'],
    formats: ['image/avif', 'image/webp'],
  },
  publicRuntimeConfig: {
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
    environment: process.env.NODE_ENV,
  },
  experimental: {
    turbotrace: {
      logLevel: 'error',
      logDetail: false,
    },
    optimizeCss: true,
    scrollRestoration: true,
  },
}

module.exports = nextConfig 
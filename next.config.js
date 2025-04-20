/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost', 'api.example.com'],
  },
  publicRuntimeConfig: {
    apiUrl: process.env.NEXT_PUBLIC_API_URL,
    wsUrl: process.env.NEXT_PUBLIC_WS_URL,
  },
  experimental: {
    turbotrace: {
      logLevel: 'error',
      logDetail: true,
    },
  },
  // Enable static exports if needed
  // output: 'export',
  
  // Configure webpack if needed
  webpack: (config, { isServer }) => {
    // Add any webpack configurations here
    return config;
  },
}

module.exports = nextConfig 
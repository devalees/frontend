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
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/api/:path*',
        basePath: false
      }
    ];
  },
  async headers() {
    return [
      {
        // Apply these headers to all routes
        source: '/:path*',
        headers: [
          { 
            key: 'Access-Control-Allow-Credentials', 
            value: 'true' 
          },
          { 
            key: 'Access-Control-Allow-Origin', 
            value: '*' 
          },
          { 
            key: 'Access-Control-Allow-Methods', 
            value: 'GET,DELETE,PATCH,POST,PUT,OPTIONS' 
          },
          { 
            key: 'Access-Control-Allow-Headers', 
            value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' 
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig 
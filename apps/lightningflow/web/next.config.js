/** @type {import('next').NextConfig} */
const path = require('path');
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

const nextConfig = {
  basePath,
  output: 'standalone',
  outputFileTracingRoot: path.join(__dirname, '../../..'),
  reactStrictMode: true,
  // Performance optimizations
  poweredByHeader: false,
  compress: true,
  // Legacy UI lint/type debt is tracked separately; keep production builds
  // deployable while `pnpm exec tsc --noEmit` remains the explicit quality gate.
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Image optimization
  images: {
    domains: [],
    formats: ['image/avif', 'image/webp'],
  },
  
  // Optimize chunk size with a simpler, more stable config
  webpack: (config, { isServer }) => {
    // Only apply to client-side bundles
    if (!isServer) {
      // Modify the client webpack config with a simpler approach
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          framework: {
            name: 'framework',
            test: /[\\/]node_modules[\\/](react|react-dom|next)[\\/]/,
            priority: 40,
            enforce: true,
          },
          commons: {
            name: 'commons',
            minChunks: 2,
            priority: 20,
          },
          shared: {
            name: 'shared',
            test: /[\\/]node_modules[\\/]/,
            priority: 10,
          },
        },
      };
    }
    
    return config;
  },
}

module.exports = nextConfig 
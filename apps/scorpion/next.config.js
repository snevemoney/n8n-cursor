/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    instrumentationHook: true,
    // Optimize navigation performance
    optimizePackageImports: ['lucide-react', 'recharts'],
    // Enable faster page transitions
    optimizeCss: true,
    // Enable faster server components
    serverComponentsExternalPackages: ['@scorpion/core'],
    // Optimize font loading
    optimizeServerReact: true,
  },
  // Enable faster page transitions
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
    // Enable React compiler optimizations
    styledComponents: false,
  },
  // Optimize images and static assets
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },
  transpilePackages: ['@scorpion/core'],
  // Optimize production builds
  swcMinify: true,
  // Enable static optimization where possible
  output: 'standalone',
  // Performance optimizations
  compress: true,
  // Optimize bundle size
  webpack: (config, { dev, isServer }) => {
    // Optimize chunk splitting for better caching
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // Vendor chunk for node_modules
            vendor: {
              name: 'vendor',
              chunks: 'all',
              test: /node_modules/,
              priority: 20,
            },
            // Common chunk for shared code
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 10,
              reuseExistingChunk: true,
            },
            // Separate chunk for large libraries
            recharts: {
              name: 'recharts',
              test: /[\\/]node_modules[\\/]recharts[\\/]/,
              chunks: 'all',
              priority: 30,
            },
          },
        },
      };
    }
    return config;
  },
}

module.exports = nextConfig


/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Performance optimizations
  poweredByHeader: false,
  compress: true,
  
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
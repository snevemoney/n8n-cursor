const webpack = require('webpack');

// Bundle analyzer (only enabled when ANALYZE=true)
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const basePath = (process.env.NEXT_PUBLIC_BASE_PATH || '').replace(/\/$/, '');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  ...(basePath ? { basePath, assetPrefix: basePath } : {}),

  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
  experimental: {
    instrumentationHook: true,
    // Optimize navigation performance
    // Note: Removed 'recharts' since we use dynamic imports for it
    optimizePackageImports: ['lucide-react'],
    // Enable faster page transitions
    optimizeCss: true,
    // Enable faster server components
    serverComponentsExternalPackages: ['@scorpion/core', 'undici'],
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
  // Transpile @scorpion/core TypeScript files (package points to src/, not dist/)
  transpilePackages: ['@scorpion/core'],
  // Optimize production builds
  swcMinify: true,
  // Enable static optimization where possible (only in production)
  ...(process.env.NODE_ENV === 'production' ? { output: 'standalone' } : {}),
  // Performance optimizations
  compress: true,
  // Optimize bundle size
  webpack: (config, { dev, isServer }) => {
    // Disable filesystem caching in dev to avoid *.pack.gz ENOENT errors
    if (dev) {
      config.cache = false;
    }
    
    // Exclude undici from webpack processing (uses private class fields that webpack can't parse)
    // undici is a Node.js-only package and should not be bundled
    config.externals = config.externals || [];
    if (isServer) {
      // Externalize undici on server-side to prevent webpack from trying to parse it
      const originalExternals = config.externals;
      config.externals = [
        ...(Array.isArray(originalExternals) ? originalExternals : [originalExternals]),
        ({ request }, callback) => {
          if (request && request.includes('undici')) {
            return callback(null, `commonjs ${request}`);
          }
          if (typeof originalExternals === 'function') {
            return originalExternals({ request }, callback);
          }
          callback();
        },
      ].filter(Boolean);
    }
    
    // Ignore undici in webpack resolve to prevent bundling issues
    config.resolve = config.resolve || {};
    config.resolve.alias = config.resolve.alias || {};
    
    // Replace enhanced_chatbot_prompts with empty module to prevent webpack warnings
    // This is an optional module that's handled gracefully with try-catch in the code
    config.plugins = config.plugins || [];
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(
        /enhanced_chatbot_prompts/,
        require.resolve('./lib/webpack-stubs/enhanced_chatbot_prompts.js')
      )
    );
    
    // Suppress warnings for optional dependencies that are handled gracefully
    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      // jsonrepair is an optional dependency, handled gracefully in code
      { module: /jsonrepair/ },
      // enhanced_chatbot_prompts is an optional TypeScript module, handled gracefully in code
      { module: /enhanced_chatbot_prompts/ },
      { message: /enhanced_chatbot_prompts/ },
      // Also suppress warnings about missing modules in general if they're handled gracefully
      (warning) => {
        if (!warning || !warning.message) return false;
        const msg = String(warning.message);
        return msg.includes('enhanced_chatbot_prompts') ||
               msg.includes("Can't resolve") && msg.includes('enhanced_chatbot_prompts') ||
               msg.includes('Module not found') && msg.includes('enhanced_chatbot_prompts');
      },
    ];
    
    // Optimize chunk splitting for better caching (production only)
    // Note: Let Next.js handle chunk naming to avoid path resolution issues
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
              test: /[\\/]node_modules[\\/]/,
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
          },
        },
      };
    }
    return config;
  },
}

module.exports = withBundleAnalyzer(nextConfig)


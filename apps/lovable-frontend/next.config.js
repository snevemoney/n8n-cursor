/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  
  // Cursor 2.0 preview support
  async headers() {
    return [
      {
        source: '/healthz',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, must-revalidate',
          },
        ],
      },
    ];
  },
  
  // Image optimization
  images: {
    domains: [
      'evenslouis.ca',
      'n8n.local',
      'localhost',
      'lightningflow.local',
      'app.lightningflow.local',
      'lightningflow.online'
    ],
    formats: ['image/avif', 'image/webp'],
  },
}

module.exports = nextConfig


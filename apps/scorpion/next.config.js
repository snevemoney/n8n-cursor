/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    instrumentationHook: true,
  },
}

module.exports = nextConfig


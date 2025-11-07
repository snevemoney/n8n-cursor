/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    instrumentationHook: true,
  },
  transpilePackages: ['@scorpion/core'],
}

module.exports = nextConfig


/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Static export so preview can ship on Vercel or any static host.
  output: 'export',
};

module.exports = nextConfig;

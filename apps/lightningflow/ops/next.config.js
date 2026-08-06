/** @type {import('next').NextConfig} */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''

const nextConfig = {
  basePath,
  experimental: {
    appDir: true,
  },
}

module.exports = nextConfig

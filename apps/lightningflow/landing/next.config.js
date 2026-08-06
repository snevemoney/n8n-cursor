/** @type {import('next').NextConfig} */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
const assetPrefix = process.env.NEXT_PUBLIC_ASSET_PREFIX || undefined

const nextConfig = {
  basePath,
  assetPrefix,
}

module.exports = nextConfig

/** @type {import('next').NextConfig} */
const path = require('path')
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''

const nextConfig = {
  basePath,
  output: 'standalone',
  outputFileTracingRoot: path.join(__dirname, '../../..'),
}

module.exports = nextConfig

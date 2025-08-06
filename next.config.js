/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  typescript: {
    // 忽略构建时的类型错误
    ignoreBuildErrors: true,
  },
  eslint: {
    // 忽略构建时的 ESLint 错误
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
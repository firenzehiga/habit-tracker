/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: { 
    optimizePackageImports: ['lucide-react'],
  },
  // Optimize compilation
  swcMinify: true,
  // Enable static optimization
  output: 'standalone',
}

export default nextConfig

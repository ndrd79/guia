/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Temporariamente desabilitado para evitar erros de hidratação
  swcMinify: true,
  experimental: {
    // Configurações para melhorar a hidratação
    optimizeCss: true,
    scrollRestoration: true,
  },
  compiler: {
    // Remove console.log em produção
    removeConsole: process.env.NODE_ENV === 'production',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'mlkpnapnijdbskaimquj.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
    formats: ['image/webp', 'image/avif'],
  },
  // Configurações para melhorar a performance e evitar problemas de hidratação
  poweredByHeader: false,
  compress: true,
  generateEtags: false,
}

module.exports = nextConfig
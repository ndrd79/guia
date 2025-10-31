/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Temporariamente desabilitado para evitar erros de hidratação
  swcMinify: true,
  eslint: {
    // Desabilita ESLint durante o build para evitar conflitos com ESLint v9
    ignoreDuringBuilds: true,
  },
  experimental: {
    // Configurações para melhorar a hidratação
    optimizeCss: true,
    scrollRestoration: true,
    // Otimizações de performance
    optimizePackageImports: ['lucide-react'],
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
        pathname: '/storage/v1/object/public/**',
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
    // Otimizações de imagem com configurações mais conservadoras
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 600, // Increased cache TTL to 10 minutes
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Configurações para melhorar a confiabilidade
    domains: [],
    unoptimized: false,
    // Configurações de loader mais específicas
    loader: 'default',
    path: '/_next/image',
  },
  // Configurações para melhorar a performance e evitar problemas de hidratação
  poweredByHeader: false,
  compress: true,
  generateEtags: false,
  // Otimizações de bundle
  webpack: (config, { dev, isServer }) => {
    // Configurações específicas para desenvolvimento
    if (dev) {
      // Melhorar hot-reload
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: ['**/node_modules', '**/.git', '**/.next'],
      };
    }

    // Otimizações de produção
    if (!dev && !isServer) {
      config.optimization.splitChunks.cacheGroups = {
        ...config.optimization.splitChunks.cacheGroups,
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      };
    }

    return config;
  },
  // Configurações de desenvolvimento
  ...(process.env.NODE_ENV === 'development' && {
    onDemandEntries: {
      // Período em ms que uma página fica em cache
      maxInactiveAge: 25 * 1000,
      // Número de páginas que devem ser mantidas simultaneamente
      pagesBufferLength: 2,
    },
  }),
}

module.exports = nextConfig
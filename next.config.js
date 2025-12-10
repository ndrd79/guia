/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['mlkpnapnijdbskaimquj.supabase.co', 'images.unsplash.com'],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'geolocation=(), microphone=(), camera=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
          // CSP básica: ajusta dominios conforme necessário (Supabase, Vercel assets, imagens externas)
          { key: 'Content-Security-Policy', value: "default-src 'self'; img-src 'self' data: https: mlkpnapnijdbskaimquj.supabase.co images.unsplash.com; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://fonts.googleapis.com; font-src 'self' https://cdnjs.cloudflare.com https://fonts.gstatic.com; connect-src 'self' https: mlkpnapnijdbskaimquj.supabase.co; frame-ancestors 'none'" },
        ],
      },
    ]
  },
}

module.exports = nextConfig

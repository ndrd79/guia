import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Permitir acesso a todas as rotas por enquanto
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*'
  ]
}
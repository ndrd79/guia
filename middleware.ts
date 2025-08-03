import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Verificar se é uma rota admin (exceto login)
  if (request.nextUrl.pathname.startsWith('/admin') && !request.nextUrl.pathname.includes('/login')) {
    // Por enquanto, permitir acesso direto - a autenticação será verificada no cliente
    // TODO: Implementar verificação de sessão no servidor quando necessário
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*'
  ]
}
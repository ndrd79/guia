import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Verificar se a rota é do admin
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Permitir acesso à página de login
    if (request.nextUrl.pathname === '/admin/login') {
      return NextResponse.next()
    }
    
    // Para outras rotas do admin, verificar se há token de sessão nos cookies
    const sessionToken = request.cookies.get('sb-access-token') || request.cookies.get('supabase-auth-token')
    
    if (!sessionToken) {
      // Redirecionar para login se não estiver autenticado
      const redirectUrl = new URL('/admin/login', request.url)
      return NextResponse.redirect(redirectUrl)
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*'
  ]
}
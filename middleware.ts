import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddlewareSupabaseClient } from './lib/supabase'

export async function middleware(request: NextRequest) {
  const { supabase, response } = createMiddlewareSupabaseClient(request)
  
  // Verificar se a rota é do admin
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Permitir acesso à página de login
    if (request.nextUrl.pathname === '/admin/login') {
      return response
    }
    
    // Verificar autenticação para outras rotas do admin
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      // Redirecionar para login se não estiver autenticado
      const redirectUrl = new URL('/admin/login', request.url)
      return NextResponse.redirect(redirectUrl)
    }
  }
  
  return response
}

export const config = {
  matcher: [
    '/admin/:path*'
  ]
}
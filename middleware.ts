import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { log } from './lib/logger'

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  
  // Log para debug
  console.log('🔍 Middleware executando para:', request.nextUrl.pathname)
  
  // MODO TEMPORÁRIO PERMISSIVO - permitir acesso a todas as rotas admin para teste
  if (request.nextUrl.pathname.startsWith('/admin')) {
    console.log('🚨 MODO PERMISSIVO: Permitindo acesso a todas as rotas admin')
    return res
  }
  
  // Código original comentado temporariamente
  /*
  // MODO DEBUG - permitir acesso temporário para teste
  if (request.nextUrl.pathname.includes('/admin/test-login')) {
    console.log('🧪 TEST: Permitindo acesso à página de teste')
    return res
  }
  
  // BYPASS TEMPORÁRIO - permitir acesso direto ao admin
  if (request.nextUrl.pathname.includes('/admin/bypass')) {
    console.log('🚨 BYPASS: Permitindo acesso direto à página de bypass')
    return res
  }
  
  // Permitir acesso à página de redirecionamento
  if (request.nextUrl.pathname.includes('/admin/redirect')) {
    console.log('🔄 REDIRECT: Permitindo acesso à página de redirecionamento')
    return res
  }
  
  */
  
  return res
}

export const config = {
  matcher: [
    '/admin/:path*'
  ]
}
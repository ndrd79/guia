import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

/**
 * Middleware simplificado para autenticação admin
 * 
 * NOTA: A verificação de role admin é feita nas páginas/APIs individuais
 * porque o middleware Edge Runtime tem limitações com variáveis de ambiente
 * e RLS do Supabase.
 * 
 * Este middleware apenas verifica se o usuário está autenticado.
 */
export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  const pathname = request.nextUrl.pathname

  // Somente proteger rotas admin
  if (!pathname.startsWith('/admin')) {
    return res
  }

  // Bypass de desenvolvimento (apenas fora de produção)
  if (process.env.NEXT_PUBLIC_ADMIN_DEV_BYPASS === 'true' && process.env.NODE_ENV !== 'production') {
    return res
  }

  // Exceções: páginas de login e diagnóstico devem ser acessíveis
  if (pathname.startsWith('/admin/login') || pathname.startsWith('/admin/diag')) {
    return res
  }

  // Criar cliente Supabase atrelado a cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          res.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          res.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // Verificar se há sessão
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    // Redirecionar para login
    const loginUrl = new URL('/admin/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Sessão válida - permitir acesso
  // A verificação de role admin será feita nas páginas individuais
  return res
}

export const config = {
  matcher: ['/admin/:path*']
}

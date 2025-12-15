import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { log } from './lib/logger'

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()

  const pathname = request.nextUrl.pathname
  log.middleware('Executando middleware', pathname)

  // Somente proteger rotas admin
  if (!pathname.startsWith('/admin')) {
    return res
  }

  // Bypass de desenvolvimento: APENAS em localhost E ambiente não-produção
  const isLocalhost = request.headers.get('host')?.includes('localhost') ||
    request.headers.get('host')?.includes('127.0.0.1')
  if (process.env.NEXT_PUBLIC_ADMIN_DEV_BYPASS === 'true' &&
    process.env.NODE_ENV !== 'production' &&
    isLocalhost) {
    log.middleware('DEV_BYPASS ativo em localhost: liberando rota admin', pathname)
    return res
  }

  // Exceções: páginas de login e redirect devem ser acessíveis
  if (pathname.startsWith('/admin/login') || pathname.startsWith('/admin/redirect')) {
    log.middleware('Exceção de proteção aplicada', pathname)
    return res
  }

  // Criar cliente Supabase atrelado a cookies do request/response
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

  // Verificar sessão
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
  if (sessionError) {
    log.auth('Erro ao obter sessão', { error: sessionError.message, pathname })
  }

  const session = sessionData?.session
  if (!session) {
    log.middleware('Sessão ausente, redirecionando para login', pathname, {
      hasSession: !!sessionData,
      sessionError: sessionError?.message
    })
    const loginUrl = new URL('/admin/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  log.middleware('Sessão encontrada', pathname, {
    userId: session.user.id,
    email: session.user.email
  })

  // REMOVIDO: Bypass hardcoded para admin@portal.com (vulnerabilidade de segurança)
  // Todos os usuários agora passam pela verificação normal de perfil

  // Verificar perfil com role admin
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  if (profileError) {
    log.auth('Erro ao obter perfil', {
      error: profileError.message,
      userId: session.user.id,
      pathname
    })
  }

  if (!profile) {
    log.middleware('Acesso negado: perfil não encontrado', pathname, {
      userId: session.user.id,
      profileError: profileError?.message
    })
    const loginUrl = new URL('/admin/login', request.url)
    loginUrl.searchParams.set('error', 'unauthorized')
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (profile.role !== 'admin') {
    log.middleware('Acesso negado: usuário não é admin', pathname, {
      userId: session.user.id,
      role: profile.role
    })
    const loginUrl = new URL('/admin/login', request.url)
    loginUrl.searchParams.set('error', 'unauthorized')
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  log.middleware('Perfil verificado com sucesso', pathname, {
    userId: session.user.id,
    role: profile.role
  })

  // Usuário autorizado
  log.middleware('Acesso concedido a rota admin', pathname, { userId: session.user.id })
  return res
}

export const config = {
  matcher: [
    '/admin/:path*'
  ]
}

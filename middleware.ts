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

  // Bypass de desenvolvimento (apenas fora de produção): permitir acesso às rotas admin sem sessão
  if (process.env.NEXT_PUBLIC_ADMIN_DEV_BYPASS === 'true' && process.env.NODE_ENV !== 'production') {
    log.middleware('DEV_BYPASS ativo em ambiente não-produção: liberando rota admin sem autenticação', pathname)
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

  // Verificar sessão usando getUser() que é mais seguro e valida no servidor
  // IMPORTANTE: getSession() pode ler cookies adulterados, getUser() valida o JWT
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError) {
    log.auth('Erro ao obter usuário', { error: userError.message, pathname })
  }

  if (!user) {
    log.middleware('Usuário não autenticado, redirecionando para login', pathname, {
      userError: userError?.message
    })
    const loginUrl = new URL('/admin/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  log.middleware('Usuário autenticado', pathname, {
    userId: user.id,
    email: user.email
  })

  // Verificar perfil com role admin
  // NOTA: Usamos createClient diretamente com SERVICE_ROLE_KEY para ignorar RLS
  // Isso é seguro porque já validamos o usuário via getUser() acima
  const { createClient } = await import('@supabase/supabase-js')
  const adminSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: profile, error: profileError } = await adminSupabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError) {
    log.auth('Erro ao obter perfil', {
      error: profileError.message,
      userId: user.id,
      pathname
    })
  }

  if (!profile) {
    log.middleware('Acesso negado: perfil não encontrado', pathname, {
      userId: user.id,
      profileError: profileError?.message
    })
    const loginUrl = new URL('/admin/login', request.url)
    loginUrl.searchParams.set('error', 'unauthorized')
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (profile.role !== 'admin') {
    log.middleware('Acesso negado: usuário não é admin', pathname, {
      userId: user.id,
      role: profile.role
    })
    const loginUrl = new URL('/admin/login', request.url)
    loginUrl.searchParams.set('error', 'unauthorized')
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  log.middleware('Perfil verificado com sucesso', pathname, {
    userId: user.id,
    role: profile.role
  })

  // Usuário autorizado
  log.middleware('Acesso concedido a rota admin', pathname, { userId: user.id })
  return res
}

export const config = {
  matcher: [
    '/admin/:path*'
  ]
}

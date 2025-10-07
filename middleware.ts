import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  
  // 🚨 MIDDLEWARE TEMPORARIAMENTE DESABILITADO PARA ACESSO IMEDIATO AO ADMIN
  console.log('⚠️ MIDDLEWARE DESABILITADO - Permitindo acesso direto a:', request.nextUrl.pathname)
  
  // Permitir acesso a TODAS as rotas sem verificação
  return res
  
  /* CÓDIGO ORIGINAL COMENTADO PARA REATIVAR DEPOIS:
  
  // Log para debug
  console.log('🔍 Middleware executando para:', request.nextUrl.pathname)
  
  // Verificar se é uma rota admin (exceto login)
  if (request.nextUrl.pathname.startsWith('/admin') && !request.nextUrl.pathname.includes('/login')) {
    console.log('🛡️ Verificando autenticação para rota admin:', request.nextUrl.pathname)
    
    try {
      const supabase = createMiddlewareClient({ req: request, res })
      
      // Verificar se há uma sessão ativa com timeout
      console.log('🔐 Verificando sessão...')
      const { data: { session }, error } = await Promise.race([
        supabase.auth.getSession(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000))
      ]) as any
      
      console.log('📊 Resultado da verificação de sessão:', {
        hasSession: !!session,
        hasError: !!error,
        userId: session?.user?.id || 'N/A'
      })
      
      if (error) {
        console.log('❌ Erro na verificação de sessão:', error.message)
        // Em caso de erro, permitir acesso temporariamente
        console.log('⚠️ Permitindo acesso devido a erro na verificação')
        return res
      }
      
      if (!session) {
        console.log('🚫 Nenhuma sessão encontrada, redirecionando para login')
        const loginUrl = new URL('/admin/login', request.url)
        loginUrl.searchParams.set('redirect', request.nextUrl.pathname)
        return NextResponse.redirect(loginUrl)
      }
      
      console.log('✅ Sessão encontrada, verificando perfil de admin...')
      
      // Verificar se o usuário tem permissões de admin com timeout
      try {
        const { data: profile, error: profileError } = await Promise.race([
          supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Profile timeout')), 2000))
        ]) as any
        
        console.log('👤 Resultado da verificação de perfil:', {
          hasProfile: !!profile,
          role: profile?.role || 'N/A',
          hasError: !!profileError
        })
        
        if (profileError) {
          console.log('⚠️ Erro na verificação de perfil, permitindo acesso:', profileError.message)
          // Em caso de erro no perfil, permitir acesso se há sessão
          return res
        }
        
        if (!profile || profile.role !== 'admin') {
          console.log('🚫 Usuário não é admin, redirecionando')
          return NextResponse.redirect(new URL('/admin/login?error=unauthorized', request.url))
        }
        
        console.log('✅ Usuário admin verificado, permitindo acesso')
        
      } catch (profileError) {
        console.log('⚠️ Timeout na verificação de perfil, permitindo acesso')
        // Se houver timeout na verificação do perfil, mas há sessão, permitir acesso
        return res
      }
      
    } catch (error) {
      console.error('❌ Erro geral no middleware:', error)
      // Em caso de erro geral, permitir acesso para evitar loops
      console.log('⚠️ Permitindo acesso devido a erro geral no middleware')
      return res
    }
  }
  
  return res
  
  */
}

export const config = {
  matcher: [
    '/admin/:path*'
  ]
}
import { useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabase'

export default function AdminRedirect() {
  const router = useRouter()
  const hasChecked = useRef(false)

  useEffect(() => {
    if (!router.isReady || hasChecked.current) return
    hasChecked.current = true

    const checkAuthAndRedirect = async () => {
      try {
        // Pequena pausa para garantir que a sessão foi estabelecida
        await new Promise(resolve => setTimeout(resolve, 300))
        
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error || !session) {
          console.log('Sessão não encontrada, redirecionando para login')
          router.replace('/admin/login')
          return
        }
        
        // Verificar se o usuário é admin
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()
        
        if (profileError || !profile || profile.role !== 'admin') {
          console.log('Usuário não é admin, redirecionando para login')
          router.replace('/admin/login?error=unauthorized')
          return
        }
        
        // Tudo certo, redirecionar para o destino
        const redirectTo = (router.query.redirect as string) || '/admin'
        console.log(`Redirecionando para: ${redirectTo}`)
        router.replace(redirectTo)
        
      } catch (error) {
        console.error('Erro no redirect:', error)
        router.replace('/admin/login')
      }
    }

    checkAuthAndRedirect()
  }, [router.isReady, router.query.redirect])

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">Verificando autenticação...</h1>
        <p className="text-gray-600 text-sm">Aguarde um momento</p>
      </div>
    </div>
  )
}
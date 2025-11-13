import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabase'

export default function AdminRedirect() {
  const [status, setStatus] = useState('Verificando autenticação...')
  const router = useRouter()

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      try {
        setStatus('Verificando sessão...')
        
        // Aguardar um pouco para garantir que a sessão foi estabelecida
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          setStatus('Erro na autenticação. Redirecionando para login...')
          router.replace('/admin/login')
          return
        }
        
        if (!session) {
          setStatus('Sessão não encontrada. Redirecionando para login...')
          router.replace('/admin/login')
          return
        }
        
        setStatus('Verificando permissões...')
        
        // Verificar se o usuário é admin
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()
        
        if (profileError || !profile || profile.role !== 'admin') {
          setStatus('Acesso negado. Redirecionando para login...')
          router.replace('/admin/login?error=unauthorized')
          return
        }
        
        setStatus('Autenticação confirmada! Redirecionando para dashboard...')
        
        // Redirecionar para o destino final
        const redirectTo = (router.query.redirect as string) || '/admin'
        router.replace(redirectTo)
        
      } catch (error) {
        setStatus('Erro inesperado. Redirecionando para login...')
        router.replace('/admin/login')
      }
    }

    checkAuthAndRedirect()
  }, [router])

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">Processando...</h1>
        <p className="text-gray-600">{status}</p>
      </div>
    </div>
  )
}
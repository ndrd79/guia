import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabase'

export default function AdminBypass() {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')
  const router = useRouter()

  const forceLogin = async () => {
    setLoading(true)
    setStatus('🔐 Fazendo login forçado...')

    try {
      // Fazer logout primeiro para limpar qualquer sessão
      await supabase.auth.signOut()
      setStatus('🧹 Sessão anterior limpa')

      // Fazer login
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'admin@portal.com',
        password: '123456'
      })

      if (error) {
        setStatus(`❌ Erro no login: ${error.message}`)
        return
      }

      setStatus('✅ Login bem-sucedido! Aguardando...')

      // Aguardar um pouco para a sessão ser estabelecida
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Verificar se a sessão foi estabelecida
      const { data: sessionData } = await supabase.auth.getSession()
      
      if (sessionData.session) {
        setStatus('🎉 Sessão confirmada! Redirecionando...')
        
        // Forçar redirecionamento
        window.location.href = '/admin/noticias'
      } else {
        setStatus('❌ Sessão não foi estabelecida')
      }

    } catch (error) {
      setStatus(`❌ Erro: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const checkCurrentSession = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      
      if (sessionData.session) {
        setStatus(`✅ Sessão ativa encontrada para: ${sessionData.session.user.email}`)
        
        // Verificar perfil
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', sessionData.session.user.id)
          .single()
          
        if (profile?.role === 'admin') {
          setStatus('🎉 Usuário admin confirmado! Você pode acessar o painel.')
        }
      } else {
        setStatus('❌ Nenhuma sessão ativa encontrada')
      }
    } catch (error) {
      setStatus(`❌ Erro ao verificar sessão: ${error}`)
    }
  }

  useEffect(() => {
    checkCurrentSession()
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-6">🚨 Acesso de Emergência Admin</h1>
        
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
            <p className="text-sm text-yellow-800">
              Esta é uma página de bypass temporária para resolver problemas de acesso ao painel admin.
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded">
            <h3 className="font-semibold mb-2">Status:</h3>
            <p className="text-sm">{status || 'Aguardando...'}</p>
          </div>

          <div className="space-y-2">
            <button
              onClick={checkCurrentSession}
              disabled={loading}
              className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              🔍 Verificar Sessão Atual
            </button>

            <button
              onClick={forceLogin}
              disabled={loading}
              className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
            >
              🔐 Login Forçado
            </button>

            <button
              onClick={() => window.location.href = '/admin/noticias'}
              className="w-full bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
            >
              🚀 Ir Direto para Admin
            </button>

            <button
              onClick={() => window.location.href = '/admin/login'}
              className="w-full bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              🔙 Voltar para Login Normal
            </button>
          </div>

          <div className="text-xs text-gray-500 text-center">
            <p>Credenciais: admin@portal.com / 123456</p>
            <p>URL: <a href="/admin/bypass" className="text-blue-500">/admin/bypass</a></p>
          </div>
        </div>
      </div>
    </div>
  )
}
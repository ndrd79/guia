import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function TestAuth() {
  const [authState, setAuthState] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    console.log(message)
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  useEffect(() => {
    checkAuthState()
  }, [])

  const checkAuthState = async () => {
    try {
      addLog('🔍 Verificando estado da autenticação...')
      
      // Verificar sessão atual
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        addLog(`❌ Erro ao verificar sessão: ${sessionError.message}`)
      } else if (sessionData.session) {
        addLog('✅ Sessão encontrada!')
        addLog(`   User ID: ${sessionData.session.user.id}`)
        addLog(`   Email: ${sessionData.session.user.email}`)
        
        // Verificar perfil
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', sessionData.session.user.id)
          .single()
          
        if (profileError) {
          addLog(`❌ Erro ao buscar perfil: ${profileError.message}`)
        } else {
          addLog(`✅ Perfil encontrado: ${profile.role}`)
        }
        
        setAuthState({
          session: sessionData.session,
          profile: profile
        })
      } else {
        addLog('❌ Nenhuma sessão encontrada')
      }
      
    } catch (error) {
      addLog(`❌ Erro geral: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const testLogin = async () => {
    try {
      addLog('🔐 Testando login...')
      setLoading(true)
      
      // Limpar sessão atual
      await supabase.auth.signOut()
      addLog('🧹 Sessão anterior limpa')
      
      // Fazer login
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'admin@portal.com',
        password: '123456'
      })
      
      if (error) {
        addLog(`❌ Erro no login: ${error.message}`)
        return
      }
      
      addLog('✅ Login bem-sucedido!')
      addLog(`   User ID: ${data.user.id}`)
      
      // Aguardar um pouco para a sessão ser estabelecida
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Verificar estado novamente
      await checkAuthState()
      
    } catch (error) {
      addLog(`❌ Erro no teste: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const clearAuth = async () => {
    try {
      addLog('🧹 Limpando autenticação...')
      await supabase.auth.signOut()
      setAuthState(null)
      setLogs([])
      addLog('✅ Autenticação limpa')
    } catch (error) {
      addLog(`❌ Erro ao limpar: ${error}`)
    }
  }

  const testRedirect = () => {
    addLog('🔄 Testando redirecionamento para /admin/noticias')
    window.location.href = '/admin/noticias'
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🧪 Teste de Autenticação Admin</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Controles */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Controles</h2>
            <div className="space-y-4">
              <button
                onClick={checkAuthState}
                disabled={loading}
                className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
              >
                🔍 Verificar Estado
              </button>
              
              <button
                onClick={testLogin}
                disabled={loading}
                className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
              >
                🔐 Testar Login
              </button>
              
              <button
                onClick={clearAuth}
                disabled={loading}
                className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50"
              >
                🧹 Limpar Auth
              </button>
              
              <button
                onClick={testRedirect}
                disabled={loading || !authState?.session}
                className="w-full bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50"
              >
                🔄 Testar Redirect
              </button>
            </div>
          </div>
          
          {/* Estado Atual */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Estado Atual</h2>
            {loading ? (
              <p>Carregando...</p>
            ) : authState ? (
              <div className="space-y-2">
                <p><strong>✅ Autenticado</strong></p>
                <p><strong>User ID:</strong> {authState.session.user.id}</p>
                <p><strong>Email:</strong> {authState.session.user.email}</p>
                <p><strong>Role:</strong> {authState.profile?.role || 'N/A'}</p>
                <p><strong>Expires:</strong> {new Date(authState.session.expires_at * 1000).toLocaleString()}</p>
              </div>
            ) : (
              <p><strong>❌ Não autenticado</strong></p>
            )}
          </div>
        </div>
        
        {/* Logs */}
        <div className="mt-8 bg-black text-green-400 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">📋 Logs</h2>
          <div className="space-y-1 max-h-96 overflow-y-auto">
            {logs.map((log, index) => (
              <div key={index} className="text-sm font-mono">
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
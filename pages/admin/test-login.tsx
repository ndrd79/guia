import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function TestLogin() {
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  const testLogin = async () => {
    setLoading(true)
    setResult('Testando login...')

    try {
      // 1. Fazer login
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: 'admin@portal.com',
        password: '123456'
      })

      if (authError) {
        setResult(`❌ Erro no login: ${authError.message}`)
        setLoading(false)
        return
      }

      setResult(`✅ Login OK! User: ${authData.user?.email}\n`)

      // 2. Verificar sessão
      const { data: sessionData } = await supabase.auth.getSession()
      setResult(prev => prev + `📊 Sessão: ${sessionData.session ? 'Ativa' : 'Inativa'}\n`)

      if (sessionData.session) {
        setResult(prev => prev + `🔑 Access Token: ${sessionData.session.access_token ? 'Presente' : 'Ausente'}\n`)
      }

      // 3. Verificar perfil
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single()

      if (profileError) {
        setResult(prev => prev + `⚠️ Erro no perfil: ${profileError.message}\n`)
      } else {
        setResult(prev => prev + `👤 Perfil: ${JSON.stringify(profile, null, 2)}\n`)
      }

      // 4. Tentar acessar admin após 3 segundos
      setResult(prev => prev + '\n🔄 Redirecionando para /admin em 3 segundos...')
      
      setTimeout(() => {
        window.location.href = '/admin'
      }, 3000)

    } catch (error: any) {
      setResult(`❌ Erro geral: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4">Teste de Login Admin</h1>
        
        <button
          onClick={testLogin}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          {loading ? 'Testando...' : 'Testar Login'}
        </button>

        {result && (
          <div className="mt-4 p-4 bg-gray-100 rounded">
            <h3 className="font-semibold mb-2">Resultado:</h3>
            <pre className="whitespace-pre-wrap text-sm">{result}</pre>
          </div>
        )}
      </div>
    </div>
  )
}
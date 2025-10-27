import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabase'

export default function AdminLogin() {
  const [email, setEmail] = useState('admin@portal.com')
  const [password, setPassword] = useState('123456')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [debugInfo, setDebugInfo] = useState('')
  const router = useRouter()

  // Verificar conexão com Supabase na inicialização
  useEffect(() => {
    const checkSupabaseConnection = async () => {
      try {
        const { data, error } = await supabase.from('noticias').select('count').limit(1)
        if (error) {
          setDebugInfo(`Erro de conexão: ${error.message}`)
        } else {
          setDebugInfo('Conexão com Supabase: OK')
        }
      } catch (err) {
        setDebugInfo(`Erro de teste: ${err}`)
      }
    }

    checkSupabaseConnection()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setLoading(true)
    setError('')
    setDebugInfo('Processando login...')

    // Validações básicas
    if (!email || !password) {
      const errorMsg = 'Email e senha são obrigatórios'
      setError(errorMsg)
      setLoading(false)
      return
    }

    if (!email.includes('@')) {
      const errorMsg = 'Email inválido'
      setError(errorMsg)
      setLoading(false)
      return
    }

    try {
      // Verificar se o Supabase está configurado
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        throw new Error('Configuração do Supabase não encontrada')
      }

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      })

      if (authError) {
        
        // Mensagens de erro mais específicas
        let errorMessage = 'Erro ao fazer login'
        if (authError.message.includes('Invalid login credentials')) {
          errorMessage = 'Email ou senha incorretos'
        } else if (authError.message.includes('Email not confirmed')) {
          errorMessage = 'Email não confirmado'
        } else if (authError.message.includes('Too many requests')) {
          errorMessage = 'Muitas tentativas. Tente novamente em alguns minutos'
        } else {
          errorMessage = authError.message
        }
        
        setError(errorMessage)
        setDebugInfo(`Erro de auth: ${authError.message}`)
        return
      }

      if (!data.user) {
        setError('Usuário não encontrado')
        setDebugInfo('Usuário não retornado pelo Supabase')
        return
      }

      setDebugInfo('Login bem-sucedido! Redirecionando...')
      
      // Verificar se a sessão foi salva corretamente
      const { data: sessionData } = await supabase.auth.getSession()
      
      if (!sessionData.session) {
        setError('Erro ao salvar sessão. Tente novamente.')
        setDebugInfo('Erro: Sessão não foi salva')
        return
      }
      
      // Verificar se o perfil admin existe
       try {
         const { data: profile, error: profileError } = await supabase
           .from('profiles')
           .select('role')
           .eq('id', data.user.id)
           .single()
         
         if (profileError || !profile) {
           const { error: insertError } = await supabase
             .from('profiles')
             .insert({
               id: data.user.id,
               email: data.user.email,
               role: 'admin'
             })
         } else if (profile.role !== 'admin') {
           await supabase
             .from('profiles')
             .update({ role: 'admin' })
             .eq('id', data.user.id)
         }
       } catch (profileErr) {
         // Erro tratado silenciosamente
       }
       
       // Redirecionamento via página intermediária
       setDebugInfo('Login bem-sucedido! Redirecionando...')
       
       // Usar página de redirecionamento intermediária para garantir autenticação
       const redirectTo = router.query.redirect as string || '/admin'
       const redirectUrl = `/admin/redirect?redirect=${encodeURIComponent(redirectTo)}`
       
       // Aguardar um pouco e redirecionar
       setTimeout(() => {
         window.location.href = redirectUrl
       }, 1000)

    } catch (err: any) {
      const errorMessage = err.message || 'Erro inesperado ao fazer login'
      setError(errorMessage)
      setDebugInfo(`Erro geral: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Login Administrativo</h1>
        
        {/* Informações de debug */}
        {debugInfo && (
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4 text-sm">
            <strong>Debug:</strong> {debugInfo}
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={loading}
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
          
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full mt-2 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🧪 Teste Automático (admin@portal.com)
          </button>
        </form>

        {/* Informações de ambiente para debug */}
        <div className="mt-4 text-xs text-gray-500 text-center">
          <p>Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Configurada' : '❌ Não configurada'}</p>
          <p>Anon Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Configurada' : '❌ Não configurada'}</p>
        </div>
      </div>
    </div>
  )
}
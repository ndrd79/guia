import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabase'

// Função para limpar todos os cookies do Supabase manualmente
function clearSupabaseCookies() {
  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const cookieName = cookie.split('=')[0].trim()
    // Limpar cookies que começam com 'sb-' (Supabase)
    if (cookieName.startsWith('sb-') || cookieName.includes('supabase')) {
      // Limpar para o domínio atual
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
      // Limpar para o domínio pai (caso seja subdomínio)
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`
      // Tentar também com .dominio (para cobrir www.dominio.com e dominio.com)
      const hostParts = window.location.hostname.split('.')
      if (hostParts.length >= 2) {
        const parentDomain = hostParts.slice(-2).join('.')
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${parentDomain};`
      }
    }
  }
}

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [debugInfo, setDebugInfo] = useState('')
  const [isAlreadyAuthenticated, setIsAlreadyAuthenticated] = useState(false)
  const [hasRedirected, setHasRedirected] = useState(false)
  const [sessionCleared, setSessionCleared] = useState(false)
  const router = useRouter()

  // Limpar sessão e cookies corrompidos na inicialização
  useEffect(() => {
    const clearAllSessions = async () => {
      try {
        // Primeiro: limpar cookies manualmente (resolve o problema de cookies corrompidos)
        clearSupabaseCookies()

        // Segundo: chamar signOut do Supabase para limpar o estado interno
        await supabase.auth.signOut({ scope: 'local' })

        // Limpar localStorage também
        if (typeof window !== 'undefined') {
          Object.keys(localStorage).forEach(key => {
            if (key.startsWith('sb-') || key.includes('supabase')) {
              localStorage.removeItem(key)
            }
          })
        }

        setSessionCleared(true)
        setDebugInfo('Sessão limpa com sucesso')
      } catch (err) {
        console.error('Erro ao limpar sessão:', err)
        setSessionCleared(true) // Continuar mesmo se houver erro
      }
    }

    clearAllSessions()
  }, [])

  // Verificar conexão com Supabase (apenas após limpar sessão)
  useEffect(() => {
    if (!sessionCleared) return

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
  }, [sessionCleared])

  // Verificar se já está autenticado ao carregar a página
  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          setDebugInfo('Sessão existente detectada. Verificando permissões...')

          // Verificar se é admin
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single()

          if (profile?.role === 'admin') {
            setDebugInfo('Usuário já autenticado como admin.')
            setIsAlreadyAuthenticated(true)
            // NÃO redirecionar automaticamente - deixar o usuário decidir
            // Isso previne loops infinitos de redirecionamento
          }
        }
      } catch (err) {
        console.error('Erro ao verificar sessão existente:', err)
      }
    }

    // Só verificar sessão existente se NÃO estivermos vindo de um redirecionamento
    const redirectFrom = router.query.redirect as string
    if (!redirectFrom) {
      checkExistingSession()
    }
  }, [router.query.redirect])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (loading) return // Evitar múltiplos cliques

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

      // NOTA: Verificação de admin será feita pelo middleware
      // Aqui apenas confiamos que o signInWithPassword funcionou

      // Pequena pausa para garantir que os cookies foram salvos
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Redirecionamento usando window.location para garantir que funciona
      const redirectTo = (router.query.redirect as string) || '/admin'

      window.location.href = redirectTo

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


        {/* Mensagem para usuários já autenticados */}
        {isAlreadyAuthenticated && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            <div className="flex items-center justify-between">
              <span>Você já está autenticado como administrador!</span>
              <button
                onClick={() => {
                  const redirectTo = router.query.redirect as string || '/admin'
                  router.replace(redirectTo)
                }}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-1 px-3 rounded text-sm transition-colors"
              >
                Continuar
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className={isAlreadyAuthenticated ? 'opacity-50 pointer-events-none' : ''}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
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
              autoComplete="current-password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading || hasRedirected}
            className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>


        </form>

        {/* Informações de ambiente para debug */}

      </div>
    </div>
  )
}

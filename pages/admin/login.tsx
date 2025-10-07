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
        console.log('🔍 Verificando conexão com Supabase...')
        console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
        console.log('Anon Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Configurada' : 'Não configurada')
        
        const { data, error } = await supabase.from('noticias').select('count').limit(1)
        if (error) {
          console.error('❌ Erro na conexão com Supabase:', error)
          setDebugInfo(`Erro de conexão: ${error.message}`)
        } else {
          console.log('✅ Conexão com Supabase OK')
          setDebugInfo('Conexão com Supabase: OK')
        }
      } catch (err) {
        console.error('❌ Erro ao testar conexão:', err)
        setDebugInfo(`Erro de teste: ${err}`)
      }
    }

    checkSupabaseConnection()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('🚀 Iniciando processo de login...')
    
    setLoading(true)
    setError('')
    setDebugInfo('Processando login...')

    // Validações básicas
    if (!email || !password) {
      const errorMsg = 'Email e senha são obrigatórios'
      console.error('❌ Validação falhou:', errorMsg)
      setError(errorMsg)
      setLoading(false)
      return
    }

    if (!email.includes('@')) {
      const errorMsg = 'Email inválido'
      console.error('❌ Email inválido:', email)
      setError(errorMsg)
      setLoading(false)
      return
    }

    try {
      console.log('📧 Tentando login com:', { email, passwordLength: password.length })
      
      // Verificar se o Supabase está configurado
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        throw new Error('Configuração do Supabase não encontrada')
      }

      console.log('🔐 Chamando supabase.auth.signInWithPassword...')
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      })

      console.log('📊 Resposta do Supabase:', { 
        data: data ? 'Dados recebidos' : 'Sem dados', 
        error: authError ? authError.message : 'Sem erro',
        user: data?.user ? 'Usuário encontrado' : 'Usuário não encontrado'
      })

      if (authError) {
        console.error('❌ Erro de autenticação:', authError)
        
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
        console.error('❌ Usuário não encontrado na resposta')
        setError('Usuário não encontrado')
        setDebugInfo('Usuário não retornado pelo Supabase')
        return
      }

      console.log('✅ Login bem-sucedido! Usuário:', data.user.email)
      console.log('🔄 Redirecionando para /admin/noticias...')
      setDebugInfo('Login bem-sucedido! Redirecionando...')
      
      // Verificar se a sessão foi salva corretamente
      const { data: sessionData } = await supabase.auth.getSession()
      console.log('📊 Sessão após login:', sessionData.session ? 'Ativa' : 'Inativa')
      
      if (!sessionData.session) {
        console.error('❌ Sessão não foi salva corretamente')
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
         
         console.log('👤 Perfil do usuário:', profile)
         
         if (profileError || !profile) {
           console.log('⚠️ Perfil não encontrado, criando perfil admin...')
           const { error: insertError } = await supabase
             .from('profiles')
             .insert({
               id: data.user.id,
               email: data.user.email,
               role: 'admin'
             })
           
           if (insertError) {
             console.error('❌ Erro ao criar perfil:', insertError)
           } else {
             console.log('✅ Perfil admin criado com sucesso')
           }
         } else if (profile.role !== 'admin') {
           console.log('⚠️ Atualizando role para admin...')
           await supabase
             .from('profiles')
             .update({ role: 'admin' })
             .eq('id', data.user.id)
         }
       } catch (profileErr) {
         console.error('❌ Erro ao verificar/criar perfil:', profileErr)
       }
       
       // SOLUÇÃO DEFINITIVA: Redirecionamento com delay para estabelecer sessão
       console.log('🚀 Iniciando redirecionamento com delay para estabelecer sessão...')
       setDebugInfo('Aguardando estabelecimento da sessão...')
       
       // Aguardar 2 segundos para a sessão ser totalmente estabelecida
       setTimeout(async () => {
         console.log('⏰ Delay concluído, verificando sessão novamente...')
         
         // Verificar se a sessão está realmente ativa
         const { data: sessionCheck } = await supabase.auth.getSession()
         console.log('🔍 Verificação final da sessão:', sessionCheck?.session ? 'Ativa' : 'Inativa')
         
         if (sessionCheck?.session) {
           console.log('✅ Sessão confirmada, iniciando redirecionamento definitivo...')
           
           // Estratégia 1: URL absoluta com window.location.replace
           const absoluteUrl = `${window.location.origin}/admin/noticias`
           console.log('🌐 Redirecionando para URL absoluta:', absoluteUrl)
           
           try {
             window.location.replace(absoluteUrl)
           } catch (error) {
             console.error('❌ Erro com URL absoluta, tentando relativa:', error)
             
             // Estratégia 2: URL relativa com window.location.replace
             try {
               window.location.replace('/admin/noticias')
             } catch (error2) {
               console.error('❌ Erro com URL relativa, forçando reload:', error2)
               
               // Estratégia 3: Forçar navegação direta
               window.location.href = '/admin/noticias'
               
               // Estratégia 4: Último recurso - reload completo
               setTimeout(() => {
                 if (window.location.pathname.includes('/admin/login')) {
                   console.log('🔄 Último recurso: reload completo da página')
                   window.location.reload()
                 }
               }, 1000)
             }
           }
         } else {
           console.error('❌ Sessão não estabelecida após delay, tentando login novamente')
           setError('Erro na autenticação. Tente novamente.')
         }
       }, 2000) // 2 segundos de delay

    } catch (err: any) {
      console.error('❌ Erro geral no login:', err)
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
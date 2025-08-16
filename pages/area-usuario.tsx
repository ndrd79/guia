import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { supabase } from '../lib/supabase'
import { UserProfile } from '../lib/types'
import type { Session } from '@supabase/supabase-js'

export default function AreaUsuario() {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkUser()
  }, [])

  async function checkUser() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/login')
        return
      }

      setSession(session)
      
      // Buscar perfil do usuário
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()
      
      setProfile(profileData)
    } catch (error) {
      console.error('Erro ao verificar usuário:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!session) {
    return null // Redirecionando...
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header da Área do Usuário */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-indigo-100 rounded-full p-3 mr-4">
                  <i className="fas fa-user text-indigo-600 text-2xl"></i>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">
                    Olá, {profile?.nome || 'Usuário'}!
                  </h1>
                  <p className="text-gray-600">{session.user.email || 'Email não disponível'}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <i className="fas fa-sign-out-alt mr-2"></i>
                Sair
              </button>
            </div>
          </div>

          {/* Menu de Opções */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Meu Perfil */}
            <Link href="/perfil" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="text-center">
                <div className="bg-blue-100 rounded-full p-4 mx-auto mb-4 w-16 h-16 flex items-center justify-center">
                  <i className="fas fa-user-edit text-blue-600 text-2xl"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Meu Perfil</h3>
                <p className="text-gray-600 text-sm">Editar informações pessoais e foto</p>
              </div>
            </Link>

            {/* Meus Classificados */}
            <Link href="/meus-classificados" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="text-center">
                <div className="bg-green-100 rounded-full p-4 mx-auto mb-4 w-16 h-16 flex items-center justify-center">
                  <i className="fas fa-tags text-green-600 text-2xl"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Meus Classificados</h3>
                <p className="text-gray-600 text-sm">Gerenciar meus anúncios</p>
              </div>
            </Link>

            {/* Novo Classificado */}
            <Link href="/novo-classificado" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="text-center">
                <div className="bg-purple-100 rounded-full p-4 mx-auto mb-4 w-16 h-16 flex items-center justify-center">
                  <i className="fas fa-plus-circle text-purple-600 text-2xl"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Novo Anúncio</h3>
                <p className="text-gray-600 text-sm">Criar novo classificado</p>
              </div>
            </Link>

            {/* Mensagens */}
            <Link href="/mensagens" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="text-center">
                <div className="bg-yellow-100 rounded-full p-4 mx-auto mb-4 w-16 h-16 flex items-center justify-center">
                  <i className="fas fa-envelope text-yellow-600 text-2xl"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Mensagens</h3>
                <p className="text-gray-600 text-sm">Conversas sobre anúncios</p>
              </div>
            </Link>

            {/* Favoritos */}
            <Link href="/favoritos" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="text-center">
                <div className="bg-red-100 rounded-full p-4 mx-auto mb-4 w-16 h-16 flex items-center justify-center">
                  <i className="fas fa-heart text-red-600 text-2xl"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Favoritos</h3>
                <p className="text-gray-600 text-sm">Anúncios salvos</p>
              </div>
            </Link>

            {/* Configurações */}
            <Link href="/configuracoes" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="text-center">
                <div className="bg-gray-100 rounded-full p-4 mx-auto mb-4 w-16 h-16 flex items-center justify-center">
                  <i className="fas fa-cog text-gray-600 text-2xl"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Configurações</h3>
                <p className="text-gray-600 text-sm">Preferências da conta</p>
              </div>
            </Link>
          </div>

          {/* Estatísticas Rápidas */}
          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Resumo da Conta</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">0</div>
                <div className="text-sm text-gray-600">Anúncios Ativos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">0</div>
                <div className="text-sm text-gray-600">Visualizações</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">0</div>
                <div className="text-sm text-gray-600">Mensagens</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">0</div>
                <div className="text-sm text-gray-600">Favoritos</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}
import { useEffect, useState } from 'react'
import { GetServerSideProps } from 'next'
import { Newspaper, ShoppingBag, Calendar, Image, Users, TrendingUp } from 'lucide-react'
import AdminLayout from '../../components/admin/AdminLayout'
import { createServerSupabaseClient } from '../../lib/supabase'

interface DashboardStats {
  noticias: number
  classificados: number
  eventos: number
  banners: number
}

interface DashboardProps {
  stats: DashboardStats
}

const StatCard = ({ icon: Icon, title, value, color }: {
  icon: any
  title: string
  value: number
  color: string
}) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center">
      <div className={`p-3 rounded-full ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  </div>
)

export default function AdminDashboard({ stats }: DashboardProps) {
  const [recentActivity] = useState([
    { id: 1, action: 'Nova notícia publicada', time: '2 horas atrás', type: 'news' },
    { id: 2, action: 'Classificado aprovado', time: '4 horas atrás', type: 'classified' },
    { id: 3, action: 'Evento criado', time: '1 dia atrás', type: 'event' },
    { id: 4, action: 'Banner atualizado', time: '2 dias atrás', type: 'banner' },
  ])

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Bem-vindo ao Painel Administrativo</h1>
          <p className="text-blue-100">Gerencie todo o conteúdo do Portal Maria Helena</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={Newspaper}
            title="Notícias"
            value={stats.noticias}
            color="bg-blue-500"
          />
          <StatCard
            icon={ShoppingBag}
            title="Classificados"
            value={stats.classificados}
            color="bg-green-500"
          />
          <StatCard
            icon={Calendar}
            title="Eventos"
            value={stats.eventos}
            color="bg-purple-500"
          />
          <StatCard
            icon={Image}
            title="Banners"
            value={stats.banners}
            color="bg-orange-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Atividade Recente</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.action}</p>
                      <p className="text-sm text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Ações Rápidas</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <a
                  href="/admin/noticias"
                  className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Newspaper className="h-8 w-8 text-blue-500 mb-2" />
                  <span className="text-sm font-medium text-gray-900">Nova Notícia</span>
                </a>
                <a
                  href="/admin/classificados"
                  className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <ShoppingBag className="h-8 w-8 text-green-500 mb-2" />
                  <span className="text-sm font-medium text-gray-900">Novo Classificado</span>
                </a>
                <a
                  href="/admin/eventos"
                  className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Calendar className="h-8 w-8 text-purple-500 mb-2" />
                  <span className="text-sm font-medium text-gray-900">Novo Evento</span>
                </a>
                <a
                  href="/admin/banners"
                  className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Image className="h-8 w-8 text-orange-500 mb-2" />
                  <span className="text-sm font-medium text-gray-900">Novo Banner</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* System Info */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Informações do Sistema</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <TrendingUp className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">Status</p>
              <p className="text-sm text-green-600">Online</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Users className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">Usuários Ativos</p>
              <p className="text-sm text-gray-600">1</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Calendar className="h-8 w-8 text-orange-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">Última Atualização</p>
              <p className="text-sm text-gray-600">Hoje</p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const supabase = createServerSupabaseClient()
  
  // Verificar autenticação
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    return {
      redirect: {
        destination: '/admin/login',
        permanent: false,
      },
    }
  }

  // Buscar estatísticas
  const [noticiasResult, classificadosResult, eventosResult, bannersResult] = await Promise.all([
    supabase.from('noticias').select('id', { count: 'exact', head: true }),
    supabase.from('classificados').select('id', { count: 'exact', head: true }),
    supabase.from('eventos').select('id', { count: 'exact', head: true }),
    supabase.from('banners').select('id', { count: 'exact', head: true }),
  ])

  const stats = {
    noticias: noticiasResult.count || 0,
    classificados: classificadosResult.count || 0,
    eventos: eventosResult.count || 0,
    banners: bannersResult.count || 0,
  }

  return {
    props: {
      stats,
    },
  }
}
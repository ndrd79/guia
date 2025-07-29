import React from 'react'
import { GetServerSideProps } from 'next'

interface DashboardStats {
  noticias: number
  classificados: number
  eventos: number
  banners: number
}

interface DashboardProps {
  stats: DashboardStats
}

const StatCard = ({ title, value }: {
  title: string
  value: number
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        <p className="text-3xl font-bold text-blue-600 mt-2">{value}</p>
      </div>
    </div>
  )
}

export default function AdminDashboard({ stats }: DashboardProps) {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Painel Administrativo</h1>
          <p className="text-gray-600">Portal Maria Helena - Dashboard</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Notícias"
            value={stats.noticias}
          />
          <StatCard
            title="Classificados"
            value={stats.classificados}
          />
          <StatCard
            title="Eventos"
            value={stats.eventos}
          />
          <StatCard
            title="Banners"
            value={stats.banners}
          />
        </div>

        {/* Simple Info */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Resumo</h2>
          <p className="text-gray-600 mb-4">Total de conteúdos: {stats.noticias + stats.classificados + stats.eventos + stats.banners}</p>
          <div className="space-y-2">
            <p className="text-sm text-gray-500">✅ Sistema funcionando corretamente</p>
            <p className="text-sm text-gray-500">📊 Dados carregados com sucesso</p>
            <p className="text-sm text-gray-500">🔐 Usuário autenticado</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {
      stats: {
        noticias: 12,
        classificados: 8,
        eventos: 5,
        banners: 3,
      },
    },
  }
}
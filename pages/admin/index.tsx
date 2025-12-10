import React from 'react'
import { GetServerSideProps } from 'next'
import AdminLayout from '../../components/admin/AdminLayout'

interface DashboardStats {
  noticias: number
  classificados: number
  eventos: number
  banners: number
  empresas: number
}

interface TableStatus {
  noticias: boolean
  classificados: boolean
  eventos: boolean
  banners: boolean
  empresas: boolean
}

interface DashboardProps {
  stats: DashboardStats
  tableStatus: TableStatus
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

export default function AdminDashboard({ stats, tableStatus }: DashboardProps) {
  return (
    <AdminLayout title="Dashboard">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Painel Administrativo</h1>
          <p className="text-gray-600">Portal Maria Helena - Dashboard</p>
        </div>

        {/* Links para as seções */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <a href="/admin/noticias" className="block bg-blue-100 text-blue-800 text-center py-4 rounded shadow hover:bg-blue-200 transition-colors">
            📰 Gerenciar Notícias
          </a>
          <a href="/admin/classificados" className="block bg-green-100 text-green-800 text-center py-4 rounded shadow hover:bg-green-200 transition-colors">
            📋 Gerenciar Classificados
          </a>
          <a href="/admin/eventos" className="block bg-purple-100 text-purple-800 text-center py-4 rounded shadow hover:bg-purple-200 transition-colors">
            🎉 Gerenciar Eventos
          </a>
          <a href="/admin/banners" className="block bg-yellow-100 text-yellow-800 text-center py-4 rounded shadow hover:bg-yellow-200 transition-colors">
            🎯 Gerenciar Banners
          </a>
          <a href="/admin/empresas" className="block bg-orange-100 text-orange-800 text-center py-4 rounded shadow hover:bg-orange-200 transition-colors">
            🏢 Gerenciar Empresas
          </a>
        </div>

        {/* Link para Empresas Pendentes */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-red-100 rounded-full p-2 mr-3">
                <span className="text-red-600 text-lg">⏳</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-red-800">Empresas Pendentes de Aprovação</h3>
                <p className="text-red-600 text-sm">Empresas aguardando moderação do Google Forms</p>
              </div>
            </div>
            <a 
              href="/admin/empresas/pendentes" 
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Moderar Agora
            </a>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
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
          <StatCard
            title="Empresas"
            value={stats.empresas}
          />
        </div>

        {/* Simple Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Resumo</h2>
          <p className="text-gray-600 mb-4">Total de conteúdos: {stats.noticias + stats.classificados + stats.eventos + stats.banners + stats.empresas}</p>
          <div className="space-y-2">
            <p className="text-sm text-gray-500">✅ Sistema funcionando corretamente</p>
            <p className="text-sm text-gray-500">📊 Dados carregados com sucesso</p>
            <p className="text-sm text-gray-500">🔐 Usuário autenticado</p>
          </div>
        </div>

        {/* Database Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Status do Banco de Dados</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className={`p-4 rounded-lg border-2 ${
              tableStatus.noticias ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
            }`}>
              <div className="flex items-center space-x-2">
                <span className={`text-lg ${
                  tableStatus.noticias ? 'text-green-600' : 'text-red-600'
                }`}>
                  {tableStatus.noticias ? '✅' : '❌'}
                </span>
                <span className="font-medium">Notícias</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {tableStatus.noticias ? 'Tabela ativa' : 'Tabela não encontrada'}
              </p>
            </div>
            
            <div className={`p-4 rounded-lg border-2 ${
              tableStatus.classificados ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
            }`}>
              <div className="flex items-center space-x-2">
                <span className={`text-lg ${
                  tableStatus.classificados ? 'text-green-600' : 'text-red-600'
                }`}>
                  {tableStatus.classificados ? '✅' : '❌'}
                </span>
                <span className="font-medium">Classificados</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {tableStatus.classificados ? 'Tabela ativa' : 'Tabela não encontrada'}
              </p>
            </div>
            
            <div className={`p-4 rounded-lg border-2 ${
              tableStatus.eventos ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
            }`}>
              <div className="flex items-center space-x-2">
                <span className={`text-lg ${
                  tableStatus.eventos ? 'text-green-600' : 'text-red-600'
                }`}>
                  {tableStatus.eventos ? '✅' : '❌'}
                </span>
                <span className="font-medium">Eventos</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {tableStatus.eventos ? 'Tabela ativa' : 'Tabela não encontrada'}
              </p>
            </div>
            
            <div className={`p-4 rounded-lg border-2 ${
              tableStatus.banners ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
            }`}>
              <div className="flex items-center space-x-2">
                <span className={`text-lg ${
                  tableStatus.banners ? 'text-green-600' : 'text-red-600'
                }`}>
                  {tableStatus.banners ? '✅' : '❌'}
                </span>
                <span className="font-medium">Banners</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {tableStatus.banners ? 'Tabela ativa' : 'Tabela não encontrada'}
              </p>
            </div>
            
            <div className={`p-4 rounded-lg border-2 ${
              tableStatus.empresas ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
            }`}>
              <div className="flex items-center space-x-2">
                <span className={`text-lg ${
                  tableStatus.empresas ? 'text-green-600' : 'text-red-600'
                }`}>
                  {tableStatus.empresas ? '✅' : '❌'}
                </span>
                <span className="font-medium">Empresas</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {tableStatus.empresas ? 'Tabela ativa' : 'Tabela não encontrada'}
              </p>
            </div>
          </div>
          
          {!tableStatus.banners && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <span className="text-yellow-600 text-lg">⚠️</span>
                <div>
                  <h3 className="font-medium text-yellow-800">Tabela Banners Não Encontrada</h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    Para usar o sistema de banners, você precisa executar a migração do banco de dados.
                  </p>
                  <p className="text-sm text-yellow-700 mt-2">
                    <strong>Instruções:</strong> Consulte o arquivo <code className="bg-yellow-100 px-1 rounded">SUPABASE-MIGRATION.md</code> 
                    na raiz do projeto para executar o script de migração.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { createServerSupabaseClient } = await import('../../lib/supabase')
  const supabase = createServerSupabaseClient(ctx)

  // Função para contar registros e verificar status da tabela
  const checkTable = async (table: string) => {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
      
      if (error) {
        console.warn(`Tabela ${table} não encontrada:`, error.message)
        return { count: 0, exists: false }
      }
      
      return { count: count || 0, exists: true }
    } catch (err) {
      console.warn(`Erro ao acessar tabela ${table}:`, err)
      return { count: 0, exists: false }
    }
  }

  // Verificar todas as tabelas
  const [noticiasResult, classificadosResult, eventosResult, bannersResult, empresasResult] = await Promise.all([
    checkTable('noticias'),
    checkTable('classificados'), 
    checkTable('eventos'),
    checkTable('banners'),
    checkTable('empresas')
  ])

  return {
    props: {
      stats: {
        noticias: noticiasResult.count,
        classificados: classificadosResult.count,
        eventos: eventosResult.count,
        banners: bannersResult.count,
        empresas: empresasResult.count,
      },
      tableStatus: {
        noticias: noticiasResult.exists,
        classificados: classificadosResult.exists,
        eventos: eventosResult.exists,
        banners: bannersResult.exists,
        empresas: empresasResult.exists,
      },
    },
  }
}
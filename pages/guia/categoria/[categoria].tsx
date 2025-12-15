import { GetServerSideProps } from 'next'
import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { createServerSupabaseClient, Empresa } from '../../../lib/supabase'
import PlanBadge from '../../../components/PlanBadge'

interface CategoriaPageProps {
  empresas: Empresa[]
  categoria: string
  categorias: string[]
}

const categorias = [
  'Restaurante',
  'Automotivo',
  'Saúde',
  'Alimentação',
  'Beleza',
  'Tecnologia',
  'Comércio',
  'Serviços',
  'Educação',
  'Imóveis',
  'Decoração',
  'Esporte',
  'Moda',
  'Pet Shop'
]

export default function CategoriaPage({ empresas, categoria, categorias: todasCategorias }: CategoriaPageProps) {
  const [ordenacao, setOrdenacao] = useState<'nome' | 'rating' | 'plano'>('plano')
  const [filtroPlano, setFiltroPlano] = useState<'todos' | 'basic' | 'premium'>('todos')

  // Filtrar empresas por tipo de plano
  const empresasFiltradas = empresas.filter(empresa => {
    if (filtroPlano === 'todos') return true
    if (filtroPlano === 'basic') return empresa.plan_type === 'basic'
    if (filtroPlano === 'premium') {
      return empresa.plan_type === 'premium' &&
        (!empresa.premium_expires_at || new Date(empresa.premium_expires_at) > new Date())
    }
    return true
  })

  // Ordenar empresas
  const empresasOrdenadas = [...empresasFiltradas].sort((a, b) => {
    if (ordenacao === 'plano') {
      // Premium primeiro, depois básico
      if (a.plan_type === 'premium' && b.plan_type === 'basic') return -1
      if (a.plan_type === 'basic' && b.plan_type === 'premium') return 1
      // Se ambos são premium, verificar expiração
      if (a.plan_type === 'premium' && b.plan_type === 'premium') {
        const aExpired = a.premium_expires_at && new Date(a.premium_expires_at) <= new Date()
        const bExpired = b.premium_expires_at && new Date(b.premium_expires_at) <= new Date()
        if (aExpired && !bExpired) return 1
        if (!aExpired && bExpired) return -1
      }
      // Se mesmo tipo de plano, ordenar por nome
      return a.name.localeCompare(b.name)
    } else if (ordenacao === 'nome') {
      return a.name.localeCompare(b.name)
    } else {
      return b.rating - a.rating
    }
  })

  // Estatísticas
  const stats = {
    total: empresas.length,
    basic: empresas.filter(e => e.plan_type === 'basic').length,
    premium: empresas.filter(e =>
      e.plan_type === 'premium' &&
      (!e.premium_expires_at || new Date(e.premium_expires_at) > new Date())
    ).length
  }

  return (
    <>
      <Head>
        <title>{`${categoria} - Guia Comercial`}</title>
        <meta name="description" content={`Empresas da categoria ${categoria} no Guia Comercial`} />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <Link href="/" className="text-2xl font-bold text-blue-600">
                  Guia Comercial
                </Link>
              </div>
              <nav className="hidden md:flex space-x-8">
                <Link href="/" className="text-gray-600 hover:text-blue-600">
                  Início
                </Link>
                <Link href="/noticias" className="text-gray-600 hover:text-blue-600">
                  Notícias
                </Link>
                <Link href="/guia" className="text-gray-600 hover:text-blue-600">
                  Guia
                </Link>
              </nav>
            </div>
          </div>
        </header>

        {/* Breadcrumb */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <nav className="flex" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-4">
                <li>
                  <Link href="/" className="text-gray-400 hover:text-gray-500">
                    Início
                  </Link>
                </li>
                <li>
                  <span className="text-gray-400">/</span>
                </li>
                <li>
                  <Link href="/guia" className="text-gray-400 hover:text-gray-500">
                    Guia
                  </Link>
                </li>
                <li>
                  <span className="text-gray-400">/</span>
                </li>
                <li>
                  <span className="text-gray-900 font-medium">{categoria}</span>
                </li>
              </ol>
            </nav>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar - Navegação por Categorias */}
            <aside className="lg:w-64 flex-shrink-0">
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Categorias
                </h3>
                <nav className="space-y-2">
                  {todasCategorias.map((cat) => (
                    <Link
                      key={cat}
                      href={`/guia/categoria/${encodeURIComponent(cat)}`}
                      className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${cat === categoria
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                    >
                      {cat}
                    </Link>
                  ))}
                </nav>
              </div>

              {/* Estatísticas */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Estatísticas
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total</span>
                    <span className="font-semibold text-gray-900">{stats.total}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Básico</span>
                    <span className="font-semibold text-gray-900">{stats.basic}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Premium</span>
                    <span className="font-semibold text-yellow-600">{stats.premium}</span>
                  </div>
                </div>
              </div>
            </aside>

            {/* Conteúdo Principal */}
            <main className="flex-1">
              {/* Header da Categoria */}
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">{categoria}</h1>
                    <p className="text-gray-600 mt-2">
                      {empresasFiltradas.length} de {empresas.length} {empresas.length === 1 ? 'empresa' : 'empresas'}
                    </p>
                  </div>
                </div>

                {/* Filtros e Ordenação */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Filtro por Plano */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Filtrar por Plano:
                    </label>
                    <select
                      value={filtroPlano}
                      onChange={(e) => setFiltroPlano(e.target.value as 'todos' | 'basic' | 'premium')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="todos">Todos os Planos</option>
                      <option value="basic">Apenas Básico</option>
                      <option value="premium">Apenas Premium</option>
                    </select>
                  </div>

                  {/* Ordenação */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ordenar por:
                    </label>
                    <select
                      value={ordenacao}
                      onChange={(e) => setOrdenacao(e.target.value as 'nome' | 'rating' | 'plano')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="plano">Tipo de Plano</option>
                      <option value="nome">Nome (A-Z)</option>
                      <option value="rating">Melhor Avaliação</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Lista de Empresas */}
              {empresasOrdenadas.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {empresasOrdenadas.map((empresa) => (
                    <div key={empresa.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                      {/* Imagem da Empresa */}
                      {empresa.image && (
                        <div className="aspect-w-16 aspect-h-9">
                          <img
                            src={empresa.image}
                            alt={empresa.name}
                            className="w-full h-48 object-cover rounded-t-lg"
                          />
                        </div>
                      )}

                      <div className="p-6">
                        {/* Nome e Badges */}
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 flex-1">
                            {empresa.name}
                          </h3>
                          <div className="flex flex-col gap-1 ml-2">
                            <PlanBadge
                              planType={empresa.plan_type}
                              expiresAt={empresa.premium_expires_at}
                              size="sm"
                            />
                            {empresa.featured && (
                              <span className="px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded-full">
                                Destaque
                              </span>
                            )}
                            {empresa.is_new && (
                              <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">
                                Novo
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Avaliação */}
                        <div className="flex items-center mb-3">
                          <div className="flex items-center">
                            <span className="text-yellow-400 text-lg">★</span>
                            <span className="text-sm font-medium text-gray-900 ml-1">
                              {empresa.rating.toFixed(1)}
                            </span>
                            <span className="text-sm text-gray-500 ml-1">
                              ({empresa.reviews} {empresa.reviews === 1 ? 'avaliação' : 'avaliações'})
                            </span>
                          </div>
                        </div>

                        {/* Localização */}
                        {empresa.location && (
                          <p className="text-sm text-gray-600 mb-3">
                            📍 {empresa.location}
                          </p>
                        )}

                        {/* Descrição */}
                        {empresa.description && (
                          <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                            {empresa.description}
                          </p>
                        )}

                        {/* Informações de Contato */}
                        <div className="space-y-2 mb-4">
                          {empresa.phone && (
                            <div className="flex items-center text-sm text-gray-600">
                              <span className="mr-2">📞</span>
                              <a href={`tel:${empresa.phone}`} className="hover:text-blue-600">
                                {empresa.phone}
                              </a>
                            </div>
                          )}
                          {empresa.email && (
                            <div className="flex items-center text-sm text-gray-600">
                              <span className="mr-2">✉️</span>
                              <a href={`mailto:${empresa.email}`} className="hover:text-blue-600">
                                {empresa.email}
                              </a>
                            </div>
                          )}
                          {empresa.website && (
                            <div className="flex items-center text-sm text-gray-600">
                              <span className="mr-2">🌐</span>
                              <a
                                href={empresa.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-blue-600"
                              >
                                Website
                              </a>
                            </div>
                          )}
                        </div>

                        {/* Botão de Ação baseado no Plano */}
                        <div className="pt-3 border-t border-gray-200">
                          {empresa.plan_type === 'premium' &&
                            (!empresa.premium_expires_at || new Date(empresa.premium_expires_at) > new Date()) ? (
                            <Link
                              href={`/guia/${empresa.id}`}
                              className="w-full inline-flex justify-center items-center px-4 py-2 bg-yellow-600 text-white text-sm font-medium rounded-md hover:bg-yellow-700 transition-colors"
                            >
                              Ver Página Completa
                            </Link>
                          ) : (
                            <div className="text-center">
                              <p className="text-sm text-gray-500 mb-2">
                                Informações básicas da empresa
                              </p>
                              {empresa.address && (
                                <p className="text-xs text-gray-400">
                                  {empresa.address}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                  <div className="text-gray-400 text-6xl mb-4">🏢</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhuma empresa encontrada
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {filtroPlano === 'todos'
                      ? `Não há empresas cadastradas na categoria "${categoria}" no momento.`
                      : `Não há empresas com plano ${filtroPlano === 'basic' ? 'básico' : 'premium'} na categoria "${categoria}".`
                    }
                  </p>
                  <div className="space-x-4">
                    {filtroPlano !== 'todos' && (
                      <button
                        onClick={() => setFiltroPlano('todos')}
                        className="inline-block px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                      >
                        Ver Todas
                      </button>
                    )}
                    <Link
                      href="/guia"
                      className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Ver Todas as Categorias
                    </Link>
                  </div>
                </div>
              )}
            </main>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-gray-800 text-white mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <p>&copy; 2024 Guia Comercial. Todos os direitos reservados.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { categoria } = context.params!
  const categoriaDecoded = decodeURIComponent(categoria as string)

  // Verificar se a categoria é válida
  if (!categorias.includes(categoriaDecoded)) {
    return {
      notFound: true
    }
  }

  const supabase = createServerSupabaseClient(context)

  try {
    // Buscar todas as empresas da categoria específica que estão ativas
    // Incluindo tanto básicas quanto premium
    const { data: empresas, error } = await supabase
      .from('empresas')
      .select('*')
      .eq('category', categoriaDecoded)
      .eq('ativo', true)
      .order('plan_type', { ascending: false }) // Premium primeiro
      .order('name', { ascending: true })

    if (error) {
      console.error('Erro ao buscar empresas:', error)
      return {
        props: {
          empresas: [],
          categoria: categoriaDecoded,
          categorias
        }
      }
    }

    return {
      props: {
        empresas: empresas || [],
        categoria: categoriaDecoded,
        categorias
      }
    }
  } catch (error) {
    console.error('Erro ao conectar com o banco:', error)
    return {
      props: {
        empresas: [],
        categoria: categoriaDecoded,
        categorias
      }
    }
  }
}
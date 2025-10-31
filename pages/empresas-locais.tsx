import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { Search, Filter, MapPin, Phone, Globe, Star, Clock, ChevronDown, Building2, Utensils, Bed, Wrench, ShoppingBag, Heart, GraduationCap, Scissors, Monitor, Dumbbell, Car } from 'lucide-react'
import Link from 'next/link'
import Header from '../components/Header'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import { ContentBanner, MobileBanner } from '../components/BannerContainer'

interface Empresa {
  id: string
  name: string
  description: string
  category: string
  rating: number
  reviews: number
  location: string
  phone: string
  email: string
  website: string
  address: string
  plan_type: string
  isOpen: boolean
  distance?: number
}

interface Filters {
  categorias: string[]
  localizacoes: string[]
}

interface ApiResponse {
  empresas: Empresa[]
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
  filters: Filters
  stats: {
    totalEmpresas: number
    planType: string
  }
}

// Categorias principais do site - expandidas conforme solicitado
const CATEGORIAS_PRINCIPAIS = [
  { nome: 'Alimentação', icone: Utensils, cor: 'bg-orange-100 text-orange-600' },
  { nome: 'Hospedagem', icone: Bed, cor: 'bg-blue-100 text-blue-600' },
  { nome: 'Serviços', icone: Wrench, cor: 'bg-green-100 text-green-600' },
  { nome: 'Comércio', icone: ShoppingBag, cor: 'bg-purple-100 text-purple-600' },
  { nome: 'Saúde', icone: Heart, cor: 'bg-red-100 text-red-600' },
  { nome: 'Educação', icone: GraduationCap, cor: 'bg-indigo-100 text-indigo-600' },
  { nome: 'Beleza', icone: Scissors, cor: 'bg-pink-100 text-pink-600' },
  { nome: 'Tecnologia', icone: Monitor, cor: 'bg-cyan-100 text-cyan-600' },
  { nome: 'Esporte', icone: Dumbbell, cor: 'bg-emerald-100 text-emerald-600' },
  { nome: 'Automotivo', icone: Car, cor: 'bg-slate-100 text-slate-600' }
]

// Função para obter ícone da categoria com mapeamento melhorado
const getCategoryIcon = (category: string) => {
  const categoryLower = category.toLowerCase()
  
  // Mapeamento específico para categorias do banco de dados
  const mapeamento: { [key: string]: string } = {
    'restaurante': 'Alimentação',
    'restaurantes': 'Alimentação',
    'alimentação': 'Alimentação',
    'comida': 'Alimentação',
    'lanchonete': 'Alimentação',
    'padaria': 'Alimentação',
    'hotel': 'Hospedagem',
    'pousada': 'Hospedagem',
    'hospedagem': 'Hospedagem',
    'serviço': 'Serviços',
    'serviços': 'Serviços',
    'loja': 'Comércio',
    'comércio': 'Comércio',
    'mercado': 'Comércio',
    'farmácia': 'Saúde',
    'saúde': 'Saúde',
    'clínica': 'Saúde',
    'hospital': 'Saúde',
    'escola': 'Educação',
    'educação': 'Educação',
    'curso': 'Educação',
    'salão': 'Beleza',
    'beleza': 'Beleza',
    'barbearia': 'Beleza',
    'estética': 'Beleza',
    'informática': 'Tecnologia',
    'tecnologia': 'Tecnologia',
    'computador': 'Tecnologia',
    'academia': 'Esporte',
    'esporte': 'Esporte',
    'fitness': 'Esporte',
    'auto': 'Automotivo',
    'automotivo': 'Automotivo',
    'mecânica': 'Automotivo',
    'oficina': 'Automotivo'
  }
  
  // Buscar por mapeamento direto
  const categoriaMapeada = mapeamento[categoryLower]
  if (categoriaMapeada) {
    const categoriaInfo = CATEGORIAS_PRINCIPAIS.find(cat => cat.nome === categoriaMapeada)
    if (categoriaInfo) return categoriaInfo
  }
  
  // Buscar por correspondência parcial
  const categoriaInfo = CATEGORIAS_PRINCIPAIS.find(cat => 
    cat.nome.toLowerCase() === categoryLower ||
    categoryLower.includes(cat.nome.toLowerCase()) ||
    cat.nome.toLowerCase().includes(categoryLower)
  )
  
  return categoriaInfo || { nome: category, icone: Building2, cor: 'bg-gray-100 text-gray-600' }
}

export default function EmpresasLocais() {
  const router = useRouter()
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedLocation, setSelectedLocation] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState<Filters>({ categorias: [], localizacoes: [] })
  const [stats, setStats] = useState({ totalEmpresas: 0, planType: 'basic' })
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNextPage: false,
    hasPrevPage: false
  })
  const [showFilters, setShowFilters] = useState(false)

  // Aplicar filtro da URL quando a página carregar
  useEffect(() => {
    if (router.isReady) {
      const { categoria } = router.query
      if (categoria && typeof categoria === 'string') {
        setSelectedCategory(categoria)
      }
    }
  }, [router.isReady, router.query])

  const fetchEmpresas = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        search,
        category: selectedCategory,
        location: selectedLocation,
        page: currentPage.toString(),
        limit: '12',
        planType: 'basic'
      })

      const response = await fetch(`/api/empresas-locais?${params}`)
      const data: ApiResponse = await response.json()

      setEmpresas(data.empresas)
      setFilters(data.filters)
      setStats(data.stats)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Erro ao buscar empresas:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEmpresas()
  }, [search, selectedCategory, selectedLocation, currentPage])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchEmpresas()
  }

  const resetFilters = () => {
    setSearch('')
    setSelectedCategory('all')
    setSelectedLocation('all')
    setCurrentPage(1)
  }

  return (
    <>
      <Head>
        <title>Empresas Locais - Portal Maria Helena</title>
        <meta name="description" content="Descubra os melhores negócios da sua região. Encontre empresas locais, serviços e comércios em Maria Helena." />
        <meta name="keywords" content="empresas locais, negócios, serviços, comércio, Maria Helena" />
      </Head>
      
      <Header />
      <Nav />
      
      {/* Banner Mobile */}
      <MobileBanner className="py-4" />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Empresas Locais
              </h1>
              <p className="text-lg text-gray-600 mb-4">
                Descubra os melhores negócios da sua região
              </p>
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                <span className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  {stats.totalEmpresas} empresas encontradas
                </span>
                <span className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  Empresas Locais
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Banner Topo do Conteúdo */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <ContentBanner position="content-top" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">
              Explore Nossas Categorias
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-5 gap-4">
              {CATEGORIAS_PRINCIPAIS.map((categoria) => {
                const IconComponent = categoria.icone
                return (
                  <button
                    key={categoria.nome}
                    onClick={() => {
                      setSelectedCategory(categoria.nome)
                      setCurrentPage(1)
                    }}
                    className={`p-4 rounded-xl transition-all duration-200 hover:scale-105 ${
                      selectedCategory === categoria.nome
                        ? 'ring-2 ring-blue-500 ' + categoria.cor
                        : categoria.cor + ' hover:shadow-md'
                    }`}
                  >
                    <IconComponent className="w-8 h-8 mx-auto mb-2" />
                    <span className="text-sm font-medium block">{categoria.nome}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar empresas..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex flex-wrap gap-4">
                <button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filtros
                  <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </button>

                {selectedCategory !== 'all' && (
                  <span className="flex items-center px-3 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm">
                    {selectedCategory}
                    <button
                      type="button"
                      onClick={() => setSelectedCategory('all')}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                )}

                {selectedLocation !== 'all' && (
                  <span className="flex items-center px-3 py-2 bg-green-100 text-green-800 rounded-lg text-sm">
                    {selectedLocation}
                    <button
                      type="button"
                      onClick={() => setSelectedLocation('all')}
                      className="ml-2 text-green-600 hover:text-green-800"
                    >
                      ×
                    </button>
                  </span>
                )}

                {(selectedCategory !== 'all' || selectedLocation !== 'all' || search) && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm"
                  >
                    Limpar filtros
                  </button>
                )}
              </div>

              {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Categoria
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">Todas as categorias</option>
                      {filters.categorias.map((categoria) => (
                        <option key={categoria} value={categoria}>
                          {categoria}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Localização
                    </label>
                    <select
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">Todas as localizações</option>
                      {filters.localizacoes.map((location) => (
                        <option key={location} value={location}>
                          {location}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </form>
          </div>

          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          )}

          {!loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {empresas.map((empresa) => {
                const categoryInfo = getCategoryIcon(empresa.category)
                const IconComponent = categoryInfo.icone
                
                return (
                  <div
                    key={empresa.id}
                    className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
                  >
                    <div className="p-6 border-b border-gray-100">
                      <div className="flex items-center justify-between mb-3">
                        <div className={`p-3 rounded-xl ${categoryInfo.cor}`}>
                          <IconComponent className="w-6 h-6" />
                        </div>
                        <div className="flex items-center">
                          <Clock className={`w-4 h-4 mr-1 ${empresa.isOpen ? 'text-green-500' : 'text-red-500'}`} />
                          <span className={`text-xs font-medium ${empresa.isOpen ? 'text-green-600' : 'text-red-600'}`}>
                            {empresa.isOpen ? 'Aberto' : 'Fechado'}
                          </span>
                        </div>
                      </div>

                      <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-1">
                        {empresa.name}
                      </h3>
                      
                      <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                        {empresa.category}
                      </span>
                    </div>

                    <div className="p-6">
                      {empresa.description && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {empresa.description}
                        </p>
                      )}

                      {empresa.rating > 0 && (
                        <div className="flex items-center mb-4">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < empresa.rating
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="ml-2 text-sm text-gray-600">
                            ({empresa.reviews} avaliações)
                          </span>
                        </div>
                      )}

                      <div className="space-y-3">
                        {empresa.location && (
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="w-4 h-4 mr-3 text-gray-400 flex-shrink-0" />
                            <span className="line-clamp-1">{empresa.location}</span>
                          </div>
                        )}
                        
                        {empresa.phone && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone className="w-4 h-4 mr-3 text-gray-400 flex-shrink-0" />
                            <span>{empresa.phone}</span>
                          </div>
                        )}
                        
                        {empresa.website && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Globe className="w-4 h-4 mr-3 text-gray-400 flex-shrink-0" />
                            <a
                              href={empresa.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 line-clamp-1"
                            >
                              Visitar site
                            </a>
                          </div>
                        )}
                      </div>

                      <div className="mt-6 pt-4 border-t">
                        <Link
                          href={`/empresa/${empresa.id}`}
                          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 text-center block font-medium"
                        >
                          Ver Detalhes
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Banner Meio do Conteúdo */}
          {!loading && empresas.length > 6 && (
            <div className="my-8">
              <ContentBanner position="content-middle" />
            </div>
          )}

          {!loading && empresas.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Nenhuma empresa encontrada
              </h3>
              <p className="text-gray-600 mb-4">
                Tente ajustar os filtros ou termos de busca
              </p>
              <button
                onClick={resetFilters}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Limpar filtros
              </button>
            </div>
          )}

          {!loading && pagination.totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-8">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={!pagination.hasPrevPage}
                className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>

              <div className="flex space-x-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  let page
                  if (pagination.totalPages <= 5) {
                    page = i + 1
                  } else if (currentPage <= 3) {
                    page = i + 1
                  } else if (currentPage >= pagination.totalPages - 2) {
                    page = pagination.totalPages - 4 + i
                  } else {
                    page = currentPage - 2 + i
                  }

                  const isCurrentPage = page === currentPage

                  if (page >= 1 && page <= pagination.totalPages) {
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-2 rounded-lg transition-colors ${
                          isCurrentPage
                            ? 'bg-blue-600 text-white'
                            : 'bg-white border border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  }
                  return null
                })}
              </div>

              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={!pagination.hasNextPage}
                className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Próxima
              </button>
            </div>
          )}

          {/* Banner Final do Conteúdo */}
          <div className="mt-8">
            <ContentBanner position="content-bottom" />
          </div>
        </div>
        
        <Footer />
      </div>
    </>
  )
}
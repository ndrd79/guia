import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { GetStaticProps } from 'next'
import Header from '../../components/Header'
import Nav from '../../components/Nav'
import Footer from '../../components/Footer'
import PageBanner from '../../components/PageBanner'
// import BannerAd from '../../components/BannerAd'
import BannerCarousel from '../../components/BannerCarousel'
import { createServerSupabaseClient, Empresa } from '../../lib/supabase'

interface Business extends Empresa {
  // Mantendo compatibilidade com a interface existente
}

interface Category {
  name: string
  icon: string
  count: number
}

interface GuiaComercialProps {
  businesses: Business[]
  categories: Category[]
  totalCount: number
}

export default function GuiaComercial({ businesses: initialBusinesses, categories, totalCount }: GuiaComercialProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [filteredBusinesses, setFilteredBusinesses] = useState(initialBusinesses)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(8) // 8 empresas por página para melhor performance
  const [isLoading, setIsLoading] = useState(false)

  // Calcular índices para paginação
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredBusinesses.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredBusinesses.length / itemsPerPage)

  const handleSearch = () => {
    setIsLoading(true)

    // Simular um pequeno delay para mostrar loading state
    setTimeout(() => {
      let filtered = initialBusinesses

      if (searchTerm) {
        filtered = filtered.filter(business =>
          business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (business.description && business.description.toLowerCase().includes(searchTerm.toLowerCase()))
        )
      }

      if (selectedCategory) {
        filtered = filtered.filter(business => business.category === selectedCategory)
      }

      setFilteredBusinesses(filtered)
      setCurrentPage(1) // Reset para primeira página quando filtrar
      setIsLoading(false)
    }, 300)
  }

  // Resetar para primeira página quando os filtros mudarem
  useEffect(() => {
    setCurrentPage(1)
  }, [filteredBusinesses])

  // Resetar filtros quando a página carrega
  useEffect(() => {
    setFilteredBusinesses(initialBusinesses)
  }, [initialBusinesses])

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber)
    // Scroll suave para o topo da lista
    document.querySelector('main')?.scrollIntoView({ behavior: 'smooth' })
  }

  const handlePrevious = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1)
    }
  }

  const handleNext = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1)
    }
  }

  // Gerar números das páginas para exibir
  const getPageNumbers = () => {
    const pageNumbers = []
    const maxPagesToShow = 5

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i)
      }
    } else {
      const startPage = Math.max(1, currentPage - 2)
      const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1)

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i)
      }
    }

    return pageNumbers
  }

  return (
    <>
      <Head>
        <title>Guia Comercial - Portal Maria Helena</title>
        <meta name="description" content="Encontre os melhores estabelecimentos, serviços e profissionais de Maria Helena" />
      </Head>

      <Header />
      <Nav />

      {/* Hero Section */}
      <section className="relative bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Guia Comercial de Maria Helena</h1>
              <p className="text-xl mb-6">Encontre os melhores estabelecimentos, serviços e profissionais da nossa cidade.</p>

              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <div className="relative flex-grow">
                  <input
                    type="text"
                    placeholder="O que você procura?"
                    className="w-full py-3 px-4 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <button
                    className="absolute right-3 top-3 text-indigo-600"
                    onClick={handleSearch}
                  >
                    <i className="fas fa-search"></i>
                  </button>
                </div>
                <select
                  className="py-3 px-4 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value)
                    setTimeout(handleSearch, 0)
                  }}
                >
                  <option value="">Todas as categorias</option>
                  {categories.map(category => (
                    <option key={category.name} value={category.name}>{category.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="md:w-1/2">
              <BannerCarousel
                position="Hero Carousel"
                local="guia_comercial"
                interval={6000}
                autoRotate={true}
                maxBanners={0}
                className="rounded-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-1/4">
            <div className="bg-white rounded-xl shadow-md p-6 mb-6 sticky top-24">
              <h2 className="text-xl font-bold mb-4 text-indigo-600">Categorias</h2>

              <div className="space-y-3">
                {categories.map(category => (
                  <div
                    key={category.name}
                    className={`category-card p-3 rounded-lg hover:bg-indigo-50 transition cursor-pointer ${selectedCategory === category.name ? 'bg-indigo-100 border-2 border-indigo-300' : ''
                      }`}
                    onClick={() => {
                      setSelectedCategory(category.name)
                      setTimeout(handleSearch, 0)
                    }}
                  >
                    <div className="flex items-center">
                      <div className="category-icon bg-indigo-100 w-10 h-10 rounded-full flex items-center justify-center mr-3 text-indigo-600">
                        <i className={category.icon}></i>
                      </div>
                      <span className="font-medium">{category.name}</span>
                      <span className="ml-auto bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">{category.count}</span>
                    </div>
                  </div>
                ))}

                {/* Botão para limpar filtros */}
                {(selectedCategory || searchTerm) && (
                  <button
                    onClick={() => {
                      setSelectedCategory('')
                      setSearchTerm('')
                      setFilteredBusinesses(initialBusinesses)
                      setCurrentPage(1)
                    }}
                    className="w-full mt-4 py-2 px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                  >
                    <i className="fas fa-times mr-2"></i>
                    Limpar Filtros
                  </button>
                )}
              </div>
            </div>

            <BannerCarousel
              position="Sidebar Direita"
              local="guia_comercial"
              interval={6000}
              autoRotate={true}
              maxBanners={0}
              className="w-full max-w-[300px] mx-auto aspect-[1/2] rounded-xl"
            />
          </aside>

          {/* Business Listings */}
          <main className="lg:w-3/4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {selectedCategory ? `${selectedCategory} em Maria Helena` : 'Todos os Estabelecimentos'}
              </h2>
              <div className="text-gray-600">
                <span>{filteredBusinesses.length} resultados encontrados</span>
                {totalPages > 1 && (
                  <span className="ml-2">• Página {currentPage} de {totalPages}</span>
                )}
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">Carregando...</h3>
                <p className="text-gray-500">Buscando estabelecimentos...</p>
              </div>
            ) : currentItems.length === 0 ? (
              <div className="text-center py-12">
                <i className="fas fa-search text-6xl text-gray-300 mb-4"></i>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">Nenhum resultado encontrado</h3>
                <p className="text-gray-500">Tente ajustar seus filtros ou termo de busca.</p>
              </div>
            ) : (
              <>
                <div className="grid gap-6">
                  {currentItems.map(business => (
                    <div key={business.id} className="business-card bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
                      <div className="flex flex-col md:flex-row">
                        <div className="md:w-1/3 relative">
                          {business.image ? (
                            <Image
                              src={business.image}
                              alt={business.name}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 100vw, 33vw"
                              loading="lazy"
                              placeholder="blur"
                              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+Rj5m4xbDLdpkZfVZGjjVmRZEjkjdGKOjKrKQQQQCCOQQetTnhKhPTvYfEfxjlMcuoLvM5nUl+dVnvJzLM7HqxPQD0AAA9AKAv/9k="
                            />
                          ) : (
                            <div className="w-full h-48 md:h-full bg-gray-200 flex items-center justify-center">
                              <i className="fas fa-building text-4xl text-gray-400"></i>
                            </div>
                          )}
                        </div>
                        <div className="md:w-2/3 p-6">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-xl font-bold text-gray-800">{business.name}</h3>
                            {business.featured && (
                              <span className="bg-yellow-400 text-yellow-800 text-xs px-2 py-1 rounded-full font-bold">
                                DESTAQUE
                              </span>
                            )}
                          </div>

                          <p className="text-indigo-600 font-medium mb-2">{business.category}</p>
                          <p className="text-gray-600 mb-4">{business.description || 'Descrição não disponível'}</p>

                          <div className="space-y-2 mb-4">
                            {business.address && (
                              <div className="flex items-center text-gray-600">
                                <i className="fas fa-map-marker-alt mr-2 text-indigo-600"></i>
                                {business.address}
                              </div>
                            )}
                            {business.phone && (
                              <div className="flex items-center text-gray-600">
                                <i className="fas fa-phone mr-2 text-indigo-600"></i>
                                {business.phone}
                              </div>
                            )}
                            {business.website && (
                              <div className="flex items-center text-gray-600">
                                <i className="fas fa-globe mr-2 text-indigo-600"></i>
                                <a href={`https://${business.website}`} className="text-indigo-600 hover:underline" target="_blank" rel="noopener noreferrer">
                                  {business.website}
                                </a>
                              </div>
                            )}
                          </div>

                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <div className="flex text-yellow-400 mr-2">
                                {[...Array(5)].map((_, i) => (
                                  <i key={i} className={`fas fa-star ${i < Math.floor(business.rating) ? '' : 'text-gray-300'}`}></i>
                                ))}
                              </div>
                              <span className="text-gray-600 text-sm">{business.rating}/5</span>
                            </div>

                            <div className="flex space-x-2">
                              <Link href={`/guia/${business.id}`}>
                                <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
                                  <i className="fas fa-info-circle mr-2"></i>Detalhes
                                </button>
                              </Link>
                              {business.phone && (
                                <a href={`tel:${business.phone}`}>
                                  <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
                                    <i className="fas fa-phone mr-2"></i>Contato
                                  </button>
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-8">
                    <div className="flex space-x-2">
                      <button
                        onClick={handlePrevious}
                        disabled={currentPage === 1}
                        className={`px-4 py-2 border rounded-lg transition ${currentPage === 1
                          ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                      >
                        <i className="fas fa-chevron-left mr-2"></i>
                        Anterior
                      </button>

                      {getPageNumbers().map(pageNumber => (
                        <button
                          key={pageNumber}
                          onClick={() => handlePageChange(pageNumber)}
                          className={`px-4 py-2 rounded-lg transition ${currentPage === pageNumber
                            ? 'bg-indigo-600 text-white'
                            : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                          {pageNumber}
                        </button>
                      ))}

                      <button
                        onClick={handleNext}
                        disabled={currentPage === totalPages}
                        className={`px-4 py-2 border rounded-lg transition ${currentPage === totalPages
                          ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                      >
                        Próximo
                        <i className="fas fa-chevron-right ml-2"></i>
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Banner Grande - Final da Página */}
      <div className="container mx-auto px-4 pb-12">
        <PageBanner
          posicao="Banner Grande - Final"
          local="guia_comercial"
          className="max-w-5xl mx-auto"
        />
      </div>

      <Footer />
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  try {
    const supabase = createServerSupabaseClient()

    // Buscar empresas ativas do banco de dados
    const { data: empresas, error: empresasError } = await supabase
      .from('empresas')
      .select('*')
      .eq('ativo', true)
      .order('featured', { ascending: false })
      .order('created_at', { ascending: false })

    if (empresasError) {
      console.error('Erro ao buscar empresas:', empresasError)
    }

    // Buscar categorias e contar empresas por categoria
    const { data: categoriesData, error: categoriesError } = await supabase
      .from('empresas')
      .select('category')
      .eq('ativo', true)

    if (categoriesError) {
      console.error('Erro ao buscar categorias:', categoriesError)
    }

    // Processar categorias e contar
    const categoryMap = new Map()
    categoriesData?.forEach(item => {
      const count = categoryMap.get(item.category) || 0
      categoryMap.set(item.category, count + 1)
    })

    // Mapear categorias com ícones
    const categoryIcons: { [key: string]: string } = {
      'Restaurante': 'fas fa-utensils',
      'Restaurantes': 'fas fa-utensils',
      'Comércio': 'fas fa-shopping-bag',
      'Automotivo': 'fas fa-car',
      'Automóveis': 'fas fa-car',
      'Imóveis': 'fas fa-home',
      'Saúde': 'fas fa-briefcase-medical',
      'Educação': 'fas fa-graduation-cap',
      'Serviços': 'fas fa-tools',
      'Alimentação': 'fas fa-utensils',
      'Beleza': 'fas fa-cut',
      'Tecnologia': 'fas fa-laptop',
      'Esporte': 'fas fa-dumbbell',
      'Esportes': 'fas fa-dumbbell',
      'Moda': 'fas fa-tshirt',
      'Decoração': 'fas fa-couch',
      'Pet Shop': 'fas fa-paw'
    }

    const categories = Array.from(categoryMap.entries()).map(([name, count]) => ({
      name,
      count,
      icon: categoryIcons[name] || 'fas fa-store'
    })).sort((a, b) => b.count - a.count)

    return {
      props: {
        businesses: empresas || [],
        categories: categories || [],
        totalCount: empresas?.length || 0
      },
      // ISR: Revalidar a cada 10 minutos
      revalidate: 600
    }
  } catch (error) {
    console.error('Erro no getStaticProps do guia:', error)
    return {
      props: {
        businesses: [],
        categories: [],
        totalCount: 0
      },
      // Em caso de erro, tentar novamente em 1 minuto
      revalidate: 60
    }
  }
}
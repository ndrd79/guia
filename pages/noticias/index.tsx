import React, { useState, useMemo, useCallback } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import { GetStaticProps } from 'next'
import Header from '../../components/Header'
import Nav from '../../components/Nav'
import Footer from '../../components/Footer'
import BannerContainer from '../../components/BannerContainer'
import { formatDate } from '../../lib/formatters'
import { createServerSupabaseClient, Noticia } from '../../lib/supabase'

interface NewsPageProps {
  noticias: Noticia[]
  categorias: string[]
  totalNoticias: number
}

// Componente de skeleton para loading
const NewsSkeleton = ({ isLarge = false }: { isLarge?: boolean }) => {
  if (isLarge) {
    return (
      <div className="mb-12 bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
        <div className="h-96 bg-gray-200"></div>
        <div className="p-6">
          <div className="h-4 bg-gray-200 rounded w-20 mb-3"></div>
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-6"></div>
          <div className="h-4 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
      <div className="h-48 bg-gray-200"></div>
      <div className="p-4">
        <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
        <div className="h-6 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 rounded mb-3"></div>
        <div className="flex justify-between items-center">
          <div className="h-3 bg-gray-200 rounded w-20"></div>
          <div className="h-3 bg-gray-200 rounded w-16"></div>
        </div>
      </div>
    </div>
  )
}



// Componente memoizado para card de notícia
const NewsCard = ({ news, isLarge = false }: { news: Noticia; isLarge?: boolean }) => {
  const getCategoryColor = useCallback((category: string) => {
    const colors: { [key: string]: string } = {
      'Política': 'bg-red-500',
      'Economia': 'bg-green-500',
      'Esportes': 'bg-blue-500',
      'Cultura': 'bg-purple-500',
      'Saúde': 'bg-pink-500',
      'Educação': 'bg-indigo-500',
      'Tecnologia': 'bg-gray-500',
      'Meio Ambiente': 'bg-emerald-500'
    }
    return colors[category] || 'bg-gray-500'
  }, [])

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }, [])

  if (isLarge) {
    return (
      <div className="mb-12 bg-white rounded-xl shadow-lg overflow-hidden news-card">
        <div className="relative">
          <div className="absolute top-4 left-4 z-10">
            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">DESTAQUE</span>
          </div>
          <div className="absolute top-4 right-4 z-10 text-white">
            <i className="far fa-calendar mr-1"></i> {formatDate(news.data || news.created_at)}
          </div>
          <div className="h-96 relative overflow-hidden">
            {news.imagem ? (
              <Image
                src={news.imagem}
                alt={news.titulo}
                fill
                className="object-cover"
                priority={true}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <i className="fas fa-newspaper text-gray-400 text-6xl"></i>
              </div>
            )}
          </div>
        </div>
        <div className="p-6">
          <span className={`${getCategoryColor(news.categoria)} text-white px-3 py-1 rounded-full text-sm font-bold mb-3 inline-block`}>
            {news.categoria}
          </span>
          <h2 className="text-2xl md:text-3xl font-bold mb-4">{news.titulo}</h2>
          <p className="text-gray-600 mb-6">{news.descricao}</p>
          <div className="flex items-center justify-between">
            <Link 
              href={`/noticias/${news.id}`} 
              className="text-indigo-600 font-medium hover:text-indigo-800 flex items-center"
              prefetch={true}
            >
              Leia a matéria completa <i className="fas fa-arrow-right ml-2"></i>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden news-card">
      <div className="relative">
        <div className="absolute top-2 left-2 z-10">
          <span className={`${getCategoryColor(news.categoria)} text-white px-2 py-1 rounded-full text-xs`}>
            {news.categoria}
          </span>
        </div>
        <div className="h-48 relative overflow-hidden">
          {news.imagem ? (
            <Image
              src={news.imagem}
              alt={news.titulo}
              fill
              className="object-cover"
              loading="lazy"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <i className="fas fa-newspaper text-gray-400 text-4xl"></i>
            </div>
          )}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg mb-2 line-clamp-2">{news.titulo}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-3">{news.descricao}</p>
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-500">
            <i className="far fa-calendar mr-1"></i> {formatDate(news.data || news.created_at)}
          </span>
          <Link 
            href={`/noticias/${news.id}`} 
            className="text-indigo-600 hover:text-indigo-800 font-medium"
            prefetch={true}
          >
            Ler mais
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function Noticias({ noticias, categorias, totalNoticias }: NewsPageProps) {
  const [selectedCategory, setSelectedCategory] = useState('Todas')
  const [currentPage, setCurrentPage] = useState(1)
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const itemsPerPage = 8

  // Memoizar notícias filtradas
  const filteredNews = useMemo(() => {
    if (selectedCategory === 'Todas') {
      return noticias
    }
    return noticias.filter(news => news.categoria.toLowerCase() === selectedCategory.toLowerCase())
  }, [noticias, selectedCategory])

  // Memoizar notícias paginadas
  const paginatedNews = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredNews.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredNews, currentPage, itemsPerPage])

  // Memoizar notícia em destaque
  const featuredNews = useMemo(() => {
    return noticias.find(news => news.destaque) || noticias[0]
  }, [noticias])

  // Memoizar notícias regulares
  const regularNews = useMemo(() => {
    return paginatedNews.filter(news => news.id !== featuredNews?.id)
  }, [paginatedNews, featuredNews])

  // Memoizar notícias populares
  const popularNews = useMemo(() => {
    return noticias.slice(0, 5)
  }, [noticias])

  // Callbacks memoizados
  const handleCategoryFilter = useCallback((category: string) => {
    setIsLoading(true)
    setSelectedCategory(category)
    setCurrentPage(1)
    // Simular pequeno delay para mostrar loading
    setTimeout(() => setIsLoading(false), 300)
  }, [])

  const handlePageChange = useCallback((page: number) => {
    setIsLoading(true)
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
    // Simular pequeno delay para mostrar loading
    setTimeout(() => setIsLoading(false), 300)
  }, [])

  const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
  }, [])

  // Calcular total de páginas
  const totalPages = Math.ceil(filteredNews.length / itemsPerPage)

  return (
    <>
      <Head>
        <title>Notícias - Portal Maria Helena</title>
        <meta name="description" content="Fique por dentro de tudo o que acontece em Maria Helena. Informações atualizadas sobre política, eventos, economia e muito mais." />
      </Head>

      <Header />
      <Nav />

      {/* News Hero Section */}
      <section className="relative bg-gradient-to-r from-indigo-700 to-purple-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Notícias de Maria Helena</h1>
          <p className="text-xl max-w-3xl mx-auto">Fique por dentro de tudo o que acontece na nossa cidade. Informações atualizadas sobre política, eventos, economia e muito mais.</p>
          
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {['Todas', ...categorias].map(category => (
              <button 
                key={category}
                className={`px-5 py-2 rounded-full font-medium transition ${
                  selectedCategory === category 
                    ? 'bg-white text-indigo-700' 
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
                onClick={() => handleCategoryFilter(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main News Content */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main News Column */}
            <div className="lg:w-2/3">
              {/* Featured News */}
              {isLoading ? (
                selectedCategory === 'Todas' && currentPage === 1 && <NewsSkeleton isLarge={true} />
              ) : (
                featuredNews && selectedCategory === 'Todas' && currentPage === 1 && (
                  <NewsCard news={featuredNews} isLarge={true} />
                )
              )}

              {/* News Grid */}
              <h2 className="text-3xl font-bold mb-8">
                {selectedCategory === 'Todas' ? 'Últimas Notícias' : `Notícias - ${selectedCategory}`}
              </h2>
              
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {Array.from({ length: 6 }, (_, i) => (
                    <NewsSkeleton key={i} />
                  ))}
                </div>
              ) : regularNews.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {regularNews.map(news => (
                    <NewsCard key={news.id} news={news} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <i className="fas fa-newspaper text-gray-400 text-6xl mb-4"></i>
                  <p className="text-gray-500 text-lg">Nenhuma notícia encontrada para esta categoria.</p>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-12 flex justify-center">
                  <nav className="flex space-x-2">
                    <button 
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <i className="fas fa-chevron-left"></i>
                    </button>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-2 rounded-lg ${
                            currentPage === page
                              ? 'bg-indigo-600 text-white'
                              : 'border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      )
                    })}
                    
                    <button 
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <i className="fas fa-chevron-right"></i>
                    </button>
                  </nav>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:w-1/3">
              {/* Advertising Space */}
              <BannerContainer 
                position="sidebar"
                className="w-full h-48 md:h-64 rounded-lg mb-8"
              />

              {/* Popular News */}
              <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <i className="fas fa-fire text-orange-500 mr-2"></i> Notícias Populares
                </h3>
                <ul className="space-y-4">
                  {popularNews.map((news) => (
                    <li key={news.id}>
                      <Link 
                        href={`/noticias/${news.id}`} 
                        className="flex items-start space-x-3 group"
                        prefetch={true}
                      >
                        <div className="flex-shrink-0">
                          <div className="relative w-16 h-16 rounded-xl overflow-hidden">
                            {news.imagem ? (
                              <Image 
                                src={news.imagem} 
                                alt={news.titulo} 
                                fill
                                className="object-cover"
                                loading="lazy"
                                sizes="64px"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-200 border-2 border-dashed rounded-xl flex items-center justify-center">
                                <i className="fas fa-newspaper text-gray-400"></i>
                              </div>
                            )}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-bold group-hover:text-indigo-600 line-clamp-2">{news.titulo}</h4>
                          <div className="text-sm text-gray-500">
                            {new Date(news.data || news.created_at).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Categories */}
              <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <i className="fas fa-folder-open text-indigo-600 mr-2"></i> Categorias
                </h3>
                <ul className="space-y-2">
                  {['Todas', ...categorias].map(category => {
                    const count = category === 'Todas' 
                      ? totalNoticias 
                      : noticias.filter(news => news.categoria.toLowerCase() === category.toLowerCase()).length
                    return (
                      <li key={category}>
                        <button 
                          className={`w-full flex justify-between items-center py-2 border-b border-gray-100 hover:text-indigo-600 text-left transition ${
                            selectedCategory === category ? 'text-indigo-600 font-semibold' : ''
                          }`}
                          onClick={() => handleCategoryFilter(category)}
                        >
                          <span>{category}</span>
                          <span className="bg-gray-200 text-gray-800 px-2 rounded-full text-xs">{count}</span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>

              {/* Newsletter */}
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-md p-6 text-white">
                <h3 className="text-xl font-bold mb-2">Receba nossas notícias</h3>
                <p className="mb-4">Cadastre-se e receba as principais notícias de Maria Helena diretamente no seu e-mail.</p>
                <div className="flex">
                  <input 
                    type="email" 
                    placeholder="Seu e-mail" 
                    className="flex-grow py-2 px-4 rounded-l-lg text-gray-800 focus:outline-none"
                    value={email}
                    onChange={handleEmailChange}
                  />
                  <button className="bg-indigo-900 hover:bg-indigo-800 py-2 px-4 rounded-r-lg font-medium transition">
                    <i className="fas fa-paper-plane"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  try {
    const supabase = createServerSupabaseClient()
    
    // Buscar notícias ativas ordenadas por data
    const { data: noticias, error } = await supabase
      .from('noticias')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50) // Limitar para performance

    if (error) {
      console.error('Erro ao buscar notícias:', error)
      return {
        props: {
          noticias: [],
          categorias: [],
          totalNoticias: 0
        },
        revalidate: 60 // Revalidar em 1 minuto em caso de erro
      }
    }

    const noticiasData = noticias || []
    
    // Extrair categorias únicas
    const categorias = Array.from(new Set(noticiasData.map(n => n.categoria)))
      .filter(Boolean)
      .sort()

    return {
      props: {
        noticias: noticiasData,
        categorias,
        totalNoticias: noticiasData.length
      },
      revalidate: 600 // Revalidar a cada 10 minutos
    }
  } catch (error) {
    console.error('Erro ao conectar com Supabase:', error)
    return {
      props: {
        noticias: [],
        categorias: [],
        totalNoticias: 0
      },
      revalidate: 60 // Revalidar em 1 minuto em caso de erro
    }
  }
}
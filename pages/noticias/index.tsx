import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react'
import Header from '../../components/Header'
import Nav from '../../components/Nav'
import Footer from '../../components/Footer'
import BannerAd from '../../components/BannerAd'

interface NewsArticle {
  id: number
  title: string
  description: string
  content: string
  category: string
  image: string
  publishedAt: string
  views: number
  comments: number
  isFeatured: boolean
}

const mockNews: NewsArticle[] = [
  {
    id: 1,
    title: "Prefeito anuncia novo plano de desenvolvimento urbano para Maria Helena",
    description: "O prefeito de Maria Helena apresentou hoje um ambicioso plano de desenvolvimento urbano que promete transformar a infraestrutura da cidade nos próximos cinco anos. O projeto inclui a revitalização do centro histórico, construção de novas ciclovias e a modernização do sistema de transporte público.",
    content: "Conteúdo completo da notícia...",
    category: "POLÍTICA",
    image: "https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?w=800",
    publishedAt: "15 Jun, 2023",
    views: 2458,
    comments: 42,
    isFeatured: true
  },
  {
    id: 2,
    title: "Hospital Municipal recebe novos equipamentos de diagnóstico",
    description: "Investimento de R$ 1,2 milhão permite modernização do setor de radiologia.",
    content: "Conteúdo completo da notícia...",
    category: "SAÚDE",
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600",
    publishedAt: "14 Jun, 2023",
    views: 1234,
    comments: 18,
    isFeatured: false
  },
  {
    id: 3,
    title: "Escolas municipais terão ensino integral a partir de 2024",
    description: "Projeto piloto será implementado em três unidades educacionais.",
    content: "Conteúdo completo da notícia...",
    category: "EDUCAÇÃO",
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600",
    publishedAt: "13 Jun, 2023",
    views: 987,
    comments: 25,
    isFeatured: false
  },
  {
    id: 4,
    title: "Feira do Empreendedor atrai investidores para Maria Helena",
    description: "Evento gerou mais de R$ 3 milhões em negócios para pequenas empresas locais.",
    content: "Conteúdo completo da notícia...",
    category: "ECONOMIA",
    image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600",
    publishedAt: "12 Jun, 2023",
    views: 1567,
    comments: 31,
    isFeatured: false
  },
  {
    id: 5,
    title: "Festival de Inverno terá shows gratuitos na praça central",
    description: "Evento cultural acontecerá de 20 a 25 de julho com atrações locais e nacionais.",
    content: "Conteúdo completo da notícia...",
    category: "CULTURA",
    image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600",
    publishedAt: "11 Jun, 2023",
    views: 2103,
    comments: 56,
    isFeatured: false
  },
  {
    id: 6,
    title: "Time de futebol sub-17 conquista título estadual",
    description: "Jovens atletas de Maria Helena trazem o troféu após vitória na final.",
    content: "Conteúdo completo da notícia...",
    category: "ESPORTES",
    image: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=600",
    publishedAt: "10 Jun, 2023",
    views: 1876,
    comments: 43,
    isFeatured: false
  }
]

const categories = ['Todas', 'Política', 'Economia', 'Saúde', 'Educação', 'Esportes', 'Cultura']

const popularNews = [
  { title: "Novo hospital será inaugurado em julho", date: "10 de Junho, 2023" },
  { title: "Prefeitura abre concurso público com 200 vagas", date: "9 de Junho, 2023" },
  { title: "Maria Helena é destaque em ranking de educação", date: "8 de Junho, 2023" },
  { title: "Festival gastronômico atrai milhares de visitantes", date: "7 de Junho, 2023" }
]

const categoryStats = [
  { name: "Política", count: 24 },
  { name: "Economia", count: 18 },
  { name: "Saúde", count: 15 },
  { name: "Educação", count: 22 },
  { name: "Esportes", count: 12 },
  { name: "Cultura", count: 9 }
]

export default function Noticias() {
  const [selectedCategory, setSelectedCategory] = useState('Todas')
  const [filteredNews, setFilteredNews] = useState(mockNews)
  const [email, setEmail] = useState('')

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category)
    if (category === 'Todas') {
      setFilteredNews(mockNews)
    } else {
      setFilteredNews(mockNews.filter(news => news.category.toLowerCase() === category.toLowerCase()))
    }
  }

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'POLÍTICA': 'bg-indigo-500',
      'SAÚDE': 'bg-green-500',
      'EDUCAÇÃO': 'bg-yellow-500',
      'ECONOMIA': 'bg-blue-500',
      'CULTURA': 'bg-purple-500',
      'ESPORTES': 'bg-orange-500',
      'MEIO AMBIENTE': 'bg-teal-500'
    }
    return colors[category] || 'bg-gray-500'
  }

  const featuredNews = filteredNews.find(news => news.isFeatured)
  const regularNews = filteredNews.filter(news => !news.isFeatured)

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
            {categories.map(category => (
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
              {featuredNews && (
                <div className="mb-12 bg-white rounded-xl shadow-lg overflow-hidden news-card">
                  <div className="relative">
                    <div className="absolute top-4 left-4 z-10">
                      <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">DESTAQUE</span>
                    </div>
                    <div className="absolute top-4 right-4 z-10 text-white">
                      <i className="far fa-calendar mr-1"></i> {featuredNews.publishedAt}
                    </div>
                    <div className="h-96 overflow-hidden">
                      <img 
                        src={featuredNews.image} 
                        alt={featuredNews.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="p-6">
                    <span className={`${getCategoryColor(featuredNews.category)} text-white px-3 py-1 rounded-full text-sm font-bold mb-3 inline-block`}>
                      {featuredNews.category}
                    </span>
                    <h2 className="text-2xl md:text-3xl font-bold mb-4">{featuredNews.title}</h2>
                    <p className="text-gray-600 mb-6">{featuredNews.description}</p>
                    <div className="flex items-center justify-between">
                      <Link href={`/noticias/${featuredNews.id}`} className="text-indigo-600 font-medium hover:text-indigo-800 flex items-center">
                        Leia a matéria completa <i className="fas fa-arrow-right ml-2"></i>
                      </Link>
                      <div className="flex items-center text-gray-500">
                        <i className="far fa-eye mr-1"></i> {featuredNews.views.toLocaleString()} visualizações
                        <i className="far fa-comment ml-4 mr-1"></i> {featuredNews.comments} comentários
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* News Grid */}
              <h2 className="text-3xl font-bold mb-8">Últimas Notícias</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {regularNews.map(news => (
                  <div key={news.id} className="bg-white rounded-xl shadow-md overflow-hidden news-card">
                    <div className="relative">
                      <div className="absolute top-2 left-2 z-10">
                        <span className={`${getCategoryColor(news.category)} text-white px-2 py-1 rounded-full text-xs`}>
                          {news.category}
                        </span>
                      </div>
                      <div className="h-48 overflow-hidden">
                        <img 
                          src={news.image} 
                          alt={news.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-lg mb-2">{news.title}</h3>
                      <p className="text-gray-600 text-sm mb-3">{news.description}</p>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">
                          <i className="far fa-calendar mr-1"></i> {news.publishedAt}
                        </span>
                        <Link href={`/noticias/${news.id}`} className="text-indigo-600 hover:text-indigo-800 font-medium">
                          Ler mais
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="mt-12 flex justify-center">
                <nav className="flex space-x-2">
                  <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <i className="fas fa-chevron-left"></i>
                  </button>
                  <button className="px-3 py-2 bg-indigo-600 text-white rounded-lg">1</button>
                  <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">2</button>
                  <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">3</button>
                  <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">4</button>
                  <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">5</button>
                  <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <i className="fas fa-chevron-right"></i>
                  </button>
                </nav>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:w-1/3">
              {/* Advertising Space */}
              <BannerAd 
                position="sidebar"
                className="h-64 rounded-lg mb-8"
                title="ESPAÇO PUBLICITÁRIO"
              />

              {/* Popular News */}
              <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <i className="fas fa-fire text-orange-500 mr-2"></i> Notícias Populares
                </h3>
                <ul className="space-y-4">
                  {popularNews.map((news, index) => (
                    <li key={index}>
                      <Link href="#" className="flex items-start space-x-3 group">
                        <div className="flex-shrink-0">
                          <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 flex items-center justify-center">
                            <i className="fas fa-newspaper text-gray-400"></i>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-bold group-hover:text-indigo-600">{news.title}</h4>
                          <div className="text-sm text-gray-500">{news.date}</div>
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
                  {categoryStats.map(category => (
                    <li key={category.name}>
                      <button 
                        className="w-full flex justify-between items-center py-2 border-b border-gray-100 hover:text-indigo-600 text-left"
                        onClick={() => handleCategoryFilter(category.name)}
                      >
                        <span>{category.name}</span>
                        <span className="bg-gray-200 text-gray-800 px-2 rounded-full text-xs">{category.count}</span>
                      </button>
                    </li>
                  ))}
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
                    onChange={(e) => setEmail(e.target.value)}
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
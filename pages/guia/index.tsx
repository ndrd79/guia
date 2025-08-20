import Head from 'next/head'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import Header from '../../components/Header'
import Nav from '../../components/Nav'
import Footer from '../../components/Footer'
import BannerAd from '../../components/BannerAd'

interface Business {
  id: number
  name: string
  category: string
  description: string
  address: string
  phone: string
  website?: string
  rating: number
  image: string
  featured: boolean
}

const mockBusinesses: Business[] = [
  {
    id: 1,
    name: "Restaurante Sabor da Terra",
    category: "Restaurantes",
    description: "Culinária regional com ingredientes frescos e ambiente acolhedor.",
    address: "Rua das Flores, 123 - Centro",
    phone: "(11) 3456-7890",
    website: "www.sabordaterra.com.br",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400",
    featured: true
  },
  {
    id: 2,
    name: "Auto Peças Central",
    category: "Automóveis",
    description: "Peças automotivas originais e nacionais com garantia.",
    address: "Av. Principal, 456 - Industrial",
    phone: "(11) 2345-6789",
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400",
    featured: false
  },
  {
    id: 3,
    name: "Farmácia Vida Saudável",
    category: "Saúde",
    description: "Medicamentos, cosméticos e produtos de higiene.",
    address: "Rua da Saúde, 789 - Centro",
    phone: "(11) 4567-8901",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400",
    featured: true
  },
  // Adicionando mais empresas para demonstrar a paginação
  {
    id: 4,
    name: "Padaria Pão Dourado",
    category: "Comércio",
    description: "Pães frescos, bolos e doces artesanais todos os dias.",
    address: "Rua do Comércio, 321 - Centro",
    phone: "(11) 5678-9012",
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400",
    featured: false
  },
  {
    id: 5,
    name: "Oficina do João",
    category: "Automóveis",
    description: "Serviços automotivos especializados em motor e suspensão.",
    address: "Av. Industrial, 654 - Industrial",
    phone: "(11) 6789-0123",
    rating: 4.4,
    image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400",
    featured: false
  },
  {
    id: 6,
    name: "Clínica Bem Estar",
    category: "Saúde",
    description: "Atendimento médico especializado e exames laboratoriais.",
    address: "Rua da Saúde, 987 - Centro",
    phone: "(11) 7890-1234",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400",
    featured: true
  },
  {
    id: 7,
    name: "Escola Futuro Brilhante",
    category: "Educação",
    description: "Educação infantil e ensino fundamental com metodologia inovadora.",
    address: "Rua da Educação, 147 - Centro",
    phone: "(11) 8901-2345",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400",
    featured: false
  },
  {
    id: 8,
    name: "Loja de Roupas Fashion",
    category: "Comércio",
    description: "Moda feminina e masculina com as últimas tendências.",
    address: "Rua da Moda, 258 - Centro",
    phone: "(11) 9012-3456",
    rating: 4.3,
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400",
    featured: false
  },
  {
    id: 9,
    name: "Imobiliária Casa Nova",
    category: "Imóveis",
    description: "Compra, venda e locação de imóveis residenciais e comerciais.",
    address: "Av. Principal, 369 - Centro",
    phone: "(11) 0123-4567",
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400",
    featured: true
  },
  {
    id: 10,
    name: "Assistência Técnica TechFix",
    category: "Serviços",
    description: "Conserto de celulares, computadores e eletrodomésticos.",
    address: "Rua da Tecnologia, 741 - Centro",
    phone: "(11) 1234-5678",
    rating: 4.2,
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400",
    featured: false
  }
]

const categories = [
  { name: "Restaurantes", icon: "fas fa-utensils", count: 42 },
  { name: "Comércio", icon: "fas fa-shopping-bag", count: 87 },
  { name: "Automóveis", icon: "fas fa-car", count: 23 },
  { name: "Imóveis", icon: "fas fa-home", count: 31 },
  { name: "Saúde", icon: "fas fa-briefcase-medical", count: 18 },
  { name: "Educação", icon: "fas fa-graduation-cap", count: 12 },
  { name: "Serviços", icon: "fas fa-tools", count: 34 }
]

export default function GuiaComercial() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [filteredBusinesses, setFilteredBusinesses] = useState(mockBusinesses)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(5) // 5 empresas por página

  // Calcular índices para paginação
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredBusinesses.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredBusinesses.length / itemsPerPage)

  const handleSearch = () => {
    let filtered = mockBusinesses
    
    if (searchTerm) {
      filtered = filtered.filter(business => 
        business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        business.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    if (selectedCategory) {
      filtered = filtered.filter(business => business.category === selectedCategory)
    }
    
    setFilteredBusinesses(filtered)
    setCurrentPage(1) // Reset para primeira página quando filtrar
  }

  // Resetar para primeira página quando os filtros mudarem
  useEffect(() => {
    setCurrentPage(1)
  }, [filteredBusinesses])

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
              <BannerAd 
                position="hero"
                className="h-48 rounded-xl"
                title="ESPAÇO PUBLICITÁRIO - DESTAQUE"
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
                    className={`category-card p-3 rounded-lg hover:bg-indigo-50 transition cursor-pointer ${
                      selectedCategory === category.name ? 'bg-indigo-100 border-2 border-indigo-300' : ''
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
                {selectedCategory && (
                  <button
                    onClick={() => {
                      setSelectedCategory('')
                      setSearchTerm('')
                      setFilteredBusinesses(mockBusinesses)
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

            <BannerAd 
              position="sidebar"
              className="h-64 rounded-xl"
              title="PUBLICIDADE"
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

            {currentItems.length === 0 ? (
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
                        <div className="md:w-1/3">
                          <img 
                            src={business.image} 
                            alt={business.name}
                            className="w-full h-48 md:h-full object-cover"
                          />
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
                          <p className="text-gray-600 mb-4">{business.description}</p>
                          
                          <div className="space-y-2 mb-4">
                            <div className="flex items-center text-gray-600">
                              <i className="fas fa-map-marker-alt mr-2 text-indigo-600"></i>
                              {business.address}
                            </div>
                            <div className="flex items-center text-gray-600">
                              <i className="fas fa-phone mr-2 text-indigo-600"></i>
                              {business.phone}
                            </div>
                            {business.website && (
                              <div className="flex items-center text-gray-600">
                                <i className="fas fa-globe mr-2 text-indigo-600"></i>
                                <a href={`https://${business.website}`} className="text-indigo-600 hover:underline">
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
                              <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
                                <i className="fas fa-phone mr-2"></i>Contato
                              </button>
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
                        className={`px-4 py-2 border rounded-lg transition ${
                          currentPage === 1 
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
                          className={`px-4 py-2 rounded-lg transition ${
                            currentPage === pageNumber 
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
                        className={`px-4 py-2 border rounded-lg transition ${
                          currentPage === totalPages 
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

      <Footer />
    </>
  )
}
import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react'
import Header from '../../components/Header'
import Nav from '../../components/Nav'
import Footer from '../../components/Footer'
import BannerAd from '../../components/BannerAd'
import { formatCurrency } from '../../lib/formatters'

interface Classified {
  id: number
  title: string
  description: string
  price: number
  category: string
  location: string
  image: string
  isNew: boolean
  isFeatured: boolean
  publishedAt: string
}

const mockClassifieds: Classified[] = [
  {
    id: 1,
    title: "Fiat Uno 2015 Completo",
    description: "4 portas, ar condicionado, 45.000 km, único dono",
    price: 32900,
    category: "Automóveis",
    location: "Centro",
    image: "https://images.unsplash.com/photo-1605540436563-5bca919ae766?w=500",
    isNew: true,
    isFeatured: false,
    publishedAt: "Hoje, 09:30"
  },
  {
    id: 2,
    title: "Casa 3 Quartos Jardim",
    description: "120m², garagem para 2 carros, área de serviço",
    price: 280000,
    category: "Imóveis",
    location: "Vila Nova",
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=500",
    isNew: false,
    isFeatured: true,
    publishedAt: "Ontem, 14:20"
  },
  {
    id: 3,
    title: "iPhone 12 Pro Max",
    description: "128GB, estado de novo, com caixa e acessórios",
    price: 2800,
    category: "Eletrônicos",
    location: "Centro",
    image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500",
    isNew: false,
    isFeatured: false,
    publishedAt: "2 dias atrás"
  },
  {
    id: 4,
    title: "Sofá 3 Lugares",
    description: "Tecido suede, cor bege, muito conservado",
    price: 850,
    category: "Móveis",
    location: "Jardim das Flores",
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500",
    isNew: false,
    isFeatured: false,
    publishedAt: "3 dias atrás"
  },
  {
    id: 5,
    title: "Serviços de Jardinagem",
    description: "Poda, plantio, manutenção de jardins e gramados",
    price: 80,
    category: "Serviços",
    location: "Toda a cidade",
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=500",
    isNew: true,
    isFeatured: true,
    publishedAt: "1 semana atrás"
  },
  {
    id: 6,
    title: "Vaga Vendedor(a)",
    description: "Experiência em vendas, salário + comissão",
    price: 1500,
    category: "Emprego",
    location: "Centro",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500",
    isNew: false,
    isFeatured: false,
    publishedAt: "5 dias atrás"
  }
]

const categories = ['Todos', 'Automóveis', 'Imóveis', 'Eletrônicos', 'Móveis', 'Serviços', 'Emprego']
const locations = ['Localização', 'Centro', 'Vila Nova', 'Jardim das Flores', 'Zona Rural']
const sortOptions = ['Ordenar por', 'Mais recentes', 'Menor preço', 'Maior preço', 'Melhor avaliados']

export default function Classificados() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const [selectedLocation, setSelectedLocation] = useState('Localização')
  const [sortBy, setSortBy] = useState('Ordenar por')
  const [filteredClassifieds, setFilteredClassifieds] = useState(mockClassifieds)

  const handleFilter = () => {
    let filtered = mockClassifieds
    
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    if (selectedCategory !== 'Todos') {
      filtered = filtered.filter(item => item.category === selectedCategory)
    }
    
    if (selectedLocation !== 'Localização') {
      filtered = filtered.filter(item => item.location === selectedLocation)
    }
    
    setFilteredClassifieds(filtered)
  }

  const formatPrice = (price: number) => {
    return formatCurrency(price)
  }

  return (
    <>
      <Head>
        <title>Classificados - Portal Maria Helena</title>
        <meta name="description" content="Encontre o que você procura ou anuncie seus produtos e serviços em Maria Helena" />
      </Head>

      <Header />
      <Nav />

      {/* Hero Section */}
      <section className="bg-indigo-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-indigo-900 mb-2">Classificados</h1>
              <p className="text-gray-600">Encontre o que você procura ou anuncie seus produtos e serviços</p>
            </div>
            <div className="mt-4 md:mt-0">
              <button className="bg-indigo-600 text-white px-6 py-3 rounded-full hover:bg-indigo-700 transition flex items-center">
                <i className="fas fa-plus-circle mr-2"></i> Criar Anúncio
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
              <div className="w-full md:w-1/2">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="O que você está procurando?" 
                    className="w-full py-2 px-4 pr-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button 
                    className="absolute right-3 top-2 text-gray-500 hover:text-indigo-600"
                    onClick={handleFilter}
                  >
                    <i className="fas fa-search"></i>
                  </button>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-600 hidden md:block">Filtrar por:</span>
                <select 
                  className="py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent text-sm"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <select 
                  className="py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent text-sm"
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                >
                  {locations.map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
                <select 
                  className="py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent text-sm"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  {sortOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Quick Filters */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <button 
                    key={category}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                      selectedCategory === category 
                        ? 'bg-indigo-600 text-white filter-active' 
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                    onClick={() => {
                      setSelectedCategory(category)
                      handleFilter()
                    }}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Advertising Space */}
          <BannerAd 
            position="content"
            className="w-full h-32 rounded-lg mb-6"
            title="ESPAÇO PUBLICITÁRIO - CLASSIFICADOS"
          />
          
          {/* Results Count */}
          <div className="mb-4">
            <p className="text-gray-600">{filteredClassifieds.length} anúncios encontrados</p>
          </div>
          
          {/* Classifieds Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredClassifieds.map(classified => (
              <div key={classified.id} className="bg-white rounded-lg shadow-md overflow-hidden card-hover transition relative">
                <div className="h-48 bg-gray-200 flex items-center justify-center relative">
                  <img 
                    src={classified.image} 
                    alt={classified.title}
                    className="w-full h-full object-cover"
                  />
                  {classified.isNew && (
                    <span className="classified-tag bg-green-500 text-white">NOVO</span>
                  )}
                  {classified.isFeatured && (
                    <span className="classified-tag bg-blue-500 text-white">DESTAQUE</span>
                  )}
                  <span className="price-badge">{formatPrice(classified.price)}</span>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-1">{classified.title}</h3>
                  <p className="text-gray-600 text-sm mb-2">{classified.description}</p>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">
                      <i className="fas fa-map-marker-alt mr-1"></i> {classified.location}
                    </span>
                    <span className="text-gray-500">{classified.publishedAt}</span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {classified.category}
                      </span>
                      <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                        Ver detalhes <i className="fas fa-arrow-right ml-1"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center mt-8">
            <div className="flex space-x-2">
              <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Anterior</button>
              <button className="px-3 py-2 bg-indigo-600 text-white rounded-lg pagination-active">1</button>
              <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">2</button>
              <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">3</button>
              <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Próximo</button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
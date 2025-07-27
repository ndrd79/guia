import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react'
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
                  onChange={(e) => setSelectedCategory(e.target.value)}
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
                    className="category-card p-3 rounded-lg hover:bg-indigo-50 transition cursor-pointer"
                    onClick={() => {
                      setSelectedCategory(category.name)
                      handleSearch()
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
              <span className="text-gray-600">{filteredBusinesses.length} resultados encontrados</span>
            </div>

            <div className="grid gap-6">
              {filteredBusinesses.map(business => (
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
                          <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
                            <i className="fas fa-info-circle mr-2"></i>Detalhes
                          </button>
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
            <div className="flex justify-center mt-8">
              <div className="flex space-x-2">
                <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Anterior</button>
                <button className="px-3 py-2 bg-indigo-600 text-white rounded-lg pagination-active">1</button>
                <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">2</button>
                <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">3</button>
                <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Próximo</button>
              </div>
            </div>
          </main>
        </div>
      </div>

      <Footer />
    </>
  )
}
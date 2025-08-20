import Head from 'next/head'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { GetServerSideProps } from 'next'
import Header from '../../components/Header'
import Nav from '../../components/Nav'
import Footer from '../../components/Footer'
import BannerContainer from '../../components/BannerContainer'
import { createServerSupabaseClient, supabase } from '../../lib/supabase'
import { FeiraInfo, Produtor } from '../../lib/types'

// Função para obter a próxima terça-feira
const getNextTuesday = () => {
  const today = new Date();
  const daysUntilTuesday = (2 - today.getDay() + 7) % 7;
  const nextTuesday = new Date(today);
  nextTuesday.setDate(today.getDate() + (daysUntilTuesday === 0 ? 7 : daysUntilTuesday));
  return nextTuesday;
};

const nextTuesday = getNextTuesday();
const nextTuesdayFormatted = `${nextTuesday.getDate()} de ${nextTuesday.toLocaleDateString('pt-BR', { month: 'long' })}`;

// Galeria de fotos da feira
const feiraImages = [
  {
    url: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    alt: 'Frutas frescas na feira'
  },
  {
    url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    alt: 'Verduras orgânicas'
  },
  {
    url: 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    alt: 'Produtos artesanais'
  },
  {
    url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    alt: 'Ambiente da feira'
  }
];

export default function FeiraDoProdutor({ feiraInfo, produtores }: FeiraDoProdutor) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)

  // Informações padrão caso não haja dados no banco
  const defaultInfo = {
    titulo: "Feira do Produtor",
    descricao: "Produtos frescos direto do campo. Frutas, verduras, legumes e produtos artesanais dos produtores locais de Maria Helena.",
    data_funcionamento: "Toda terça-feira",
    horario_funcionamento: "06:00 às 12:00",
    local: "Praça Central - Maria Helena",
    informacoes_adicionais: "Venha conhecer os melhores produtos da nossa região! Apoie os produtores locais e leve para casa alimentos frescos e de qualidade.",
    contato: undefined
  }

  const info = feiraInfo || defaultInfo

  // Auto-rotação das imagens
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === feiraImages.length - 1 ? 0 : prevIndex + 1
      )
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <>
      <Head>
        <title>Feira do Produtor - Portal Maria Helena</title>
        <meta name="description" content="Feira do Produtor de Maria Helena. Produtos frescos direto do campo toda terça-feira na Praça Central." />
        <meta name="keywords" content="feira, produtor, Maria Helena, produtos frescos, agricultura local" />
      </Head>

      <Header />
      <Nav />

      {/* Hero Section com Carousel de Imagens */}
      <section className="relative h-screen overflow-hidden">
        {/* Background Image Carousel */}
        <div className="absolute inset-0">
          {feiraImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentImageIndex ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img
                src={image.url}
                alt={image.alt}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-50"></div>
            </div>
          ))}
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 h-full flex items-center justify-center text-white">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-4xl mx-auto">
              <div className="inline-flex items-center bg-green-500 bg-opacity-30 backdrop-blur-sm rounded-full px-6 py-3 mb-8">
                <i className="fas fa-seedling mr-3 text-2xl"></i>
                <span className="text-lg font-medium">Toda Terça-feira • 06:00 às 12:00</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                Feira do <span className="text-green-400">Produtor</span>
              </h1>
              <p className="text-xl md:text-2xl mb-12 opacity-90 leading-relaxed">
                Produtos frescos direto do campo para sua mesa.<br/>
                Apoie os produtores locais de Maria Helena.
              </p>
              
              {/* Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl p-6">
                  <i className="fas fa-calendar-alt text-3xl text-green-400 mb-4"></i>
                  <h3 className="font-bold text-lg mb-2">Próxima Feira</h3>
                  <p className="text-green-200">{nextTuesdayFormatted}</p>
                </div>
                <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl p-6">
                  <i className="fas fa-clock text-3xl text-green-400 mb-4"></i>
                  <h3 className="font-bold text-lg mb-2">Horário</h3>
                  <p className="text-green-200">{info.horario_funcionamento}</p>
                </div>
                <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl p-6">
                  <i className="fas fa-map-marker-alt text-3xl text-green-400 mb-4"></i>
                  <h3 className="font-bold text-lg mb-2">Local</h3>
                  <p className="text-green-200">{info.local}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
                <button 
                  onClick={() => setIsImageModalOpen(true)}
                  className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-full font-semibold transition-all transform hover:scale-105 shadow-lg"
                >
                  <i className="fas fa-images mr-2"></i>
                  Ver Galeria de Fotos
                </button>
                <Link href="#sobre" className="border-2 border-white text-white hover:bg-white hover:text-gray-800 px-8 py-4 rounded-full font-semibold transition-all">
                  <i className="fas fa-info-circle mr-2"></i>
                  Saiba Mais
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Image Navigation Dots */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
          {feiraImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Banner Publicitário */}
      <section className="py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <BannerContainer 
            position="feira-topo"
            className="w-full h-32 rounded-lg shadow-lg"
          />
        </div>
      </section>

      {/* Sobre a Feira */}
      <section id="sobre" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <div className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
                  <i className="fas fa-leaf mr-2"></i>
                  Agricultura Local
                </div>
                <h2 className="text-4xl font-bold mb-6 text-gray-800 leading-tight">
                  Conectando <span className="text-green-600">Produtores</span> e <span className="text-green-600">Consumidores</span>
                </h2>
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  {info.informacoes_adicionais || info.descricao}
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                  <div className="flex items-start">
                    <div className="bg-green-100 p-3 rounded-xl mr-4 flex-shrink-0">
                      <i className="fas fa-leaf text-green-600 text-xl"></i>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 mb-2">Produtos Frescos</h3>
                      <p className="text-gray-600 text-sm">Direto do campo para sua mesa, sem intermediários</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-green-100 p-3 rounded-xl mr-4 flex-shrink-0">
                      <i className="fas fa-handshake text-green-600 text-xl"></i>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 mb-2">Apoio Local</h3>
                      <p className="text-gray-600 text-sm">Fortalecendo a economia e agricultura regional</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-green-100 p-3 rounded-xl mr-4 flex-shrink-0">
                      <i className="fas fa-heart text-green-600 text-xl"></i>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 mb-2">Qualidade Garantida</h3>
                      <p className="text-gray-600 text-sm">Produtos selecionados e de alta qualidade</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-green-100 p-3 rounded-xl mr-4 flex-shrink-0">
                      <i className="fas fa-dollar-sign text-green-600 text-xl"></i>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 mb-2">Preços Justos</h3>
                      <p className="text-gray-600 text-sm">Valores acessíveis direto do produtor</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
                  <h3 className="text-xl font-bold mb-4 text-gray-800">Informações da Feira</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <i className="fas fa-calendar-check mr-3 text-green-600"></i>
                      <span className="text-gray-700"><strong>Frequência:</strong> {info.data_funcionamento}</span>
                    </div>
                    <div className="flex items-center">
                      <i className="fas fa-clock mr-3 text-green-600"></i>
                      <span className="text-gray-700"><strong>Horário:</strong> {info.horario_funcionamento}</span>
                    </div>
                    <div className="flex items-center">
                      <i className="fas fa-map-marker-alt mr-3 text-green-600"></i>
                      <span className="text-gray-700"><strong>Local:</strong> {info.local}</span>
                    </div>
                    {info.contato && (
                      <div className="flex items-center">
                        <i className="fas fa-phone mr-3 text-green-600"></i>
                        <span className="text-gray-700"><strong>Contato:</strong> {info.contato}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <img
                      src="https://images.unsplash.com/photo-1488459716781-31db52582fe9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                      alt="Frutas frescas"
                      className="w-full h-48 object-cover rounded-2xl shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                      onClick={() => setIsImageModalOpen(true)}
                    />
                    <img
                      src="https://images.unsplash.com/photo-1506976785307-8732e854ad03?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                      alt="Produtos artesanais"
                      className="w-full h-32 object-cover rounded-2xl shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                      onClick={() => setIsImageModalOpen(true)}
                    />
                  </div>
                  <div className="space-y-4 mt-8">
                    <img
                      src="https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                      alt="Verduras orgânicas"
                      className="w-full h-32 object-cover rounded-2xl shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                      onClick={() => setIsImageModalOpen(true)}
                    />
                    <img
                      src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                      alt="Ambiente da feira"
                      className="w-full h-48 object-cover rounded-2xl shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                      onClick={() => setIsImageModalOpen(true)}
                    />
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 bg-green-500 text-white p-4 rounded-full shadow-lg">
                  <i className="fas fa-camera text-2xl"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Produtos Disponíveis */}
      <section className="py-20 bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-4 text-gray-800">Produtos Disponíveis</h2>
            <p className="text-lg text-gray-600 mb-12">Variedade de produtos frescos e artesanais</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {[
                { icon: 'fas fa-apple-alt', name: 'Frutas', color: 'text-red-500' },
                { icon: 'fas fa-carrot', name: 'Verduras', color: 'text-orange-500' },
                { icon: 'fas fa-seedling', name: 'Legumes', color: 'text-green-500' },
                { icon: 'fas fa-bread-slice', name: 'Pães', color: 'text-yellow-600' },
                { icon: 'fas fa-cheese', name: 'Laticínios', color: 'text-yellow-400' },
                { icon: 'fas fa-jar', name: 'Conservas', color: 'text-purple-500' }
              ].map((produto, index) => (
                <div key={index} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-2">
                  <i className={`${produto.icon} text-4xl ${produto.color} mb-4`}></i>
                  <h3 className="font-semibold text-gray-800">{produto.name}</h3>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Produtores Participantes */}
      {produtores.length > 0 && (
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold mb-4 text-gray-800">Nossos Produtores</h2>
                <p className="text-lg text-gray-600">Conheça os produtores locais que participam da feira</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {produtores.map((produtor) => (
                  <div key={produtor.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all transform hover:-translate-y-2">
                    {produtor.imagem ? (
                      <div className="h-56 bg-gray-200 overflow-hidden">
                        <img 
                          src={produtor.imagem} 
                          alt={produtor.nome}
                          className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                    ) : (
                      <div className="h-56 bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                        <i className="fas fa-user-tie text-6xl text-white opacity-50"></i>
                      </div>
                    )}
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-3 text-gray-800">{produtor.nome}</h3>
                      <div className="mb-4">
                        <span className="inline-block bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full font-medium">
                          <i className="fas fa-leaf mr-1"></i>
                          {produtor.produtos}
                        </span>
                      </div>
                      {produtor.descricao && (
                        <p className="text-gray-600 mb-4 text-sm leading-relaxed">{produtor.descricao}</p>
                      )}
                      {produtor.contato && (
                        <div className="flex items-center text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
                          <i className="fas fa-phone mr-2 text-green-600"></i>
                          <span>{produtor.contato}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Banner Publicitário */}
      <section className="py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <BannerContainer 
            position="feira-meio"
            className="w-full h-40 rounded-lg shadow-lg"
          />
        </div>
      </section>

      {/* Depoimentos */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-emerald-600">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-4xl font-bold mb-12">O que dizem nossos visitantes</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  nome: "Maria Silva",
                  depoimento: "Produtos fresquíssimos e preços justos. Venho toda semana!",
                  avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80"
                },
                {
                  nome: "João Santos",
                  depoimento: "Apoiar os produtores locais faz toda a diferença. Qualidade excepcional!",
                  avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80"
                },
                {
                  nome: "Ana Costa",
                  depoimento: "Ambiente familiar e produtos que fazem a diferença na nossa alimentação.",
                  avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80"
                }
              ].map((depoimento, index) => (
                <div key={index} className="bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl p-6">
                  <div className="flex items-center mb-4">
                    <img 
                      src={depoimento.avatar} 
                      alt={depoimento.nome}
                      className="w-12 h-12 rounded-full mr-4 object-cover"
                    />
                    <div>
                      <h4 className="font-semibold">{depoimento.nome}</h4>
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <i key={i} className="fas fa-star text-sm"></i>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm opacity-90 italic">"{depoimento.depoimento}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold mb-6 text-gray-800">Visite a Feira do Produtor</h2>
            <p className="text-xl mb-8 text-gray-600">Toda terça-feira na Praça Central de Maria Helena</p>
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div>
                  <i className="fas fa-clock text-3xl text-green-600 mb-3"></i>
                  <h3 className="font-bold text-gray-800 mb-2">Horário</h3>
                  <p className="text-gray-600">06:00 às 12:00</p>
                </div>
                <div>
                  <i className="fas fa-map-marker-alt text-3xl text-green-600 mb-3"></i>
                  <h3 className="font-bold text-gray-800 mb-2">Local</h3>
                  <p className="text-gray-600">Praça Central</p>
                </div>
                <div>
                  <i className="fas fa-calendar text-3xl text-green-600 mb-3"></i>
                  <h3 className="font-bold text-gray-800 mb-2">Próxima</h3>
                  <p className="text-gray-600">{nextTuesdayFormatted}</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Link href="/eventos" className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-full font-semibold transition-all transform hover:scale-105 shadow-lg">
                <i className="fas fa-calendar mr-2"></i>
                Ver Todos os Eventos
              </Link>
              <Link href="/guia" className="border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white px-8 py-4 rounded-full font-semibold transition-all">
                <i className="fas fa-store mr-2"></i>
                Guia Comercial
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Modal de Galeria de Fotos */}
      {isImageModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="max-w-4xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white text-2xl font-bold">Galeria da Feira do Produtor</h3>
              <button 
                onClick={() => setIsImageModalOpen(false)}
                className="text-white hover:text-gray-300 text-3xl"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {feiraImages.map((image, index) => (
                <img
                  key={index}
                  src={image.url}
                  alt={image.alt}
                  className="w-full h-64 object-cover rounded-lg hover:opacity-80 transition-opacity cursor-pointer"
                  onClick={() => setCurrentImageIndex(index)}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async () => {
  const supabaseServer = createServerSupabaseClient()
  
  let feiraInfo = null
  let produtores: Produtor[] = []

  try {
    // Buscar informações da feira
    const { data: feiraData } = await supabaseServer
      .from('feira_produtor')
      .select('*')
      .eq('ativa', true)
      .single()
    
    if (feiraData) {
      feiraInfo = feiraData
    }

    // Buscar produtores ativos
    const { data: produtoresData } = await supabaseServer
      .from('produtores_feira')
      .select('*')
      .eq('ativo', true)
      .order('nome')
    
    if (produtoresData) {
      produtores = produtoresData
    }
  } catch (error) {
    console.error('Erro ao buscar dados da feira:', error)
  }

  return {
    props: {
      feiraInfo,
      produtores
    }
  }
}


interface FeiraDoProdutor {
  feiraInfo: FeiraInfo | null
  produtores: Produtor[]
}
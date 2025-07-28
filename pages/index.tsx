import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import Header from '../components/Header';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import NewsCard from '../components/NewsCard';
import BannerAd from '../components/BannerAd';
import { formatDate } from '../lib/formatters';

const HomePage: React.FC = () => {
  // Dados mockados para demonstração
  const featuredNews = {
    id: '1',
    title: 'Prefeitura lança programa de revitalização do centro histórico',
    excerpt: 'Projeto inclui calçamento, iluminação e paisagismo em 12 quadras do centro da cidade.',
    imageUrl: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    category: 'geral',
    publishedAt: '2023-06-15',
    views: 1200,
    featured: true
  };

  const recentNews = [
    {
      id: '2',
      title: 'Escolas municipais recebem novos laboratórios de informática',
      excerpt: 'Investimento de R$ 350 mil beneficia 12 escolas da rede municipal de ensino.',
      imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1171&q=80',
      category: 'educacao',
      publishedAt: '2023-06-14',
      featured: false
    },
    {
      id: '3',
      title: 'Feira do Empreendedor tem recorde de participantes',
      excerpt: 'Evento reuniu mais de 80 expositores e 3 mil visitantes no último final de semana.',
      imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1171&q=80',
      category: 'economia',
      publishedAt: '2023-06-13',
      featured: false
    },
    {
      id: '4',
      title: 'Seleção municipal de futsal é campeã estadual',
      excerpt: 'Time de Maria Helena vence competição e se classifica para o nacional.',
      imageUrl: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
      category: 'esportes',
      publishedAt: '2023-06-12',
      featured: false
    },
    {
      id: '5',
      title: 'Posto de saúde central terá horário ampliado',
      excerpt: 'A partir de julho, unidade funcionará até as 20h durante a semana.',
      imageUrl: 'https://images.unsplash.com/photo-1551190822-a9333d879b1f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
      category: 'saude',
      publishedAt: '2023-06-11',
      featured: false
    },
    {
      id: '6',
      title: 'Festival de Inverno terá shows gratuitos em julho',
      excerpt: 'Programação inclui música, teatro e oficinas culturais durante todo o mês.',
      imageUrl: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
      category: 'cultura',
      publishedAt: '2023-06-10',
      featured: false
    }
  ];

  const categories = [
    { icon: 'fas fa-utensils', name: 'Restaurantes', href: '/guia?categoria=restaurantes' },
    { icon: 'fas fa-shopping-bag', name: 'Comércio', href: '/guia?categoria=comercio' },
    { icon: 'fas fa-car', name: 'Automóveis', href: '/guia?categoria=automoveis' },
    { icon: 'fas fa-home', name: 'Imóveis', href: '/guia?categoria=imoveis' },
    { icon: 'fas fa-briefcase-medical', name: 'Saúde', href: '/guia?categoria=saude' },
    { icon: 'fas fa-graduation-cap', name: 'Educação', href: '/guia?categoria=educacao' }
  ];

  const featuredBusinesses = [
    {
      id: '1',
      name: 'Padaria Doce Sabor',
      description: 'Padaria artesanal com os melhores pães da região.',
      rating: 4.5,
      reviews: 42,
      location: 'Centro',
      featured: true
    },
    {
      id: '2',
      name: 'AutoMecânica Rapidão',
      description: 'Serviços automotivos com garantia e qualidade.',
      rating: 4.0,
      reviews: 28,
      location: 'Vila Nova',
      featured: false
    },
    {
      id: '3',
      name: 'Studio Beleza Total',
      description: 'Cabelo, maquiagem, estética e muito mais.',
      rating: 5.0,
      reviews: 67,
      location: 'Jardim das Flores',
      featured: false,
      isNew: true
    },
    {
      id: '4',
      name: 'Supermercado Bom Preço',
      description: 'Tudo que você precisa com os melhores preços.',
      rating: 4.5,
      reviews: 35,
      location: 'Centro',
      featured: false
    }
  ];

  const upcomingEvents = [
    {
      id: '1',
      title: 'Festival de Música',
      description: 'Festival com bandas locais na praça central.',
      date: '2023-06-15',
      time: '19:00 - 23:00',
      price: 'Gratuito',
      status: 'HOJE',
      icon: 'fas fa-music',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      id: '2',
      title: 'Feira Gastronômica',
      description: 'Degustação dos melhores pratos da região.',
      date: '2023-06-16',
      time: '10:00 - 22:00',
      price: 'R$ 10,00',
      status: 'AMANHÃ',
      icon: 'fas fa-utensils',
      gradient: 'from-blue-500 to-teal-400'
    },
    {
      id: '3',
      title: 'Corrida da Saúde',
      description: '5km e 10km com premiação para os vencedores.',
      date: '2023-06-18',
      time: '07:00 - 12:00',
      price: 'Inscrições',
      status: '18 JUN',
      icon: 'fas fa-running',
      gradient: 'from-orange-500 to-yellow-400'
    }
  ];

  const classifieds = [
    {
      id: '1',
      title: 'Fiat Uno 2015',
      description: 'Completo, 4 portas, ar condicionado, 45.000 km',
      price: 'R$ 32.900',
      location: 'Centro',
      icon: 'fas fa-car'
    },
    {
      id: '2',
      title: 'Casa 3 Quartos',
      description: 'Jardim das Flores, 120m², garagem para 2 carros',
      price: 'R$ 280.000',
      location: 'Jardim',
      icon: 'fas fa-home'
    },
    {
      id: '3',
      title: 'Notebook Dell',
      description: 'i5, 8GB RAM, SSD 256GB, tela 15.6", 1 ano de uso',
      price: 'R$ 2.450',
      location: 'Vila Nova',
      icon: 'fas fa-laptop'
    },
    {
      id: '4',
      title: 'Sofá 3 Lugares',
      description: 'Couro sintético, cor bege, excelente estado',
      price: 'R$ 850',
      location: 'Centro',
      icon: 'fas fa-couch'
    }
  ];

  const services = [
    {
      title: 'Transporte Público',
      description: 'Horários e rotas do transporte coletivo',
      icon: 'fas fa-bus',
      href: '/servicos/transporte'
    },
    {
      title: 'Impostos Municipais',
      description: 'Calcule e pague seus tributos online',
      icon: 'fas fa-file-invoice-dollar',
      href: '/servicos/impostos'
    },
    {
      title: 'Editais e Licitações',
      description: 'Acompanhe as oportunidades públicas',
      icon: 'fas fa-clipboard-list',
      href: '/servicos/editais'
    },
    {
      title: 'Agendamentos',
      description: 'Marque consultas e serviços municipais',
      icon: 'fas fa-calendar-check',
      href: '/servicos/agendamentos'
    }
  ];

  return (
    <>
      <Head>
        <title>Portal Maria Helena - Guia Comercial & Eventos</title>
        <meta name="description" content="Portal oficial de Maria Helena - Conectando pessoas e negócios. Encontre empresas, eventos, classificados e serviços da sua cidade." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <Header />
      <Nav />

      <main>
        {/* News Section */}
        <section className="py-8 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold">Notícias de Maria Helena</h2>
              <Link href="/noticias" className="text-indigo-600 hover:text-indigo-800 font-medium">
                Ver todas <i className="fas fa-arrow-right ml-1"></i>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <NewsCard {...featuredNews} />
              {recentNews.slice(0, 4).map((news) => (
                <NewsCard key={news.id} {...news} />
              ))}
            </div>
          </div>
        </section>

        {/* Hero Section with Featured Event */}
        <section className="relative bg-gray-900 text-white">
          <div className="container mx-auto px-4 py-12">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 mb-8 md:mb-0">
                <h2 className="text-4xl font-bold mb-4">Descubra o melhor de Maria Helena</h2>
                <p className="text-xl mb-6">Encontre negócios locais, eventos imperdíveis e tudo que sua cidade tem para oferecer.</p>
                <div className="flex space-x-4">
                  <Link href="/guia">
                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-full font-medium transition">
                      Explorar Negócios
                    </button>
                  </Link>
                  <Link href="/eventos">
                    <button className="bg-transparent border-2 border-white hover:bg-white hover:text-gray-900 text-white px-6 py-3 rounded-full font-medium transition">
                      Ver Eventos
                    </button>
                  </Link>
                </div>
              </div>
              
              <BannerAd 
                position="hero" 
                className="md:w-1/2 h-64 rounded-xl" 
              />
            </div>
          </div>
        </section>

        {/* Quick Access Categories */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Explore Nossas Categorias</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {categories.map((category, index) => (
                <Link key={index} href={category.href} className="bg-indigo-50 rounded-lg p-4 text-center hover:bg-indigo-100 transition card-hover">
                  <div className="bg-indigo-100 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-3">
                    <i className={`${category.icon} text-indigo-600 text-2xl`}></i>
                  </div>
                  <span className="font-medium">{category.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Businesses */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold">Empresas em Destaque</h2>
              <Link href="/guia" className="text-indigo-600 hover:text-indigo-800 font-medium">
                Ver todas <i className="fas fa-arrow-right ml-1"></i>
              </Link>
            </div>
            
            <BannerAd position="featured-businesses-top" className="w-full h-32 rounded-lg mb-8" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredBusinesses.map((business) => (
                <div key={business.id} className="bg-white rounded-xl shadow-md overflow-hidden card-hover transition">
                  <div className="relative h-48 bg-gray-200 flex items-center justify-center">
                    <i className="fas fa-store text-4xl text-gray-400"></i>
                    {business.featured && (
                      <div className="absolute top-2 right-2 bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded">Destaque</div>
                    )}
                    {business.isNew && (
                      <div className="absolute top-2 right-2 bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded">Novo</div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-1">{business.name}</h3>
                    <div className="flex items-center text-yellow-400 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <i key={i} className={`fas fa-star${i < Math.floor(business.rating) ? '' : i < business.rating ? '-half-alt' : ' far'}`}></i>
                      ))}
                      <span className="text-gray-600 text-sm ml-1">({business.reviews})</span>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{business.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-indigo-600 text-sm font-medium">
                        <i className="fas fa-map-marker-alt mr-1"></i> {business.location}
                      </span>
                      <Link href={`/guia/${business.id}`} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                        Ver detalhes
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <BannerAd position="featured-businesses-bottom-1" className="h-32 rounded-lg" />
              <BannerAd position="featured-businesses-bottom-2" className="h-32 rounded-lg" />
            </div>
          </div>
        </section>

        {/* Events Section */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold">Próximos Eventos</h2>
              <Link href="/eventos" className="text-indigo-600 hover:text-indigo-800 font-medium">
                Ver agenda completa <i className="fas fa-arrow-right ml-1"></i>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="bg-gray-50 rounded-xl overflow-hidden shadow-md event-card">
                  <div className={`relative h-48 bg-gradient-to-r ${event.gradient} flex items-center justify-center`}>
                    <div className="absolute top-0 left-0 bg-white text-indigo-600 font-bold px-3 py-1 m-2 rounded">{event.status}</div>
                    <i className={`${event.icon} text-white text-5xl`}></i>
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg">{event.title}</h3>
                      <div className="bg-indigo-100 text-indigo-800 text-xs font-bold px-2 py-1 rounded">{event.price}</div>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{event.description}</p>
                    <div className="flex justify-between items-center text-sm">
                      <div>
                        <div className="text-gray-500"><i className="far fa-calendar-alt mr-1"></i> {formatDate(event.date)}</div>
                        <div className="text-gray-500"><i className="far fa-clock mr-1"></i> {event.time}</div>
                      </div>
                      <Link href={`/eventos/${event.id}`} className="text-indigo-600 hover:text-indigo-800 font-medium">
                        + Info
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <BannerAd position="events-bottom" className="w-full h-40 rounded-lg mt-8" />
          </div>
        </section>

        {/* Classifieds Section */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold">Classificados</h2>
              <div className="flex space-x-4">
                <Link href="/classificados" className="text-indigo-600 hover:text-indigo-800 font-medium">
                  Ver todos
                </Link>
                <Link href="/classificados/novo">
                  <button className="bg-indigo-600 text-white px-4 py-2 rounded-full hover:bg-indigo-700 transition flex items-center text-sm">
                    <i className="fas fa-plus-circle mr-2"></i> Novo Anúncio
                  </button>
                </Link>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {classifieds.map((classified) => (
                <div key={classified.id} className="bg-white rounded-lg shadow-md overflow-hidden card-hover transition">
                  <div className="h-48 bg-gray-200 flex items-center justify-center">
                    <i className={`${classified.icon} text-4xl text-gray-400`}></i>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-1">{classified.title}</h3>
                    <p className="text-gray-600 text-sm mb-2">{classified.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-indigo-600">{classified.price}</span>
                      <span className="text-gray-500 text-sm">
                        <i className="fas fa-map-marker-alt mr-1"></i> {classified.location}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Serviços Úteis</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {services.map((service, index) => (
                <Link key={index} href={service.href} className="bg-indigo-50 rounded-xl p-6 text-center hover:bg-indigo-100 transition card-hover">
                  <div className="bg-indigo-100 w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4">
                    <i className={`${service.icon} text-indigo-600 text-3xl`}></i>
                  </div>
                  <h3 className="font-bold text-lg mb-2">{service.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{service.description}</p>
                  <span className="text-indigo-600 font-medium text-sm">
                    Acessar <i className="fas fa-arrow-right ml-1"></i>
                  </span>
                </Link>
              ))}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <BannerAd position="services-bottom-1" className="h-40 rounded-lg" />
              <BannerAd position="services-bottom-2" className="h-40 rounded-lg" />
              <BannerAd position="services-bottom-3" className="h-40 rounded-lg" />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default HomePage;
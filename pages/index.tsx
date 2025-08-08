import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { GetServerSideProps } from 'next';
import Header from '../components/Header';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import NewsCard from '../components/NewsCard';
import BannerContainer from '../components/BannerContainer';
import BusinessCarousel from '../components/BusinessCarousel';
import { formatDate } from '../lib/formatters';
import { createServerSupabaseClient, Noticia } from '../lib/supabase';

interface HomePageProps {
  noticias: Noticia[]
}

const HomePage: React.FC<HomePageProps> = ({ noticias }) => {
  // Separar notícias em destaque e recentes
  const featuredNews = noticias.length > 0 && noticias[0].id ? {
    id: String(noticias[0].id),
    title: noticias[0].titulo,
    excerpt: noticias[0].descricao,
    imageUrl: noticias[0].imagem || 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    category: noticias[0].categoria.toLowerCase(),
    publishedAt: formatDate(noticias[0].data),
    views: 1200, // Placeholder - pode ser implementado no futuro
    featured: true
  } : null;

  const recentNews = noticias.slice(1, 6).map(noticia => ({
    id: String(noticia.id),
    title: noticia.titulo,
    excerpt: noticia.descricao,
    imageUrl: noticia.imagem || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1171&q=80',
    category: noticia.categoria.toLowerCase(),
    publishedAt: formatDate(noticia.data),
    featured: false
  }));

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
      name: 'Restaurante Sabor da Terra',
      description: 'Culinária regional com ingredientes frescos e ambiente aconchegante.',
      rating: 4.8,
      reviews: 127,
      location: 'Centro',
      featured: true,
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&h=300&q=80',
      category: 'Restaurante'
    },
    {
      id: '2',
      name: 'Auto Mecânica Silva',
      description: 'Serviços automotivos especializados com mais de 20 anos de experiência.',
      rating: 4.6,
      reviews: 89,
      location: 'Zona Industrial',
      featured: true,
      image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&h=300&q=80',
      category: 'Automotivo'
    },
    {
      id: '3',
      name: 'Farmácia Central',
      description: 'Medicamentos, produtos de higiene e atendimento farmacêutico especializado.',
      rating: 4.7,
      reviews: 156,
      location: 'Centro',
      featured: true,
      image: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&h=300&q=80',
      category: 'Saúde'
    },
    {
      id: '4',
      name: 'Padaria Pão Dourado',
      description: 'Pães frescos, doces caseiros e café da manhã completo.',
      rating: 4.5,
      reviews: 203,
      location: 'Bairro São José',
      featured: true,
      image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&h=300&q=80',
      category: 'Alimentação'
    },
    {
      id: '5',
      name: 'Salão Beleza & Estilo',
      description: 'Cortes modernos, tratamentos capilares e serviços de beleza completos.',
      rating: 4.9,
      reviews: 94,
      location: 'Centro',
      featured: true,
      isNew: true,
      image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&h=300&q=80',
      category: 'Beleza'
    },
    {
      id: '6',
      name: 'Loja Tech Solutions',
      description: 'Equipamentos de informática, assistência técnica e soluções em TI.',
      rating: 4.4,
      reviews: 67,
      location: 'Centro Comercial',
      featured: true,
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&h=300&q=80',
      category: 'Tecnologia'
    },
    {
      id: '7',
      name: 'Academia Fitness Pro',
      description: 'Equipamentos modernos, personal trainers e aulas em grupo.',
      rating: 4.6,
      reviews: 142,
      location: 'Zona Norte',
      featured: true,
      isNew: true,
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&h=300&q=80',
      category: 'Fitness'
    },
    {
      id: '8',
      name: 'Pet Shop Amigo Fiel',
      description: 'Produtos para pets, banho e tosa, consultas veterinárias.',
      rating: 4.7,
      reviews: 118,
      location: 'Bairro Jardim',
      featured: true,
      image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&h=300&q=80',
      category: 'Pet Shop'
    },
    {
      id: '9',
      name: 'Floricultura Jardim Secreto',
      description: 'Flores frescas, arranjos personalizados e plantas ornamentais.',
      rating: 4.8,
      reviews: 85,
      location: 'Centro',
      featured: true,
      image: 'https://images.unsplash.com/photo-1441123100240-f9f3f77ed41b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&h=300&q=80',
      category: 'Floricultura'
    },
    {
      id: '10',
      name: 'Pizzaria Bella Napoli',
      description: 'Pizzas artesanais no forno a lenha com ingredientes importados.',
      rating: 4.5,
      reviews: 176,
      location: 'Zona Sul',
      featured: true,
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&h=300&q=80',
      category: 'Pizzaria'
    },
    {
      id: '11',
      name: 'Ótica Visão Clara',
      description: 'Óculos de grau e sol, exames oftalmológicos e lentes de contato.',
      rating: 4.6,
      reviews: 92,
      location: 'Centro',
      featured: true,
      image: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&h=300&q=80',
      category: 'Ótica'
    },
    {
      id: '12',
      name: 'Livraria Saber & Cultura',
      description: 'Livros, material escolar, papelaria e café literário.',
      rating: 4.7,
      reviews: 134,
      location: 'Centro Cultural',
      featured: true,
      isNew: true,
      image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&h=300&q=80',
      category: 'Livraria'
    },
    {
      id: '13',
      name: 'MH Cell',
      description: 'Assistência técnica em celulares, vendas e acessórios. Contato: (44) 98435-5545',
      rating: 4.8,
      reviews: 156,
      location: 'Rua Piedade, 1385',
      featured: true,
      isNew: true,
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&h=300&q=80',
      category: 'Tecnologia'
    }
  ];

  // Função para obter a próxima terça-feira
  const getNextTuesday = () => {
    const today = new Date();
    const daysUntilTuesday = (2 - today.getDay() + 7) % 7;
    const nextTuesday = new Date(today);
    nextTuesday.setDate(today.getDate() + (daysUntilTuesday === 0 ? 7 : daysUntilTuesday));
    return nextTuesday;
  };

  const nextTuesday = getNextTuesday();
  const nextTuesdayFormatted = nextTuesday.toISOString().split('T')[0];
  const isToday = nextTuesday.toDateString() === new Date().toDateString();
  const isTomorrow = nextTuesday.toDateString() === new Date(Date.now() + 86400000).toDateString();
  
  let feiraStatus = 'TERÇA';
  if (isToday) feiraStatus = 'HOJE';
  else if (isTomorrow) feiraStatus = 'AMANHÃ';
  else feiraStatus = `${nextTuesday.getDate()} ${nextTuesday.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase()}`;

  const upcomingEvents = [
    {
      id: 'feira-produtor',
      title: 'Feira do Produtor',
      description: 'Produtos frescos direto do campo. Frutas, verduras, legumes e produtos artesanais.',
      date: nextTuesdayFormatted,
      time: '06:00 - 12:00',
      price: 'Gratuito',
      status: feiraStatus,
      icon: 'fas fa-seedling',
      gradient: 'from-green-500 to-emerald-400',
      isRecurring: true,
      location: 'Praça Central'
    },
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
              {featuredNews && <NewsCard {...featuredNews} />}
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
              
              <BannerContainer 
                position="Banner Principal" 
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
            
            <BannerContainer position="Empresas Destaque - Topo" className="w-full h-32 rounded-lg mb-8" />
            
            <BusinessCarousel businesses={featuredBusinesses.filter(business => business.featured)} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <BannerContainer position="Empresas Destaque - Rodapé 1" className="h-32 rounded-lg" />
              <BannerContainer position="Empresas Destaque - Rodapé 2" className="h-32 rounded-lg" />
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {upcomingEvents.map((event) => (
                <div key={event.id} className={`bg-gray-50 rounded-xl overflow-hidden shadow-md event-card ${event.isRecurring ? 'ring-2 ring-green-400' : ''}`}>
                  <div className={`relative h-32 bg-gradient-to-r ${event.gradient} flex items-center justify-center`}>
                    <div className="absolute top-0 left-0 bg-white text-indigo-600 font-bold px-3 py-1 m-2 rounded">{event.status}</div>
                    {event.isRecurring && (
                      <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-2 py-1 m-2 rounded-full flex items-center">
                        <i className="fas fa-redo-alt mr-1"></i> Toda Terça
                      </div>
                    )}
                    <i className={`${event.icon} text-white text-3xl`}></i>
                  </div>
                  <div className="p-3">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-base">{event.title}</h3>
                      <div className="bg-indigo-100 text-indigo-800 text-xs font-bold px-2 py-1 rounded">{event.price}</div>
                    </div>
                    <p className="text-gray-600 text-xs mb-2">{event.description}</p>
                    {event.location && (
                      <div className="text-gray-500 text-xs mb-1">
                        <i className="fas fa-map-marker-alt mr-1"></i> {event.location}
                      </div>
                    )}
                    <div className="flex justify-between items-center text-xs">
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
            
            <BannerContainer position="Eventos - Rodapé" className="w-full h-40 rounded-lg mt-8" />
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
              <BannerContainer position="Serviços - Rodapé 1" className="h-40 rounded-lg" />
              <BannerContainer position="Serviços - Rodapé 2" className="h-40 rounded-lg" />
              <BannerContainer position="Serviços - Rodapé 3" className="h-40 rounded-lg" />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const supabase = createServerSupabaseClient(context)
    
    // Buscar notícias em destaque (máximo 3) e notícias recentes (máximo 3)
    const { data: noticiasDestaque, error: errorDestaque } = await supabase
      .from('noticias')
      .select('*')
      .eq('destaque', true)
      .order('data', { ascending: false })
      .limit(3)
    
    const { data: noticiasRecentes, error: errorRecentes } = await supabase
      .from('noticias')
      .select('*')
      .order('data', { ascending: false })
      .limit(3)
    
    if (errorDestaque || errorRecentes) {
      console.error('Erro ao buscar notícias:', errorDestaque || errorRecentes)
      return {
        props: {
          noticias: []
        }
      }
    }
    
    // Combinar notícias em destaque e recentes, removendo duplicatas
    const todasNoticias = [...(noticiasDestaque || [])]
    const noticiasRecentesFiltered = (noticiasRecentes || []).filter(
      noticia => !todasNoticias.some(n => n.id === noticia.id)
    )
    todasNoticias.push(...noticiasRecentesFiltered.slice(0, 6 - todasNoticias.length))
    
    return {
      props: {
        noticias: todasNoticias
      }
    }
  } catch (error) {
    console.error('Erro no getServerSideProps:', error)
    return {
      props: {
        noticias: []
      }
    }
  }
};

export default HomePage;
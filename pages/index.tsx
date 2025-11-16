import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { GetServerSideProps } from 'next';
import Header from '../components/Header';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import NewsCard from '../components/NewsCard';
import EventCard from '../components/EventCard';
import BannerCarousel from '../components/BannerCarousel';
import BusinessCarousel from '../components/BusinessCarousel';
import SecondaryBanner from '../components/SecondaryBanner';
import FooterBanner from '../components/FooterBanner';
import WeatherSlider from '../components/WeatherSlider';
import HeroBanner from '../components/HeroBanner';
import BannerContainer from '../components/BannerContainer';
import { createServerSupabaseClient, Noticia, Evento, Empresa, Classificado, Banner } from '../lib/supabase';

interface HomePageProps {
  noticias: Noticia[];
  empresas: Empresa[];
  classificados: Classificado[];
}

const HomePage: React.FC<HomePageProps> = ({ 
  noticias, 
  empresas, 
  classificados
}) => {
  // Usar dados reais do banco em vez de dados mockados
  const safeNoticias = Array.isArray(noticias) ? noticias : [];
  const safeEmpresas = Array.isArray(empresas) ? empresas : [];
  const safeClassificados = Array.isArray(classificados) ? classificados : [];
  const featuredNews = safeNoticias.find(n => n.destaque) ?? safeNoticias[0];
  const recentNews = (featuredNews 
    ? safeNoticias.filter(n => n.id !== featuredNews.id)
    : safeNoticias
  ).slice(0, 7);
  // Uma notícia ao lado do destaque e as demais abaixo
  const companionNews = recentNews[0];
  const gridNews = recentNews.slice(1);

  const categories = [
    { name: 'Restaurantes', icon: 'fas fa-utensils', href: '/empresas-locais?categoria=Alimentação' },
    { name: 'Hospedagem', icon: 'fas fa-bed', href: '/empresas-locais?categoria=Hospedagem' },
    { name: 'Serviços', icon: 'fas fa-tools', href: '/empresas-locais?categoria=Serviços' },
    { name: 'Comércio', icon: 'fas fa-shopping-bag', href: '/empresas-locais?categoria=Comércio' },
    { name: 'Saúde', icon: 'fas fa-heartbeat', href: '/empresas-locais?categoria=Saúde' },
    { name: 'Educação', icon: 'fas fa-graduation-cap', href: '/empresas-locais?categoria=Educação' }
  ];

  // Removi a previsão do tempo da lista de serviços
  const services = [
    {
      title: 'Telefones Úteis',
      description: 'Contatos importantes da cidade',
      icon: 'fas fa-phone',
      href: '/servicos/telefones-uteis'
    },
    {
      title: 'Transporte Público',
      description: 'Horários e rotas dos ônibus',
      icon: 'fas fa-bus',
      href: '/servicos/transporte'
    },
    {
      title: 'Farmácias de Plantão',
      description: 'Plantões e horários especiais',
      icon: 'fas fa-pills',
      href: '/servicos/farmacias'
    }
  ];

  return (
    <>
      <Head>
        <title>Portal Maria Helena - Guia Comercial & Eventos</title>
        <meta name="description" content="Portal oficial de Maria Helena - Conectando pessoas e negócios." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

  <Header />
  <Nav />

  <main>
        {/* Carrossel Hero abaixo da navegação (sem bloco de texto) */}
        <section className="py-4 bg-white">
          <div className="container mx-auto px-4">
            <BannerCarousel 
              position="Hero Carousel" 
              local="home"
              interval={6000}
              autoRotate={true}
              maxBanners={0}
              className="rounded-xl"
            />
          </div>
        </section>

        {/* Seção de Notícias */}
        <section className="py-6 md:py-12 bg-gradient-to-b from-white to-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-4 md:mb-8">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">Notícias</h2>
                <p className="text-gray-600 mt-1 text-sm md:text-base">Acompanhe as últimas atualizações da cidade</p>
              </div>
              <Link href="/noticias" className="inline-flex items-center rounded-full transition px-3 py-2 text-sm font-medium bg-white text-indigo-600 border border-indigo-600 hover:bg-indigo-50 md:bg-indigo-600 md:text-white md:border-transparent md:hover:bg-indigo-700 md:px-4 md:py-2 md:text-base md:font-semibold">
                Ver todas <i className="fas fa-arrow-right ml-1 text-[10px] md:ml-2 md:text-xs"></i>
              </Link>
            </div>
            
            {safeNoticias.length > 0 ? (
              <div className="space-y-4 md:space-y-8">
                {/* Linha com destaque (2/3) e uma notícia ao lado (1/3) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 items-stretch">
                  <div className="md:col-span-2 rounded-2xl bg-white border border-gray-200 shadow-sm p-4 md:p-5">
                    {featuredNews && (
                      <NewsCard 
                        id={featuredNews.id}
                        title={featuredNews.titulo}
                        excerpt={featuredNews.descricao}
                        imageUrl={featuredNews.imagem}
                        category={featuredNews.categoria}
                        publishedAt={new Date(featuredNews.data).toLocaleDateString('pt-BR')}
                        featured={true}
                        className="shadow-xl"
                      />
                    )}
                  </div>
                  {companionNews && (
                    <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-4 md:p-5 flex">
                      <NewsCard 
                        key={companionNews.id}
                        id={companionNews.id}
                        title={companionNews.titulo}
                        excerpt={companionNews.descricao}
                        imageUrl={companionNews.imagem}
                        category={companionNews.categoria}
                        publishedAt={new Date(companionNews.data).toLocaleDateString('pt-BR')}
                        featured={false}
                        tall={true}
                        className="border border-gray-100"
                      />
                    </div>
                  )}
                </div>

                {/* Grid das outras 6 notícias abaixo */}
                <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-4 md:p-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {gridNews.map((news) => (
                      <NewsCard 
                        key={news.id}
                        id={news.id}
                        title={news.titulo}
                        excerpt={news.descricao}
                        imageUrl={news.imagem}
                        category={news.categoria}
                        publishedAt={new Date(news.data).toLocaleDateString('pt-BR')}
                        featured={false}
                        className="border border-gray-100"
                      />
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Nenhuma notícia disponível no momento.</p>
              </div>
            )}
          </div>
        </section>



        

        {/* CTA - Explore Itaperuçu */}
        <section className="py-8 md:py-16 bg-[#0D1321]">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Descubra o melhor de Maria Helena
                </h2>
                <p className="text-gray-200 text-base md:text-lg mb-3 md:mb-6">
                  Encontre negócios locais, eventos imperdíveis e tudo que sua cidade tem para oferecer.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link href="/guia" className="inline-flex items-center px-5 py-3 rounded-full bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition">
                    Explorar Negócios
                  </Link>
                  <Link href="/eventos" className="inline-flex items-center px-5 py-3 rounded-full border border-white text-white hover:bg-white hover:text-indigo-900 transition">
                    Ver Eventos
                  </Link>
                </div>
              </div>
              <div>
                <BannerCarousel
                  position="CTA Banner"
                  local="home"
                  interval={5000}
                  autoRotate={true}
                  maxBanners={0}
                  className="rounded-lg p-0 shadow-none max-h-[360px] bg-transparent"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Banner acima das Categorias - usando o mesmo carrossel do Hero */}
        <section className="py-4 bg-white">
          <div className="container mx-auto px-4">
            <BannerCarousel 
              position="Categorias Banner" 
              local="home"
              interval={6000}
              autoRotate={true}
              maxBanners={0}
              className="rounded-xl"
            />
          </div>
        </section>

        {/* Seção de Categorias */}
        <section className="py-6 md:py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-6 md:mb-12">Explore Nossas Categorias</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((category, index) => (
                <Link key={index} href={category.href} className="bg-indigo-50 rounded-lg p-4 text-center hover:bg-indigo-100 transition">
                  <div className="bg-indigo-100 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-3">
                    <i className={`${category.icon} text-indigo-600 text-2xl`}></i>
                  </div>
                  <span className="font-medium">{category.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Seção de Empresas em Destaque */}
        <section className="py-6 md:py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-4 md:mb-8">
              <h2 className="text-3xl font-bold">Empresas em Destaque</h2>
              <Link href="/guia" className="text-indigo-600 hover:text-indigo-800 font-medium text-sm md:text-base transition">
                Ver todas <i className="fas fa-arrow-right ml-1 text-[10px] md:text-xs"></i>
              </Link>
            </div>
            <BusinessCarousel businesses={safeEmpresas} />
          </div>
        </section>

        {/* Seção de Classificados em Destaque */}
        <section className="py-6 md:py-12 bg-indigo-50">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-4 md:mb-8">
              <h2 className="text-3xl font-bold">Classificados em Destaque</h2>
              <Link href="/classificados" className="text-indigo-600 hover:text-indigo-800 font-medium">
                Ver todos <i className="fas fa-arrow-right ml-1"></i>
              </Link>
            </div>
            
            {safeClassificados && safeClassificados.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {safeClassificados.map((classificado) => (
                  <div key={classificado.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                    {classificado.imagem && (
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={classificado.imagem}
                          alt={classificado.titulo}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <div className="absolute top-2 right-2">
                          <span className="bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                            {classificado.categoria}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    <div className="p-4">
                      <h3 className="font-bold text-lg mb-2 line-clamp-2">{classificado.titulo}</h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{classificado.descricao}</p>
                      
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-2xl font-bold text-indigo-600">
                          R$ {classificado.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center text-sm text-gray-500 mb-3">
                        <span className="flex items-center">
                          <i className="fas fa-map-marker-alt mr-1"></i>
                          {classificado.localizacao}
                        </span>
                        <span>
                          {new Date(classificado.created_at).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      
                      <Link 
                        href={`/classificados/${classificado.id}`}
                        className="block w-full bg-indigo-600 text-white text-center py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-300"
                      >
                        Ver detalhes
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Nenhum classificado em destaque no momento.</p>
              </div>
            )}
          </div>
        </section>

        {/* Seção de Serviços Úteis */}
        <section className="py-6 md:py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-6 md:mb-12">Serviços Úteis</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {services.map((service, index) => (
                <Link key={index} href={service.href} className="bg-indigo-50 rounded-xl p-4 md:p-6 text-center hover:bg-indigo-100 transition">
                  <div className="bg-indigo-100 w-16 h-16 md:w-20 md:h-20 mx-auto rounded-full flex items-center justify-center mb-3 md:mb-4">
                    <i className={`${service.icon} text-indigo-600 text-3xl`}></i>
                  </div>
                  <h3 className="font-bold text-lg mb-2">{service.title}</h3>
                  <p className="text-gray-600 text-sm mb-3 md:mb-4">{service.description}</p>
                  <span className="text-indigo-600 font-medium text-sm">
                    Acessar <i className="fas fa-arrow-right ml-1"></i>
                  </span>
                </Link>
              ))}
              
              {/* WeatherSlider com o mesmo estilo dos outros cards */}
              <WeatherSlider />
            </div>
          </div>
        </section>

        {/* Banner abaixo dos Serviços Úteis - usando carrossel igual ao Hero */}
        <section className="py-4 bg-white">
          <div className="container mx-auto px-4">
            <BannerCarousel 
              position="Serviços Banner" 
              local="home"
              interval={6000}
              autoRotate={true}
              maxBanners={0}
              className="rounded-xl"
            />
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const supabase = createServerSupabaseClient();
    
    // Otimização: Executar consultas em paralelo em vez de sequencial
    const [
      noticiasResult,
      empresasResult,
      classificadosResult,
    ] = await Promise.all([
      supabase
        .from('noticias')
        .select('id,titulo,descricao,imagem,categoria,data,destaque,created_at')
        .eq('workflow_status', 'published')
        .order('created_at', { ascending: false })
        .limit(12),
      
      supabase
        .from('empresas')
        .select('id,name,description,category,rating,reviews,location,image,featured,is_new,plan_type,premium_expires_at,created_at')
        .eq('ativo', true)
        .or('featured.eq.true,plan_type.eq.premium')
        .order('featured', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(24),
      
      supabase
        .from('classificados')
        .select('id,titulo,categoria,preco,imagem,localizacao,descricao,created_at')
        .order('created_at', { ascending: false })
        .limit(8),
    ]);

    // Erros são tratados silenciosamente em produção

    // Processar empresas: incluir destacadas e premium não expiradas; limitar a 8
    const empresasRaw = empresasResult.data || []
    const empresasFiltradas = empresasRaw
      .filter((e: any) => {
        const isFeatured = e.featured === true
        const isPremiumActive = e.plan_type === 'premium' && (
          !e.premium_expires_at || new Date(e.premium_expires_at) > new Date()
        )
        return isFeatured || isPremiumActive
      })
      .sort((a: any, b: any) => {
        // Ordenar: featured primeiro, depois premium ativo, depois data
        if (a.featured && !b.featured) return -1
        if (!a.featured && b.featured) return 1
        const aPremiumActive = a.plan_type === 'premium' && (!a.premium_expires_at || new Date(a.premium_expires_at) > new Date())
        const bPremiumActive = b.plan_type === 'premium' && (!b.premium_expires_at || new Date(b.premium_expires_at) > new Date())
        if (aPremiumActive && !bPremiumActive) return -1
        if (!aPremiumActive && bPremiumActive) return 1
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      })
      .slice(0, 8)

    return {
      props: {
        noticias: noticiasResult.data || [],
        empresas: empresasFiltradas,
        classificados: classificadosResult.data || []
      }
    };
  } catch (error) {
    // Erro tratado silenciosamente em produção
    return {
      props: {
        noticias: [],
        empresas: [],
        classificados: []
      }
    };
  }
};

export default HomePage;

import React from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import Header from '../../components/Header';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import BannerContainer from '../../components/BannerContainer';
import BannerCarousel from '../../components/BannerCarousel';
import { PopularNewsSidebar, LatestNewsSidebar, UpcomingEventsSidebar, RecentClassifiedsSidebar, FeaturedBusinessesSidebar, NewsletterSidebar, FeaturedBusinessesCarousel } from '../../components/sidebar';
import { formatDate } from '../../lib/formatters';
import { autoFormatNews } from '../../lib/text/autoFormatNews';
import { createServerSupabaseClient, Noticia, Banner } from '../../lib/supabase';

interface NewsPageProps {
  news: Noticia | null;
  relatedNews: Noticia[];
  banner: Banner | null;
  popular?: { id: string; titulo: string; imagem?: string | null; created_at?: string | null }[];
  latest?: { id: string; titulo: string; imagem?: string | null; created_at?: string | null }[];
  events?: { id: string; titulo: string; data?: string | null; local?: string | null }[];
  classifieds?: { id: string; titulo: string; preco?: number | null; categoria?: string | null; imagem?: string | null }[];
  businesses?: { id: string; nome: string; categoria?: string | null; logo?: string | null }[];
  formattedHtml?: string;
  formattedDek?: string;
}

const getCategoryColor = (cat: string) => {
  const colors: { [key: string]: string } = {
    'Educação': 'bg-blue-600',
    'Economia': 'bg-green-600',
    'Esportes': 'bg-yellow-600',
    'Saúde': 'bg-red-600',
    'Cultura': 'bg-purple-600',
    'Política': 'bg-gray-600',
    'Tecnologia': 'bg-indigo-600',
    'Entretenimento': 'bg-pink-600',
    'Segurança': 'bg-red-700',
    'Meio Ambiente': 'bg-green-800',
    'Turismo': 'bg-sky-500',
    'Agronegócios': 'bg-amber-800',
    'Trânsito': 'bg-yellow-700',
    'Eventos': 'bg-violet-500',
    'Infraestrutura': 'bg-gray-800',
    'Assistência Social': 'bg-rose-500',
    'Justiça': 'bg-blue-900',
    'Clima': 'bg-cyan-500',
    'Negócios': 'bg-emerald-700',
    'Gastronomia': 'bg-orange-700'
  };
  return colors[cat] || 'bg-indigo-600';
};

 

export default function NewsPage({ news, relatedNews, banner, popular, latest, events, classifieds, businesses, formattedHtml, formattedDek }: NewsPageProps) {
  if (!news) {
    return (
      <>
        <Head>
          <title>Notícia não encontrada - Portal Maria Helena</title>
        </Head>
        <Header />
        <Nav />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl font-bold mb-4">Notícia não encontrada</h1>
          <p className="text-gray-600 mb-8">A notícia que você está procurando não existe ou foi removida.</p>
          <Link href="/noticias" className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition">
            Voltar para Notícias
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  const topLocal = `noticia-${news.id}-top`;
  const bottomLocal = `noticia-${news.id}-bottom`;

  return (
    <>
      <Head>
        <title>{news.titulo} - Portal Maria Helena</title>
        <meta name="description" content={news.descricao} />
        <meta property="og:title" content={news.titulo} />
        <meta property="og:description" content={news.descricao} />
        {news.imagem && <meta property="og:image" content={news.imagem} />}
        <meta property="og:type" content="article" />
      </Head>

      <Header />
      <Nav />

      <main className="py-8">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <nav className="mb-8">
            <ol className="flex items-center space-x-2 text-sm text-gray-600">
              <li><Link href="/" className="hover:text-indigo-600">Início</Link></li>
              <li><i className="fas fa-chevron-right text-xs"></i></li>
              <li><Link href="/noticias" className="hover:text-indigo-600">Notícias</Link></li>
              <li><i className="fas fa-chevron-right text-xs"></i></li>
              <li className="text-gray-900 font-medium truncate">{news.titulo}</li>
            </ol>
          </nav>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Content */}
            <article className="lg:w-2/3">
              <div className="mb-8">
                <BannerCarousel 
                  position="hero"
                  local={topLocal}
                  maxBanners={1}
                  interval={5000}
                  autoRotate={true}
                  className="mx-auto"
                />
              </div>
              {/* Article Header */}
              <header className="mb-8">
                <div className="mb-4">
                  <span className={`${getCategoryColor(news.categoria)} text-white px-3 py-1 rounded-full text-sm font-bold`}>
                    {news.categoria}
                  </span>
                </div>
                
                <h1 className="text-4xl font-bold mb-4 leading-tight">{news.titulo}</h1>
                
                <div className="flex items-center text-gray-600 text-sm mb-6">
                  <span className="flex items-center mr-6">
                    <i className="far fa-calendar-alt mr-2"></i>
                    {formatDate(news.data)}
                  </span>
                </div>
                
                <p className="text-xl text-gray-700 leading-relaxed">{news.descricao}</p>
              </header>

              {/* Featured Image */}
              {news.imagem && (
                <div className="mb-8">
                  <div className="relative h-96 rounded-xl overflow-hidden">
                    <Image
                      src={news.imagem}
                      alt={news.titulo}
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                  {news.credito_foto && (
                    <div className="mt-2 text-sm text-gray-600 text-right">
                      Foto: {news.credito_foto}
                    </div>
                  )}
                </div>
              )}

              {formattedDek ? (
                <div className="mb-6 p-4 bg-indigo-50 border border-indigo-100 rounded-lg text-indigo-900">
                  <div className="font-semibold mb-2">Resumo em 30 segundos</div>
                  <div className="text-sm">{formattedDek}</div>
                </div>
              ) : null}

              <div 
                className="prose prose-lg max-w-none mb-8"
                dangerouslySetInnerHTML={{ __html: formattedHtml || news.conteudo }}
              />

              {news.fonte && (
                <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="text-sm text-gray-600">
                    <strong>Fonte:</strong> {news.fonte}
                  </div>
                </div>
              )}

              <div className="my-8">
                <BannerCarousel 
                  position="hero"
                  local={bottomLocal}
                  maxBanners={1}
                  interval={5000}
                  autoRotate={true}
                  className="mx-auto"
                />
              </div>

              <div className="border-t border-gray-200 pt-6 mb-8">
                <h3 className="text-lg font-bold mb-4">Compartilhe esta notícia</h3>
                <div className="flex space-x-4">
                  <button
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                    onClick={() => {
                      const url = typeof window !== 'undefined' ? window.location.href : ''
                      const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
                      window.open(shareUrl, '_blank', 'noopener,noreferrer')
                    }}
                  >
                    <i className="fab fa-facebook-f mr-2"></i>Facebook
                  </button>
                  <button
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                    onClick={() => {
                      const url = typeof window !== 'undefined' ? window.location.href : ''
                      const text = `${news.titulo} - ${url}`
                      const shareUrl = `https://wa.me/?text=${encodeURIComponent(text)}`
                      window.open(shareUrl, '_blank', 'noopener,noreferrer')
                    }}
                  >
                    <i className="fab fa-whatsapp mr-2"></i>WhatsApp
                  </button>
                  <button
                    className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition"
                    onClick={async () => {
                      const url = typeof window !== 'undefined' ? window.location.href : ''
                      const text = `${news.titulo} - ${url}`
                      if (navigator.share) {
                        try {
                          await navigator.share({ title: news.titulo, text: news.descricao || news.titulo, url })
                        } catch {}
                      } else if (navigator.clipboard && navigator.clipboard.writeText) {
                        try {
                          await navigator.clipboard.writeText(text)
                          alert('Link copiado. Abra o Instagram e cole na publicação ou mensagem.')
                        } catch {
                          window.prompt('Copie o link para compartilhar no Instagram:', text)
                        }
                      } else {
                        window.prompt('Copie o link para compartilhar no Instagram:', text)
                      }
                    }}
                  >
                    <i className="fab fa-instagram mr-2"></i>Instagram
                  </button>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center border-t border-gray-200 pt-6">
                <Link href="/noticias" className="text-indigo-600 hover:text-indigo-800 font-medium">
                  <i className="fas fa-arrow-left mr-2"></i>Voltar para Notícias
                </Link>
              </div>
            </article>

            {/* Sidebar */}
            <aside className="lg:w-1/3 space-y-6">
              {popular?.length ? <PopularNewsSidebar items={popular as any} /> : null}

              <div className="hidden lg:block">
                <BannerCarousel 
                  position="sidebar"
                  local="noticia-sidebar-1"
                  interval={6000}
                  autoRotate={true}
                  maxBanners={5}
                  className="w-full rounded-lg"
                />
              </div>

              <FeaturedBusinessesCarousel items={(businesses as any) || []} />

              {relatedNews.length > 0 && (
                <LatestNewsSidebar items={relatedNews as any} />
              )}
              {businesses?.length ? <FeaturedBusinessesSidebar items={businesses as any} /> : null}
              {events?.length ? <UpcomingEventsSidebar items={events as any} /> : null}
              {classifieds?.length ? <RecentClassifiedsSidebar items={classifieds as any} /> : null}
              <NewsletterSidebar />

              {/* Publicidade - Carrossel 2 (300x250) */}
              <div className="hidden lg:block">
                <BannerCarousel 
                  position="sidebar"
                  local="noticia-sidebar-2"
                  interval={5000}
                  autoRotate={true}
                  maxBanners={5}
                  className="w-full rounded-lg"
                />
              </div>
            </aside>
          </div>
        </div>
      </main>

      {/* Banner Publicitário 3 - Antes do Newsletter */}
      <section className="container mx-auto px-4 py-8">
        <BannerContainer 
          position="Notícia - Antes Newsletter" 
          className="w-full rounded-lg mx-auto max-w-4xl"
        />
      </section>

      <Footer />
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { params } = context;
  const id = params?.id as string;
  
  try {
    const supabase = createServerSupabaseClient(context);
    
    // Buscar a notícia
    const { data: news } = await supabase
      .from('noticias')
      .select('*')
      .eq('id', id)
      .eq('workflow_status', 'published')
      .single();
    
    if (!news) {
      return {
        props: {
          news: null,
          relatedNews: [],
          banner: null
        }
      };
    }
    
    let banner = null;
    if (news.banner_id) {
      const { data: bannerData } = await supabase
        .from('banners')
        .select('*')
        .eq('id', news.banner_id)
        .eq('ativo', true)
        .single();
      banner = bannerData;
    }

    const { data: relatedNews } = await supabase
      .from('noticias')
      .select('id,titulo,imagem,created_at')
      .eq('categoria', news.categoria)
      .eq('workflow_status', 'published')
      .neq('id', id)
      .order('created_at', { ascending: false })
      .limit(5);

    const formatted = autoFormatNews({ title: news.titulo, content: news.conteudo, category: news.categoria })

    const nowIso = new Date().toISOString();
    const [popularRes, latestRes, eventsRes, classifiedsRes, businessesRes] = await Promise.all([
      supabase.from('noticias').select('id,titulo,imagem,created_at').eq('workflow_status', 'published').order('created_at', { ascending: false }).limit(5),
      supabase.from('noticias').select('id,titulo,imagem,created_at').eq('workflow_status', 'published').order('created_at', { ascending: false }).limit(5),
      supabase.from('eventos').select('id,titulo,data,local').gte('data', nowIso).order('data').limit(3),
      supabase.from('classificados').select('id,titulo,preco,categoria,imagem').order('created_at', { ascending: false }).limit(3),
      supabase.from('empresas').select('id,nome,categoria,logo').order('created_at', { ascending: false }).limit(3)
    ]);

    return {
      props: {
        news,
        relatedNews: relatedNews || [],
        banner,
        popular: popularRes.data || [],
        latest: latestRes.data || [],
        events: eventsRes.data || [],
        classifieds: classifiedsRes.data || [],
        businesses: businessesRes.data || [],
        formattedHtml: formatted.html,
        formattedDek: formatted.dek
      }
    };
  } catch (error) {
    console.error('Erro ao buscar notícia:', error);
    return {
      props: {
        news: null,
        relatedNews: [],
        banner: null
      }
    };
  }
};

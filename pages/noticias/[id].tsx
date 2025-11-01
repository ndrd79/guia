import React from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import Header from '../../components/Header';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import BannerContainer from '../../components/BannerContainer';
import { formatDate } from '../../lib/formatters';
import { createServerSupabaseClient, Noticia, Banner } from '../../lib/supabase';

interface NewsPageProps {
  news: Noticia | null;
  relatedNews: Noticia[];
  banner: Banner | null;
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

// Função para inserir banner no meio do conteúdo com design elegante
const insertBannerInContent = (content: string, banner: Banner | null) => {
  if (!banner) return content;
  
  // Divide o conteúdo em parágrafos
  const paragraphs = content.split('</p>');
  
  // Se há pelo menos 2 parágrafos, insere o banner no meio
  if (paragraphs.length >= 2) {
    const middleIndex = Math.floor(paragraphs.length / 2);
    
    // Determina o tamanho do container baseado nas dimensões do banner
    const containerSize = banner.largura && banner.largura > 500 ? 'large' : 
                         banner.largura && banner.largura < 350 ? 'small' : '';
    
    const bannerHtml = `
      <div class="content-banner-container ${containerSize}">
        <div class="content-banner-inner">
          ${banner.link ? `<a href="${banner.link}" target="_blank" rel="noopener noreferrer" class="block">` : ''}
            <img 
              src="${banner.imagem}" 
              alt="${banner.nome || 'Banner publicitário'}"
              class="content-banner-image"
              style="max-width: ${banner.largura || 600}px; height: auto;"
              loading="lazy"
            />
          ${banner.link ? '</a>' : ''}
          <div class="content-banner-label">
            <i class="fas fa-ad mr-1"></i>Publicidade
          </div>
        </div>
      </div>
    `;
    
    // Insere o banner no meio do conteúdo
    paragraphs.splice(middleIndex, 0, bannerHtml);
    
    return paragraphs.join('</p>');
  }
  
  return content;
};

export default function NewsPage({ news, relatedNews, banner }: NewsPageProps) {
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

  // Processa o conteúdo com banner inserido
  const contentWithBanner = insertBannerInContent(news.conteudo, banner);

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
                <div className="relative h-96 mb-8 rounded-xl overflow-hidden">
                  <Image
                    src={news.imagem}
                    alt={news.titulo}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              )}

              {/* Article Content with Banner */}
              <div 
                className="prose prose-lg max-w-none mb-8"
                dangerouslySetInnerHTML={{ __html: contentWithBanner }}
              />

              {/* Share Buttons */}
              <div className="border-t border-gray-200 pt-6 mb-8">
                <h3 className="text-lg font-bold mb-4">Compartilhe esta notícia</h3>
                <div className="flex space-x-4">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                    <i className="fab fa-facebook-f mr-2"></i>Facebook
                  </button>
                  <button className="bg-blue-400 text-white px-4 py-2 rounded-lg hover:bg-blue-500 transition">
                    <i className="fab fa-twitter mr-2"></i>Twitter
                  </button>
                  <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
                    <i className="fab fa-whatsapp mr-2"></i>WhatsApp
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
              {/* Banner Principal da Sidebar */}
              <BannerContainer 
                position="Notícia - Sidebar Topo" 
                className="w-full rounded-lg"
              />

              {/* Related News */}
              {relatedNews.length > 0 && (
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="text-xl font-bold mb-4 flex items-center">
                    <i className="fas fa-newspaper text-indigo-600 mr-2"></i>
                    Notícias Relacionadas
                  </h3>
                  <div className="space-y-4">
                    {relatedNews.map((relatedNews) => (
                      <Link key={relatedNews.id} href={`/noticias/${relatedNews.id}`} className="block group">
                        <div className="flex space-x-3">
                          {relatedNews.imagem && (
                            <div className="relative w-20 h-16 rounded-lg overflow-hidden flex-shrink-0">
                              <Image
                                src={relatedNews.imagem}
                                alt={relatedNews.titulo}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform"
                              />
                            </div>
                          )}
                          <div className="flex-1">
                            <h4 className="font-medium text-sm line-clamp-2 group-hover:text-indigo-600 transition-colors">
                              {relatedNews.titulo}
                            </h4>
                            <p className="text-xs text-gray-500 mt-1">{formatDate(relatedNews.data)}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Banner Publicitário 1 - Após Notícias Relacionadas */}
              <BannerContainer 
                position="Notícia - Após Relacionadas 1" 
                className="w-full rounded-lg"
              />

              {/* Banner Publicitário 2 - Após Notícias Relacionadas */}
              <BannerContainer 
                position="Notícia - Após Relacionadas 2" 
                className="w-full rounded-lg"
              />
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
    
    // Buscar banner associado se existir
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
    
    // Buscar notícias relacionadas da mesma categoria
    const { data: relatedNews } = await supabase
      .from('noticias')
      .select('*')
      .eq('categoria', news.categoria)
      .neq('id', id)
      .order('created_at', { ascending: false })
      .limit(3);
    
    return {
      props: {
        news,
        relatedNews: relatedNews || [],
        banner
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
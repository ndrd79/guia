import React, { useState } from 'react'
import { GetServerSideProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import Header from '../../components/Header'
import Nav from '../../components/Nav'
import Footer from '../../components/Footer'
import BannerCarousel from '../../components/BannerCarousel'
import { createServerSupabaseClient, Evento } from '../../lib/supabase'
import { formatDate } from '../../lib/formatters'
import { Calendar, MapPin, Clock, ArrowLeft, Share2, Facebook, MessageCircle, Copy, Check } from 'lucide-react'

interface EventPageProps {
  evento: Evento | null
  upcomingEvents: Evento[]
  featuredBusinesses: any[]
}

export default function EventoDetailPage({ evento, upcomingEvents, featuredBusinesses }: EventPageProps) {
  const [copied, setCopied] = useState(false)
  const [imageError, setImageError] = useState(false)

  if (!evento) {
    return (
      <>
        <Head>
          <title>Evento não encontrado - Portal Maria Helena</title>
        </Head>
        <Header />
        <Nav />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl font-bold mb-4 text-gray-800">Evento não encontrado</h1>
          <p className="text-gray-600 mb-8 font-medium">O evento que você está procurando não existe ou já foi encerrado.</p>
          <Link href="/eventos" className="bg-indigo-600 text-white px-6 py-3 rounded-full hover:bg-indigo-700 transition font-semibold">
            Voltar para Eventos
          </Link>
        </div>
        <Footer />
      </>
    )
  }

  const getDateParts = (dateStr: string) => {
    const date = new Date(dateStr)
    return {
      day: date.getDate().toString().padStart(2, '0'),
      month: date.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase().replace('.', ''),
      weekday: date.toLocaleDateString('pt-BR', { weekday: 'long' }),
      time: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      full: date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
    }
  }

  const dateInfo = getDateParts(evento.data_hora)
  const eventUrl = typeof window !== 'undefined' ? window.location.href : ''
  const shareText = `Confira o evento "${evento.titulo}" em Maria Helena! Local: ${evento.local || 'Não especificado'}. Data: ${dateInfo.full} às ${dateInfo.time}. Saiba mais em: `

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText}${eventUrl}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Falha ao copiar link: ', err)
    }
  }

  // Verifica se o evento é "Feira do Produtor" para exibição de tag especial
  const isFeira = evento.titulo.toLowerCase().includes('feira do produtor')

  return (
    <>
      <Head>
        <title>{`${evento.titulo} - Eventos - Portal Maria Helena`}</title>
        <meta name="description" content={evento.descricao || `Confira mais detalhes sobre o evento ${evento.titulo} em Maria Helena.`} />
        <meta property="og:title" content={evento.titulo} />
        <meta property="og:description" content={evento.descricao} />
        {evento.imagem && <meta property="og:image" content={evento.imagem} />}
        <meta property="og:type" content="article" />
      </Head>

      <Header />
      <Nav />

      <main className="min-h-screen bg-gray-50 pb-12">
        {/* Banner de Destaque / Hero */}
        <section className="relative h-[40vh] md:h-[50vh] overflow-hidden bg-indigo-900">
          {evento.imagem && !imageError ? (
            <Image
              src={evento.imagem}
              alt={evento.titulo}
              fill
              className="object-cover object-center opacity-40 blur-[2px] scale-105"
              priority
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-purple-700 via-indigo-800 to-blue-700 opacity-60" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-50 via-black/40 to-transparent" />
          
          <div className="relative h-full container mx-auto px-4 flex flex-col justify-end pb-8">
            <div className="max-w-4xl">
              <Link
                href="/eventos"
                className="inline-flex items-center text-white/90 hover:text-white mb-6 text-sm font-semibold bg-black/25 backdrop-blur-md px-4 py-2 rounded-full transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar para Eventos
              </Link>
              
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="px-3.5 py-1.5 bg-indigo-600 text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-md">
                  {evento.tipo || 'Evento'}
                </span>
                {isFeira && (
                  <span className="px-3.5 py-1.5 bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-md">
                    Produtor Local
                  </span>
                )}
              </div>
              
              <h1 className="text-3xl md:text-5xl font-black text-white leading-tight drop-shadow-md">
                {evento.titulo}
              </h1>
            </div>
          </div>
        </section>

        {/* Conteúdo Principal com Sidebar */}
        <div className="container mx-auto px-4 mt-8">
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Bloco de Detalhes do Evento */}
            <article className="flex-1 space-y-6">
              {/* Card de Detalhes Rápidos */}
              <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2 border-b pb-4">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                  Informações Gerais
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Data e Dia da Semana */}
                  <div className="flex items-start gap-4">
                    <div className="bg-indigo-55 bg-indigo-50 text-indigo-600 p-3.5 rounded-2xl flex-shrink-0">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-500 text-sm uppercase tracking-wider">Data</h3>
                      <p className="text-gray-900 font-bold text-lg leading-tight mt-0.5">{dateInfo.full}</p>
                      <p className="text-gray-500 text-sm font-medium capitalize">{dateInfo.weekday}</p>
                    </div>
                  </div>

                  {/* Hora */}
                  <div className="flex items-start gap-4">
                    <div className="bg-indigo-50 text-indigo-600 p-3.5 rounded-2xl flex-shrink-0">
                      <Clock className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-500 text-sm uppercase tracking-wider">Horário</h3>
                      <p className="text-gray-900 font-bold text-lg leading-tight mt-0.5">{dateInfo.time}</p>
                      <p className="text-gray-500 text-sm font-medium">Horário de Brasília</p>
                    </div>
                  </div>

                  {/* Localização */}
                  {evento.local && (
                    <div className="flex items-start gap-4 md:col-span-2">
                      <div className="bg-indigo-50 text-indigo-600 p-3.5 rounded-2xl flex-shrink-0">
                        <MapPin className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-500 text-sm uppercase tracking-wider">Local</h3>
                        <p className="text-gray-900 font-bold text-lg leading-tight mt-0.5">{evento.local}</p>
                        <p className="text-gray-500 text-sm font-medium">Maria Helena - PR</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Card de Imagem do Evento */}
              {evento.imagem && (
                <div className="relative h-64 md:h-[450px] w-full rounded-3xl overflow-hidden shadow-sm border border-gray-100">
                  <Image
                    src={evento.imagem}
                    alt={evento.titulo}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 800px"
                    onError={() => setImageError(true)}
                  />
                </div>
              )}

              {/* Card de Descrição */}
              <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-4">
                  Sobre o Evento
                </h2>
                <div className="prose prose-indigo max-w-none text-gray-700 leading-relaxed font-medium whitespace-pre-line text-base">
                  {evento.descricao || 'Nenhuma descrição fornecida para este evento.'}
                </div>
              </div>

              {/* Botões de Compartilhamento */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-indigo-600" />
                  Compartilhar Evento
                </h3>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => {
                      const url = `https://wa.me/?text=${encodeURIComponent(`${shareText}${eventUrl}`)}`
                      window.open(url, '_blank', 'noopener,noreferrer')
                    }}
                    className="flex items-center gap-2 bg-[#25D366] text-white font-semibold px-5 py-3 rounded-2xl hover:bg-[#128C7E] transition shadow-sm hover:shadow-md"
                  >
                    <MessageCircle className="w-5 h-5" />
                    WhatsApp
                  </button>
                  
                  <button
                    onClick={() => {
                      const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(eventUrl)}`
                      window.open(url, '_blank', 'noopener,noreferrer')
                    }}
                    className="flex items-center gap-2 bg-[#1877F2] text-white font-semibold px-5 py-3 rounded-2xl hover:bg-[#166FE5] transition shadow-sm hover:shadow-md"
                  >
                    <Facebook className="w-5 h-5" />
                    Facebook
                  </button>
                  
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-2 bg-gray-100 text-gray-700 font-semibold px-5 py-3 rounded-2xl hover:bg-gray-200 transition shadow-sm hover:shadow-md"
                  >
                    {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
                    {copied ? 'Link Copiado!' : 'Copiar Link'}
                  </button>
                </div>
              </div>
            </article>

            {/* Sidebar Direita */}
            <aside className="lg:w-80 space-y-6">
              {/* Banner Sidebar */}
              <BannerCarousel
                position="Sidebar Direita"
                local="eventos"
                interval={5000}
                autoRotate={true}
                maxBanners={3}
                className="rounded-2xl"
              />

              {/* Calendário de Próximos Eventos */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-lg">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                  Próximos Eventos
                </h3>
                <div className="space-y-4">
                  {upcomingEvents.length === 0 ? (
                    <p className="text-gray-500 text-sm">Nenhum outro evento programado.</p>
                  ) : (
                    upcomingEvents.map(evt => {
                      const parts = getDateParts(evt.data_hora)
                      const linkUrl = evt.titulo.toLowerCase().includes('feira do produtor')
                        ? '/eventos/feira-do-produtor'
                        : `/eventos/${evt.id}`
                      return (
                        <Link
                          key={evt.id}
                          href={linkUrl}
                          className="flex items-center gap-3 group"
                        >
                          <div className="flex-shrink-0 w-12 text-center bg-indigo-50 rounded-xl py-1">
                            <span className="block text-base font-black text-indigo-600">{parts.day}</span>
                            <span className="block text-[10px] font-bold text-gray-500 uppercase">{parts.month}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                              {evt.titulo}
                            </p>
                            <p className="text-xs text-gray-500 truncate flex items-center gap-0.5">
                              <MapPin className="w-3 h-3 text-gray-400" />
                              {evt.local}
                            </p>
                          </div>
                        </Link>
                      )
                    })
                  )}
                </div>
              </div>

              {/* Empresas em Destaque */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4 text-lg">
                  Empresas em Destaque
                </h3>
                <div className="space-y-4">
                  {featuredBusinesses.length === 0 ? (
                    <p className="text-gray-500 text-sm">Nenhuma empresa em destaque.</p>
                  ) : (
                    featuredBusinesses.map((empresa, idx) => (
                      <Link
                        key={empresa.id || idx}
                        href={`/guia/${empresa.id}`}
                        className="flex items-center gap-3 group"
                      >
                        <div className="relative w-12 h-12 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center border border-gray-100">
                          {empresa.image ? (
                            <Image
                              src={empresa.image}
                              alt={empresa.name}
                              fill
                              className="object-contain p-1"
                            />
                          ) : (
                            <span className="text-[10px] font-bold text-gray-400">LOGO</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                            {empresa.name}
                          </p>
                          <p className="text-xs text-indigo-600 font-semibold truncate">
                            {empresa.category}
                          </p>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            </aside>
            
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { params } = context
  const id = params?.id as string

  try {
    const supabase = createServerSupabaseClient(context)

    // Buscar o evento atual
    const { data: evento, error } = await supabase
      .from('eventos')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !evento) {
      return {
        props: {
          evento: null,
          upcomingEvents: [],
          featuredBusinesses: []
        }
      }
    }

    // Buscar próximos eventos (excluindo o atual)
    const { data: upcomingEvents } = await supabase
      .from('eventos')
      .select('*')
      .neq('id', id)
      .gte('data_hora', new Date().toISOString())
      .order('data_hora', { ascending: true })
      .limit(4)

    // Buscar empresas em destaque
    const { data: featuredData } = await supabase
      .from('empresas')
      .select('id, name, category, image')
      .eq('featured', true)
      .eq('ativo', true)
      .limit(3)

    return {
      props: {
        evento,
        upcomingEvents: upcomingEvents || [],
        featuredBusinesses: featuredData || []
      }
    }
  } catch (error) {
    console.error('Erro ao buscar dados do evento:', error)
    return {
      props: {
        evento: null,
        upcomingEvents: [],
        featuredBusinesses: []
      }
    }
  }
}

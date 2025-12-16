import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import { GetServerSideProps } from 'next'
import Header from '../../components/Header'
import Nav from '../../components/Nav'
import Footer from '../../components/Footer'
import BannerCarousel from '../../components/BannerCarousel'
import { createServerSupabaseClient, Evento } from '../../lib/supabase'
import { Calendar, MapPin, Clock, ChevronLeft, ChevronRight, Search, Filter } from 'lucide-react'

interface EventosPageProps {
  eventos: Evento[]
  categorias: string[]
}

export default function EventosPage({ eventos, categorias }: EventosPageProps) {
  const [filtroCategoria, setFiltroCategoria] = useState('Todos')
  const [buscaTexto, setBuscaTexto] = useState('')
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const timerRef = useRef<number | null>(null)

  // Eventos em destaque para o hero (primeiros 5)
  const eventosDestaque = eventos.slice(0, 5)

  // Filtrar eventos
  const eventosFiltrados = eventos.filter(evento => {
    const matchCategoria = filtroCategoria === 'Todos' || evento.tipo === filtroCategoria
    const matchBusca = evento.titulo.toLowerCase().includes(buscaTexto.toLowerCase()) ||
      evento.local?.toLowerCase().includes(buscaTexto.toLowerCase())
    return matchCategoria && matchBusca
  })

  // Auto-rotação do hero
  useEffect(() => {
    if (eventosDestaque.length <= 1 || isPaused) return

    timerRef.current = window.setInterval(() => {
      setCurrentHeroIndex(prev => (prev + 1) % eventosDestaque.length)
    }, 6000)

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current)
    }
  }, [eventosDestaque.length, isPaused])

  const goToPreviousHero = () => {
    setCurrentHeroIndex(prev => prev === 0 ? eventosDestaque.length - 1 : prev - 1)
  }

  const goToNextHero = () => {
    setCurrentHeroIndex(prev => (prev + 1) % eventosDestaque.length)
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

  const currentHeroEvent = eventosDestaque[currentHeroIndex]

  return (
    <>
      <Head>
        <title>Eventos - Portal Maria Helena</title>
        <meta name="description" content="Confira os próximos eventos em Maria Helena. Shows, festas, feiras e muito mais." />
      </Head>

      <Header />
      <Nav />

      <main className="min-h-screen bg-gray-50">

        {/* Hero Carrossel Full-Width */}
        {eventosDestaque.length > 0 && currentHeroEvent && (
          <section
            className="relative h-[50vh] md:h-[60vh] lg:h-[70vh] overflow-hidden"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Background Image */}
            <div className="absolute inset-0">
              {currentHeroEvent.imagem ? (
                <Image
                  src={currentHeroEvent.imagem}
                  alt={currentHeroEvent.titulo}
                  fill
                  className="object-cover transition-all duration-700"
                  priority
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-indigo-600 to-purple-700" />
              )}
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
            </div>

            {/* Content */}
            <div className="relative h-full container mx-auto px-4 flex flex-col justify-end pb-12 md:pb-16">
              <div className="max-w-3xl">
                {/* Badge */}
                <span className="inline-block px-4 py-1.5 bg-indigo-600 text-white text-sm font-semibold rounded-full mb-4">
                  {currentHeroEvent.tipo || 'Evento'}
                </span>

                {/* Title */}
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                  {currentHeroEvent.titulo}
                </h1>

                {/* Info */}
                <div className="flex flex-wrap items-center gap-4 md:gap-6 text-white/90 mb-6">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    <span>{getDateParts(currentHeroEvent.data_hora).full}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    <span>{getDateParts(currentHeroEvent.data_hora).time}</span>
                  </div>
                  {currentHeroEvent.local && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      <span>{currentHeroEvent.local}</span>
                    </div>
                  )}
                </div>

                {/* CTA */}
                <Link
                  href={`/eventos`}
                  className="inline-flex items-center px-6 py-3 bg-white text-indigo-600 font-semibold rounded-full hover:bg-indigo-50 transition-colors"
                >
                  Ver Detalhes
                </Link>
              </div>
            </div>

            {/* Navigation Arrows */}
            {eventosDestaque.length > 1 && (
              <>
                <button
                  onClick={goToPreviousHero}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm p-3 rounded-full transition-colors"
                  aria-label="Evento anterior"
                >
                  <ChevronLeft className="w-6 h-6 text-white" />
                </button>
                <button
                  onClick={goToNextHero}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm p-3 rounded-full transition-colors"
                  aria-label="Próximo evento"
                >
                  <ChevronRight className="w-6 h-6 text-white" />
                </button>
              </>
            )}

            {/* Indicators */}
            {eventosDestaque.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                {eventosDestaque.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentHeroIndex(index)}
                    className={`h-2 rounded-full transition-all ${index === currentHeroIndex
                      ? 'w-8 bg-white'
                      : 'w-2 bg-white/50 hover:bg-white/70'
                      }`}
                    aria-label={`Ir para evento ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Filtros */}
        <section className="py-6 bg-white border-b sticky top-0 z-20">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Categorias */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFiltroCategoria('Todos')}
                  className={`px-4 py-2 rounded-full font-medium transition-colors ${filtroCategoria === 'Todos'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  Todos
                </button>
                {categorias.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setFiltroCategoria(cat)}
                    className={`px-4 py-2 rounded-full font-medium transition-colors ${filtroCategoria === cat
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Busca */}
              <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar evento..."
                  value={buscaTexto}
                  onChange={e => setBuscaTexto(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Banner Topo - Condicional */}
        <div className="py-8">
          <BannerCarousel
            position="Banner Grande - Topo"
            local="eventos"
            interval={6000}
            autoRotate={true}
            maxBanners={5}
            className="container mx-auto px-4"
          />
        </div>

        {/* Conteúdo Principal com Sidebar */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-8">

              {/* Grid de Eventos */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {filtroCategoria === 'Todos' ? 'Todos os Eventos' : filtroCategoria}
                  </h2>
                  <span className="text-gray-500">
                    {eventosFiltrados.length} evento{eventosFiltrados.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {eventosFiltrados.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-2xl">
                    <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-xl font-semibold text-gray-500 mb-2">
                      Nenhum evento encontrado
                    </h3>
                    <p className="text-gray-400">
                      Tente ajustar os filtros ou a busca
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {eventosFiltrados.map(evento => (
                      <EventCard key={evento.id} evento={evento} />
                    ))}
                  </div>
                )}

                {/* Banner Meio - Condicional */}
                <div className="mt-8">
                  <BannerCarousel
                    position="Banner Grande - Meio"
                    local="eventos"
                    interval={6000}
                    autoRotate={true}
                    maxBanners={5}
                    className="rounded-xl"
                  />
                </div>
              </div>

              {/* Sidebar - só aparece se tiver banners */}
              <aside className="lg:w-80 space-y-6">
                {/* Banner Sidebar */}
                <BannerCarousel
                  position="Sidebar Direita"
                  local="eventos"
                  interval={5000}
                  autoRotate={true}
                  maxBanners={3}
                  className="rounded-xl"
                />

                {/* Mini Calendário ou Info */}
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-indigo-600" />
                    Próximos Eventos
                  </h3>
                  <div className="space-y-3">
                    {eventos.slice(0, 4).map(evento => {
                      const { day, month } = getDateParts(evento.data_hora)
                      return (
                        <Link
                          key={evento.id}
                          href="/eventos"
                          className="flex items-center gap-3 group"
                        >
                          <div className="flex-shrink-0 w-12 text-center">
                            <span className="block text-lg font-bold text-indigo-600">{day}</span>
                            <span className="block text-xs text-gray-500">{month}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                              {evento.titulo}
                            </p>
                            <p className="text-xs text-gray-500 truncate">{evento.local}</p>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </div>

                {/* Empresas em Destaque */}
                <EmpresasDestaque />
              </aside>
            </div>
          </div>
        </section>

        {/* Banner Final - Condicional */}
        <div className="container mx-auto px-4 pb-8">
          <BannerCarousel
            position="Banner Grande - Final"
            local="eventos"
            interval={5000}
            autoRotate={true}
            maxBanners={5}
            className="rounded-xl"
          />
        </div>

      </main>

      <Footer />
    </>
  )
}

/**
 * Card de Evento
 */
function EventCard({ evento }: { evento: Evento }) {
  const [imageError, setImageError] = useState(false)

  const getDateParts = (dateStr: string) => {
    const date = new Date(dateStr)
    return {
      day: date.getDate().toString().padStart(2, '0'),
      month: date.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase().replace('.', ''),
      fullDate: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    }
  }

  const { fullDate } = getDateParts(evento.data_hora)

  return (
    <Link
      href="/eventos"
      className="group block bg-white rounded-3xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden rounded-t-3xl">
        {!imageError && evento.imagem ? (
          <Image
            src={evento.imagem}
            alt={evento.titulo}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Calendar className="w-16 h-16 text-white/40" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Title */}
        <h3 className="font-bold text-gray-900 text-lg leading-tight line-clamp-2 group-hover:text-indigo-600 transition-colors mb-2">
          {evento.titulo}
        </h3>

        {/* Description */}
        {evento.descricao && (
          <p className="text-sm text-green-600 line-clamp-2 mb-3">
            {evento.descricao}
          </p>
        )}

        {/* Date */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
          <Calendar className="w-4 h-4" />
          <span>{fullDate}</span>
        </div>

        {/* Read More Link */}
        <span className="inline-flex items-center gap-1 text-indigo-600 font-semibold text-sm group-hover:gap-2 transition-all">
          Ler mais
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </span>
      </div>
    </Link>
  )
}

/**
 * Empresas em Destaque - Carrossel na sidebar
 */
function EmpresasDestaque() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [empresas, setEmpresas] = useState<any[]>([])

  useEffect(() => {
    // Buscar empresas em destaque
    fetch('/api/empresas?featured=true&limit=5')
      .then(res => res.json())
      .then(data => setEmpresas(data.empresas || []))
      .catch(() => setEmpresas([]))
  }, [])

  useEffect(() => {
    if (empresas.length <= 1) return
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % empresas.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [empresas.length])

  if (empresas.length === 0) return null

  const currentEmpresa = empresas[currentIndex]

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h3 className="font-bold text-gray-900 mb-4">
        Empresas em Destaque
      </h3>

      <Link
        href={`/guia/${currentEmpresa.id}`}
        className="block group"
      >
        {/* Logo/Imagem */}
        <div className="relative h-32 bg-gray-100 rounded-xl mb-3 overflow-hidden flex items-center justify-center">
          {currentEmpresa.image ? (
            <Image
              src={currentEmpresa.image}
              alt={currentEmpresa.name}
              fill
              className="object-contain p-4"
            />
          ) : (
            <span className="text-gray-400 text-sm">Logo</span>
          )}
        </div>

        {/* Info */}
        <h4 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
          {currentEmpresa.name}
        </h4>
        <p className="text-sm text-indigo-600">
          {currentEmpresa.category}
        </p>
      </Link>

      {/* Indicadores */}
      {empresas.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-4">
          {empresas.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${index === currentIndex
                ? 'bg-indigo-600'
                : 'bg-gray-300'
                }`}
              aria-label={`Empresa ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const supabase = createServerSupabaseClient()

    const { data: eventos, error } = await supabase
      .from('eventos')
      .select('*')
      .gte('data_hora', new Date().toISOString())
      .order('data_hora', { ascending: true })
      .limit(50)

    if (error) throw error

    // Extrair categorias únicas
    const categorias = Array.from(new Set(eventos?.map(e => e.tipo).filter(Boolean))) as string[]

    return {
      props: {
        eventos: eventos || [],
        categorias
      }
    }
  } catch (error) {
    return {
      props: {
        eventos: [],
        categorias: []
      }
    }
  }
}
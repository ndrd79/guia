import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Calendar, MapPin, Clock, ChevronLeft, ChevronRight } from 'lucide-react'
import { Evento } from '../lib/supabase'

interface EventsCarouselSectionProps {
    eventos: Evento[]
    title?: string
    className?: string
}

export default function EventsCarouselSection({
    eventos,
    title = "Próximos Eventos",
    className = ''
}: EventsCarouselSectionProps) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isPaused, setIsPaused] = useState(false)
    const timerRef = useRef<number | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    // Filtrar eventos futuros
    const displayEvents = eventos.filter(e => new Date(e.data_hora) >= new Date())

    // Cards visíveis por breakpoint
    const getVisibleCards = () => {
        if (typeof window === 'undefined') return 4
        if (window.innerWidth < 640) return 1
        if (window.innerWidth < 768) return 2
        if (window.innerWidth < 1280) return 3
        return 4
    }

    const [visibleCards, setVisibleCards] = useState(4)

    useEffect(() => {
        const handleResize = () => setVisibleCards(getVisibleCards())
        handleResize()
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    // Auto-rotação
    useEffect(() => {
        if (displayEvents.length <= visibleCards || isPaused) return

        timerRef.current = window.setInterval(() => {
            setCurrentIndex(prev => {
                const maxIndex = displayEvents.length - visibleCards
                return prev >= maxIndex ? 0 : prev + 1
            })
        }, 5000)

        return () => {
            if (timerRef.current) window.clearInterval(timerRef.current)
        }
    }, [displayEvents.length, visibleCards, isPaused])

    const goToPrevious = () => {
        setCurrentIndex(prev => prev === 0 ? displayEvents.length - visibleCards : prev - 1)
    }

    const goToNext = () => {
        setCurrentIndex(prev => {
            const maxIndex = displayEvents.length - visibleCards
            return prev >= maxIndex ? 0 : prev + 1
        })
    }

    if (displayEvents.length === 0) {
        return (
            <section className={`py-12 bg-gradient-to-b from-slate-50 to-white ${className}`}>
                <div className="container mx-auto px-4 text-center">
                    <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h2 className="text-2xl font-bold text-gray-400 mb-2">Nenhum evento próximo</h2>
                    <Link href="/eventos" className="text-indigo-600 hover:text-indigo-700 font-medium">
                        Ver histórico de eventos →
                    </Link>
                </div>
            </section>
        )
    }

    return (
        <section
            className={`py-12 bg-gradient-to-b from-slate-50 to-white ${className}`}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
                        <p className="text-gray-500 mt-1">Confira o que está acontecendo na cidade</p>
                    </div>
                    <Link
                        href="/eventos"
                        className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-full hover:bg-indigo-700 transition-colors"
                    >
                        Ver todos
                        <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>

                {/* Carousel Container */}
                <div className="relative">
                    {/* Navigation Arrows */}
                    {displayEvents.length > visibleCards && (
                        <>
                            <button
                                onClick={goToPrevious}
                                className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg hover:bg-gray-50 p-3 rounded-full transition-colors"
                                aria-label="Eventos anteriores"
                            >
                                <ChevronLeft className="w-5 h-5 text-gray-700" />
                            </button>
                            <button
                                onClick={goToNext}
                                className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg hover:bg-gray-50 p-3 rounded-full transition-colors"
                                aria-label="Próximos eventos"
                            >
                                <ChevronRight className="w-5 h-5 text-gray-700" />
                            </button>
                        </>
                    )}

                    {/* Cards Container */}
                    <div
                        ref={containerRef}
                        className="overflow-hidden"
                    >
                        <div
                            className="flex transition-transform duration-500 ease-out"
                            style={{
                                transform: `translateX(-${currentIndex * (100 / visibleCards)}%)`,
                            }}
                        >
                            {displayEvents.map((evento) => (
                                <div
                                    key={evento.id}
                                    className="flex-shrink-0 px-3"
                                    style={{ width: `${100 / visibleCards}%` }}
                                >
                                    <EventCard evento={evento} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Indicators (mobile) */}
                {displayEvents.length > visibleCards && (
                    <div className="flex justify-center gap-2 mt-6 sm:hidden">
                        {Array.from({ length: displayEvents.length - visibleCards + 1 }).map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentIndex(index)}
                                className={`h-2 rounded-full transition-all ${index === currentIndex
                                    ? 'w-6 bg-indigo-600'
                                    : 'w-2 bg-gray-300'
                                    }`}
                                aria-label={`Ir para slide ${index + 1}`}
                            />
                        ))}
                    </div>
                )}

                {/* Mobile CTA */}
                <div className="sm:hidden mt-6 text-center">
                    <Link
                        href="/eventos"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-full hover:bg-indigo-700 transition-colors"
                    >
                        Ver todos os eventos
                        <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </section>
    )
}

/**
 * Card individual de evento (estilo da referência)
 */
function EventCard({ evento }: { evento: Evento }) {
    const [imageError, setImageError] = useState(false)

    const getDateParts = (dateStr: string) => {
        const date = new Date(dateStr)
        return {
            day: date.getDate().toString().padStart(2, '0'),
            month: date.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase().replace('.', ''),
            weekday: date.toLocaleDateString('pt-BR', { weekday: 'short' }).toUpperCase().replace('.', ''),
            time: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        }
    }

    const { day, month, weekday, time } = getDateParts(evento.data_hora)

    return (
        <Link
            href={`/eventos`}
            className="group block bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
        >
            {/* Image */}
            <div className="relative h-40 overflow-hidden">
                {!imageError && evento.imagem ? (
                    <Image
                        src={evento.imagem}
                        alt={evento.titulo}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                        <Calendar className="w-16 h-16 text-white/40" />
                    </div>
                )}

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            {/* Content */}
            <div className="p-4">
                <div className="flex gap-4">
                    {/* Date Column */}
                    <div className="flex-shrink-0 text-center">
                        <span className="block text-xs font-semibold text-gray-500 uppercase">
                            {weekday}
                        </span>
                        <span className="block text-2xl font-bold text-indigo-600">
                            {day}
                        </span>
                        <span className="block text-xs font-semibold text-gray-500 uppercase">
                            {month}
                        </span>
                    </div>

                    {/* Info Column */}
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 text-base leading-tight line-clamp-2 group-hover:text-indigo-600 transition-colors">
                            {evento.titulo}
                        </h3>

                        <div className="mt-2 space-y-1">
                            {evento.local && (
                                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                    <MapPin className="w-4 h-4 flex-shrink-0" />
                                    <span className="truncate">{evento.local}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                <Clock className="w-4 h-4 flex-shrink-0" />
                                <span>{time}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    )
}

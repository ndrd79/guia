import React, { useState, useEffect, useMemo, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Calendar, MapPin, Clock, ChevronLeft, ChevronRight } from 'lucide-react'
import { Evento } from '../lib/supabase'

interface UpcomingEventsCarouselProps {
    eventos: Evento[]
    interval?: number
    autoRotate?: boolean
    maxEvents?: number
    className?: string
}

export default function UpcomingEventsCarousel({
    eventos,
    interval = 5000,
    autoRotate = true,
    maxEvents = 5,
    className = ''
}: UpcomingEventsCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isPaused, setIsPaused] = useState(false)
    const timerRef = useRef<number | null>(null)

    // Limitar eventos e filtrar futuros
    const displayEvents = useMemo(() => {
        const now = new Date()
        return eventos
            .filter(e => new Date(e.data_hora) >= now)
            .slice(0, maxEvents)
    }, [eventos, maxEvents])

    // Auto-rotação
    useEffect(() => {
        if (!autoRotate || displayEvents.length <= 1 || isPaused) return

        if (timerRef.current) {
            window.clearInterval(timerRef.current)
        }

        timerRef.current = window.setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % displayEvents.length)
        }, interval)

        return () => {
            if (timerRef.current) window.clearInterval(timerRef.current)
        }
    }, [autoRotate, interval, displayEvents.length, isPaused])

    const goToPrevious = () => {
        setCurrentIndex(prev =>
            prev === 0 ? displayEvents.length - 1 : prev - 1
        )
    }

    const goToNext = () => {
        setCurrentIndex(prev =>
            (prev + 1) % displayEvents.length
        )
    }

    const getDayMonth = (dateStr: string) => {
        const date = new Date(dateStr)
        return {
            day: date.getDate().toString().padStart(2, '0'),
            month: date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '').toUpperCase()
        }
    }

    const getHour = (dateStr: string) => {
        const date = new Date(dateStr)
        return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    }

    if (displayEvents.length === 0) {
        return (
            <div className={`bg-indigo-900/30 rounded-xl p-8 text-center ${className}`}>
                <Calendar className="w-12 h-12 mx-auto mb-3 text-indigo-400" />
                <p className="text-white/70">Nenhum evento próximo</p>
                <Link href="/eventos" className="text-indigo-400 hover:text-indigo-300 text-sm mt-2 inline-block">
                    Ver todos os eventos →
                </Link>
            </div>
        )
    }

    const currentEvent = displayEvents[currentIndex]
    const { day, month } = getDayMonth(currentEvent.data_hora)

    return (
        <div
            className={`relative overflow-hidden rounded-xl ${className}`}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-indigo-400" />
                    <h3 className="text-lg font-semibold text-white">Próximos Eventos</h3>
                </div>
                <Link
                    href="/eventos"
                    className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                    Ver todos →
                </Link>
            </div>

            {/* Main Carousel */}
            <div className="relative bg-gradient-to-br from-indigo-900/50 to-purple-900/50 rounded-xl overflow-hidden">
                {/* Event Image */}
                <div className="relative h-[200px] md:h-[280px]">
                    {currentEvent.imagem ? (
                        <Image
                            src={currentEvent.imagem}
                            alt={currentEvent.titulo}
                            fill
                            className="object-cover transition-all duration-700"
                            sizes="(max-width: 768px) 100vw, 600px"
                        />
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center">
                            <Calendar className="w-20 h-20 text-white/30" />
                        </div>
                    )}

                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                    {/* Date Badge */}
                    <div className="absolute top-4 left-4 bg-white rounded-lg px-3 py-2 text-center shadow-lg">
                        <span className="block text-2xl font-bold text-indigo-600">{day}</span>
                        <span className="block text-xs font-semibold text-gray-500 uppercase">{month}</span>
                    </div>

                    {/* Event Info */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                        <h4 className="text-xl md:text-2xl font-bold text-white mb-2 line-clamp-2">
                            {currentEvent.titulo}
                        </h4>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-white/80">
                            <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>{getHour(currentEvent.data_hora)}</span>
                            </div>
                            {currentEvent.local && (
                                <div className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4" />
                                    <span className="line-clamp-1">{currentEvent.local}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Navigation Arrows */}
                {displayEvents.length > 1 && (
                    <>
                        <button
                            onClick={goToPrevious}
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors z-10"
                            aria-label="Evento anterior"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                            onClick={goToNext}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors z-10"
                            aria-label="Próximo evento"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </>
                )}
            </div>

            {/* Indicators */}
            {displayEvents.length > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                    {displayEvents.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className={`h-2 rounded-full transition-all ${index === currentIndex
                                    ? 'w-6 bg-indigo-500'
                                    : 'w-2 bg-white/30 hover:bg-white/50'
                                }`}
                            aria-label={`Ir para evento ${index + 1}`}
                        />
                    ))}
                </div>
            )}

            {/* CTA Button */}
            <Link
                href="/eventos"
                className="block mt-4 text-center py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors"
            >
                Ver Detalhes do Evento
            </Link>
        </div>
    )
}

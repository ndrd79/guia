/**
 * PageBanner Component
 * 
 * Banner simples para exibir em páginas específicas.
 * Quando não há banners cadastrados para a posição, não exibe nada.
 */

import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { supabase, Banner } from '../lib/supabase'

interface PageBannerProps {
    posicao: string
    local?: string
    className?: string
    maxBanners?: number
}

export default function PageBanner({
    posicao,
    local,
    className = '',
    maxBanners = 1
}: PageBannerProps) {
    const [banners, setBanners] = useState<Banner[]>([])
    const [loading, setLoading] = useState(true)
    const [currentIndex, setCurrentIndex] = useState(0)

    // Funções de tracking definidas antes dos useEffects
    const trackImpression = useCallback(async (bannerId: string) => {
        try {
            await fetch('/api/analytics/banner-view', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ banner_id: bannerId }),
            })
        } catch {
            // Silently fail
        }
    }, [])

    const trackClick = useCallback(async (bannerId: string) => {
        try {
            await fetch('/api/analytics/banner-click', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ banner_id: bannerId }),
            })
        } catch {
            // Silently fail
        }
    }, [])

    // Fetch banners
    useEffect(() => {
        async function fetchBanners() {
            if (!supabase) {
                setLoading(false)
                return
            }

            try {
                let query = supabase
                    .from('banners')
                    .select('*')
                    .eq('posicao', posicao)
                    .eq('ativo', true)
                    .order('ordem', { ascending: true })
                    .limit(maxBanners)

                // Filtrar por local se especificado
                if (local) {
                    query = query.or(`local.eq.${local},local.eq.geral,local.is.null`)
                }

                const { data, error } = await query

                if (error) {
                    console.error('Erro ao carregar banners:', error)
                    setBanners([])
                } else {
                    // Filtrar banners dentro do período de agendamento
                    const validBanners = (data || []).filter((banner: Banner) => {
                        const dataInicio = banner.data_inicio ? new Date(banner.data_inicio) : null
                        const dataFim = banner.data_fim ? new Date(banner.data_fim) : null
                        const nowDate = new Date()

                        if (dataInicio && nowDate < dataInicio) return false
                        if (dataFim && nowDate > dataFim) return false
                        return true
                    })

                    setBanners(validBanners)
                }
            } catch (err) {
                console.error('Erro ao buscar banners:', err)
                setBanners([])
            } finally {
                setLoading(false)
            }
        }

        fetchBanners()
    }, [posicao, local, maxBanners])

    // Rotação automática se houver múltiplos banners
    useEffect(() => {
        if (banners.length <= 1) return

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % banners.length)
        }, 5000) // 5 segundos

        return () => clearInterval(interval)
    }, [banners.length])

    // Track impression quando banner muda
    useEffect(() => {
        if (banners.length > 0 && banners[currentIndex]?.id) {
            trackImpression(banners[currentIndex].id)
        }
    }, [currentIndex, banners, trackImpression])

    // Se está carregando ou não tem banners, não mostra nada
    if (loading || banners.length === 0) {
        return null
    }

    const currentBanner = banners[currentIndex]

    const bannerContent = (
        <div
            className={`relative overflow-hidden rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl ${className}`}
            style={{
                width: '100%',
                aspectRatio: `${currentBanner.largura}/${currentBanner.altura}`
            }}
        >
            <Image
                src={currentBanner.imagem}
                alt={currentBanner.nome || 'Banner'}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1170px"
                priority={false}
            />

            {/* Indicadores se múltiplos banners */}
            {banners.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {banners.map((_, index) => (
                        <button
                            key={index}
                            onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                setCurrentIndex(index)
                            }}
                            className={`w-2 h-2 rounded-full transition-all ${index === currentIndex
                                ? 'bg-white w-4'
                                : 'bg-white/50 hover:bg-white/75'
                                }`}
                            aria-label={`Banner ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    )

    // Se tem link, envolver com Link
    if (currentBanner.link) {
        return (
            <Link
                href={currentBanner.link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackClick(currentBanner.id)}
                className="block"
            >
                {bannerContent}
            </Link>
        )
    }

    return bannerContent
}


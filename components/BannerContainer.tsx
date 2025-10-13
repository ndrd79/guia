import React, { useRef, useEffect } from 'react'
import { useBanner } from '../hooks/useBanners'
import { useAnalytics } from '../hooks/useAnalytics'
import BannerAd from './BannerAd'

interface BannerContainerProps {
  position: string
  className?: string
  width?: number
  height?: number
  showPlaceholder?: boolean
  bannerType?: 'sidebar' | 'inline' | 'small' | 'custom'
}

const BannerContainer: React.FC<BannerContainerProps> = ({
  position,
  className = '',
  width,
  height,
  showPlaceholder = true,
  bannerType = 'custom'
}) => {
  const { banner, loading, error } = useBanner(position)
  const { trackImpression } = useAnalytics()
  const bannerRef = useRef<HTMLElement>(null)

  // Função para verificar se o banner está no período ativo
  const isBannerActive = (banner: any) => {
    if (!banner || !banner.ativo) return false

    const now = new Date()
    
    // Se não há agendamento, banner está ativo
    if (!banner.data_inicio && !banner.data_fim) {
      return true
    }

    // Verificar data de início
    if (banner.data_inicio) {
      const dataInicio = new Date(banner.data_inicio)
      if (now < dataInicio) {
        return false // Banner ainda não começou
      }
    }

    // Verificar data de fim
    if (banner.data_fim) {
      const dataFim = new Date(banner.data_fim)
      if (now > dataFim) {
        return false // Banner já expirou
      }
    }

    return true
  }

  // Definir dimensões padrão baseadas no tipo de banner
  const getDefaultDimensions = () => {
    switch (bannerType) {
      case 'sidebar':
        return { width: 300, height: 250 } // Aspect ratio 6:5
      case 'inline':
        return { width: 728, height: 90 } // Leaderboard
      case 'small':
        return { width: 320, height: 100 } // Small banner
      default:
        return { width: 400, height: 200 } // Default
    }
  }

  const defaultDimensions = getDefaultDimensions()
  const bannerWidth = width || banner?.largura || defaultDimensions.width
  const bannerHeight = height || banner?.altura || defaultDimensions.height

  // Intersection Observer para rastrear impressões
  useEffect(() => {
    if (!banner?.id || !bannerRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            // Banner está 50% visível, registrar impressão
            trackImpression(banner.id, position)
          }
        })
      },
      {
        threshold: 0.5, // Trigger quando 50% do banner estiver visível
        rootMargin: '0px'
      }
    )

    observer.observe(bannerRef.current)

    return () => {
      observer.disconnect()
    }
  }, [banner?.id, position, trackImpression])

  // Gerar aria-label descritivo
  const getAriaLabel = () => {
    if (banner?.nome) {
      return `Banner publicitário: ${banner.nome}`
    }
    return `Banner publicitário na posição ${position}`
  }

  // Se está carregando, mostra skeleton
  if (loading) {
    return (
      <aside 
        className={`banner-responsive banner-skeleton rounded-lg ${className}`}
        role="complementary"
        aria-label="Carregando banner publicitário"
      >
        <div className="h-full w-full flex items-center justify-center text-gray-500 min-h-[120px]">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-300 rounded-full animate-pulse"></div>
            <span className="text-xs sm:text-sm md:text-base opacity-70">Carregando...</span>
          </div>
        </div>
      </aside>
    )
  }

  // Se há erro e não deve mostrar placeholder, não renderiza nada
  if (error && !showPlaceholder) {
    return null
  }

  // Se não há banner e não deve mostrar placeholder, não renderiza nada
  if (!banner && !showPlaceholder) {
    return null
  }

  // Se o banner não está no período ativo, não renderiza nada
  if (banner && !isBannerActive(banner)) {
    return null
  }

  return (
    <aside 
      ref={bannerRef}
      className={`banner-responsive overflow-hidden ${className}`}
      role="complementary"
      aria-label={getAriaLabel()}
    >
      <BannerAd
        position={position}
        className="w-full h-full"
        width={bannerWidth}
        height={bannerHeight}
        imageUrl={banner?.imagem}
        linkUrl={banner?.link}
        altText={banner?.nome || `Banner ${position}`}
        title={banner?.nome}
        bannerId={banner?.id}
      />
    </aside>
  )
}

export default BannerContainer
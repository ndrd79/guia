import React from 'react'
import { useBanner } from '../hooks/useBanners'
import BannerAd from './BannerAd'

interface BannerContainerProps {
  position: string
  className?: string
  width?: number
  height?: number
  showPlaceholder?: boolean
}

const BannerContainer: React.FC<BannerContainerProps> = ({
  position,
  className = '',
  width,
  height,
  showPlaceholder = true
}) => {
  const { banner, loading, error } = useBanner(position)

  // Se está carregando, mostra skeleton
  if (loading) {
    return (
      <div className={`banner-responsive banner-skeleton rounded-lg ${className}`}>
        <div className="h-full w-full flex items-center justify-center text-gray-500 min-h-[120px]">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-300 rounded-full animate-pulse"></div>
            <span className="text-xs sm:text-sm md:text-base opacity-70">Carregando...</span>
          </div>
        </div>
      </div>
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

  return (
    <div className={`banner-responsive overflow-hidden ${className}`}>
      <BannerAd
        position={position}
        className="w-full h-full"
        width={width || banner?.largura || 400}
        height={height || banner?.altura || 200}
        imageUrl={banner?.imagem}
        linkUrl={banner?.link}
        altText={banner?.nome || `Banner ${position}`}
        title={banner?.nome}
      />
    </div>
  )
}

export default BannerContainer
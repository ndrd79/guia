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

  // Se está carregando, mostra placeholder
  if (loading) {
    return (
      <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`}>
        <div className="h-full w-full flex items-center justify-center text-gray-500">
          Carregando banner...
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
    <BannerAd
      position={position}
      className={className}
      width={width || banner?.largura || 400}
      height={height || banner?.altura || 200}
      imageUrl={banner?.imagem}
      linkUrl={banner?.link}
      altText={banner?.nome || `Banner ${position}`}
      title={banner?.nome}
    />
  )
}

export default BannerContainer
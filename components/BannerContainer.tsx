import React from 'react'
import OptimizedBanner, { useOptimizedBanners } from './OptimizedBanner'

interface BannerContainerProps {
  position: string
  local?: string
  className?: string
  maxBanners?: number
  priority?: boolean
  layout?: 'horizontal' | 'vertical' | 'grid'
  debug?: boolean
}

export default function BannerContainer({
  position,
  local,
  className = '',
  maxBanners = 1,
  priority = false,
  layout = 'vertical',
  debug = false
}: BannerContainerProps) {
  const { banners, loading, error } = useOptimizedBanners(position, local)

  if (loading) {
    return (
      <div className={`banner-container ${className}`}>
        <div className="animate-pulse bg-gray-200 rounded-lg h-24 w-full"></div>
      </div>
    )
  }

  if (error || !banners.length) {
    return null
  }

  const displayBanners = maxBanners && maxBanners > 0 ? banners.slice(0, maxBanners) : banners

  const getLayoutClasses = () => {
    switch (layout) {
      case 'horizontal':
        return 'flex flex-row gap-4 overflow-x-auto'
      case 'grid':
        return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
      default:
        return 'flex flex-col gap-4'
    }
  }

  return (
    <div className={`banner-container ${getLayoutClasses()} ${className}`}>
      {displayBanners.map((banner, index) => (
        <OptimizedBanner
          key={banner.id}
          banner={banner}
          position={position}
          priority={priority && index === 0}
          lazy={!priority || index > 0}
        />
      ))}
      {debug && (
        <div className="mt-2 p-2 text-xs rounded border border-blue-300 bg-blue-50">
          <div className="font-semibold text-blue-800">Debug Banner</div>
          <div>Posição: {position}</div>
          <div>Encontrados: {displayBanners.length}</div>
          <div>IDs: {displayBanners.map(b => b.id).join(', ')}</div>
          <div>Dimensões: {displayBanners.map(b => `${b.largura}x${b.altura}`).join(' | ')}</div>
        </div>
      )}
    </div>
  )
}

// Componentes específicos para posições estratégicas
export function HeaderBanner({ className = '' }: { className?: string }) {
  return (
    <BannerContainer
      position="header"
      className={`header-banner ${className}`}
      priority={true}
      maxBanners={1}
    />
  )
}

export function ContentBanner({ 
  position = 'content-top',
  className = '' 
}: { 
  position?: 'content-top' | 'content-middle' | 'content-bottom'
  className?: string 
}) {
  return (
    <BannerContainer
      position={position}
      className={`content-banner my-6 ${className}`}
      maxBanners={1}
    />
  )
}

export function SidebarBanner({ className = '' }: { className?: string }) {
  return (
    <BannerContainer
      position="sidebar"
      className={`sidebar-banner ${className}`}
      maxBanners={3}
      layout="vertical"
    />
  )
}

export function FooterBanner({ className = '' }: { className?: string }) {
  return (
    <BannerContainer
      position="footer"
      className={`footer-banner ${className}`}
      maxBanners={4}
      layout="grid"
    />
  )
}

export function MobileBanner({ className = '' }: { className?: string }) {
  return (
    <div className={`mobile-banner block md:hidden ${className}`}>
      <BannerContainer
        position="mobile"
        maxBanners={1}
        priority={true}
      />
    </div>
  )
}
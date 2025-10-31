import React from 'react'
import OptimizedBanner, { useOptimizedBanners } from './OptimizedBanner'

interface BannerContainerProps {
  position: string
  className?: string
  maxBanners?: number
  priority?: boolean
  layout?: 'horizontal' | 'vertical' | 'grid'
}

export default function BannerContainer({
  position,
  className = '',
  maxBanners = 1,
  priority = false,
  layout = 'vertical'
}: BannerContainerProps) {
  const { banners, loading, error } = useOptimizedBanners(position)

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

  const displayBanners = banners.slice(0, maxBanners)

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
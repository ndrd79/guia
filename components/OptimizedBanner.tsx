import React, { useState, useEffect, useRef, useCallback } from 'react'
import OptimizedImage from './OptimizedImage'
import Link from 'next/link'
import { useAnalytics } from '../hooks/useAnalytics'

interface BannerData {
  id: string
  nome: string
  imagem: string
  link?: string
  largura: number
  altura: number
  posicao: string
  ativo: boolean
  created_at: string
  updated_at: string
}

interface OptimizedBannerProps {
  banner: BannerData
  position: string
  className?: string
  priority?: boolean
  lazy?: boolean
  sizes?: string
}

// Tamanhos de banner suportados
export const BANNER_SIZES = {
  'leaderboard': { width: 728, height: 90 },
  'banner': { width: 468, height: 60 },
  'rectangle': { width: 300, height: 250 },
  'square': { width: 250, height: 250 },
  'mobile-banner': { width: 320, height: 50 },
  'small-rectangle': { width: 300, height: 100 },
  'skyscraper': { width: 160, height: 600 },
  'wide-skyscraper': { width: 300, height: 600 },
  // Novos tamanhos suportando layouts específicos
  'cta-half': { width: 585, height: 360 },
  'hero-large': { width: 1170, height: 330 }
} as const

export type BannerSize = keyof typeof BANNER_SIZES

// Schema markup para SEO
const generateBannerSchema = (banner: BannerData) => ({
  "@context": "https://schema.org",
  "@type": "Advertisement",
  "name": banner.nome,
  "description": banner.nome,
  "image": banner.imagem,
  "url": banner.link,
  "width": banner.largura,
  "height": banner.altura
})

export default function OptimizedBanner({
  banner,
  position,
  className = '',
  priority = false,
  lazy = true,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
}: OptimizedBannerProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const bannerRef = useRef<HTMLDivElement>(null)
  const { trackBannerView, trackBannerClick } = useAnalytics()

  // Intersection Observer para lazy loading
  useEffect(() => {
    if (!lazy || priority) {
      setIsVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.1
      }
    )

    if (bannerRef.current) {
      observer.observe(bannerRef.current)
    }

    return () => observer.disconnect()
  }, [lazy, priority])

  // Track banner view quando carregado
  useEffect(() => {
    if (isLoaded && isVisible) {
      trackBannerView(banner.id, position)
    }
  }, [isLoaded, isVisible, banner.id, position, trackBannerView])

  // Handle click tracking
  const handleClick = () => {
    trackBannerClick(banner.id, position, banner.link || '')
  }

  // Handle image load success
  const handleImageLoad = useCallback(() => {
    setIsLoaded(true)
    setHasError(false)
  }, [])

  // Handle image error with retry mechanism
  const handleImageError = useCallback(() => {
    console.warn(`Erro ao carregar imagem do banner: ${banner.nome}`)
    setHasError(true)
    setIsLoaded(false)
  }, [banner.nome])

  // Determinar o tamanho do banner
  const getBannerSize = (): BannerSize => {
    const { largura, altura } = banner
    
    // Encontrar o tamanho mais próximo
    for (const [size, dimensions] of Object.entries(BANNER_SIZES)) {
      if (dimensions.width === largura && dimensions.height === altura) {
        return size as BannerSize
      }
    }
    
    // Fallback para rectangle se não encontrar
    return 'rectangle'
  }

  const bannerSize = getBannerSize()
  const isSmallBanner = ['mobile-banner', 'small-rectangle', 'banner'].includes(bannerSize)

  // Classes CSS responsivas
  const getResponsiveClasses = () => {
    const baseClasses = 'relative overflow-hidden rounded-lg shadow-sm hover:shadow-md transition-all duration-300'
    if (position === 'sidebar') {
      return `${baseClasses} w-full aspect-square mx-auto`
    }
    
    switch (bannerSize) {
      case 'mobile-banner':
        return `${baseClasses} w-full max-w-[320px] h-auto mx-auto`
      case 'small-rectangle':
        return `${baseClasses} w-full max-w-[300px] h-auto mx-auto`
      case 'square':
        return `${baseClasses} w-full max-w-[250px] h-auto mx-auto`
      case 'rectangle':
        return `${baseClasses} w-full max-w-[300px] h-auto mx-auto`
      case 'leaderboard':
        return `${baseClasses} w-full max-w-[728px] h-auto mx-auto`
      case 'banner':
        return `${baseClasses} w-full max-w-[468px] h-auto mx-auto`
      case 'cta-half':
        return `${baseClasses} w-full max-w-[585px] max-h-[360px] mx-auto bg-transparent rounded-lg shadow-none p-0`
      case 'hero-large':
        return `${baseClasses} w-full h-auto mx-auto`
      default:
        return `${baseClasses} w-full mx-auto`
    }
  }

  // Placeholder enquanto carrega
  const Placeholder = () => (
    <div 
      className={`${getResponsiveClasses()} bg-gray-100 shadow-md animate-pulse flex items-center justify-center`}
      style={{ width: banner.largura, height: banner.altura }}
    >
      <div className="text-gray-400 text-sm">Carregando...</div>
    </div>
  )

  // Error fallback
  const ErrorFallback = () => (
    <div 
      className={`${getResponsiveClasses()} bg-gray-50 shadow-md flex items-center justify-center`}
      style={{ width: banner.largura, height: banner.altura }}
    >
      <div className="text-gray-400 text-xs text-center p-2">
        Banner indisponível
      </div>
    </div>
  )

  if (!banner.ativo) {
    return null
  }

  if (hasError) {
    return <ErrorFallback />
  }

  const BannerContent = () => (
    <div 
      ref={bannerRef}
      className={`${getResponsiveClasses()} ${className}`}
      style={{ 
        width: '100%',
        height: 'auto',
        maxWidth: '100%',
        aspectRatio: position === 'sidebar' ? '1 / 1' : `${banner.largura}/${banner.altura}`,
        position: 'relative',
        zIndex: 1
      }}
    >
      {/* Schema markup para SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateBannerSchema(banner))
        }}
      />
      
      {isVisible ? (
        <OptimizedImage
          src={banner.imagem}
          alt={banner.nome || 'Banner publicitário'}
          width={banner.largura}
          height={banner.altura}
          priority={priority}
          quality={92}
          sizes={`${banner.largura}px`}
          className={`w-full h-full ${position === 'sidebar' ? 'object-cover rounded-lg' : bannerSize === 'cta-half' ? 'object-cover rounded-lg drop-shadow-[0_8px_16px_rgba(255,255,255,0.25)]' : 'object-contain md:object-cover rounded-lg'}`}
          onLoad={handleImageLoad}
          onError={handleImageError}
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+Wq/Z"
          fallbackSrc="/images/placeholder-banner-600x300.svg"
          unoptimized={false}
        />
      ) : (
        <Placeholder />
      )}
      
      {/* Loading overlay */}
      {isVisible && !isLoaded && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
          <div className="text-gray-400 text-sm">Carregando...</div>
        </div>
      )}
    </div>
  )

  // Se tem link, envolver em Link component
  if (banner.link) {
    return (
      <Link 
        href={banner.link}
        onClick={handleClick}
        className="block hover:opacity-90 transition-opacity"
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Visitar ${banner.nome}`}
      >
        <BannerContent />
      </Link>
    )
  }

  return <BannerContent />
}

// Hook para carregar banners otimizados
export function useOptimizedBanners(position: string, local?: string) {
  const [banners, setBanners] = useState<BannerData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    let retryCount = 0
    const maxRetries = 2 // Reduced retries to prevent excessive requests

    const fetchBanners = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 8000) // Reduced timeout
        
        const params = new URLSearchParams({
          position: position,
          active: 'true',
          ...(local ? { local } : {})
        })
        const response = await fetch(
          `/api/banners?${params.toString()}`,
          { 
            signal: controller.signal,
            headers: {
              'Content-Type': 'application/json',
            },
            // Add cache control to prevent unnecessary requests
            cache: 'default'
          }
        )
        
        clearTimeout(timeoutId)
        
        if (!response.ok) {
          throw new Error(`Erro ao carregar banners: ${response.status}`)
        }
        
        const data = await response.json()
        
        if (isMounted) {
          setBanners(data.data || [])
          setError(null)
        }
      } catch (err) {
        if (!isMounted) return
        
        // Handle specific error types
        if (err instanceof Error) {
          if (err.name === 'AbortError') {
            // Don't retry on abort - likely component unmounted
            console.log(`Request aborted for position: ${position}`)
            return
          }
          
          if (err.message.includes('fetch') && retryCount < maxRetries) {
            retryCount++
            console.log(`Retry ${retryCount}/${maxRetries} for position: ${position}`)
            setTimeout(() => fetchBanners(), 1000 * retryCount)
            return
          }
        }
        
        // Silent fail for missing banners - this is normal
        console.log(`No banners found for position: ${position}`)
        setError(null)
        setBanners([])
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchBanners()

    return () => {
      isMounted = false
    }
  }, [position, local])

  return { banners, loading, error }
}

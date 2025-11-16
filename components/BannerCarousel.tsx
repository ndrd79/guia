import React, { useEffect, useMemo, useRef, useState } from 'react'
import OptimizedBanner from './OptimizedBanner'

interface BannerData {
  id: string
  nome: string
  posicao: string
  imagem: string
  link?: string
  largura?: number
  altura?: number
}

interface BannerCarouselProps {
  position: string
  local?: string
  interval?: number
  autoRotate?: boolean
  maxBanners?: number
  className?: string
}

export default function BannerCarousel({
  position,
  local,
  interval = 5000,
  autoRotate = true,
  maxBanners = 5,
  className = ''
}: BannerCarouselProps) {
  const [banners, setBanners] = useState<BannerData[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [prevIndex, setPrevIndex] = useState<number | null>(null)
  const [animating, setAnimating] = useState(false)
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    const load = async () => {
      try {
        const params = new URLSearchParams({
          position,
          active: 'true',
          ...(local ? { local } : {})
        })
        const res = await fetch(`/api/banners?${params.toString()}`)
        const json = await res.json()
        // Quando maxBanners <= 0, não limitar
        const itemsSource: BannerData[] = json?.data || []
        const items: BannerData[] = maxBanners && maxBanners > 0
          ? itemsSource.slice(0, maxBanners)
          : itemsSource
        setBanners(items)
      } catch (e) {
        console.warn('Falha ao carregar banners para carrossel:', e)
      }
    }
    load()
    return () => controller.abort()
  }, [position, local, maxBanners])

  const goToIndex = (i: number) => {
    if (i === currentIndex) return
    setPrevIndex(currentIndex)
    setCurrentIndex(i)
    setAnimating(true)
    window.setTimeout(() => {
      setAnimating(false)
      setPrevIndex(null)
    }, Math.max(300, Math.min(1200, interval * 0.4)))
  }

  useEffect(() => {
    if (!autoRotate || banners.length <= 1) return
    if (timerRef.current) {
      window.clearInterval(timerRef.current)
    }
    timerRef.current = window.setInterval(() => {
      const next = (currentIndex + 1) % banners.length
      goToIndex(next)
    }, Math.max(2000, interval))
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current)
    }
  }, [autoRotate, interval, banners.length, currentIndex])

  const currentBanner = useMemo(() => banners[currentIndex], [banners, currentIndex])
  const previousBanner = useMemo(() => (prevIndex !== null ? banners[prevIndex] : null), [banners, prevIndex])

  if (!banners.length) return null

  const ratio = currentBanner?.largura && currentBanner?.altura 
    ? `${currentBanner.largura}/${currentBanner.altura}` 
    : '1170/330'

  return (
    <div 
      className={`banner-carousel relative overflow-hidden ${className} max-h-[220px] sm:max-h-[250px] lg:max-h-[330px]`}
      style={{ height: 'auto', aspectRatio: ratio }}
    >
      <div className="absolute inset-0">
        {previousBanner && (
          <div className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${animating ? 'opacity-0' : 'opacity-0'}`}>
            <OptimizedBanner 
              banner={previousBanner as any}
              position={position}
              priority={false}
              lazy={false}
            />
          </div>
        )}
        {currentBanner && (
          <div className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${animating ? 'opacity-100' : 'opacity-100'}`}>
            <OptimizedBanner 
              banner={currentBanner as any}
              position={position}
              priority={true}
              lazy={false}
            />
          </div>
        )}
      </div>

      {banners.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
          {banners.map((b, i) => (
            <button
              key={b.id}
              aria-label={`Slide ${i + 1}`}
              className={`h-2 w-2 rounded-full ${i === currentIndex ? 'bg-white' : 'bg-white/50'}`}
              onClick={() => goToIndex(i)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

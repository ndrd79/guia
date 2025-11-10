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

  useEffect(() => {
    if (!autoRotate || banners.length <= 1) return
    if (timerRef.current) {
      window.clearInterval(timerRef.current)
    }
    timerRef.current = window.setInterval(() => {
      setCurrentIndex((idx) => (idx + 1) % banners.length)
    }, Math.max(2000, interval))
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current)
    }
  }, [autoRotate, interval, banners.length])

  const currentBanner = useMemo(() => banners[currentIndex], [banners, currentIndex])

  if (!banners.length) return null

  return (
    <div className={`banner-carousel relative overflow-hidden ${className}`}>
      <div className="relative w-full">
        {currentBanner && (
          <OptimizedBanner 
            banner={currentBanner as any}
            position={position}
            priority={true}
            lazy={false}
          />
        )}
      </div>

      {banners.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
          {banners.map((b, i) => (
            <button
              key={b.id}
              aria-label={`Slide ${i + 1}`}
              className={`h-2 w-2 rounded-full ${i === currentIndex ? 'bg-white' : 'bg-white/50'}`}
              onClick={() => setCurrentIndex(i)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
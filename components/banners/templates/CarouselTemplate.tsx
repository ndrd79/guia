/**
 * Carousel Template Component
 * 
 * Template de carrossel automático com rotação de banners
 */

import React, { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { BannerTemplateProps } from '../../../lib/banners/BannerTemplateRegistry'

export const CarouselTemplate: React.FC<BannerTemplateProps> = ({
    banners,
    config = {},
    responsive,
    onBannerClick,
    onBannerView
}) => {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isMobile, setIsMobile] = useState(false)
    const [isPaused, setIsPaused] = useState(false)

    const {
        interval = 5,
        max_banners = 4,
        indicators = true,
        auto_rotate = true,
        transition = 'slide'
    } = config

    // Limitar número de banners
    const displayBanners = banners.slice(0, max_banners)

    // Detectar mobile
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768)
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    // Auto-rotação
    useEffect(() => {
        if (!auto_rotate || displayBanners.length <= 1 || isPaused) return

        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % displayBanners.length)
        }, interval * 1000)

        return () => clearInterval(timer)
    }, [displayBanners.length, interval, auto_rotate, isPaused])

    // Tracking de visualizações
    useEffect(() => {
        if (displayBanners[currentIndex] && onBannerView) {
            onBannerView(displayBanners[currentIndex])
        }
    }, [currentIndex, displayBanners, onBannerView])

    const handleBannerClick = useCallback((banner: any) => {
        if (onBannerClick) {
            onBannerClick(banner)
        }
    }, [onBannerClick])

    const goToSlide = (index: number) => {
        setCurrentIndex(index)
    }

    const goToPrevious = () => {
        setCurrentIndex((prev) =>
            prev === 0 ? displayBanners.length - 1 : prev - 1
        )
    }

    const goToNext = () => {
        setCurrentIndex((prev) =>
            (prev + 1) % displayBanners.length
        )
    }

    if (displayBanners.length === 0) {
        return null
    }

    const dimensions = isMobile
        ? responsive.mobile || responsive.desktop
        : responsive.desktop

    const transitionClass = transition === 'fade'
        ? 'transition-opacity duration-500'
        : 'transition-transform duration-500 ease-in-out'

    return (
        <div
            className="relative w-full overflow-hidden rounded-lg banner-carousel"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            style={{
                maxWidth: dimensions.width,
                margin: '0 auto'
            }}
        >
            {/* Slides Container */}
            <div
                className="relative"
                style={{
                    height: dimensions.height,
                    aspectRatio: `${dimensions.width}/${dimensions.height}`
                }}
            >
                {transition === 'slide' ? (
                    // Slide transition
                    <div
                        className={`flex ${transitionClass}`}
                        style={{
                            transform: `translateX(-${currentIndex * 100}%)`,
                            height: '100%'
                        }}
                    >
                        {displayBanners.map((banner, index) => (
                            <div
                                key={banner.id || index}
                                className="w-full flex-shrink-0"
                                style={{ height: '100%' }}
                            >
                                <BannerSlide
                                    banner={banner}
                                    dimensions={dimensions}
                                    onClick={() => handleBannerClick(banner)}
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    // Fade transition
                    <>
                        {displayBanners.map((banner, index) => (
                            <div
                                key={banner.id || index}
                                className={`absolute inset-0 ${transitionClass} ${index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                                    }`}
                            >
                                <BannerSlide
                                    banner={banner}
                                    dimensions={dimensions}
                                    onClick={() => handleBannerClick(banner)}
                                />
                            </div>
                        ))}
                    </>
                )}
            </div>

            {/* Navigation Arrows */}
            {displayBanners.length > 1 && (
                <>
                    <button
                        onClick={goToPrevious}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors z-20"
                        aria-label="Banner anterior"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button
                        onClick={goToNext}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors z-20"
                        aria-label="Próximo banner"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </>
            )}

            {/* Indicators */}
            {indicators && displayBanners.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
                    {displayBanners.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={`w-3 h-3 rounded-full transition-all ${index === currentIndex
                                    ? 'bg-white scale-110'
                                    : 'bg-white/50 hover:bg-white/75'
                                }`}
                            aria-label={`Ir para o banner ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

/**
 * Componente individual de slide do banner
 */
const BannerSlide: React.FC<{
    banner: any
    dimensions: { width: number; height: number }
    onClick: () => void
}> = ({ banner, dimensions, onClick }) => {
    const [imageError, setImageError] = useState(false)

    const content = (
        <div className="relative w-full h-full bg-gray-100">
            {!imageError && banner.imagem ? (
                <Image
                    src={banner.imagem}
                    alt={banner.nome || 'Banner'}
                    fill
                    className="object-cover"
                    sizes={`${dimensions.width}px`}
                    priority
                    onError={() => setImageError(true)}
                />
            ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                    <div className="text-center">
                        <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-sm">Banner</p>
                    </div>
                </div>
            )}
        </div>
    )

    if (banner.link) {
        return (
            <a
                href={banner.link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onClick}
                className="block w-full h-full cursor-pointer hover:opacity-95 transition-opacity"
            >
                {content}
            </a>
        )
    }

    return content
}

export default CarouselTemplate

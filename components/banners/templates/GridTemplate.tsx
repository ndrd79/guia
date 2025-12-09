/**
 * Grid Template Component
 * 
 * Template para layout em grid de múltiplos banners
 */

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { BannerTemplateProps } from '../../../lib/banners/BannerTemplateRegistry'

export const GridTemplate: React.FC<BannerTemplateProps> = ({
    banners,
    config = {},
    responsive,
    onBannerClick,
    onBannerView
}) => {
    const [isMobile, setIsMobile] = useState(false)

    const {
        columns = 2,
        gap = 16,
        max_banners = 6,
        aspect_ratio = '16:9'
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

    // Tracking de visualizações
    useEffect(() => {
        displayBanners.forEach(banner => {
            if (onBannerView) {
                onBannerView(banner)
            }
        })
    }, [displayBanners, onBannerView])

    if (displayBanners.length === 0) {
        return null
    }

    const dimensions = isMobile
        ? responsive.mobile || responsive.desktop
        : responsive.desktop

    // Ajustar colunas para mobile
    const gridColumns = isMobile ? Math.min(columns, 2) : columns

    return (
        <div
            className="w-full banner-grid"
            style={{ maxWidth: dimensions.width, margin: '0 auto' }}
        >
            <div
                className="grid"
                style={{
                    gridTemplateColumns: `repeat(${gridColumns}, 1fr)`,
                    gap: `${gap}px`
                }}
            >
                {displayBanners.map((banner, index) => (
                    <GridItem
                        key={banner.id || index}
                        banner={banner}
                        aspectRatio={aspect_ratio}
                        onClick={() => onBannerClick && onBannerClick(banner)}
                    />
                ))}
            </div>
        </div>
    )
}

/**
 * Item individual do grid
 */
const GridItem: React.FC<{
    banner: any
    aspectRatio: string
    onClick: () => void
}> = ({ banner, aspectRatio, onClick }) => {
    const [imageError, setImageError] = useState(false)

    // Converter aspect ratio string para número
    const [width, height] = aspectRatio.split(':').map(Number)
    const aspectValue = width / height

    const content = (
        <div
            className="relative w-full bg-gray-100 rounded-lg overflow-hidden"
            style={{ aspectRatio: aspectValue }}
        >
            {!imageError && banner.imagem ? (
                <Image
                    src={banner.imagem}
                    alt={banner.nome || 'Banner'}
                    fill
                    className="object-cover transition-transform duration-300 hover:scale-105"
                    sizes="(max-width: 768px) 50vw, 33vw"
                    loading="lazy"
                    onError={() => setImageError(true)}
                />
            ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
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
                className="block cursor-pointer"
            >
                {content}
            </a>
        )
    }

    return content
}

export default GridTemplate

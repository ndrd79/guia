/**
 * Static Template Component
 * 
 * Template para banner estático único
 */

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { BannerTemplateProps } from '../../../lib/banners/BannerTemplateRegistry'

export const StaticTemplate: React.FC<BannerTemplateProps> = ({
    banners,
    config = {},
    responsive,
    onBannerClick,
    onBannerView
}) => {
    const [isMobile, setIsMobile] = useState(false)
    const [imageError, setImageError] = useState(false)

    const {
        clickable = true,
        lazy_load = true,
        show_border = false,
        sticky = false
    } = config

    // Pegar apenas o primeiro banner
    const banner = banners[0]

    // Detectar mobile
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768)
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    // Tracking de visualização
    useEffect(() => {
        if (banner && onBannerView) {
            onBannerView(banner)
        }
    }, [banner, onBannerView])

    if (!banner) {
        return null
    }

    const dimensions = isMobile
        ? responsive.mobile || responsive.desktop
        : responsive.desktop

    const handleClick = () => {
        if (clickable && onBannerClick) {
            onBannerClick(banner)
        }
    }

    const content = (
        <div
            className={`relative overflow-hidden rounded-lg ${show_border ? 'border border-gray-200' : ''} ${sticky ? 'sticky top-4' : ''}`}
            style={{
                maxWidth: dimensions.width,
                margin: '0 auto'
            }}
        >
            <div
                className="relative w-full bg-gray-100"
                style={{
                    aspectRatio: `${dimensions.width}/${dimensions.height}`
                }}
            >
                {!imageError && banner.imagem ? (
                    <Image
                        src={banner.imagem}
                        alt={banner.nome || 'Banner'}
                        fill
                        className="object-cover transition-transform duration-300 hover:scale-105"
                        sizes={`${dimensions.width}px`}
                        priority={!lazy_load}
                        loading={lazy_load ? 'lazy' : 'eager'}
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                        <div className="text-center">
                            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="text-sm">Banner</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )

    if (clickable && banner.link) {
        return (
            <a
                href={banner.link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleClick}
                className="block cursor-pointer"
            >
                {content}
            </a>
        )
    }

    return content
}

export default StaticTemplate

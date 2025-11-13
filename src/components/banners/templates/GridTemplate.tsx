"use client";
import React from 'react';
import Image from 'next/image';
import { TemplateProps } from '@/lib/banners/BannerTemplateRegistry';

export function GridTemplate({ banners, config, onBannerClick, deviceType }: TemplateProps) {
  const {
    columns = 2,
    gap = '16px',
    showTitles = true,
    dimensions = { width: 800, height: 400 }
  } = config;

  if (banners.length === 0) {
    return null;
  }

  // Ajustar número de colunas baseado no dispositivo
  const responsiveColumns = deviceType === 'mobile' ? 1 : columns;
  
  // Calcular dimensões dos itens do grid
  const itemWidth = Math.floor(dimensions.width / responsiveColumns);
  const itemHeight = Math.floor(dimensions.height / Math.ceil(banners.length / responsiveColumns));

  return (
    <div 
      className="grid w-full"
      style={{
        gridTemplateColumns: `repeat(${responsiveColumns}, 1fr)`,
        gap,
        width: dimensions.width,
        maxWidth: '100%'
      }}
    >
      {banners.map((banner: any, index: number) => (
        <div
          key={banner.id}
          className="relative group overflow-hidden rounded-lg bg-gray-100"
          style={{
            height: itemHeight,
            cursor: 'pointer'
          }}
          onClick={() => onBannerClick(banner)}
        >
          <Image
            src={banner.image_url}
            alt={banner.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes={`${itemWidth}w`}
            priority={index === 0}
          />
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
          
          {/* Title */}
          {showTitles && banner.title && (
            <div className="absolute bottom-2 left-2 right-2 text-white">
              <h4 className="text-sm font-medium drop-shadow-md line-clamp-2">
                {banner.title}
              </h4>
            </div>
          )}

          {/* Hover effect for desktop */}
          {deviceType !== 'mobile' && (
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          )}

          {/* Click indicator */}
          <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Ver agora
          </div>
        </div>
      ))}
    </div>
  );
}

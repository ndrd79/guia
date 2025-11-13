import React from 'react';
import Image from 'next/image';
import { TemplateProps } from '../BannerTemplateRegistry';

export function StaticTemplate({ banners, config, onBannerClick, deviceType }: TemplateProps) {
  const {
    showBorder = false,
    borderRadius = '8px',
    dimensions = { width: 800, height: 400 }
  } = config;

  if (banners.length === 0) {
    return null;
  }

  // Static template mostra apenas o primeiro banner
  const banner = banners[0];

  return (
    <div 
      className={`relative overflow-hidden ${
        showBorder ? 'border border-gray-200' : ''
      }`}
      style={{ 
        width: dimensions.width, 
        height: dimensions.height,
        maxWidth: '100%',
        borderRadius
      }}
    >
      <Image
        src={banner.image_url}
        alt={banner.title}
        fill
        className="object-cover cursor-pointer hover:opacity-95 transition-opacity"
        onClick={() => onBannerClick(banner)}
        sizes={`${dimensions.width}w`}
        priority
      />
      
      {/* Banner Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
      
      {/* Banner Title (optional) */}
      {banner.title && (
        <div className="absolute bottom-3 left-3 right-3 text-white">
          <h3 className="text-base font-medium drop-shadow-md">
            {banner.title}
          </h3>
        </div>
      )}

      {/* Click indicator for mobile */}
      {deviceType === 'mobile' && (
        <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded pointer-events-none">
          Toque para ver
        </div>
      )}
    </div>
  );
}
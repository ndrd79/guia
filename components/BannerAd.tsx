import React from 'react';
import Image from 'next/image';

interface BannerAdProps {
  position: string;
  className?: string;
  width?: number;
  height?: number;
  imageUrl?: string;
  linkUrl?: string;
  altText?: string;
  title?: string;
}

const BannerAd: React.FC<BannerAdProps> = ({
  position,
  className = '',
  width,
  height,
  imageUrl,
  linkUrl,
  altText = 'Banner Publicitário',
  title
}) => {
  // Se não há imagem, mostra o placeholder
  if (!imageUrl) {
    return (
      <div className={`ad-space banner-responsive ${className}`}>
        <span className="text-xs sm:text-sm md:text-base">
          [ESPAÇO PUBLICITÁRIO - {position.toUpperCase()}]
        </span>
      </div>
    );
  }

  const adContent = (
    <div className={`banner-responsive relative overflow-hidden rounded-lg banner-transition banner-hover ${className}`}>
      <Image
        src={imageUrl}
        alt={altText}
        width={width || 400}
        height={height || 200}
        className="w-full h-full object-cover transition-transform duration-500"
        style={{ maxWidth: '100%', height: 'auto' }}
        sizes="(max-width: 640px) 100vw, (max-width: 768px) 90vw, (max-width: 1024px) 50vw, 33vw"
        priority={position === 'header-top' || position === 'hero'}
        loading={position === 'header-top' || position === 'hero' ? "eager" : "lazy"}
      />
      {title && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 sm:p-3 md:p-4">
          <h3 className="text-white font-semibold text-xs sm:text-sm md:text-base truncate">{title}</h3>
        </div>
      )}
    </div>
  );

  // Se há link, envolve com link
  if (linkUrl) {
    return (
      <a 
        href={linkUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        className="block hover:opacity-90 transition-opacity"
      >
        {adContent}
      </a>
    );
  }

  return adContent;
};

export default BannerAd;
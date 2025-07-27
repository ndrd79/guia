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
      <div className={`ad-space ${className}`}>
        [ESPAÇO PUBLICITÁRIO - {position.toUpperCase()}]
      </div>
    );
  }

  const adContent = (
    <div className={`relative overflow-hidden rounded-lg ${className}`}>
      <Image
        src={imageUrl}
        alt={altText}
        width={width || 400}
        height={height || 200}
        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        priority={position === 'header-top'}
      />
      {title && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <h3 className="text-white font-semibold text-sm">{title}</h3>
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
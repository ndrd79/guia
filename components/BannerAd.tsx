import React, { useState } from 'react';
import Image from 'next/image';
import { useAnalytics } from '../hooks/useAnalytics';

interface BannerAdProps {
  position: string;
  className?: string;
  width?: number;
  height?: number;
  imageUrl?: string;
  linkUrl?: string;
  altText?: string;
  title?: string;
  bannerId?: string;
}

const BannerAd: React.FC<BannerAdProps> = ({
  position,
  className = '',
  width,
  height,
  imageUrl,
  linkUrl,
  altText = 'Banner Publicitário',
  title,
  bannerId
}) => {
  const { trackBannerClick } = useAnalytics();
  const [imageError, setImageError] = useState(false);

  const handleClick = () => {
    console.log('🖱️ Banner clicado!', {
      bannerId,
      position,
      title,
      linkUrl
    });
    
    if (bannerId && linkUrl) {
      console.log('📊 Enviando rastreamento de clique para:', bannerId);
      trackBannerClick(bannerId, position, linkUrl);
      
      // Feedback visual temporário
      const clickFeedback = document.createElement('div');
      clickFeedback.innerHTML = '✅ Clique registrado!';
      clickFeedback.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 8px 16px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        z-index: 9999;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease-out;
      `;
      
      // Adicionar animação CSS
      if (!document.querySelector('#click-feedback-styles')) {
        const style = document.createElement('style');
        style.id = 'click-feedback-styles';
        style.textContent = `
          @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
          }
        `;
        document.head.appendChild(style);
      }
      
      document.body.appendChild(clickFeedback);
      
      // Remover após 3 segundos
      setTimeout(() => {
        clickFeedback.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
          if (clickFeedback.parentNode) {
            clickFeedback.parentNode.removeChild(clickFeedback);
          }
        }, 300);
      }, 3000);
      
    } else {
      console.warn('⚠️ Banner clicado mas sem bannerId!');
    }
  };
  // Se não há imagem ou houve erro, mostra o placeholder
  if (!imageUrl || imageError) {
    return (
      <div 
        className={`ad-space banner-responsive ${className}`}
        role="img"
        aria-label="Espaço publicitário disponível"
        style={{ width: width || 400, height: height || 200 }}
      >
        <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100 rounded-lg">
          <div className="text-center">
            <i className="fas fa-ad text-2xl mb-2"></i>
            <p className="text-xs">Publicidade</p>
            {imageError && (
              <p className="text-xs text-red-400 mt-1">Imagem indisponível</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  const adContent = (
    <figure className={`banner-responsive relative overflow-hidden rounded-lg banner-transition banner-hover ${className}`}>
      <div className="relative w-full" style={{ aspectRatio: `${width || 400}/${height || 200}` }}>
        <Image
          src={imageUrl}
          alt={altText}
          fill
          className="object-contain md:object-cover transition-transform duration-500"
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 90vw, (max-width: 1024px) 50vw, 33vw"
          priority={position === 'header-top' || position === 'hero'}
          loading={position === 'header-top' || position === 'hero' ? "eager" : "lazy"}
          onError={() => {
            console.warn(`Erro ao carregar imagem do banner: ${imageUrl}`);
            setImageError(true);
          }}
        />
      </div>
      {title && (
        <figcaption className="sr-only">
          {title}
        </figcaption>
      )}
    </figure>
  );

  // Se há link, envolve com link
  if (linkUrl) {
    return (
      <a 
        href={linkUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        className="block hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded-lg"
        aria-label={`Abrir ${title || altText} em nova aba`}
        onClick={handleClick}
      >
        {adContent}
      </a>
    );
  }

  return adContent;
};

export default BannerAd;

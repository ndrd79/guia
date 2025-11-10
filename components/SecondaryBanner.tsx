import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Banner } from '../lib/supabase';

interface SecondaryBannerProps {
  banners: Banner[];
}

const SecondaryBanner: React.FC<SecondaryBannerProps> = ({ banners }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isClient, setIsClient] = useState(false);

  // 4 cores diferentes para os slides
  const slideColors = [
    'bg-gradient-to-br from-teal-500 to-teal-700',
    'bg-gradient-to-br from-pink-500 to-pink-700', 
    'bg-gradient-to-br from-indigo-500 to-indigo-700',
    'bg-gradient-to-br from-yellow-500 to-yellow-700'
  ];

  // Função para normalizar URLs removendo parâmetros desnecessários
  const normalizeUrl = (url: string): string => {
    if (!url) return '';
    
    // No servidor, retorna URL simples para evitar problemas de hidratação
    if (!isClient) {
      return url.split('?')[0] || '#';
    }
    
    try {
      const urlObj = new URL(url, window.location.origin);
      // Remove parâmetros específicos que causam problemas de hidratação
      urlObj.searchParams.delete('ide_webview_request_time');
      urlObj.searchParams.delete('_t');
      urlObj.searchParams.delete('timestamp');
      
      // Se a URL é relativa ao site atual, retorna apenas o pathname + search + hash
      if (urlObj.origin === window.location.origin) {
        return urlObj.pathname + urlObj.search + urlObj.hash;
      }
      
      return urlObj.toString();
    } catch (error) {
      // Se não conseguir fazer parse da URL, retorna a URL original limpa
      return url.split('?')[0];
    }
  };

  // Garantir renderização consistente entre servidor e cliente
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Auto-play functionality - só executa no cliente
  useEffect(() => {
    if (!isClient) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 4);
    }, 4000);

    return () => clearInterval(interval);
  }, [isClient]);

  // Pega o banner para o slide atual (se existir)
  const getCurrentBanner = (slideIndex: number) => {
    if (!banners || banners.length === 0) return null;
    return banners[slideIndex] || null;
  };

  // Função para obter o href normalizado
  const getBannerHref = (banner: Banner | null): string => {
    if (!banner || !banner.link) return '#';
    
    // No servidor, retorna uma URL simples para evitar problemas de hidratação
    if (!isClient) {
      return banner.link.split('?')[0] || '#';
    }
    
    // No cliente, normaliza a URL
    return normalizeUrl(banner.link);
  };

  return (
    <section className="py-4 sm:py-6 md:py-8 bg-white">
      <div className="banner-container">
        {/* Container do slide */}
        <div className="banner-responsive banner-secondary relative rounded-none sm:rounded-lg shadow-lg md:shadow-2xl banner-transition" style={{ overflow: 'visible' }}>
          {[0, 1, 2, 3].map((slideIndex) => {
            const banner = getCurrentBanner(slideIndex);
            const bannerHref = getBannerHref(banner);
            
            return (
              <div
                key={slideIndex}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                  slideIndex === currentSlide ? 'opacity-100' : 'opacity-0'
                }`}
              >
                {/* Renderizar com link apenas se o banner tem link válido */}
                {banner && banner.link && bannerHref !== '#' ? (
                  <Link href={bannerHref} className="block w-full h-full">
                    <div className="relative w-full h-full group cursor-pointer">
                      {banner.imagem ? (
                        <>
                          <Image
                            src={banner.imagem}
                            alt={banner.nome}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1170px"
                            priority={slideIndex === 0}
                            onError={(e) => {
                              console.error('Erro ao carregar banner:', banner.imagem);
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-20 transition-all duration-300"></div>
                        </>
                      ) : (
                        <div className={`${slideColors[slideIndex]} w-full h-full`}></div>
                      )}
                    </div>
                  </Link>
                ) : (
                  <div className="relative w-full h-full" style={{ overflow: 'visible' }}>
                    {banner && banner.imagem ? (
                      <>
                        <Image
                          src={banner.imagem}
                          alt={banner.nome}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1170px"
                          priority={slideIndex === 0}
                          onError={(e) => {
                            console.error('Erro ao carregar banner:', banner.imagem);
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
                      </>
                    ) : (
                      <div className={`${slideColors[slideIndex]} w-full h-full`}></div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default SecondaryBanner;
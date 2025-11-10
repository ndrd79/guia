import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Banner } from '../lib/supabase';

interface HeroBannerProps {
  banners: Banner[];
}

const HeroBanner: React.FC<HeroBannerProps> = ({ banners }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // 4 cores diferentes para os slides
  const slideColors = [
    'bg-gradient-to-br from-blue-500 to-blue-700',
    'bg-gradient-to-br from-green-500 to-green-700', 
    'bg-gradient-to-br from-purple-500 to-purple-700',
    'bg-gradient-to-br from-orange-500 to-orange-700'
  ];

  // Auto-play functionality com tempo configurável
  useEffect(() => {
    if (!banners || banners.length === 0) return;
    
    // Pega o tempo de exibição do banner atual ou usa 4 segundos como padrão
    const currentBanner = banners[currentSlide];
    const tempoExibicao = currentBanner?.tempo_exibicao || 4;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % Math.min(4, banners.length));
    }, tempoExibicao * 1000);

    return () => clearInterval(interval);
  }, [currentSlide, banners]);

  // Pega o banner para o slide atual (se existir)
  const getCurrentBanner = (slideIndex: number) => {
    if (!banners || banners.length === 0) return null;
    return banners[slideIndex] || null;
  };

  // Filtra banners válidos (com imagem ou cor de fundo)
  const validBanners = banners?.filter(banner => banner?.imagem || banner?.nome) || [];
  
  // Não renderiza nada se não houver banners válidos
  if (validBanners.length === 0) {
    return null;
  }

  return (
    <section className="py-2 sm:py-4 md:py-8 bg-gray-50">
      <div className="banner-container">
        {/* Container do slide - Altura responsiva */}
        <div className="banner-responsive banner-hero relative rounded-none sm:rounded-lg shadow-lg md:shadow-2xl banner-transition">
          {/* Slides de banners */}
          {validBanners.slice(0, 4).map((banner, slideIndex) => {
            
            return (
              <div
                key={slideIndex}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                  slideIndex === currentSlide ? 'opacity-100' : 'opacity-0'
                }`}
              >
                {banner && banner.link ? (
                  <Link href={banner.link} className="block w-full h-full">
                    <div className="relative w-full h-full group cursor-pointer">
                      {banner.imagem ? (
                        <>
                          <Image
                            src={banner.imagem}
                            alt={banner.nome}
                            fill
                            className="object-contain md:object-cover transition-transform duration-500 group-hover:scale-105"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1170px"
                            priority={slideIndex === 0}
                            loading={slideIndex === 0 ? "eager" : "lazy"}
                            placeholder="blur"
                            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+Rj5m4xbDLdpkZfVZGjjVmRZEjkjdGKOjKrKQQQQCCOQQetTnhKhPTvYfEfxjlMcuoLvM5nUl+dVnvJzLM7HqxPQD0AAA9AKAv/9k="
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
                  <div className="relative w-full h-full">
                    {banner && banner.imagem ? (
                      <>
                        <Image
                          src={banner.imagem}
                          alt={banner.nome}
                          fill
                          className="object-contain md:object-cover"
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

export default HeroBanner;
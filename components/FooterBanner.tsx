import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Banner } from '../lib/supabase';

interface FooterBannerProps {
  banners: Banner[];
}

const FooterBanner: React.FC<FooterBannerProps> = ({ banners }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // 4 cores diferentes para os slides
  const slideColors = [
    'bg-gradient-to-br from-red-500 to-red-700',
    'bg-gradient-to-br from-cyan-500 to-cyan-700', 
    'bg-gradient-to-br from-emerald-500 to-emerald-700',
    'bg-gradient-to-br from-violet-500 to-violet-700'
  ];

  // Auto-play functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 4);
    }, 4000); // Muda a cada 4 segundos

    return () => clearInterval(interval);
  }, []);

  // Pega o banner para o slide atual (se existir)
  const getCurrentBanner = (slideIndex: number) => {
    if (!banners || banners.length === 0) return null;
    return banners[slideIndex] || null;
  };

  return (
    <section className="py-4 sm:py-6 md:py-8 bg-gray-50">
      <div className="banner-container">
        {/* Container do slide */}
        <div className="banner-responsive banner-footer relative rounded-none sm:rounded-lg shadow-lg md:shadow-2xl banner-transition">
          {/* 4 Slides de cores diferentes */}
          {[0, 1, 2, 3].map((slideIndex) => {
            const banner = getCurrentBanner(slideIndex);
            
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
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            sizes="100vw"
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
                  <div className="relative w-full h-full">
                    {banner && banner.imagem ? (
                      <>
                        <Image
                          src={banner.imagem}
                          alt={banner.nome}
                          fill
                          className="object-cover"
                          sizes="100vw"
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

export default FooterBanner;
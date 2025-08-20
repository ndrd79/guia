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
    <section className="py-8 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Container do slide */}
        <div className="max-w-[1170px] mx-auto h-[330px] relative overflow-hidden rounded-lg shadow-2xl">
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
                      
                      {/* Conteúdo do Banner */}
                      <div className="absolute inset-0 flex items-center justify-center p-8">
                        <div className="text-center text-white max-w-2xl">
                          <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-4 drop-shadow-lg">
                            {banner.nome}
                          </h2>
                          <p className="text-lg md:text-xl mb-6 drop-shadow opacity-90">
                            Descubra mais sobre este anúncio
                          </p>
                          <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-full px-6 py-3 inline-block">
                            <span className="text-sm md:text-base font-medium">
                              Clique para saber mais
                            </span>
                          </div>
                        </div>
                      </div>
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
                    
                    {/* Conteúdo do Slide */}
                    <div className="absolute inset-0 flex items-center justify-center p-8">
                      <div className="text-center text-white max-w-2xl">
                        <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-4 drop-shadow-lg">
                          {banner ? banner.nome : `Slide ${slideIndex + 1}`}
                        </h2>
                        <p className="text-lg md:text-xl drop-shadow opacity-90">
                          {banner ? 'Descubra mais sobre este anúncio' : 'Conteúdo em destaque'}
                        </p>
                      </div>
                    </div>
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
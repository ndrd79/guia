import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Banner } from '../lib/supabase';

interface SecondaryBannerProps {
  banners: Banner[];
}

const SecondaryBanner: React.FC<SecondaryBannerProps> = ({ banners }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // 4 cores diferentes para os slides
  const slideColors = [
    'bg-gradient-to-br from-teal-500 to-teal-700',
    'bg-gradient-to-br from-pink-500 to-pink-700', 
    'bg-gradient-to-br from-indigo-500 to-indigo-700',
    'bg-gradient-to-br from-yellow-500 to-yellow-700'
  ];

  // Auto-play functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 4);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Pega o banner para o slide atual (se existir)
  const getCurrentBanner = (slideIndex: number) => {
    if (!banners || banners.length === 0) return null;
    return banners[slideIndex] || null;
  };

  return (
    <section className="py-4 md:py-8 bg-gray-50">
      <div className="container mx-auto px-2 md:px-4">
        {/* Container do slide - Altura responsiva */}
        <div className="max-w-[1170px] mx-auto h-[180px] sm:h-[220px] md:h-[280px] lg:h-[330px] relative overflow-hidden rounded-lg shadow-2xl">
          {/* Resto do código igual ao HeroBanner com as mesmas correções responsivas */}
          {[0, 1, 2, 3].map((slideIndex) => {
            const banner = getCurrentBanner(slideIndex);
            
            return (
              <div
                key={slideIndex}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                  slideIndex === currentSlide ? 'opacity-100' : 'opacity-0'
                }`}
              >
                {/* Aplicar as mesmas correções responsivas do HeroBanner */}
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
                      
                      {/* Conteúdo responsivo */}
                      <div className="absolute inset-0 flex items-center justify-center p-4 md:p-8">
                        <div className="text-center text-white max-w-2xl">
                          <h2 className="text-lg sm:text-xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-2 md:mb-4 drop-shadow-lg">
                            {banner.nome}
                          </h2>
                          <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-4 md:mb-6 drop-shadow opacity-90">
                            Descubra mais sobre este anúncio
                          </p>
                          <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-full px-4 py-2 md:px-6 md:py-3 inline-block">
                            <span className="text-xs sm:text-sm md:text-base font-medium">
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
                    
                    <div className="absolute inset-0 flex items-center justify-center p-4 md:p-8">
                      <div className="text-center text-white max-w-2xl">
                        <h2 className="text-lg sm:text-xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-2 md:mb-4 drop-shadow-lg">
                          {banner ? banner.nome : `Categorias ${slideIndex + 1}`}
                        </h2>
                        <p className="text-sm sm:text-base md:text-lg lg:text-xl drop-shadow opacity-90">
                          {banner ? 'Descubra mais sobre este anúncio' : 'Explore nossas categorias de negócios'}
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

export default SecondaryBanner;
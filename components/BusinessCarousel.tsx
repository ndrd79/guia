import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Empresa } from '../lib/supabase';

interface BusinessCarouselProps {
  businesses: Empresa[];
}

const BusinessCarousel: React.FC<BusinessCarouselProps> = ({ businesses }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || !businesses || businesses.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === businesses.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [businesses?.length, isAutoPlaying]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000); // Resume auto-play after 10s
  };

  const goToPrevious = () => {
    if (!businesses || businesses.length === 0) return;
    setCurrentIndex(currentIndex === 0 ? businesses.length - 1 : currentIndex - 1);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToNext = () => {
    if (!businesses || businesses.length === 0) return;
    setCurrentIndex(currentIndex === businesses.length - 1 ? 0 : currentIndex + 1);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const getVisibleBusinesses = () => {
    if (!businesses || businesses.length === 0) return [];
    
    const visibleCount = Math.min(4, businesses.length); // Show up to 4 businesses at a time
    const result = [];
    
    for (let i = 0; i < visibleCount; i++) {
      const index = (currentIndex + i) % businesses.length;
      result.push(businesses[index]);
    }
    
    return result;
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <i 
        key={i} 
        className={`fas fa-star${
          i < Math.floor(rating) ? '' : 
          i < rating ? '-half-alt' : ' far'
        } text-yellow-400`}
      ></i>
    ));
  };

  // Se não há empresas, não renderiza nada
  if (!businesses || businesses.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Nenhuma empresa em destaque no momento.</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Navigation Buttons - só mostra se há mais de 4 empresas */}
      {businesses.length > 4 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 z-10 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-indigo-50"
            aria-label="Empresa anterior"
          >
            <i className="fas fa-chevron-left text-indigo-600"></i>
          </button>
          
          <button
            onClick={goToNext}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 z-10 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-indigo-50"
            aria-label="Próxima empresa"
          >
            <i className="fas fa-chevron-right text-indigo-600"></i>
          </button>
        </>
      )}

      {/* Business Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {getVisibleBusinesses().map((business, index) => (
          <div 
            key={`${business.id}-${currentIndex}-${index}`} 
            className="bg-white rounded-xl shadow-md overflow-hidden card-hover transition-all duration-500 transform hover:scale-105"
          >
            <div className="relative h-48 overflow-hidden">
              {business.image ? (
                <Image
                  src={business.image}
                  alt={business.name}
                  fill
                  className="object-cover transition-transform duration-300 hover:scale-110"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  onError={(e) => {
                    console.error('Erro ao carregar imagem da empresa:', business.image);
                    // Fallback para imagem padrão
                    e.currentTarget.src = '/images/placeholder-business.jpg';
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <i className="fas fa-building text-gray-400 text-4xl"></i>
                </div>
              )}
              
              {/* Badges */}
              <div className="absolute top-2 right-2 flex flex-col gap-1">
                {business.featured && (
                  <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                    ⭐ Destaque
                  </div>
                )}
                {business.is_new && (
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                    🆕 Novo
                  </div>
                )}
              </div>
              
              {/* Category Badge */}
              <div className="absolute bottom-2 left-2">
                <span className="bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-full">
                  {business.category}
                </span>
              </div>
            </div>

            <div className="p-4">
              <h3 className="font-bold text-lg mb-2 text-gray-800 hover:text-indigo-600 transition-colors">
                {business.name}
              </h3>
              
              {/* Rating */}
              <div className="flex items-center mb-2">
                <div className="flex mr-2">
                  {renderStars(business.rating)}
                </div>
                <span className="text-gray-600 text-sm">({business.reviews})</span>
              </div>
              
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {business.description}
              </p>
              
              <div className="flex justify-between items-center">
                <span className="text-indigo-600 text-sm font-medium flex items-center">
                  <i className="fas fa-map-marker-alt mr-1"></i> 
                  {business.location}
                </span>
                <Link 
                  href={`/guia/${business.id}`} 
                  className="text-indigo-600 hover:text-indigo-800 text-sm font-medium hover:underline transition-colors"
                >
                  Ver detalhes
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Dots Indicator */}
      <div className="flex justify-center mt-6 space-x-2">
        {businesses.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentIndex 
                ? 'bg-indigo-600 scale-125' 
                : 'bg-gray-300 hover:bg-gray-400'
            }`}
            aria-label={`Ir para empresa ${index + 1}`}
          />
        ))}
      </div>

      {/* Auto-play indicator */}
      <div className="flex justify-center mt-2">
        <button
          onClick={() => setIsAutoPlaying(!isAutoPlaying)}
          className={`text-xs px-3 py-1 rounded-full transition-colors ${
            isAutoPlaying 
              ? 'bg-green-100 text-green-700 hover:bg-green-200' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <i className={`fas fa-${isAutoPlaying ? 'pause' : 'play'} mr-1`}></i>
          {isAutoPlaying ? 'Pausar' : 'Reproduzir'}
        </button>
      </div>
    </div>
  );
};

export default BusinessCarousel;
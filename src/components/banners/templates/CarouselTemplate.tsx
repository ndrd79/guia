import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { TemplateProps } from '../BannerTemplateRegistry';

export function CarouselTemplate({ banners, config, onBannerClick, deviceType }: TemplateProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const {
    rotationTime = 5000,
    showIndicators = true,
    showArrows = true,
    infiniteLoop = true,
    dimensions = { width: 800, height: 400 }
  } = config;

  // Auto-rotation logic
  useEffect(() => {
    if (!rotationTime || banners.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        if (infiniteLoop) {
          return (prev + 1) % banners.length;
        }
        return prev === banners.length - 1 ? 0 : prev + 1;
      });
    }, rotationTime);

    return () => clearInterval(interval);
  }, [rotationTime, banners.length, isPaused, infiniteLoop]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => {
      if (infiniteLoop) {
        return prev === 0 ? banners.length - 1 : prev - 1;
      }
      return Math.max(0, prev - 1);
    });
  };

  const goToNext = () => {
    setCurrentIndex((prev) => {
      if (infiniteLoop) {
        return (prev + 1) % banners.length;
      }
      return Math.min(banners.length - 1, prev + 1);
    });
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  if (banners.length === 0) {
    return null;
  }

  const currentBanner = banners[currentIndex];

  return (
    <div 
      className="relative w-full overflow-hidden rounded-lg bg-gray-100"
      style={{ 
        width: dimensions.width, 
        height: dimensions.height,
        maxWidth: '100%'
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Banner Image */}
      <div className="relative w-full h-full">
        <Image
          src={currentBanner.image_url}
          alt={currentBanner.title}
          fill
          className="object-cover cursor-pointer"
          onClick={() => onBannerClick(currentBanner)}
          sizes={`${dimensions.width}w`}
          priority={currentIndex === 0}
        />
        
        {/* Banner Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
        
        {/* Banner Title (optional) */}
        {currentBanner.title && (
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <h3 className="text-lg font-semibold drop-shadow-lg">
              {currentBanner.title}
            </h3>
          </div>
        )}
      </div>

      {/* Navigation Arrows */}
      {showArrows && banners.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
            aria-label="Banner anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
            aria-label="Próximo banner"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Indicators */}
      {showIndicators && banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex 
                  ? 'bg-white scale-125' 
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Ir para banner ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Banner Counter (for mobile) */}
      {deviceType === 'mobile' && banners.length > 1 && (
        <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
          {currentIndex + 1} / {banners.length}
        </div>
      )}
    </div>
  );
}
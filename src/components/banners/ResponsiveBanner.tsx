"use client";
import React, { useState, useEffect } from 'react';
import { BannerData, TemplateComponent, BannerTemplateConfig } from '@/lib/banners/BannerTemplateRegistry';
import { useDeviceType } from '@/hooks/useDeviceType';
import { getOptimizedImageUrl } from '@/lib/images';

interface ResponsiveBannerProps {
  banners: BannerData[];
  template: TemplateComponent;
  config: BannerTemplateConfig;
  onBannerClick: (banner: BannerData) => void;
  deviceType: 'desktop' | 'tablet' | 'mobile';
}

export function ResponsiveBanner({ 
  banners, 
  template: TemplateComponent, 
  config, 
  onBannerClick, 
  deviceType 
}: ResponsiveBannerProps) {
  const [optimizedImages, setOptimizedImages] = useState<Record<string, string>>({});

  // Filtrar banners baseado no dispositivo (se necessário)
  const filteredBanners = banners.filter(banner => {
    // Adicionar lógica de filtro se necessário
    // Por exemplo, banners específicos para mobile/desktop
    return true;
  });

  // Gerar imagens otimizadas para mobile quando necessário
  useEffect(() => {
    if (deviceType === 'mobile') {
      const generateOptimized = async () => {
        const newOptimized: Record<string, string> = {};
        for (const banner of filteredBanners) {
          if (banner.image_url && !banner.image_url_mobile) {
            newOptimized[banner.id] = getOptimizedImageUrl(banner.image_url, {
              width: 400,
              height: 200,
              format: 'webp',
              quality: 80,
              fit: 'cover'
            });
          }
        }
        setOptimizedImages(newOptimized);
      };
      generateOptimized();
    }
  }, [filteredBanners, deviceType]);

  // Ajustar configurações baseado no dispositivo
  const responsiveConfig = {
    ...config,
    // Ajustar dimensões para mobile se necessário
    dimensions: deviceType === 'mobile' && config.dimensions
      ? {
          width: Math.min(config.dimensions.width, 400), // Limitar largura mobile
          height: Math.round(config.dimensions.height * 0.6) // Reduzir altura proporcionalmente
        }
      : config.dimensions
  };

  // Substituir URLs de imagem pelas versões otimizadas quando disponíveis
  const processedBanners = filteredBanners.map(banner => ({
    ...banner,
    image_url: optimizedImages[banner.id] || banner.image_url
  }));

  return (
    <TemplateComponent
      banners={processedBanners}
      config={responsiveConfig}
      onBannerClick={onBannerClick}
      deviceType={deviceType}
    />
  );
}

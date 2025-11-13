import React from 'react';
import { TemplateProps } from '../BannerTemplateRegistry';

export function CustomTemplate({ banners, config, onBannerClick, deviceType }: TemplateProps) {
  const {
    customClass = '',
    customStyles = {},
    dimensions = { width: 800, height: 400 }
  } = config;

  if (banners.length === 0) {
    return null;
  }

  // Template customizável - renderiza HTML customizado
  return (
    <div 
      className={`custom-banner-template ${customClass}`}
      style={{
        width: dimensions.width,
        height: dimensions.height,
        maxWidth: '100%',
        ...customStyles
      }}
    >
      {/* Renderizar primeiro banner com comportamento customizável */}
      <div 
        className="w-full h-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
        onClick={() => onBannerClick(banners[0])}
      >
        <div className="text-center p-6">
          <h2 className="text-2xl font-bold mb-2">
            {banners[0].title || 'Banner Customizado'}
          </h2>
          <p className="text-lg opacity-90">
            Clique para explorar conteúdo exclusivo
          </p>
          <div className="mt-4 px-6 py-2 bg-white text-gray-800 rounded-full font-medium hover:bg-gray-100 transition-colors">
            Saiba mais
          </div>
        </div>
      </div>

      {/* Indicador de dispositivo para debugging */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
          {deviceType} - {banners.length} banner(s)
        </div>
      )}
    </div>
  );
}
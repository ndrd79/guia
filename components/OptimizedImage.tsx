import React, { useState, useCallback, useRef, useEffect } from 'react';
import Image from 'next/image';

interface OptimizedImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
  onError?: () => void;
  onLoad?: () => void;
  fallbackSrc?: string;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  quality?: number;
  unoptimized?: boolean;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  fill = false,
  width,
  height,
  className = '',
  sizes,
  priority = false,
  onError,
  onLoad,
  fallbackSrc,
  placeholder,
  blurDataURL,
  quality = 75,
  unoptimized = false,
}) => {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const retryCountRef = useRef(0);
  const maxRetries = 2;

  // Reset state when src changes
  useEffect(() => {
    setCurrentSrc(src);
    setHasError(false);
    setIsLoading(true);
    retryCountRef.current = 0;
  }, [src]);

  const handleImageError = useCallback(() => {
    console.warn(`🔄 Erro ao carregar imagem: ${currentSrc}`);
    
    // Try fallback first if available
    if (!hasError && fallbackSrc && currentSrc !== fallbackSrc) {
      console.log(`🔄 Tentando fallback: ${fallbackSrc}`);
      setCurrentSrc(fallbackSrc);
      setHasError(false);
      setIsLoading(false);
      return;
    }

    // All attempts failed - show placeholder immediately
    console.error(`❌ Falha definitiva ao carregar imagem: ${src}`);
    setHasError(true);
    setIsLoading(false);
    onError?.();
  }, [currentSrc, hasError, fallbackSrc, src, onError]);

  const handleImageLoad = useCallback(() => {
    console.log(`✅ Imagem carregada com sucesso: ${currentSrc}`);
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  }, [currentSrc, onLoad]);

  // Show placeholder while loading or on error
  if (hasError || !currentSrc) {
    const placeholderContent = (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
        <div className="text-gray-400 text-center">
          <i className="fas fa-image text-2xl mb-2"></i>
          <p className="text-xs">Imagem não disponível</p>
        </div>
      </div>
    );

    if (fill) {
      return <div className="absolute inset-0">{placeholderContent}</div>;
    }

    return (
      <div 
        style={{ width: width || 'auto', height: height || 'auto' }}
        className={className}
      >
        {placeholderContent}
      </div>
    );
  }

  const imageProps = {
    src: currentSrc,
    alt,
    className,
    onError: handleImageError,
    onLoad: handleImageLoad,
    quality,
    unoptimized,
    // Add loading strategy to prevent ERR_ABORTED
    loading: (priority ? 'eager' : 'lazy') as 'eager' | 'lazy',
    ...(priority && { priority: true }),
    ...(sizes && { sizes }),
    ...(placeholder && { placeholder }),
    ...(blurDataURL && { blurDataURL }),
  };

  if (fill) {
    return <Image {...imageProps} fill />;
  }

  return (
    <Image
      {...imageProps}
      width={width || 400}
      height={height || 300}
    />
  );
};

export default OptimizedImage;
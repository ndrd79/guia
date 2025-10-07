import { useState, useEffect, useRef } from 'react';

interface UseImageOptimizationProps {
  src: string;
  priority?: boolean;
  preload?: boolean;
}

interface UseImageOptimizationReturn {
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;
  imageRef: React.RefObject<HTMLImageElement>;
}

export const useImageOptimization = ({
  src,
  priority = false,
  preload = false
}: UseImageOptimizationProps): UseImageOptimizationReturn => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!src) {
      setIsLoading(false);
      setError('No image source provided');
      return;
    }

    setIsLoading(true);
    setError(null);
    setIsLoaded(false);

    // Preload da imagem se necessário
    if (priority || preload) {
      const img = new Image();
      
      img.onload = () => {
        setIsLoaded(true);
        setIsLoading(false);
      };
      
      img.onerror = () => {
        setError('Failed to load image');
        setIsLoading(false);
      };
      
      img.src = src;
    } else {
      // Para imagens não prioritárias, usar Intersection Observer
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const img = new Image();
              
              img.onload = () => {
                setIsLoaded(true);
                setIsLoading(false);
              };
              
              img.onerror = () => {
                setError('Failed to load image');
                setIsLoading(false);
              };
              
              img.src = src;
              observer.disconnect();
            }
          });
        },
        {
          rootMargin: '50px' // Começar a carregar 50px antes de aparecer
        }
      );

      if (imageRef.current) {
        observer.observe(imageRef.current);
      }

      return () => observer.disconnect();
    }
  }, [src, priority, preload]);

  return {
    isLoaded,
    isLoading,
    error,
    imageRef
  };
};

// Hook para otimização de múltiplas imagens (carrossel)
export const useCarouselImageOptimization = (images: string[], currentIndex: number) => {
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());

  useEffect(() => {
    // Preload da imagem atual e próximas 2
    const imagesToPreload = [
      currentIndex,
      (currentIndex + 1) % images.length,
      (currentIndex + 2) % images.length
    ];

    imagesToPreload.forEach((index) => {
      if (!loadedImages.has(index) && images[index]) {
        const img = new Image();
        img.onload = () => {
          setLoadedImages(prev => new Set(prev).add(index));
        };
        img.src = images[index];
      }
    });
  }, [currentIndex, images, loadedImages]);

  return {
    isImageLoaded: (index: number) => loadedImages.has(index)
  };
};
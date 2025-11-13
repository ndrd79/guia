export type CropOptions = {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
};

// Helper client-safe para gerar URL da API de otimização de imagens
export function getOptimizedImageUrl(
  originalUrl: string,
  options: CropOptions = {}
): string {
  const params = new URLSearchParams({
    url: originalUrl,
    width: String(options.width ?? 400),
    height: String(options.height ?? 200),
    quality: String(options.quality ?? 80),
    format: options.format ?? 'webp',
    fit: options.fit ?? 'cover',
  });

  return `/api/images/optimize?${params.toString()}`;
}
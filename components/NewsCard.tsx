import React from 'react';
import Link from 'next/link';
import OptimizedImage from './OptimizedImage';

interface NewsCardProps {
  id: string;
  title: string;
  excerpt: string;
  imageUrl?: string;
  category: string;
  publishedAt: string;
  views?: number;
  featured?: boolean;
  tall?: boolean;
  className?: string;
}

const NewsCard: React.FC<NewsCardProps> = ({
  id,
  title,
  excerpt,
  imageUrl,
  category,
  publishedAt,
  views,
  featured = false,
  tall = false,
  className = ''
}) => {
  // Debug: log dos dados recebidos
  console.log('🎯 NewsCard Props:', { id, title, excerpt, imageUrl, category, publishedAt, featured });

  if (featured) {
    return (
      <Link href={`/noticias/${id}`} className="block h-full">
        <div className={`relative overflow-hidden rounded-2xl bg-white ring-1 ring-gray-200 shadow-xl h-full min-h-[22rem] md:min-h-[24rem] group cursor-pointer transition duration-300 hover:shadow-2xl hover:-translate-y-0.5 ${className}`}>
          {/* Imagem de fundo para o card de destaque */}
          {imageUrl && (
            <div className="absolute inset-0">
              <OptimizedImage
                src={imageUrl}
                alt={title}
                fill
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                onError={() => console.error('❌ Erro ao carregar imagem de destaque:', imageUrl)}
                fallbackSrc="/images/news-placeholder.svg"
                quality={80}
              />
            </div>
          )}

          {/* Overlay elegante */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />

          {/* Conteúdo do card de destaque */}
          <div className="relative z-10 h-full flex flex-col justify-end p-0">
            <div className="m-4 md:m-6 bg-black/55 backdrop-blur-sm rounded-xl p-4 md:p-5 ring-1 ring-white/10 shadow-lg">
              <div className="mb-2">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 text-indigo-700 text-[11px] font-semibold shadow-sm">
                  <i className="fas fa-star text-[10px]"></i>
                  Destaque
                </span>
              </div>

              <h2 className="text-gray-50 text-2xl md:text-3xl font-bold tracking-tight leading-snug drop-shadow-sm line-clamp-2">
                {title || 'Título não disponível'}
              </h2>

              <p className="text-gray-100 mt-2 text-sm md:text-base leading-relaxed line-clamp-3">
                {excerpt || 'Descrição não disponível'}
              </p>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-4 text-gray-200 text-xs">
                  <span className="flex items-center">
                    <i className="far fa-calendar-alt mr-1"></i>
                    {publishedAt || 'Data não disponível'}
                  </span>
                  {views && (
                    <span className="flex items-center">
                      <i className="far fa-eye mr-1"></i>
                      {views}
                    </span>
                  )}
                </div>

                <div className="inline-flex items-center px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold shadow-sm hover:bg-indigo-500 transition">
                  Ler matéria
                  <i className="fas fa-arrow-right ml-2 text-xs"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Card normal (não destacado) com imagem
  return (
    <Link href={`/noticias/${id}`} className="block">
      <div className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden ${tall ? 'h-full' : 'h-80'} cursor-pointer hover:scale-105 flex flex-col ${className}`}>
        {/* Imagem do card normal */}
        {imageUrl && (
          <div className={`relative ${tall ? 'h-56 md:h-64' : 'h-48'} w-full`}>
            <OptimizedImage
              src={imageUrl}
              alt={title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              onError={() => console.error('❌ Erro ao carregar imagem do card:', imageUrl)}
              fallbackSrc="/images/news-placeholder.svg"
              quality={75}
            />
          </div>
        )}

        {/* Conteúdo do card normal */}
        <div className={`p-4 ${tall ? 'flex-1 flex flex-col justify-between' : 'h-32 flex flex-col justify-between'}`}>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm">
              {title || 'Título não disponível'}
            </h3>

            <p className="text-gray-600 text-xs mb-3 line-clamp-2">
              {excerpt || 'Descrição não disponível'}
            </p>
          </div>

          <div>
            <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
              <span className="flex items-center">
                <i className="far fa-calendar-alt mr-1"></i>
                {publishedAt || 'Data não disponível'}
              </span>

              {views && (
                <span className="flex items-center">
                  <i className="far fa-eye mr-1"></i>
                  {views}
                </span>
              )}
            </div>

            <div className="text-blue-600 text-xs font-medium">
              Ler mais →
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default NewsCard;
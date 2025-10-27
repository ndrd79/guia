import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface NewsCardProps {
  id: string;
  title: string;
  excerpt: string;
  imageUrl?: string;
  category: string;
  publishedAt: string;
  views?: number;
  featured?: boolean;
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
  className = ''
}) => {
  // Debug: log dos dados recebidos
  console.log('🎯 NewsCard Props:', { id, title, excerpt, imageUrl, category, publishedAt, featured });

  if (featured) {
    return (
      <Link href={`/noticias/${id}`} className="block">
        <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 text-white h-80 cursor-pointer hover:scale-105 transition-transform duration-300 ${className}`}>
          {/* Imagem de fundo para o card de destaque */}
          {imageUrl && (
            <div className="absolute inset-0">
              <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover opacity-30"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              onError={() => console.error('❌ Erro ao carregar imagem de destaque:', imageUrl)}
            />
            </div>
          )}
          
          {/* Conteúdo do card de destaque */}
          <div className="relative z-10 p-4 h-full flex flex-col justify-between">
            <div>
              <div className="mb-3">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-red-500 text-white">
                  ⭐ DESTAQUE
                </span>
              </div>
              
              <h2 className="text-xl md:text-2xl font-bold mb-3 leading-tight line-clamp-3">
                {title || 'Título não disponível'}
              </h2>
              
              <p className="text-blue-100 mb-4 text-sm leading-relaxed line-clamp-3">
                {excerpt || 'Descrição não disponível'}
              </p>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 text-blue-200 text-xs">
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
              
              <div className="inline-flex items-center px-3 py-2 bg-white text-blue-600 rounded-lg text-sm font-semibold">
                Ler mais
                <i className="fas fa-arrow-right ml-1 text-xs"></i>
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
      <div className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden h-80 cursor-pointer hover:scale-105 ${className}`}>
        {/* Imagem do card normal */}
        {imageUrl && (
          <div className="relative h-48 w-full">
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              onError={() => console.error('❌ Erro ao carregar imagem do card:', imageUrl)}
            />
          </div>
        )}
        
        {/* Conteúdo do card normal */}
        <div className="p-4 h-32 flex flex-col justify-between">
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
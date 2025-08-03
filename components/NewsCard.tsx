import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatDate } from '../lib/formatters';

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


  const getCategoryColor = (cat: string) => {
    if (!cat) return 'bg-indigo-600';
    
    const colors: { [key: string]: string } = {
      'educacao': 'bg-blue-600',
      'economia': 'bg-green-600',
      'esportes': 'bg-yellow-600',
      'saude': 'bg-red-600',
      'cultura': 'bg-purple-600',
      'politica': 'bg-gray-600',
      'geral': 'bg-indigo-600'
    };
    return colors[cat.toLowerCase()] || 'bg-indigo-600';
  };

  if (featured) {
    return (
      <Link href={`/noticias/${id}`} className={`md:col-span-2 bg-gray-50 rounded-xl overflow-hidden shadow-md relative block hover:shadow-lg transition-shadow cursor-pointer ${className}`}>
        <div className="relative h-64 bg-gradient-to-r from-blue-600 to-blue-800 flex items-center justify-center">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover opacity-70"
              priority
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-800 opacity-70" />
          )}
          <div className="relative z-10 p-6 text-white">
            <div className="breaking-news mb-2">
              <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">DESTAQUE</span>
            </div>
            <h3 className="text-2xl font-bold mb-2">{title}</h3>
            <p className="mb-4">{excerpt}</p>
            <div className="flex items-center text-sm">
              <span><i className="far fa-calendar-alt mr-1"></i> {formatDate(publishedAt)}</span>
              {views && (
                <span className="ml-4"><i className="far fa-eye mr-1"></i> {views} visualizações</span>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/noticias/${id}`} className={`bg-white rounded-xl shadow-md overflow-hidden card-hover transition block hover:shadow-lg cursor-pointer ${className}`}>
      <div className="relative h-40 bg-gray-200">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <i className="fas fa-newspaper text-4xl text-gray-400"></i>
          </div>
        )}
        <div className={`absolute top-2 left-2 ${getCategoryColor(category)} text-white text-xs font-bold px-2 py-1 rounded`}>
          {category ? category.toUpperCase() : 'GERAL'}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg mb-2 line-clamp-2 hover:text-indigo-600 transition-colors">{title}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-3">{excerpt}</p>
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-500">
            <i className="far fa-calendar-alt mr-1"></i> {formatDate(publishedAt)}
          </span>
          <span className="text-indigo-600 font-medium">
            Ler mais
          </span>
        </div>
      </div>
    </Link>
  );
};

export default NewsCard;
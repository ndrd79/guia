import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatDate } from '../lib/formatters';

interface EventCardProps {
  id: string;
  titulo: string;
  descricao: string;
  imagem?: string;
  tipo: string;
  data_hora: string;
  local: string;
  featured?: boolean;
  className?: string;
}

const EventCard: React.FC<EventCardProps> = ({
  id,
  titulo,
  descricao,
  imagem,
  tipo,
  data_hora,
  local,
  featured = false,
  className = ''
}) => {
  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      day: date.getDate().toString().padStart(2, '0'),
      month: date.toLocaleDateString('pt-BR', { month: 'short' }),
      time: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const eventDate = formatEventDate(data_hora);

  if (featured) {
    return (
      <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-600 to-purple-800 text-white h-80 ${className}`}>
        {/* Imagem de fundo para o evento de destaque */}
        {imagem && (
          <div className="absolute inset-0">
            <Image
              src={imagem}
              alt={titulo}
              fill
              className="object-cover opacity-30"
              onError={() => console.error('❌ Erro ao carregar imagem do evento:', imagem)}
            />
          </div>
        )}
        
        {/* Conteúdo do evento de destaque */}
        <div className="relative z-10 p-4 h-full flex flex-col justify-between">
          <div>
            <div className="mb-3">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-yellow-500 text-black">
                ⭐ EVENTO DESTAQUE
              </span>
            </div>
            
            <h2 className="text-xl md:text-2xl font-bold mb-3 leading-tight line-clamp-3">
              {titulo || 'Título não disponível'}
            </h2>
            
            <p className="text-purple-100 mb-4 text-sm leading-relaxed line-clamp-3">
              {descricao || 'Descrição não disponível'}
            </p>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 text-purple-200 text-xs">
              <span className="flex items-center">
                <i className="far fa-calendar-alt mr-1"></i>
                {eventDate.day} {eventDate.month}
              </span>
              <span className="flex items-center">
                <i className="far fa-clock mr-1"></i>
                {eventDate.time}
              </span>
              <span className="flex items-center">
                <i className="fas fa-map-marker-alt mr-1"></i>
                {local}
              </span>
            </div>
            
            <Link 
              href={`/eventos/${id}`} 
              className="inline-flex items-center px-3 py-2 bg-white text-purple-600 rounded-lg text-sm font-semibold hover:bg-purple-50 transition-colors"
            >
              Ver detalhes
              <i className="fas fa-arrow-right ml-1 text-xs"></i>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Card normal (não destacado)
  return (
    <div className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden h-80 ${className}`}>
      {/* Imagem do evento normal */}
      {imagem && (
        <div className="relative h-48 w-full">
          <Image
            src={imagem}
            alt={titulo}
            fill
            className="object-cover"
            onError={() => console.error('❌ Erro ao carregar imagem do evento:', imagem)}
          />
        </div>
      )}
      
      {/* Conteúdo do evento normal */}
      <div className="p-4 h-32 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
              {tipo}
            </span>
            <div className="text-right text-xs text-gray-500">
              <div className="font-bold text-lg text-purple-600">{eventDate.day}</div>
              <div className="text-xs">{eventDate.month}</div>
            </div>
          </div>
          
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm">
            {titulo || 'Título não disponível'}
          </h3>
        </div>
        
        <div>
          <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
            <span className="flex items-center">
              <i className="far fa-clock mr-1"></i>
              {eventDate.time}
            </span>
            
            <span className="flex items-center">
              <i className="fas fa-map-marker-alt mr-1"></i>
              {local}
            </span>
          </div>
          
          <Link 
            href={`/eventos/${id}`} 
            className="text-purple-600 hover:text-purple-800 text-xs font-medium hover:underline"
          >
            Ver detalhes →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
import { useState } from 'react'
import { X, Edit, Globe } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import CategoryBadge from './CategoryBadge'
import { Noticia } from '../../lib/supabase'

interface PreviewModalProps {
  news: Noticia | null
  isOpen: boolean
  onClose: () => void
  onEdit?: () => void
  onPublish?: () => void
}

export default function PreviewModal({ news, isOpen, onClose, onEdit, onPublish }: PreviewModalProps) {
  if (!isOpen || !news) return null

  const formattedDate = format(new Date(news.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Globe size={20} className="text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Pré-visualização da Notícia</h2>
          </div>
          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                onClick={onEdit}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                <Edit size={16} />
                Editar
              </button>
            )}
            {onPublish && (
              <button
                onClick={onPublish}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
              >
                <Globe size={16} />
                Publicar
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="p-6">
            {/* News Preview Content */}
            <article className="max-w-3xl mx-auto">
              {/* Category and Date */}
              <div className="flex items-center gap-4 mb-4">
                <CategoryBadge category={news.categoria} isDestaque={news.destaque} />
                <span className="text-sm text-gray-500">{formattedDate}</span>
              </div>

              {/* Title */}
              <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
                {news.titulo}
              </h1>

              {/* Description */}
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                {news.descricao}
              </p>

              {/* Featured Image */}
              {news.imagem && (
                <div className="mb-6">
                  <img
                    src={news.imagem}
                    alt={news.titulo}
                    className="w-full h-64 object-cover rounded-lg shadow-sm"
                  />
                </div>
              )}

              {/* Content */}
              <div className="prose prose-lg max-w-none">
                <div 
                  className="text-gray-800 leading-relaxed whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: news.conteudo.replace(/\n/g, '<br>') }}
                />
              </div>

              {/* Footer */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Portal Maria Helena</span>
                  <span>Publicado em {formattedDate}</span>
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>
    </div>
  )
}
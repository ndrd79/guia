import { useState } from 'react'
import { ArrowUp, ArrowDown } from 'lucide-react'
import { Noticia } from '../../lib/supabase'
import CategoryBadge from './CategoryBadge'
import ActionButtons from './ActionButtons'
import StatusIndicator from './StatusIndicator'
import RelativeDate from './RelativeDate'

interface ModernTableProps {
  noticias: Noticia[]
  onEdit: (noticia: Noticia) => void
  onDelete: (id: string) => void
  onToggleFeature: (noticia: Noticia) => void
  onView: (noticia: Noticia) => void
  onToggleStatus?: (noticia: Noticia) => void
  onPreview?: (noticia: Noticia) => void
}

type SortField = 'titulo' | 'categoria' | 'data'
type SortDirection = 'asc' | 'desc'

export default function ModernTable({
  noticias,
  onEdit,
  onDelete,
  onToggleFeature,
  onView,
  onToggleStatus,
  onPreview
}: ModernTableProps) {
  const [sortField, setSortField] = useState<SortField>('data')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [hoveredRow, setHoveredRow] = useState<string | null>(null)

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const sortedNoticias = [...noticias].sort((a, b) => {
    let aValue: string | number
    let bValue: string | number

    switch (sortField) {
      case 'titulo':
        aValue = a.titulo.toLowerCase()
        bValue = b.titulo.toLowerCase()
        break
      case 'categoria':
        aValue = a.categoria.toLowerCase()
        bValue = b.categoria.toLowerCase()
        break
      case 'data':
        aValue = new Date(a.data).getTime()
        bValue = new Date(b.data).getTime()
        break
      default:
        return 0
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <th 
      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        <div className="flex flex-col">
          <ArrowUp 
            className={`h-3 w-3 ${sortField === field && sortDirection === 'asc' ? 'text-blue-600' : 'text-gray-300'}`} 
          />
          <ArrowDown 
            className={`h-3 w-3 -mt-1 ${sortField === field && sortDirection === 'desc' ? 'text-blue-600' : 'text-gray-300'}`} 
          />
        </div>
      </div>
    </th>
  )

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900">Lista de Notícias</h3>
        <p className="text-sm text-gray-600 mt-1">
          Gerencie todas as notícias do portal
        </p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <SortableHeader field="titulo">Título</SortableHeader>
              <SortableHeader field="categoria">Categoria</SortableHeader>
              <SortableHeader field="data">Data</SortableHeader>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedNoticias.map((noticia, index) => (
              <tr 
                key={noticia.id}
                className={`transition-colors duration-200 hover:bg-gray-50 ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                }`}
                onMouseEnter={() => setHoveredRow(noticia.id)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {noticia.imagem && (
                      <img
                        className="h-12 w-12 rounded-lg object-cover mr-4 shadow-sm"
                        src={noticia.imagem}
                        alt={noticia.titulo}
                      />
                    )}
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {noticia.titulo}
                      </div>
                      <div className="text-sm text-gray-500">
                        {noticia.descricao.substring(0, 60)}...
                      </div>
                    </div>
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <CategoryBadge 
                    category={noticia.categoria} 
                    isDestaque={noticia.destaque}
                  />
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <RelativeDate date={noticia.data} />
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusIndicator 
                    isPublished={!noticia.isDraft}
                    onClick={onToggleStatus ? () => onToggleStatus(noticia) : undefined}
                  />
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <ActionButtons
                    onEdit={() => onEdit(noticia)}
                    onDelete={() => onDelete(noticia.id)}
                    onToggleFeature={() => onToggleFeature(noticia)}
                    onView={() => onView(noticia)}
                    onPreview={onPreview ? () => onPreview(noticia) : undefined}
                    isVisible={hoveredRow === noticia.id}
                    isFeatured={noticia.destaque}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
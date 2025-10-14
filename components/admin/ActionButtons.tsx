import { Edit, Trash2, Star, Eye, Globe } from 'lucide-react'

interface ActionButtonsProps {
  onEdit: () => void
  onDelete: () => void
  onToggleFeature: () => void
  onView: () => void
  onPreview?: () => void
  isVisible: boolean
  isFeatured?: boolean
}

export default function ActionButtons({
  onEdit,
  onDelete,
  onToggleFeature,
  onView,
  onPreview,
  isVisible,
  isFeatured = false
}: ActionButtonsProps) {
  return (
    <div className={`flex space-x-2 transition-opacity duration-200 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <button
        onClick={onEdit}
        className="p-1 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded transition-colors duration-200"
        title="Editar notícia"
      >
        <Edit className="h-4 w-4" />
      </button>
      
      <button
        onClick={onDelete}
        className="p-1 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors duration-200"
        title="Excluir notícia"
      >
        <Trash2 className="h-4 w-4" />
      </button>
      
      <button
        onClick={onToggleFeature}
        className={`p-1 rounded transition-colors duration-200 ${
          isFeatured 
            ? 'text-yellow-600 hover:text-yellow-900 hover:bg-yellow-50' 
            : 'text-gray-400 hover:text-yellow-600 hover:bg-yellow-50'
        }`}
        title={isFeatured ? "Remover destaque" : "Marcar como destaque"}
      >
        <Star className={`h-4 w-4 ${isFeatured ? 'fill-current' : ''}`} />
      </button>
      
      {onPreview && (
        <button
          onClick={onPreview}
          className="p-1 text-purple-600 hover:text-purple-900 hover:bg-purple-50 rounded transition-colors duration-200"
          title="Pré-visualizar notícia"
        >
          <Globe className="h-4 w-4" />
        </button>
      )}
      
      <button
        onClick={onView}
        className="p-1 text-green-600 hover:text-green-900 hover:bg-green-50 rounded transition-colors duration-200"
        title="Visualizar no site"
      >
        <Eye className="h-4 w-4" />
      </button>
    </div>
  )
}
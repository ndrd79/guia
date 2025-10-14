import { Star } from 'lucide-react'

interface CategoryBadgeProps {
  category: string
  isDestaque?: boolean
}

const categoryColors: Record<string, string> = {
  'Política': 'bg-blue-500 text-white', // #3B82F6
  'Esportes': 'bg-green-500 text-white', // #10B981
  'Saúde': 'bg-purple-500 text-white', // #8B5CF6
  'Economia': 'bg-indigo-500 text-white',
  'Cultura': 'bg-pink-500 text-white',
  'Educação': 'bg-teal-500 text-white',
  'Tecnologia': 'bg-gray-500 text-white',
  'Entretenimento': 'bg-orange-500 text-white',
  'Segurança': 'bg-red-600 text-white',
  'Meio Ambiente': 'bg-green-700 text-white',
  'Turismo': 'bg-sky-400 text-white',
  'Agronegócios': 'bg-amber-700 text-white',
  'Trânsito': 'bg-yellow-600 text-white',
  'Eventos': 'bg-violet-400 text-white',
  'Infraestrutura': 'bg-gray-700 text-white',
  'Assistência Social': 'bg-rose-400 text-white',
  'Justiça': 'bg-blue-800 text-white',
  'Clima': 'bg-cyan-400 text-white',
  'Negócios': 'bg-emerald-600 text-white',
  'Gastronomia': 'bg-orange-600 text-white',
}

export default function CategoryBadge({ category, isDestaque }: CategoryBadgeProps) {
  if (isDestaque) {
    return (
      <div className="flex items-center space-x-1">
        <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-yellow-500 text-white">
          <Star className="h-3 w-3 mr-1" />
          Destaque
        </span>
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${categoryColors[category] || 'bg-gray-500 text-white'}`}>
          {category}
        </span>
      </div>
    )
  }

  return (
    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${categoryColors[category] || 'bg-gray-500 text-white'}`}>
      {category}
    </span>
  )
}
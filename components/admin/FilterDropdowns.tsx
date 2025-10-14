import { Filter, ChevronDown, Calendar } from 'lucide-react'

interface FilterDropdownsProps {
  categories: string[]
  selectedCategory: string
  selectedStatus: string
  dateStart: string
  dateEnd: string
  onCategoryChange: (category: string) => void
  onStatusChange: (status: string) => void
  onDateStartChange: (date: string) => void
  onDateEndChange: (date: string) => void
}

export default function FilterDropdowns({
  categories,
  selectedCategory,
  selectedStatus,
  dateStart,
  dateEnd,
  onCategoryChange,
  onStatusChange,
  onDateStartChange,
  onDateEndChange
}: FilterDropdownsProps) {
  return (
    <div className="flex flex-wrap gap-4 items-center">
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <Filter className="h-4 w-4" />
        <span>Filtros:</span>
      </div>
      
      {/* Category Filter */}
      <div className="relative">
        <select
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Todas as categorias</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
      </div>

      {/* Status Filter */}
      <div className="relative">
        <select
          value={selectedStatus}
          onChange={(e) => onStatusChange(e.target.value)}
          className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Todos os status</option>
          <option value="destaque">Destaque</option>
          <option value="normal">Normal</option>
        </select>
        <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
      </div>

      {/* Date Range Filters */}
      <div className="flex items-center space-x-2">
        <Calendar className="h-4 w-4 text-gray-400" />
        <input
          type="date"
          value={dateStart}
          onChange={(e) => onDateStartChange(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Data inicial"
        />
        <span className="text-gray-400">até</span>
        <input
          type="date"
          value={dateEnd}
          onChange={(e) => onDateEndChange(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Data final"
        />
      </div>
    </div>
  )
}
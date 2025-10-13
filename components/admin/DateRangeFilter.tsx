import { useState } from 'react'
import { Calendar, ChevronDown } from 'lucide-react'
import { format, subDays, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface DateRange {
  start: Date
  end: Date
}

interface DateRangeFilterProps {
  value: DateRange
  onChange: (range: DateRange) => void
  presets?: boolean
  className?: string
}

const PRESET_RANGES = [
  {
    label: 'Hoje',
    getValue: () => ({
      start: new Date(),
      end: new Date()
    })
  },
  {
    label: 'Últimos 7 dias',
    getValue: () => ({
      start: subDays(new Date(), 6),
      end: new Date()
    })
  },
  {
    label: 'Últimos 30 dias',
    getValue: () => ({
      start: subDays(new Date(), 29),
      end: new Date()
    })
  },
  {
    label: 'Este mês',
    getValue: () => ({
      start: startOfMonth(new Date()),
      end: endOfMonth(new Date())
    })
  },
  {
    label: 'Mês passado',
    getValue: () => {
      const lastMonth = subDays(startOfMonth(new Date()), 1)
      return {
        start: startOfMonth(lastMonth),
        end: endOfMonth(lastMonth)
      }
    }
  },
  {
    label: 'Este ano',
    getValue: () => ({
      start: startOfYear(new Date()),
      end: endOfYear(new Date())
    })
  }
]

export default function DateRangeFilter({
  value,
  onChange,
  presets = true,
  className = ''
}: DateRangeFilterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [customStart, setCustomStart] = useState(
    format(value.start, 'yyyy-MM-dd')
  )
  const [customEnd, setCustomEnd] = useState(
    format(value.end, 'yyyy-MM-dd')
  )

  const formatDateRange = (range: DateRange) => {
    const startStr = format(range.start, 'dd/MM/yyyy', { locale: ptBR })
    const endStr = format(range.end, 'dd/MM/yyyy', { locale: ptBR })
    
    if (startStr === endStr) {
      return startStr
    }
    
    return `${startStr} - ${endStr}`
  }

  const handlePresetSelect = (preset: typeof PRESET_RANGES[0]) => {
    const range = preset.getValue()
    onChange(range)
    setCustomStart(format(range.start, 'yyyy-MM-dd'))
    setCustomEnd(format(range.end, 'yyyy-MM-dd'))
    setIsOpen(false)
  }

  const handleCustomApply = () => {
    const start = new Date(customStart)
    const end = new Date(customEnd)
    
    if (start <= end) {
      onChange({ start, end })
      setIsOpen(false)
    }
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <Calendar className="h-4 w-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">
          {formatDateRange(value)}
        </span>
        <ChevronDown className="h-4 w-4 text-gray-500" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          {presets && (
            <div className="p-4 border-b border-gray-200">
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                Períodos predefinidos
              </h4>
              <div className="space-y-1">
                {PRESET_RANGES.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => handlePresetSelect(preset)}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">
              Período personalizado
            </h4>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Data inicial
                </label>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Data final
                </label>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex space-x-2 pt-2">
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex-1 px-3 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCustomApply}
                  className="flex-1 px-3 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Aplicar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
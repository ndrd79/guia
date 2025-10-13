import React, { useState, useEffect } from 'react'
import { Calendar, ChevronDown } from 'lucide-react'

export interface DateRange {
  startDate: string
  endDate: string
  period: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom'
}

interface DateRangeFilterProps {
  value: DateRange
  onChange: (range: DateRange) => void
  className?: string
}

const getDateRange = (period: DateRange['period'], currentValue?: DateRange): { startDate: string; endDate: string } => {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  
  switch (period) {
    case 'today':
      return {
        startDate: today.toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0]
      }
    
    case 'week':
      const weekStart = new Date(today)
      weekStart.setDate(today.getDate() - today.getDay())
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 6)
      return {
        startDate: weekStart.toISOString().split('T')[0],
        endDate: weekEnd.toISOString().split('T')[0]
      }
    
    case 'month':
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
      const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0)
      return {
        startDate: monthStart.toISOString().split('T')[0],
        endDate: monthEnd.toISOString().split('T')[0]
      }
    
    case 'quarter':
      const quarterStart = new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3, 1)
      const quarterEnd = new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3 + 3, 0)
      return {
        startDate: quarterStart.toISOString().split('T')[0],
        endDate: quarterEnd.toISOString().split('T')[0]
      }
    
    case 'year':
      const yearStart = new Date(today.getFullYear(), 0, 1)
      const yearEnd = new Date(today.getFullYear(), 11, 31)
      return {
        startDate: yearStart.toISOString().split('T')[0],
        endDate: yearEnd.toISOString().split('T')[0]
      }
    
    default:
      return {
        startDate: currentValue?.startDate || today.toISOString().split('T')[0],
        endDate: currentValue?.endDate || today.toISOString().split('T')[0]
      }
  }
}

const periodOptions = [
  { value: 'today', label: 'Hoje' },
  { value: 'week', label: 'Esta semana' },
  { value: 'month', label: 'Este mês' },
  { value: 'quarter', label: 'Este trimestre' },
  { value: 'year', label: 'Este ano' },
  { value: 'custom', label: 'Período personalizado' }
] as const

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  value,
  onChange,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [tempStartDate, setTempStartDate] = useState(value.startDate)
  const [tempEndDate, setTempEndDate] = useState(value.endDate)

  useEffect(() => {
    setTempStartDate(value.startDate)
    setTempEndDate(value.endDate)
  }, [value.startDate, value.endDate])

  const handlePeriodChange = (period: DateRange['period']) => {
    if (period === 'custom') {
      onChange({
        ...value,
        period,
        startDate: tempStartDate,
        endDate: tempEndDate
      })
    } else {
      const range = getDateRange(period, value)
      onChange({
        period,
        startDate: range.startDate,
        endDate: range.endDate
      })
    }
    setIsOpen(false)
  }

  const handleCustomDateChange = () => {
    onChange({
      ...value,
      period: 'custom',
      startDate: tempStartDate,
      endDate: tempEndDate
    })
  }

  const getCurrentLabel = () => {
    const option = periodOptions.find(opt => opt.value === value.period)
    if (option && value.period !== 'custom') {
      return option.label
    }
    
    if (value.period === 'custom') {
      const start = new Date(value.startDate).toLocaleDateString('pt-BR')
      const end = new Date(value.endDate).toLocaleDateString('pt-BR')
      return `${start} - ${end}`
    }
    
    return 'Selecionar período'
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
      >
        <div className="flex items-center">
          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
          <span className="text-gray-700">{getCurrentLabel()}</span>
        </div>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-80 bg-white border border-gray-200 rounded-md shadow-lg">
          <div className="p-4">
            <div className="space-y-2 mb-4">
              {periodOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handlePeriodChange(option.value)}
                  className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                    value.period === option.value
                      ? 'bg-orange-100 text-orange-800'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {value.period === 'custom' && (
              <div className="border-t pt-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Data inicial
                    </label>
                    <input
                      type="date"
                      value={tempStartDate}
                      onChange={(e) => setTempStartDate(e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Data final
                    </label>
                    <input
                      type="date"
                      value={tempEndDate}
                      onChange={(e) => setTempEndDate(e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                </div>
                <button
                  onClick={handleCustomDateChange}
                  className="w-full mt-3 px-3 py-2 text-sm font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  Aplicar período
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}

export default DateRangeFilter
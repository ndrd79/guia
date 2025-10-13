import React from 'react'
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string | number
  previousValue?: string | number
  icon: LucideIcon
  format?: 'number' | 'percentage' | 'currency'
  loading?: boolean
  color?: 'blue' | 'green' | 'orange' | 'red' | 'purple' | 'gray'
  description?: string
}

const formatValue = (value: string | number, format: string = 'number') => {
  if (typeof value === 'string') return value
  
  switch (format) {
    case 'percentage':
      return `${value.toFixed(2)}%`
    case 'currency':
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value)
    case 'number':
    default:
      if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M`
      }
      if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}K`
      }
      return value.toLocaleString('pt-BR')
  }
}

const calculateChange = (current: number, previous: number) => {
  if (previous === 0) return 0
  return ((current - previous) / previous) * 100
}

const getChangeIcon = (change: number) => {
  if (change > 0) return TrendingUp
  if (change < 0) return TrendingDown
  return Minus
}

const getChangeColor = (change: number) => {
  if (change > 0) return 'text-green-600'
  if (change < 0) return 'text-red-600'
  return 'text-gray-500'
}

const colorClasses = {
  blue: {
    bg: 'bg-blue-50',
    icon: 'text-blue-600',
    border: 'border-blue-200'
  },
  green: {
    bg: 'bg-green-50',
    icon: 'text-green-600',
    border: 'border-green-200'
  },
  orange: {
    bg: 'bg-orange-50',
    icon: 'text-orange-600',
    border: 'border-orange-200'
  },
  red: {
    bg: 'bg-red-50',
    icon: 'text-red-600',
    border: 'border-red-200'
  },
  purple: {
    bg: 'bg-purple-50',
    icon: 'text-purple-600',
    border: 'border-purple-200'
  },
  gray: {
    bg: 'bg-gray-50',
    icon: 'text-gray-600',
    border: 'border-gray-200'
  }
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  previousValue,
  icon: Icon,
  format = 'number',
  loading = false,
  color = 'blue',
  description
}) => {
  const colors = colorClasses[color]
  
  const currentValue = typeof value === 'number' ? value : parseFloat(value.toString()) || 0
  const prevValue = typeof previousValue === 'number' ? previousValue : parseFloat(previousValue?.toString() || '0') || 0
  
  const change = prevValue > 0 ? calculateChange(currentValue, prevValue) : 0
  const ChangeIcon = getChangeIcon(change)
  const changeColorClass = getChangeColor(change)

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        <div className="flex items-center">
          <div className={`p-2 rounded-md ${colors.bg} ${colors.border} border`}>
            <div className="h-6 w-6 bg-gray-300 rounded animate-pulse"></div>
          </div>
          <div className="ml-4 flex-1">
            <div className="h-4 bg-gray-300 rounded animate-pulse mb-2"></div>
            <div className="h-8 bg-gray-300 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center">
        <div className={`p-2 rounded-md ${colors.bg} ${colors.border} border`}>
          <Icon className={`h-6 w-6 ${colors.icon}`} />
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <div className="flex items-baseline">
            <p className="text-2xl font-semibold text-gray-900">
              {formatValue(value, format)}
            </p>
            {previousValue !== undefined && change !== 0 && (
              <div className={`ml-2 flex items-center text-sm ${changeColorClass}`}>
                <ChangeIcon className="h-4 w-4 mr-1" />
                <span>{Math.abs(change).toFixed(1)}%</span>
              </div>
            )}
          </div>
          {description && (
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default MetricCard
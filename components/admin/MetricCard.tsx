import { LucideIcon } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string | number
  change?: {
    value: number
    type: 'increase' | 'decrease' | 'neutral'
    period: string
  }
  icon: LucideIcon
  color?: 'blue' | 'green' | 'orange' | 'red' | 'purple'
  loading?: boolean
  format?: 'number' | 'percentage' | 'currency'
}

export default function MetricCard({
  title,
  value,
  change,
  icon: Icon,
  color = 'blue',
  loading = false,
  format = 'number'
}: MetricCardProps) {
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
    }
  }

  const formatValue = (val: string | number) => {
    if (typeof val === 'string') return val
    
    switch (format) {
      case 'percentage':
        return `${val.toFixed(1)}%`
      case 'currency':
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(val)
      default:
        return new Intl.NumberFormat('pt-BR').format(val)
    }
  }

  const getChangeColor = (type: 'increase' | 'decrease' | 'neutral') => {
    switch (type) {
      case 'increase':
        return 'text-green-600'
      case 'decrease':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getChangeIcon = (type: 'increase' | 'decrease' | 'neutral') => {
    switch (type) {
      case 'increase':
        return '↗'
      case 'decrease':
        return '↘'
      default:
        return '→'
    }
  }

  if (loading) {
    return (
      <div className={`bg-white rounded-lg border ${colorClasses[color].border} p-6 shadow-sm`}>
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
            <div className="h-8 bg-gray-200 rounded animate-pulse w-16"></div>
            <div className="h-3 bg-gray-200 rounded animate-pulse w-20"></div>
          </div>
          <div className={`p-3 rounded-lg ${colorClasses[color].bg}`}>
            <div className="h-6 w-6 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg border ${colorClasses[color].border} p-6 shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatValue(value)}
          </p>
          {change && (
            <div className={`flex items-center text-sm ${getChangeColor(change.type)}`}>
              <span className="mr-1">{getChangeIcon(change.type)}</span>
              <span className="font-medium">
                {Math.abs(change.value).toFixed(1)}%
              </span>
              <span className="text-gray-500 ml-1">vs {change.period}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color].bg}`}>
          <Icon className={`h-6 w-6 ${colorClasses[color].icon}`} />
        </div>
      </div>
    </div>
  )
}
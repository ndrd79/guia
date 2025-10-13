import { ReactNode } from 'react'
import { LucideIcon } from 'lucide-react'

interface ChartCardProps {
  title: string
  subtitle?: string
  children: ReactNode
  icon?: LucideIcon
  actions?: ReactNode
  loading?: boolean
  className?: string
  height?: number
}

export default function ChartCard({
  title,
  subtitle,
  children,
  icon: Icon,
  actions,
  loading = false,
  className = '',
  height = 300
}: ChartCardProps) {
  if (loading) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-5 bg-gray-200 rounded animate-pulse w-32"></div>
              {subtitle && <div className="h-4 bg-gray-200 rounded animate-pulse w-48"></div>}
            </div>
            {actions && <div className="h-8 bg-gray-200 rounded animate-pulse w-24"></div>}
          </div>
        </div>
        <div className="p-6">
          <div 
            className="bg-gray-100 rounded animate-pulse"
            style={{ height: `${height}px` }}
          ></div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow ${className}`}>
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {Icon && (
              <div className="p-2 bg-blue-50 rounded-lg">
                <Icon className="h-5 w-5 text-blue-600" />
              </div>
            )}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              {subtitle && (
                <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
              )}
            </div>
          </div>
          {actions && (
            <div className="flex items-center space-x-2">
              {actions}
            </div>
          )}
        </div>
      </div>
      <div className="p-6">
        <div style={{ height: `${height}px` }}>
          {children}
        </div>
      </div>
    </div>
  )
}
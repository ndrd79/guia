import { ReactNode } from 'react'

interface StatCardProps {
  title: string
  value: number
  icon: ReactNode
  color: 'blue' | 'gold' | 'green'
  description?: string
}

export default function StatCard({ title, value, icon, color, description }: StatCardProps) {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-50',
    gold: 'text-yellow-600 bg-yellow-50',
    green: 'text-green-600 bg-green-50'
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value.toLocaleString('pt-BR')}</p>
          {description && (
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          )}
        </div>
      </div>
    </div>
  )
}
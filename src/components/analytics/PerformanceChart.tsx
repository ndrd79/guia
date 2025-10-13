import React from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts'

interface ChartData {
  name: string
  impressions?: number
  clicks?: number
  ctr?: number
  conversions?: number
  revenue?: number
  [key: string]: any
}

interface PerformanceChartProps {
  data: ChartData[]
  type: 'line' | 'bar' | 'pie'
  title?: string
  height?: number
  showLegend?: boolean
  colors?: string[]
  loading?: boolean
}

const defaultColors = [
  '#f97316', // orange-500
  '#3b82f6', // blue-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#8b5cf6', // violet-500
  '#06b6d4', // cyan-500
  '#84cc16'  // lime-500
]

const formatNumber = (value: number) => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`
  }
  return value.toString()
}

const formatCTR = (value: number) => {
  return `${value.toFixed(2)}%`
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-medium text-gray-900 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            <span className="font-medium">{entry.dataKey}:</span>{' '}
            {entry.dataKey === 'ctr' ? formatCTR(entry.value) : formatNumber(entry.value)}
          </p>
        ))}
      </div>
    )
  }
  return null
}

const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-full">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
  </div>
)

export const PerformanceChart: React.FC<PerformanceChartProps> = ({
  data,
  type,
  title,
  height = 300,
  showLegend = true,
  colors = defaultColors,
  loading = false
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        {title && <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>}
        <div style={{ height }}>
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        {title && <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>}
        <div 
          className="flex items-center justify-center text-gray-500"
          style={{ height }}
        >
          Nenhum dado disponível
        </div>
      </div>
    )
  }

  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis 
              dataKey="name" 
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis 
              stroke="#6b7280"
              fontSize={12}
              tickFormatter={formatNumber}
            />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend />}
            <Line 
              type="monotone" 
              dataKey="impressions" 
              stroke={colors[0]} 
              strokeWidth={2}
              name="Impressões"
              dot={{ fill: colors[0], strokeWidth: 2, r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="clicks" 
              stroke={colors[1]} 
              strokeWidth={2}
              name="Cliques"
              dot={{ fill: colors[1], strokeWidth: 2, r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="ctr" 
              stroke={colors[2]} 
              strokeWidth={2}
              name="CTR (%)"
              dot={{ fill: colors[2], strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        )

      case 'bar':
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis 
              dataKey="name" 
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis 
              stroke="#6b7280"
              fontSize={12}
              tickFormatter={formatNumber}
            />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend />}
            <Bar 
              dataKey="impressions" 
              fill={colors[0]} 
              name="Impressões"
              radius={[2, 2, 0, 0]}
            />
            <Bar 
              dataKey="clicks" 
              fill={colors[1]} 
              name="Cliques"
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        )

      case 'pie':
        return (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        )

      default:
        return null
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {title && <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        {renderChart()}
      </ResponsiveContainer>
    </div>
  )
}

export default PerformanceChart
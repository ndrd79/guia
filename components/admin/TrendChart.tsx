import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts'

interface TrendChartProps {
  data: any[]
  type: 'line' | 'bar' | 'area' | 'pie'
  xKey: string
  yKey: string | string[]
  colors?: string[]
  height?: number
  showGrid?: boolean
  showTooltip?: boolean
  showLegend?: boolean
  formatTooltip?: (value: any, name: string) => [string, string]
  formatXAxis?: (value: any) => string
  formatYAxis?: (value: any) => string
}

const DEFAULT_COLORS = [
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // orange
  '#EF4444', // red
  '#8B5CF6', // purple
  '#06B6D4', // cyan
  '#84CC16', // lime
  '#F97316'  // orange-500
]

export default function TrendChart({
  data,
  type,
  xKey,
  yKey,
  colors = DEFAULT_COLORS,
  height = 300,
  showGrid = true,
  showTooltip = true,
  showLegend = false,
  formatTooltip,
  formatXAxis,
  formatYAxis
}: TrendChartProps) {
  const renderTooltip = (props: any) => {
    if (!showTooltip || !props.active || !props.payload) return null

    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="text-sm font-medium text-gray-900 mb-2">
          {formatXAxis ? formatXAxis(props.label) : props.label}
        </p>
        {props.payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center space-x-2 text-sm">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            ></div>
            <span className="text-gray-600">{entry.name}:</span>
            <span className="font-medium text-gray-900">
              {formatTooltip 
                ? formatTooltip(entry.value, entry.name)[0]
                : new Intl.NumberFormat('pt-BR').format(entry.value)
              }
            </span>
          </div>
        ))}
      </div>
    )
  }

  const commonProps = {
    data,
    height,
    margin: { top: 5, right: 30, left: 20, bottom: 5 }
  }

  if (type === 'pie') {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            dataKey={yKey as string}
            nameKey={xKey}
            cx="50%"
            cy="50%"
            outerRadius={80}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          {showTooltip && <Tooltip content={renderTooltip} />}
        </PieChart>
      </ResponsiveContainer>
    )
  }

  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
            <XAxis 
              dataKey={xKey}
              tick={{ fontSize: 12 }}
              tickFormatter={formatXAxis}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickFormatter={formatYAxis}
            />
            {showTooltip && <Tooltip content={renderTooltip} />}
            {Array.isArray(yKey) ? (
              yKey.map((key, index) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={colors[index % colors.length]}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              ))
            ) : (
              <Line
                type="monotone"
                dataKey={yKey}
                stroke={colors[0]}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            )}
          </LineChart>
        )

      case 'area':
        return (
          <AreaChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
            <XAxis 
              dataKey={xKey}
              tick={{ fontSize: 12 }}
              tickFormatter={formatXAxis}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickFormatter={formatYAxis}
            />
            {showTooltip && <Tooltip content={renderTooltip} />}
            {Array.isArray(yKey) ? (
              yKey.map((key, index) => (
                <Area
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stackId="1"
                  stroke={colors[index % colors.length]}
                  fill={colors[index % colors.length]}
                  fillOpacity={0.6}
                />
              ))
            ) : (
              <Area
                type="monotone"
                dataKey={yKey}
                stroke={colors[0]}
                fill={colors[0]}
                fillOpacity={0.6}
              />
            )}
          </AreaChart>
        )

      case 'bar':
      default:
        return (
          <BarChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
            <XAxis 
              dataKey={xKey}
              tick={{ fontSize: 12 }}
              tickFormatter={formatXAxis}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickFormatter={formatYAxis}
            />
            {showTooltip && <Tooltip content={renderTooltip} />}
            {Array.isArray(yKey) ? (
              yKey.map((key, index) => (
                <Bar
                  key={key}
                  dataKey={key}
                  fill={colors[index % colors.length]}
                  radius={[2, 2, 0, 0]}
                />
              ))
            ) : (
              <Bar
                dataKey={yKey}
                fill={colors[0]}
                radius={[2, 2, 0, 0]}
              />
            )}
          </BarChart>
        )
    }
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      {renderChart()}
    </ResponsiveContainer>
  )
}
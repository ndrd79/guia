import React, { useState, useEffect, useMemo } from 'react'
import { 
  Eye, 
  MousePointer, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  Target,
  BarChart3,
  PieChart,
  Calendar,
  Filter,
  RefreshCw,
  FileText,
  Users
} from 'lucide-react'
import { useAnalytics } from '../../hooks/useAnalytics'
import { MetricCard } from './MetricCard'
import { PerformanceChart } from './PerformanceChart'
import { DateRangeFilter, DateRange } from './DateRangeFilter'
import { ExportButton } from './ExportButton'
import { AdvancedReports } from './AdvancedReports'
import { TopPerformers } from './TopPerformers'
import { LoadingOverlay, MetricCardSkeleton, ChartSkeleton, TableSkeleton } from './LoadingStates'

interface Banner {
  id: string
  nome: string
  posicao: string
  ativo: boolean
  data_inicio?: string | null
  data_fim?: string | null
}

interface AnalyticsDashboardProps {
  banners: Banner[]
  className?: string
}

const getDefaultDateRange = (): DateRange => {
  const today = new Date()
  const thirtyDaysAgo = new Date(today)
  thirtyDaysAgo.setDate(today.getDate() - 30)
  
  return {
    startDate: thirtyDaysAgo.toISOString().split('T')[0],
    endDate: today.toISOString().split('T')[0],
    period: 'month'
  }
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  banners,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'reports'>('dashboard')
  const [dateRange, setDateRange] = useState<DateRange>(getDefaultDateRange())
  const [selectedBanner, setSelectedBanner] = useState<string>('all')
  const [selectedPosition, setSelectedPosition] = useState<string>('all')
  const [chartType, setChartType] = useState<'line' | 'bar' | 'pie'>('line')
  
  const { data, loading, error, fetchAnalytics, refreshData } = useAnalytics()

  // Load analytics data when filters change
  useEffect(() => {
    const filters = {
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      bannerId: selectedBanner !== 'all' ? selectedBanner : undefined,
      position: selectedPosition !== 'all' ? selectedPosition : undefined
    }
    
    fetchAnalytics(filters)
  }, [dateRange, selectedBanner, selectedPosition, fetchAnalytics])

  // Get unique positions from banners
  const positions = useMemo(() => {
    const positionSet = new Set(banners.map(b => b.posicao))
    const uniquePositions = Array.from(positionSet)
    return uniquePositions.sort()
  }, [banners])

  // Calculate summary metrics
  const summaryMetrics = useMemo(() => {
    if (!data?.summary) {
      return {
        totalImpressions: 0,
        totalClicks: 0,
        averageCTR: 0,
        totalRevenue: 0,
        totalConversions: 0,
        averageROI: 0
      }
    }

    const { summary } = data
    return {
      totalImpressions: summary.totalImpressions || 0,
      totalClicks: summary.totalClicks || 0,
      averageCTR: summary.averageCTR || 0,
      totalRevenue: summary.totalRevenue || 0,
      totalConversions: summary.totalConversions || 0,
      averageROI: summary.averageROI || 0
    }
  }, [data])

  // Convert BannerAnalytics to BannerData for TopPerformers
  const topPerformersData = useMemo(() => {
    if (!data?.banners) return []
    
    return data.banners.map(banner => ({
      id: banner.bannerId,
      title: banner.title,
      position: banner.position,
      impressions: banner.impressions,
      clicks: banner.clicks,
      ctr: banner.impressions > 0 ? (banner.clicks / banner.impressions) * 100 : 0,
      revenue: banner.revenue,
      conversionRate: 0 // Default value since it's not available in BannerAnalytics
    }))
  }, [data])

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!data?.banners) return []

    return data.banners.map(banner => ({
      name: banner.title || banner.bannerId,
      impressions: banner.impressions || 0,
      clicks: banner.clicks || 0,
      ctr: banner.impressions > 0 ? (banner.clicks / banner.impressions) * 100 : 0,
      revenue: banner.revenue || 0
    }))
  }, [data])

  // Prepare export data
  const exportData = useMemo(() => {
    if (!data?.banners) return []

    return data.banners.map(banner => ({
      'Banner': banner.title || banner.bannerId,
      'Posição': banner.position || 'N/A',
      'Impressões': banner.impressions || 0,
      'Cliques': banner.clicks || 0,
      'CTR (%)': banner.impressions > 0 ? ((banner.clicks / banner.impressions) * 100).toFixed(2) : '0.00',
      'Receita (R$)': (banner.revenue || 0).toFixed(2),
      'Período': `${dateRange.startDate} - ${dateRange.endDate}`
    }))
  }, [data, dateRange])

  const handleRefresh = () => {
    refreshData()
  }

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-6 ${className}`}>
        <div className="flex items-center">
          <div className="text-red-600">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Erro ao carregar dados de analytics
            </h3>
            <p className="text-sm text-red-700 mt-1">
              {error}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-blue-600" />
              Analytics Dashboard
            </h2>
            <p className="text-gray-600 mt-1">
              Acompanhe o desempenho dos seus banners em tempo real
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </button>
            
            <ExportButton 
              data={exportData}
              filename={`analytics-${dateRange.startDate}-${dateRange.endDate}`}
              disabled={loading || !data}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'dashboard'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Dashboard
                </div>
              </button>
              <button
                onClick={() => setActiveTab('reports')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'reports'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Relatórios Avançados
                </div>
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'dashboard' ? (
        <div className="p-6 space-y-6">
          {/* Filters */}
          <div className="flex flex-col lg:flex-row gap-4">
            <DateRangeFilter
              value={dateRange}
              onChange={setDateRange}
              className="w-full lg:w-auto"
            />
            
            <select
              value={selectedBanner}
              onChange={(e) => setSelectedBanner(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todos os banners</option>
              {banners.map(banner => (
                <option key={banner.id} value={banner.id}>
                  {banner.nome}
                </option>
              ))}
            </select>
            
            <select
              value={selectedPosition}
              onChange={(e) => setSelectedPosition(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todas as posições</option>
              {positions.map(position => (
                <option key={position} value={position}>
                  {position}
                </option>
              ))}
            </select>
          </div>

          {/* Summary metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {loading ? (
              <>
                <MetricCardSkeleton />
                <MetricCardSkeleton />
                <MetricCardSkeleton />
                <MetricCardSkeleton />
                <MetricCardSkeleton />
                <MetricCardSkeleton />
              </>
            ) : (
              <>
                <MetricCard
                  title="Impressões"
                  value={summaryMetrics.totalImpressions}
                  icon={Eye}
                  color="blue"
                  loading={loading}
                  format="number"
                />
                
                <MetricCard
                  title="Cliques"
                  value={summaryMetrics.totalClicks}
                  icon={MousePointer}
                  color="green"
                  loading={loading}
                  format="number"
                />
                
                <MetricCard
                  title="CTR Médio"
                  value={summaryMetrics.averageCTR}
                  icon={TrendingUp}
                  color="orange"
                  loading={loading}
                  format="percentage"
                />
                
                <MetricCard
                  title="Receita"
                  value={summaryMetrics.totalRevenue}
                  icon={DollarSign}
                  color="green"
                  loading={loading}
                  format="currency"
                />
                
                <MetricCard
                  title="ROI Médio"
                  value={summaryMetrics.averageROI}
                  icon={Clock}
                  color="purple"
                  loading={loading}
                  format="percentage"
                />
                
                <MetricCard
                  title="Conversões"
                  value={summaryMetrics.totalConversions}
                  icon={Target}
                  color="red"
                  loading={loading}
                  format="number"
                />
              </>
            )}
          </div>

          {/* Charts section */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">Performance por Banner</h3>
              
              <div className="flex items-center gap-2 mt-3 sm:mt-0">
                <span className="text-sm text-gray-600">Visualização:</span>
                <div className="flex rounded-md border border-gray-300">
                  <button
                    onClick={() => setChartType('line')}
                    className={`px-3 py-1 text-sm rounded-l-md ${
                      chartType === 'line'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <BarChart3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setChartType('bar')}
                    className={`px-3 py-1 text-sm ${
                      chartType === 'bar'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <BarChart3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setChartType('pie')}
                    className={`px-3 py-1 text-sm rounded-r-md ${
                      chartType === 'pie'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <PieChart className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
            
            {loading ? (
              <ChartSkeleton />
            ) : (
              <PerformanceChart
                data={chartData}
                type={chartType}
                loading={loading}
                height={400}
              />
            )}
          </div>

          {/* Top Performers Table */}
          {loading ? (
            <TableSkeleton rows={5} />
          ) : (
            <TopPerformers 
              banners={topPerformersData} 
              loading={loading}
            />
          )}
        </div>
      ) : (
        <div className="p-6">
          <AdvancedReports 
            banners={banners}
          />
        </div>
      )}
    </div>
  )
}

export default AnalyticsDashboard
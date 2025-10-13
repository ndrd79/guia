import React, { useState, useEffect, useMemo } from 'react'
import { 
  FileText, 
  Calendar, 
  Filter, 
  TrendingUp, 
  DollarSign,
  BarChart3,
  PieChart,
  Target,
  Eye,
  MousePointer,
  Clock,
  Activity,
  Zap
} from 'lucide-react'
import { useAnalytics } from '../../../src/hooks/useAnalytics'
import { MetricCard } from './MetricCard'
import { PerformanceChart } from './PerformanceChart'
import { DateRangeFilter, DateRange } from './DateRangeFilter'
import { ExportButton } from './ExportButton'
import { AdvancedMetrics } from './AdvancedMetrics'
import { ReportScheduler } from './ReportScheduler'

interface Banner {
  id: string
  nome: string
  posicao: string
  ativo: boolean
  data_inicio?: string | null
  data_fim?: string | null
}

interface AdvancedReportsProps {
  banners: Banner[]
  className?: string
}

interface ROIMetrics {
  investment: number
  revenue: number
  roi: number
  roas: number
  costPerClick: number
  costPerImpression: number
}

interface ComparisonPeriod {
  current: DateRange
  previous: DateRange
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

const getPreviousPeriod = (current: DateRange): DateRange => {
  const currentStart = new Date(current.startDate)
  const currentEnd = new Date(current.endDate)
  const daysDiff = Math.ceil((currentEnd.getTime() - currentStart.getTime()) / (1000 * 60 * 60 * 24))
  
  const previousEnd = new Date(currentStart)
  previousEnd.setDate(currentStart.getDate() - 1)
  
  const previousStart = new Date(previousEnd)
  previousStart.setDate(previousEnd.getDate() - daysDiff)
  
  return {
    startDate: previousStart.toISOString().split('T')[0],
    endDate: previousEnd.toISOString().split('T')[0],
    period: 'custom'
  }
}

const calculateROI = (revenue: number, investment: number): ROIMetrics => {
  const roi = investment > 0 ? ((revenue - investment) / investment) * 100 : 0
  const roas = investment > 0 ? revenue / investment : 0
  
  return {
    investment,
    revenue,
    roi,
    roas,
    costPerClick: 0, // Será calculado com base nos dados reais
    costPerImpression: 0 // Será calculado com base nos dados reais
  }
}

export const AdvancedReports: React.FC<AdvancedReportsProps> = ({
  banners,
  className = ''
}) => {
  const [currentPeriod, setCurrentPeriod] = useState<DateRange>(getDefaultDateRange())
  const [selectedBanner, setSelectedBanner] = useState<string>('all')
  const [selectedPosition, setSelectedPosition] = useState<string>('all')
  const [reportType, setReportType] = useState<'performance' | 'roi' | 'trends' | 'comparison' | 'advanced' | 'scheduler'>('performance')
  const [showComparison, setShowComparison] = useState(false)
  
  const previousPeriod = useMemo(() => getPreviousPeriod(currentPeriod), [currentPeriod])
  
  // Hooks para dados atuais e anteriores
  const { 
    data: currentData, 
    loading: currentLoading, 
    error: currentError, 
    fetchAnalytics: fetchCurrentAnalytics 
  } = useAnalytics()
  
  const { 
    data: previousData, 
    loading: previousLoading, 
    fetchAnalytics: fetchPreviousAnalytics 
  } = useAnalytics()

  // Carregar dados quando filtros mudarem
  useEffect(() => {
    const filters = {
      startDate: currentPeriod.startDate,
      endDate: currentPeriod.endDate,
      bannerId: selectedBanner !== 'all' ? selectedBanner : undefined,
      position: selectedPosition !== 'all' ? selectedPosition : undefined
    }
    
    fetchCurrentAnalytics(filters)
    
    if (showComparison) {
      const previousFilters = {
        startDate: previousPeriod.startDate,
        endDate: previousPeriod.endDate,
        bannerId: selectedBanner !== 'all' ? selectedBanner : undefined,
        position: selectedPosition !== 'all' ? selectedPosition : undefined
      }
      fetchPreviousAnalytics(previousFilters)
    }
  }, [currentPeriod, previousPeriod, selectedBanner, selectedPosition, showComparison])

  // Posições únicas
  const positions = useMemo(() => {
    const positionSet = new Set(banners.map(b => b.posicao))
    const uniquePositions = Array.from(positionSet)
    return uniquePositions.sort()
  }, [banners])

  // Calcular métricas de ROI
  const roiMetrics = useMemo(() => {
    if (!currentData?.summary) return null
    
    const { summary } = currentData
    // Simular investimento baseado em impressões (R$ 0.01 por impressão)
    const investment = summary.totalImpressions * 0.01
    
    return calculateROI(summary.totalRevenue, investment)
  }, [currentData])

  // Calcular comparações
  const comparisonMetrics = useMemo(() => {
    if (!currentData?.summary || !previousData?.summary || !showComparison) return null
    
    const current = currentData.summary
    const previous = previousData.summary
    
    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0
      return ((current - previous) / previous) * 100
    }
    
    return {
      impressions: calculateChange(current.totalImpressions, previous.totalImpressions),
      clicks: calculateChange(current.totalClicks, previous.totalClicks),
      revenue: calculateChange(current.totalRevenue, previous.totalRevenue),
      ctr: calculateChange(
        current.totalImpressions > 0 ? (current.totalClicks / current.totalImpressions) * 100 : 0,
        previous.totalImpressions > 0 ? (previous.totalClicks / previous.totalImpressions) * 100 : 0
      )
    }
  }, [currentData, previousData, showComparison])

  // Dados para gráficos de tendência
  const trendData = useMemo(() => {
    if (!currentData?.banners) return []
    
    return currentData.banners.map(banner => ({
      name: banner.title,
      impressions: banner.impressions,
      clicks: banner.clicks,
      revenue: banner.revenue,
      roi: roiMetrics ? ((banner.revenue - (banner.impressions * 0.01)) / (banner.impressions * 0.01)) * 100 : 0
    }))
  }, [currentData, roiMetrics])

  // Dados para exportação
  const exportData = useMemo(() => {
    if (!currentData?.banners) return []
    
    return currentData.banners.map(banner => ({
      'Banner': banner.title,
      'Posição': banner.position || 'N/A',
      'Impressões': banner.impressions,
      'Cliques': banner.clicks,
      'CTR (%)': banner.impressions > 0 ? ((banner.clicks / banner.impressions) * 100).toFixed(2) : '0.00',
      'Receita (R$)': banner.revenue.toFixed(2),
      'Investimento (R$)': (banner.impressions * 0.01).toFixed(2),
      'ROI (%)': banner.impressions > 0 ? (((banner.revenue - (banner.impressions * 0.01)) / (banner.impressions * 0.01)) * 100).toFixed(2) : '0.00',
      'ROAS': banner.impressions > 0 ? (banner.revenue / (banner.impressions * 0.01)).toFixed(2) : '0.00',
      'Período': `${currentPeriod.startDate} - ${currentPeriod.endDate}`
    }))
  }, [currentData, currentPeriod])

  const loading = currentLoading || (showComparison && previousLoading)
  const error = currentError

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
              Erro ao carregar relatórios avançados
            </h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header com filtros */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Relatórios Avançados</h2>
            <p className="text-sm text-gray-600 mt-1">
              Análise detalhada de performance e ROI
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <DateRangeFilter
              value={currentPeriod}
              onChange={setCurrentPeriod}
              className="w-full sm:w-auto"
            />
            
            <select
              value={selectedBanner}
              onChange={(e) => setSelectedBanner(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
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
              className="px-3 py-2 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="all">Todas as posições</option>
              {positions.map(position => (
                <option key={position} value={position}>
                  {position}
                </option>
              ))}
            </select>
            
            <button
              onClick={() => setShowComparison(!showComparison)}
              className={`inline-flex items-center px-3 py-2 text-sm font-medium border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                showComparison
                  ? 'bg-orange-600 text-white border-orange-600 hover:bg-orange-700'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Comparar períodos
            </button>
            
            <ExportButton
              data={exportData}
              filename={`relatorio-avancado-${currentPeriod.startDate}-${currentPeriod.endDate}`}
            />
          </div>
        </div>
      </div>

      {/* Seletor de tipo de relatório */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'performance', label: 'Performance', icon: BarChart3 },
            { key: 'roi', label: 'ROI & ROAS', icon: DollarSign },
            { key: 'trends', label: 'Tendências', icon: TrendingUp },
            { key: 'comparison', label: 'Comparação', icon: Target },
            { key: 'advanced', label: 'Métricas Avançadas', icon: Zap },
            { key: 'scheduler', label: 'Agendamento', icon: Calendar }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setReportType(key as any)}
              className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                reportType === key
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Icon className="h-4 w-4 mr-2" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Métricas de comparação */}
      {showComparison && comparisonMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Impressões"
            value={currentData?.summary?.totalImpressions || 0}
            previousValue={previousData?.summary?.totalImpressions || 0}
            icon={TrendingUp}
            color="blue"
            loading={loading}
            format="number"
            description={`${comparisonMetrics.impressions > 0 ? '+' : ''}${comparisonMetrics.impressions.toFixed(1)}% vs período anterior`}
          />
          
          <MetricCard
            title="Cliques"
            value={currentData?.summary?.totalClicks || 0}
            previousValue={previousData?.summary?.totalClicks || 0}
            icon={Target}
            color="green"
            loading={loading}
            format="number"
            description={`${comparisonMetrics.clicks > 0 ? '+' : ''}${comparisonMetrics.clicks.toFixed(1)}% vs período anterior`}
          />
          
          <MetricCard
            title="Receita"
            value={currentData?.summary?.totalRevenue || 0}
            previousValue={previousData?.summary?.totalRevenue || 0}
            icon={DollarSign}
            color="green"
            loading={loading}
            format="currency"
            description={`${comparisonMetrics.revenue > 0 ? '+' : ''}${comparisonMetrics.revenue.toFixed(1)}% vs período anterior`}
          />
          
          <MetricCard
            title="CTR"
            value={currentData?.summary ? (currentData.summary.totalImpressions > 0 ? (currentData.summary.totalClicks / currentData.summary.totalImpressions) * 100 : 0) : 0}
            previousValue={previousData?.summary ? (previousData.summary.totalImpressions > 0 ? (previousData.summary.totalClicks / previousData.summary.totalImpressions) * 100 : 0) : 0}
            icon={TrendingUp}
            color="orange"
            loading={loading}
            format="percentage"
            description={`${comparisonMetrics.ctr > 0 ? '+' : ''}${comparisonMetrics.ctr.toFixed(1)}% vs período anterior`}
          />
        </div>
      )}

      {/* Conteúdo baseado no tipo de relatório */}
      {reportType === 'performance' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Análise de Performance</h3>
          <PerformanceChart
            data={trendData}
            type="bar"
            loading={loading}
            height={400}
          />
        </div>
      )}

      {reportType === 'roi' && roiMetrics && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="ROI"
              value={roiMetrics.roi}
              icon={TrendingUp}
              color={roiMetrics.roi > 0 ? 'green' : 'red'}
              loading={loading}
              format="percentage"
              description="Retorno sobre investimento"
            />
            
            <MetricCard
              title="ROAS"
              value={roiMetrics.roas}
              icon={DollarSign}
              color={roiMetrics.roas > 1 ? 'green' : 'orange'}
              loading={loading}
              format="number"
              description="Retorno sobre gasto publicitário"
            />
            
            <MetricCard
              title="Investimento"
              value={roiMetrics.investment}
              icon={DollarSign}
              color="blue"
              loading={loading}
              format="currency"
              description="Total investido no período"
            />
            
            <MetricCard
              title="Receita"
              value={roiMetrics.revenue}
              icon={DollarSign}
              color="green"
              loading={loading}
              format="currency"
              description="Receita gerada no período"
            />
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">ROI por Banner</h3>
            <PerformanceChart
              data={trendData.map(item => ({
                name: item.name,
                roi: item.roi,
                revenue: item.revenue
              }))}
              type="bar"
              loading={loading}
              height={400}
            />
          </div>
        </div>
      )}

      {reportType === 'trends' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Análise de Tendências</h3>
          <PerformanceChart
            data={trendData}
            type="line"
            loading={loading}
            height={400}
          />
        </div>
      )}

      {reportType === 'comparison' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Comparação de Banners</h3>
          <PerformanceChart
            data={trendData}
            type="pie"
            loading={loading}
            height={400}
          />
        </div>
      )}

      {reportType === 'advanced' && (
        <AdvancedMetrics 
          banners={banners}
          dateRange={{
            startDate: new Date(currentPeriod.startDate),
            endDate: new Date(currentPeriod.endDate)
          }}
        />
      )}

      {reportType === 'scheduler' && (
        <ReportScheduler 
          banners={banners}
          onScheduleReport={(report) => {
            console.log('Relatório agendado:', report)
            // Aqui você pode implementar a lógica para salvar o relatório agendado
          }}
        />
      )}
    </div>
  )
}

export default AdvancedReports
import { useState } from 'react'
import { 
  BarChart3, 
  TrendingUp, 
  Eye, 
  MousePointer, 
  Target, 
  DollarSign,
  Download,
  RefreshCw,
  Filter,
  Calendar
} from 'lucide-react'
import MetricCard from './MetricCard'
import ChartCard from './ChartCard'
import TrendChart from './TrendChart'
import DateRangeFilter from './DateRangeFilter'
import { useAnalyticsDashboard } from '../../hooks/useAnalyticsDashboard'

export default function AnalyticsDashboard() {
  const {
    bannerStats,
    trendData,
    topBanners,
    metrics,
    comparisonMetrics,
    dateRange,
    selectedPositions,
    selectedBanners,
    setDateRange,
    setSelectedPositions,
    setSelectedBanners,
    clearFilters,
    refresh,
    exportToCSV,
    loading,
    error
  } = useAnalyticsDashboard()

  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'banners' | 'performance'>('overview')

  // Get unique positions and banners for filters
  const availablePositions = Array.from(new Set(bannerStats.map(banner => banner.posicao)))
  const availableBanners = bannerStats.map(banner => ({ id: banner.id, nome: banner.nome }))

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value)
  }

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center space-x-2">
          <div className="text-red-600">⚠️</div>
          <div>
            <h3 className="text-red-800 font-medium">Erro ao carregar analytics</h3>
            <p className="text-red-600 text-sm mt-1">{error}</p>
            <button
              onClick={refresh}
              className="mt-2 text-sm text-red-700 hover:text-red-800 underline"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with filters and actions */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="text-gray-600 mt-1">Análise detalhada de performance dos banners</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <DateRangeFilter
            value={dateRange}
            onChange={setDateRange}
            className="flex-shrink-0"
          />
          
          <button
            onClick={refresh}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="text-sm font-medium">Atualizar</span>
          </button>
          
          <button
            onClick={exportToCSV}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Download className="h-4 w-4" />
            <span className="text-sm font-medium">Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filtros:</span>
          </div>
          
          {/* Position filter */}
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">Posições:</label>
            <select
              multiple
              value={selectedPositions}
              onChange={(e) => setSelectedPositions(Array.from(e.target.selectedOptions, option => option.value))}
              className="text-sm border border-gray-300 rounded px-2 py-1 max-w-40"
            >
              {availablePositions.map(position => (
                <option key={position} value={position}>{position}</option>
              ))}
            </select>
          </div>
          
          {/* Banner filter */}
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">Banners:</label>
            <select
              multiple
              value={selectedBanners}
              onChange={(e) => setSelectedBanners(Array.from(e.target.selectedOptions, option => option.value))}
              className="text-sm border border-gray-300 rounded px-2 py-1 max-w-40"
            >
              {availableBanners.map(banner => (
                <option key={banner.id} value={banner.id}>{banner.nome}</option>
              ))}
            </select>
          </div>
          
          {(selectedPositions.length > 0 || selectedBanners.length > 0) && (
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-700 underline"
            >
              Limpar filtros
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Visão Geral', icon: BarChart3 },
            { id: 'trends', label: 'Tendências', icon: TrendingUp },
            { id: 'banners', label: 'Por Banner', icon: Target },
            { id: 'performance', label: 'Performance', icon: DollarSign }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Total de Impressões"
              value={metrics.totalImpressions}
              icon={Eye}
              color="blue"
              loading={loading}
              change={comparisonMetrics ? {
                value: comparisonMetrics.impressoes,
                type: comparisonMetrics.impressoes >= 0 ? 'increase' : 'decrease',
                period: 'semana anterior'
              } : undefined}
            />
            
            <MetricCard
              title="Total de Cliques"
              value={metrics.totalClicks}
              icon={MousePointer}
              color="green"
              loading={loading}
              change={comparisonMetrics ? {
                value: comparisonMetrics.cliques,
                type: comparisonMetrics.cliques >= 0 ? 'increase' : 'decrease',
                period: 'semana anterior'
              } : undefined}
            />
            
            <MetricCard
              title="CTR Médio"
              value={metrics.averageCTR}
              icon={Target}
              color="orange"
              loading={loading}
              format="percentage"
            />
            
            <MetricCard
              title="Receita Total"
              value={metrics.totalRevenue}
              icon={DollarSign}
              color="purple"
              loading={loading}
              format="currency"
              change={comparisonMetrics ? {
                value: comparisonMetrics.receita,
                type: comparisonMetrics.receita >= 0 ? 'increase' : 'decrease',
                period: 'semana anterior'
              } : undefined}
            />
          </div>

          {/* Overview Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard
              title="Impressões vs Cliques"
              subtitle="Últimos 30 dias"
              icon={BarChart3}
              loading={loading}
            >
              <TrendChart
                data={trendData}
                type="line"
                xKey="date"
                yKey={['impressoes', 'cliques']}
                colors={['#3B82F6', '#10B981']}
                formatXAxis={(value) => new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                formatTooltip={(value, name) => [
                  formatNumber(value),
                  name === 'impressoes' ? 'Impressões' : 'Cliques'
                ]}
              />
            </ChartCard>

            <ChartCard
              title="Top 5 Banners por CTR"
              subtitle="Performance atual"
              icon={Target}
              loading={loading}
            >
              <TrendChart
                data={bannerStats.slice(0, 5).map(banner => ({
                  nome: banner.nome.length > 15 ? banner.nome.substring(0, 15) + '...' : banner.nome,
                  ctr: banner.ctr * 100
                }))}
                type="bar"
                xKey="nome"
                yKey="ctr"
                colors={['#F59E0B']}
                formatTooltip={(value) => [`${value.toFixed(2)}%`, 'CTR']}
              />
            </ChartCard>
          </div>
        </div>
      )}

      {activeTab === 'trends' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard
              title="Tendência de Impressões"
              subtitle="Evolução diária"
              icon={Eye}
              loading={loading}
              height={350}
            >
              <TrendChart
                data={trendData}
                type="area"
                xKey="date"
                yKey="impressoes"
                colors={['#3B82F6']}
                formatXAxis={(value) => new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                formatTooltip={(value) => [formatNumber(value), 'Impressões']}
              />
            </ChartCard>

            <ChartCard
              title="Tendência de Receita"
              subtitle="Evolução diária"
              icon={DollarSign}
              loading={loading}
              height={350}
            >
              <TrendChart
                data={trendData}
                type="area"
                xKey="date"
                yKey="receita"
                colors={['#10B981']}
                formatXAxis={(value) => new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                formatTooltip={(value) => [formatCurrency(value), 'Receita']}
              />
            </ChartCard>
          </div>

          <ChartCard
            title="Comparativo Geral"
            subtitle="Impressões, Cliques, Conversões e Receita"
            icon={TrendingUp}
            loading={loading}
            height={400}
          >
            <TrendChart
              data={trendData}
              type="line"
              xKey="date"
              yKey={['impressoes', 'cliques', 'conversoes', 'receita']}
              colors={['#3B82F6', '#10B981', '#F59E0B', '#EF4444']}
              formatXAxis={(value) => new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
            />
          </ChartCard>
        </div>
      )}

      {activeTab === 'banners' && (
        <div className="space-y-6">
          {/* Banner Performance Table */}
          <ChartCard
            title="Performance por Banner"
            subtitle={`${bannerStats.length} banners analisados`}
            icon={Target}
            loading={loading}
          >
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Banner
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Posição
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Impressões
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliques
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      CTR
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Conversões
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Receita
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ROI
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bannerStats.map((banner) => (
                    <tr key={banner.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {banner.nome}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {banner.posicao}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatNumber(banner.impressoes)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatNumber(banner.cliques)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatPercentage(banner.ctr)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatNumber(banner.conversoes)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(banner.receita)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatPercentage(banner.roi)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ChartCard>
        </div>
      )}

      {activeTab === 'performance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <MetricCard
              title="Conversões Totais"
              value={metrics.totalConversions}
              icon={Target}
              color="green"
              loading={loading}
              change={comparisonMetrics ? {
                value: comparisonMetrics.conversoes,
                type: comparisonMetrics.conversoes >= 0 ? 'increase' : 'decrease',
                period: 'semana anterior'
              } : undefined}
            />
            
            <MetricCard
              title="Taxa de Conversão Média"
              value={metrics.averageConversionRate}
              icon={TrendingUp}
              color="blue"
              loading={loading}
              format="percentage"
            />
            
            <MetricCard
              title="ROI Médio"
              value={metrics.averageROI}
              icon={DollarSign}
              color="purple"
              loading={loading}
              format="percentage"
            />
            
            <MetricCard
              title="Tempo Médio de Visualização"
              value={`${metrics.averageViewTime.toFixed(1)}s`}
              icon={Eye}
              color="orange"
              loading={loading}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard
              title="Distribuição por Posição"
              subtitle="Impressões por posição"
              icon={BarChart3}
              loading={loading}
            >
              <TrendChart
                data={Array.from(
                  bannerStats.reduce((acc, banner) => {
                    const existing = acc.get(banner.posicao) || { posicao: banner.posicao, impressoes: 0 }
                    existing.impressoes += banner.impressoes
                    acc.set(banner.posicao, existing)
                    return acc
                  }, new Map()).values()
                )}
                type="pie"
                xKey="posicao"
                yKey="impressoes"
                colors={['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']}
              />
            </ChartCard>

            <ChartCard
              title="Performance vs Investimento"
              subtitle="ROI por banner"
              icon={DollarSign}
              loading={loading}
            >
              <TrendChart
                data={bannerStats.slice(0, 10).map(banner => ({
                  nome: banner.nome.length > 10 ? banner.nome.substring(0, 10) + '...' : banner.nome,
                  roi: banner.roi * 100
                }))}
                type="bar"
                xKey="nome"
                yKey="roi"
                colors={['#10B981']}
                formatTooltip={(value) => [`${value.toFixed(1)}%`, 'ROI']}
              />
            </ChartCard>
          </div>
        </div>
      )}
    </div>
  )
}
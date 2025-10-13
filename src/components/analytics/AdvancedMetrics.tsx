import React, { useState, useEffect } from 'react'
import { 
  Clock, 
  TrendingUp, 
  Users, 
  Target,
  BarChart3,
  Calendar,
  Zap,
  Activity
} from 'lucide-react'
import { MetricCard } from './MetricCard'
import { PerformanceChart } from './PerformanceChart'

interface AdvancedMetricsProps {
  banners: any[]
  dateRange: {
    startDate: Date
    endDate: Date
  }
}

interface HourlyData {
  hour: string
  impressions: number
  clicks: number
  ctr: number
}

interface ComparisonData {
  bannerA: {
    id: string
    name: string
    impressions: number
    clicks: number
    ctr: number
    revenue: number
  }
  bannerB: {
    id: string
    name: string
    impressions: number
    clicks: number
    ctr: number
    revenue: number
  }
  significance: number
  winner: 'A' | 'B' | 'tie'
}

export const AdvancedMetrics: React.FC<AdvancedMetricsProps> = ({ 
  banners, 
  dateRange 
}) => {
  const [loading, setLoading] = useState(false)
  const [hourlyData, setHourlyData] = useState<HourlyData[]>([])
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null)
  const [selectedBannerA, setSelectedBannerA] = useState<string>('')
  const [selectedBannerB, setSelectedBannerB] = useState<string>('')
  const [peakHours, setPeakHours] = useState<{
    hour: string
    impressions: number
    clicks: number
  }[]>([])

  // Simular dados de horários de pico
  const generateHourlyData = (): HourlyData[] => {
    const hours = Array.from({ length: 24 }, (_, i) => {
      const hour = i.toString().padStart(2, '0') + ':00'
      // Simular picos de tráfego em horários comerciais
      const baseImpressions = Math.random() * 100
      const multiplier = (i >= 8 && i <= 18) ? 2 + Math.random() : 0.5 + Math.random() * 0.5
      const impressions = Math.floor(baseImpressions * multiplier)
      const clicks = Math.floor(impressions * (0.02 + Math.random() * 0.03))
      const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0

      return {
        hour,
        impressions,
        clicks,
        ctr: Number(ctr.toFixed(2))
      }
    })

    return hours
  }

  // Simular comparação A/B
  const generateComparisonData = (bannerAId: string, bannerBId: string): ComparisonData | null => {
    const bannerA = banners.find(b => b.id === bannerAId)
    const bannerB = banners.find(b => b.id === bannerBId)

    if (!bannerA || !bannerB) return null

    // Simular dados de performance
    const dataA = {
      id: bannerA.id,
      name: bannerA.nome,
      impressions: Math.floor(Math.random() * 10000) + 1000,
      clicks: Math.floor(Math.random() * 500) + 50,
      ctr: 0,
      revenue: 0
    }
    dataA.ctr = (dataA.clicks / dataA.impressions) * 100
    dataA.revenue = dataA.clicks * (Math.random() * 2 + 0.5)

    const dataB = {
      id: bannerB.id,
      name: bannerB.nome,
      impressions: Math.floor(Math.random() * 10000) + 1000,
      clicks: Math.floor(Math.random() * 500) + 50,
      ctr: 0,
      revenue: 0
    }
    dataB.ctr = (dataB.clicks / dataB.impressions) * 100
    dataB.revenue = dataB.clicks * (Math.random() * 2 + 0.5)

    // Calcular significância estatística (simulada)
    const significance = Math.random() * 100
    const winner = dataA.ctr > dataB.ctr ? 'A' : dataB.ctr > dataA.ctr ? 'B' : 'tie'

    return {
      bannerA: dataA,
      bannerB: dataB,
      significance,
      winner
    }
  }

  // Identificar horários de pico
  const identifyPeakHours = (data: HourlyData[]) => {
    const sorted = [...data].sort((a, b) => b.impressions - a.impressions)
    return sorted.slice(0, 3)
  }

  useEffect(() => {
    setLoading(true)
    
    // Simular carregamento de dados
    setTimeout(() => {
      const hourlyStats = generateHourlyData()
      setHourlyData(hourlyStats)
      setPeakHours(identifyPeakHours(hourlyStats))
      setLoading(false)
    }, 1000)
  }, [dateRange])

  useEffect(() => {
    if (selectedBannerA && selectedBannerB && selectedBannerA !== selectedBannerB) {
      const comparison = generateComparisonData(selectedBannerA, selectedBannerB)
      setComparisonData(comparison)
    } else {
      setComparisonData(null)
    }
  }, [selectedBannerA, selectedBannerB, banners])

  const totalHourlyImpressions = hourlyData.reduce((sum, hour) => sum + hour.impressions, 0)
  const totalHourlyClicks = hourlyData.reduce((sum, hour) => sum + hour.clicks, 0)
  const averageHourlyCTR = totalHourlyImpressions > 0 ? (totalHourlyClicks / totalHourlyImpressions) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Métricas de horários de pico */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-blue-600" />
          Análise de Horários de Pico
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <MetricCard
            title="Impressões Totais (24h)"
            value={totalHourlyImpressions}
            icon={Activity}
            color="blue"
            loading={loading}
            format="number"
          />
          
          <MetricCard
            title="Cliques Totais (24h)"
            value={totalHourlyClicks}
            icon={Target}
            color="green"
            loading={loading}
            format="number"
          />
          
          <MetricCard
            title="CTR Médio (24h)"
            value={averageHourlyCTR}
            icon={TrendingUp}
            color="orange"
            loading={loading}
            format="percentage"
          />
        </div>

        {/* Gráfico de performance por hora */}
        <div className="mb-6">
          <h4 className="text-md font-medium text-gray-900 mb-3">Performance por Hora</h4>
          <PerformanceChart
            data={hourlyData.map(hour => ({
              name: hour.hour,
              impressions: hour.impressions,
              clicks: hour.clicks,
              ctr: hour.ctr,
              revenue: hour.clicks * 0.5 // Simulado
            }))}
            type="line"
            loading={loading}
            height={300}
          />
        </div>

        {/* Top 3 horários de pico */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-3">Top 3 Horários de Pico</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {peakHours.map((peak, index) => (
              <div key={peak.hour} className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-900">#{index + 1}</span>
                  <Zap className="h-4 w-4 text-blue-600" />
                </div>
                <div className="text-lg font-bold text-blue-900">{peak.hour}</div>
                <div className="text-sm text-blue-700">
                  {peak.impressions.toLocaleString()} impressões
                </div>
                <div className="text-sm text-blue-700">
                  {peak.clicks.toLocaleString()} cliques
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Comparação A/B */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-purple-600" />
          Comparação A/B de Banners
        </h3>

        {/* Seletores de banners */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Banner A
            </label>
            <select
              value={selectedBannerA}
              onChange={(e) => setSelectedBannerA(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="">Selecione um banner</option>
              {banners.map((banner) => (
                <option key={banner.id} value={banner.id}>
                  {banner.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Banner B
            </label>
            <select
              value={selectedBannerB}
              onChange={(e) => setSelectedBannerB(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="">Selecione um banner</option>
              {banners.filter(b => b.id !== selectedBannerA).map((banner) => (
                <option key={banner.id} value={banner.id}>
                  {banner.nome}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Resultados da comparação */}
        {comparisonData && (
          <div className="space-y-6">
            {/* Indicador de vencedor */}
            <div className="text-center">
              <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                comparisonData.winner === 'A' 
                  ? 'bg-green-100 text-green-800'
                  : comparisonData.winner === 'B'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {comparisonData.winner === 'tie' 
                  ? 'Empate Estatístico'
                  : `Vencedor: Banner ${comparisonData.winner}`
                }
                <span className="ml-2 text-xs">
                  ({comparisonData.significance.toFixed(1)}% confiança)
                </span>
              </div>
            </div>

            {/* Comparação lado a lado */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Banner A */}
              <div className={`border-2 rounded-lg p-4 ${
                comparisonData.winner === 'A' ? 'border-green-300 bg-green-50' : 'border-gray-200'
              }`}>
                <h4 className="font-semibold text-gray-900 mb-3">
                  Banner A: {comparisonData.bannerA.name}
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Impressões:</span>
                    <span className="font-medium">{comparisonData.bannerA.impressions.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Cliques:</span>
                    <span className="font-medium">{comparisonData.bannerA.clicks.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">CTR:</span>
                    <span className="font-medium">{comparisonData.bannerA.ctr.toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Receita:</span>
                    <span className="font-medium">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(comparisonData.bannerA.revenue)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Banner B */}
              <div className={`border-2 rounded-lg p-4 ${
                comparisonData.winner === 'B' ? 'border-blue-300 bg-blue-50' : 'border-gray-200'
              }`}>
                <h4 className="font-semibold text-gray-900 mb-3">
                  Banner B: {comparisonData.bannerB.name}
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Impressões:</span>
                    <span className="font-medium">{comparisonData.bannerB.impressions.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Cliques:</span>
                    <span className="font-medium">{comparisonData.bannerB.clicks.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">CTR:</span>
                    <span className="font-medium">{comparisonData.bannerB.ctr.toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Receita:</span>
                    <span className="font-medium">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(comparisonData.bannerB.revenue)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Diferenças percentuais */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h5 className="font-medium text-gray-900 mb-3">Diferenças Percentuais</h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-gray-600">CTR</div>
                  <div className={`font-medium ${
                    comparisonData.bannerA.ctr > comparisonData.bannerB.ctr ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {((comparisonData.bannerA.ctr - comparisonData.bannerB.ctr) / comparisonData.bannerB.ctr * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-gray-600">Cliques</div>
                  <div className={`font-medium ${
                    comparisonData.bannerA.clicks > comparisonData.bannerB.clicks ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {((comparisonData.bannerA.clicks - comparisonData.bannerB.clicks) / comparisonData.bannerB.clicks * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-gray-600">Receita</div>
                  <div className={`font-medium ${
                    comparisonData.bannerA.revenue > comparisonData.bannerB.revenue ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {((comparisonData.bannerA.revenue - comparisonData.bannerB.revenue) / comparisonData.bannerB.revenue * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-gray-600">Confiança</div>
                  <div className={`font-medium ${
                    comparisonData.significance > 95 ? 'text-green-600' : 
                    comparisonData.significance > 80 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {comparisonData.significance.toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {!comparisonData && selectedBannerA && selectedBannerB && (
          <div className="text-center py-8 text-gray-500">
            Selecione dois banners diferentes para comparar
          </div>
        )}

        {!selectedBannerA && !selectedBannerB && (
          <div className="text-center py-8 text-gray-500">
            Selecione dois banners para iniciar a comparação A/B
          </div>
        )}
      </div>
    </div>
  )
}
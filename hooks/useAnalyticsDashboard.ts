import { useState, useEffect, useMemo, useCallback } from 'react'
import { subDays, format, startOfDay, endOfDay } from 'date-fns'

interface DateRange {
  start: Date
  end: Date
}

interface BannerStats {
  id: string
  nome: string
  posicao: string
  impressoes: number
  cliques: number
  ctr: number
  conversoes: number
  taxa_conversao: number
  receita: number
  roi: number
  tempo_medio_visualizacao: number
  data: string
}

interface DashboardMetrics {
  totalImpressions: number
  totalClicks: number
  averageCTR: number
  totalConversions: number
  averageConversionRate: number
  totalRevenue: number
  averageROI: number
  averageViewTime: number
}

interface TrendData {
  date: string
  impressoes: number
  cliques: number
  conversoes: number
  receita: number
}

interface TopBanner {
  id: string
  nome: string
  posicao: string
  metric: number
  metricType: 'impressoes' | 'cliques' | 'ctr' | 'conversoes' | 'roi'
}

interface AnalyticsDashboardState {
  // Data
  bannerStats: BannerStats[]
  trendData: TrendData[]
  topBanners: TopBanner[]
  
  // Metrics
  metrics: DashboardMetrics
  
  // Filters
  dateRange: DateRange
  selectedPositions: string[]
  selectedBanners: string[]
  
  // UI State
  loading: boolean
  error: string | null
  
  // Cache
  lastFetch: Date | null
}

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export function useAnalyticsDashboard() {
  const [state, setState] = useState<AnalyticsDashboardState>({
    bannerStats: [],
    trendData: [],
    topBanners: [],
    metrics: {
      totalImpressions: 0,
      totalClicks: 0,
      averageCTR: 0,
      totalConversions: 0,
      averageConversionRate: 0,
      totalRevenue: 0,
      averageROI: 0,
      averageViewTime: 0
    },
    dateRange: {
      start: subDays(new Date(), 29),
      end: new Date()
    },
    selectedPositions: [],
    selectedBanners: [],
    loading: false,
    error: null,
    lastFetch: null
  })

  // Check if cache is valid
  const isCacheValid = useMemo(() => {
    if (!state.lastFetch) return false
    return Date.now() - state.lastFetch.getTime() < CACHE_DURATION
  }, [state.lastFetch])

  // Fetch banner statistics
  const fetchBannerStats = useCallback(async (force = false) => {
    if (!force && isCacheValid) return

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const startDate = format(startOfDay(state.dateRange.start), 'yyyy-MM-dd')
      const endDate = format(endOfDay(state.dateRange.end), 'yyyy-MM-dd')
      
      const params = new URLSearchParams({
        start_date: startDate,
        end_date: endDate
      })

      if (state.selectedPositions.length > 0) {
        params.append('positions', state.selectedPositions.join(','))
      }

      if (state.selectedBanners.length > 0) {
        params.append('banners', state.selectedBanners.join(','))
      }

      const response = await fetch(`/api/analytics/dashboard?${params}`)
      
      if (!response.ok) {
        throw new Error('Erro ao carregar dados de analytics')
      }

      const data = await response.json()

      setState(prev => ({
        ...prev,
        bannerStats: data.bannerStats || [],
        trendData: data.trendData || [],
        topBanners: data.topBanners || [],
        metrics: data.metrics || prev.metrics,
        loading: false,
        lastFetch: new Date()
      }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }))
    }
  }, [state.dateRange, state.selectedPositions, state.selectedBanners, isCacheValid])

  // Update date range
  const setDateRange = useCallback((range: DateRange) => {
    setState(prev => ({
      ...prev,
      dateRange: range,
      lastFetch: null // Invalidate cache
    }))
  }, [])

  // Update position filters
  const setSelectedPositions = useCallback((positions: string[]) => {
    setState(prev => ({
      ...prev,
      selectedPositions: positions,
      lastFetch: null // Invalidate cache
    }))
  }, [])

  // Update banner filters
  const setSelectedBanners = useCallback((banners: string[]) => {
    setState(prev => ({
      ...prev,
      selectedBanners: banners,
      lastFetch: null // Invalidate cache
    }))
  }, [])

  // Clear all filters
  const clearFilters = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedPositions: [],
      selectedBanners: [],
      dateRange: {
        start: subDays(new Date(), 29),
        end: new Date()
      },
      lastFetch: null // Invalidate cache
    }))
  }, [])

  // Refresh data
  const refresh = useCallback(() => {
    fetchBannerStats(true)
  }, [fetchBannerStats])

  // Calculate comparison metrics
  const comparisonMetrics = useMemo(() => {
    if (state.trendData.length < 2) return null

    const currentPeriod = state.trendData.slice(-7) // Last 7 days
    const previousPeriod = state.trendData.slice(-14, -7) // Previous 7 days

    if (currentPeriod.length === 0 || previousPeriod.length === 0) return null

    const currentTotal = currentPeriod.reduce((acc, day) => ({
      impressoes: acc.impressoes + day.impressoes,
      cliques: acc.cliques + day.cliques,
      conversoes: acc.conversoes + day.conversoes,
      receita: acc.receita + day.receita
    }), { impressoes: 0, cliques: 0, conversoes: 0, receita: 0 })

    const previousTotal = previousPeriod.reduce((acc, day) => ({
      impressoes: acc.impressoes + day.impressoes,
      cliques: acc.cliques + day.cliques,
      conversoes: acc.conversoes + day.conversoes,
      receita: acc.receita + day.receita
    }), { impressoes: 0, cliques: 0, conversoes: 0, receita: 0 })

    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0
      return ((current - previous) / previous) * 100
    }

    return {
      impressoes: calculateChange(currentTotal.impressoes, previousTotal.impressoes),
      cliques: calculateChange(currentTotal.cliques, previousTotal.cliques),
      conversoes: calculateChange(currentTotal.conversoes, previousTotal.conversoes),
      receita: calculateChange(currentTotal.receita, previousTotal.receita)
    }
  }, [state.trendData])

  // Export data functions
  const exportToCSV = useCallback(() => {
    const headers = [
      'Banner',
      'Posição',
      'Impressões',
      'Cliques',
      'CTR (%)',
      'Conversões',
      'Taxa Conversão (%)',
      'Receita (R$)',
      'ROI (%)',
      'Tempo Médio (s)'
    ]

    const rows = state.bannerStats.map(banner => [
      banner.nome,
      banner.posicao,
      banner.impressoes.toString(),
      banner.cliques.toString(),
      (banner.ctr * 100).toFixed(2),
      banner.conversoes.toString(),
      (banner.taxa_conversao * 100).toFixed(2),
      banner.receita.toFixed(2),
      (banner.roi * 100).toFixed(2),
      banner.tempo_medio_visualizacao.toFixed(1)
    ])

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `analytics-banners-${format(new Date(), 'yyyy-MM-dd')}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [state.bannerStats])

  // Auto-fetch on mount and when filters change
  useEffect(() => {
    fetchBannerStats()
  }, [fetchBannerStats])

  return {
    // Data
    bannerStats: state.bannerStats,
    trendData: state.trendData,
    topBanners: state.topBanners,
    metrics: state.metrics,
    comparisonMetrics,
    
    // Filters
    dateRange: state.dateRange,
    selectedPositions: state.selectedPositions,
    selectedBanners: state.selectedBanners,
    
    // Actions
    setDateRange,
    setSelectedPositions,
    setSelectedBanners,
    clearFilters,
    refresh,
    exportToCSV,
    
    // State
    loading: state.loading,
    error: state.error,
    isCacheValid
  }
}
import { useState, useEffect, useCallback } from 'react'
import { useAnalyticsCache } from './useAnalyticsCache'
import { supabase } from '../../lib/supabase'

export interface AnalyticsData {
  impressoes: number
  cliques: number
  ctr: number
  conversoes?: number
  receita?: number
  roi?: number
}

export interface BannerAnalytics extends AnalyticsData {
  id: string
  nome: string
  posicao: string
  data: string
}

export interface AnalyticsFilters {
  startDate?: string
  endDate?: string
  position?: string
  bannerId?: string
  period?: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom'
}

export interface AnalyticsSummary {
  totalImpressions: number
  totalClicks: number
  averageCTR: number
  totalConversions: number
  totalRevenue: number
  averageROI: number
  topBanners: BannerAnalytics[]
  performanceByPosition: Array<{
    position: string
    impressions: number
    clicks: number
    ctr: number
  }>
  timeSeriesData: Array<{
    date: string
    impressions: number
    clicks: number
    ctr: number
  }>
}

export const useAnalytics = (filters: AnalyticsFilters = {}) => {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { getCache, setCache, generateCacheKey, hasCache } = useAnalyticsCache({ ttl: 5 * 60 * 1000 }) // 5 minutes cache

  const fetchAnalytics = useCallback(async (requestFilters: AnalyticsFilters = {}) => {
    const cacheKey = generateCacheKey(requestFilters)
    
    // Check cache first
    if (hasCache(cacheKey)) {
      const cachedData = getCache<AnalyticsData>(cacheKey)
      if (cachedData) {
        setData(cachedData)
        return cachedData
      }
    }

    setLoading(true)
    setError(null)

    try {
      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        throw new Error('Erro de autenticação: ' + sessionError.message)
      }

      if (!session) {
        throw new Error('Usuário não autenticado')
      }

      const params = new URLSearchParams()
      
      if (requestFilters.startDate) {
        params.append('startDate', requestFilters.startDate)
      }
      if (requestFilters.endDate) {
        params.append('endDate', requestFilters.endDate)
      }
      if (requestFilters.bannerId) {
        params.append('bannerId', requestFilters.bannerId)
      }
      if (requestFilters.position) {
        params.append('position', requestFilters.position)
      }

      const response = await fetch(`/api/analytics/summary?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        }
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Erro ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      
      // Check if response has the expected structure
      if (!result.success || !result.data) {
        throw new Error('Formato de resposta inválido')
      }
      
      // Cache the result
      setCache(cacheKey, result.data)
      
      setData(result.data)
      return result.data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido ao carregar analytics'
      console.error('Erro no useAnalytics:', err)
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [generateCacheKey, hasCache, getCache, setCache])

  const refreshData = useCallback((requestFilters: AnalyticsFilters = {}) => {
    return fetchAnalytics(requestFilters)
  }, [fetchAnalytics])

  // Load initial data
  useEffect(() => {
    fetchAnalytics(filters)
  }, [fetchAnalytics, filters])

  return {
    data,
    loading,
    error,
    refreshData,
    fetchAnalytics
  }
}

export default useAnalytics
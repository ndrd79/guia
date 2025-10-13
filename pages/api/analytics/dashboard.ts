import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { start_date, end_date, positions, banners } = req.query

    // Build base query
    let query = supabase
      .from('banner_analytics')
      .select(`
        *,
        banners (
          id,
          nome,
          posicao
        )
      `)

    // Add date filters
    if (start_date) {
      query = query.gte('data', start_date)
    }
    if (end_date) {
      query = query.lte('data', end_date)
    }

    // Add position filters
    if (positions && typeof positions === 'string') {
      const positionList = positions.split(',')
      query = query.in('banners.posicao', positionList)
    }

    // Add banner filters
    if (banners && typeof banners === 'string') {
      const bannerList = banners.split(',')
      query = query.in('banner_id', bannerList)
    }

    const { data: analyticsData, error } = await query

    if (error) {
      console.error('Error fetching analytics data:', error)
      return res.status(500).json({ error: 'Erro ao buscar dados de analytics' })
    }

    // Process banner stats
    const bannerStatsMap = new Map()
    
    analyticsData?.forEach(record => {
      const bannerId = record.banner_id
      const banner = record.banners
      
      if (!banner) return

      if (!bannerStatsMap.has(bannerId)) {
        bannerStatsMap.set(bannerId, {
          id: bannerId,
          nome: banner.nome,
          posicao: banner.posicao,
          impressoes: 0,
          cliques: 0,
          conversoes: 0,
          receita: 0,
          tempo_total_visualizacao: 0,
          dias: 0
        })
      }

      const stats = bannerStatsMap.get(bannerId)
      stats.impressoes += record.impressoes || 0
      stats.cliques += record.cliques || 0
      stats.conversoes += record.conversoes || 0
      stats.receita += record.receita || 0
      stats.tempo_total_visualizacao += (record.tempo_medio_visualizacao || 0) * (record.impressoes || 0)
      stats.dias += 1
    })

    // Calculate derived metrics for each banner
    const bannerStats = Array.from(bannerStatsMap.values()).map(stats => ({
      ...stats,
      ctr: stats.impressoes > 0 ? stats.cliques / stats.impressoes : 0,
      taxa_conversao: stats.cliques > 0 ? stats.conversoes / stats.cliques : 0,
      roi: stats.receita > 0 ? (stats.receita - (stats.impressoes * 0.01)) / (stats.impressoes * 0.01) : 0,
      tempo_medio_visualizacao: stats.impressoes > 0 ? stats.tempo_total_visualizacao / stats.impressoes : 0
    }))

    // Calculate overall metrics
    const metrics: DashboardMetrics = {
      totalImpressions: bannerStats.reduce((sum, banner) => sum + banner.impressoes, 0),
      totalClicks: bannerStats.reduce((sum, banner) => sum + banner.cliques, 0),
      averageCTR: 0,
      totalConversions: bannerStats.reduce((sum, banner) => sum + banner.conversoes, 0),
      averageConversionRate: 0,
      totalRevenue: bannerStats.reduce((sum, banner) => sum + banner.receita, 0),
      averageROI: 0,
      averageViewTime: 0
    }

    // Calculate averages
    if (metrics.totalImpressions > 0) {
      metrics.averageCTR = metrics.totalClicks / metrics.totalImpressions
    }
    if (metrics.totalClicks > 0) {
      metrics.averageConversionRate = metrics.totalConversions / metrics.totalClicks
    }
    if (bannerStats.length > 0) {
      metrics.averageROI = bannerStats.reduce((sum, banner) => sum + banner.roi, 0) / bannerStats.length
      metrics.averageViewTime = bannerStats.reduce((sum, banner) => sum + banner.tempo_medio_visualizacao, 0) / bannerStats.length
    }

    // Generate trend data (daily aggregation)
    const trendMap = new Map()
    
    analyticsData?.forEach(record => {
      const date = record.data
      
      if (!trendMap.has(date)) {
        trendMap.set(date, {
          date,
          impressoes: 0,
          cliques: 0,
          conversoes: 0,
          receita: 0
        })
      }

      const trend = trendMap.get(date)
      trend.impressoes += record.impressoes || 0
      trend.cliques += record.cliques || 0
      trend.conversoes += record.conversoes || 0
      trend.receita += record.receita || 0
    })

    const trendData = Array.from(trendMap.values()).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )

    // Generate top banners by different metrics
    const topBanners = [
      ...bannerStats
        .sort((a, b) => b.impressoes - a.impressoes)
        .slice(0, 5)
        .map(banner => ({
          id: banner.id,
          nome: banner.nome,
          posicao: banner.posicao,
          metric: banner.impressoes,
          metricType: 'impressoes' as const
        })),
      ...bannerStats
        .sort((a, b) => b.cliques - a.cliques)
        .slice(0, 5)
        .map(banner => ({
          id: banner.id,
          nome: banner.nome,
          posicao: banner.posicao,
          metric: banner.cliques,
          metricType: 'cliques' as const
        })),
      ...bannerStats
        .sort((a, b) => b.ctr - a.ctr)
        .slice(0, 5)
        .map(banner => ({
          id: banner.id,
          nome: banner.nome,
          posicao: banner.posicao,
          metric: banner.ctr,
          metricType: 'ctr' as const
        })),
      ...bannerStats
        .sort((a, b) => b.conversoes - a.conversoes)
        .slice(0, 5)
        .map(banner => ({
          id: banner.id,
          nome: banner.nome,
          posicao: banner.posicao,
          metric: banner.conversoes,
          metricType: 'conversoes' as const
        })),
      ...bannerStats
        .sort((a, b) => b.roi - a.roi)
        .slice(0, 5)
        .map(banner => ({
          id: banner.id,
          nome: banner.nome,
          posicao: banner.posicao,
          metric: banner.roi,
          metricType: 'roi' as const
        }))
    ]

    res.status(200).json({
      bannerStats,
      trendData,
      topBanners,
      metrics
    })

  } catch (error) {
    console.error('Dashboard API error:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
}
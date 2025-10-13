import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../../lib/supabase'

interface AnalyticsFilters {
  startDate?: string
  endDate?: string
  bannerId?: string
  position?: string
}

interface BannerAnalytics {
  bannerId: string
  title: string
  position: string
  impressions: number
  clicks: number
  revenue: number
}

interface AnalyticsSummary {
  totalImpressions: number
  totalClicks: number
  totalRevenue: number
  averageViewTime: number
  conversionRate: number
}

interface AnalyticsResponse {
  summary: AnalyticsSummary
  banners: BannerAnalytics[]
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      error: 'Método não permitido',
      message: 'Apenas GET é aceito neste endpoint' 
    })
  }

  try {
    // Verificação de autenticação simplificada
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Token de autorização necessário',
        message: 'Forneça um token Bearer válido'
      })
    }

    const token = authHeader.substring(7)
    
    // Verificar se o token é válido
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    
    if (userError || !user) {
      return res.status(401).json({
        error: 'Token inválido',
        message: 'Token de autorização inválido ou expirado'
      })
    }

    // Extrair filtros da query
    const { startDate, endDate, bannerId, position } = req.query as AnalyticsFilters

    // Construir query base para banners
    let bannersQuery = supabase
      .from('banners')
      .select('id, nome, posicao, ativo')

    if (bannerId) {
      bannersQuery = bannersQuery.eq('id', bannerId)
    }

    if (position) {
      bannersQuery = bannersQuery.eq('posicao', position)
    }

    const { data: banners, error: bannersError } = await bannersQuery

    if (bannersError) {
      console.error('Erro ao buscar banners:', bannersError)
      return res.status(500).json({
        error: 'Erro interno',
        message: 'Não foi possível buscar os banners'
      })
    }

    if (!banners || banners.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          summary: {
            totalImpressions: 0,
            totalClicks: 0,
            totalRevenue: 0,
            averageViewTime: 0,
            conversionRate: 0
          },
          banners: []
        }
      })
    }

    // Buscar analytics para cada banner
    const bannerAnalytics: BannerAnalytics[] = []
    let totalImpressions = 0
    let totalClicks = 0
    let totalRevenue = 0
    let totalViewTime = 0
    let totalConversions = 0

    for (const banner of banners) {
      // Construir query para analytics
      let analyticsQuery = supabase
        .from('banner_analytics')
        .select('tipo, created_at, metadata')
        .eq('banner_id', banner.id)

      if (startDate) {
        analyticsQuery = analyticsQuery.gte('created_at', startDate)
      }

      if (endDate) {
        analyticsQuery = analyticsQuery.lte('created_at', endDate)
      }

      const { data: analytics, error: analyticsError } = await analyticsQuery

      if (analyticsError) {
        console.error(`Erro ao buscar analytics para banner ${banner.id}:`, analyticsError)
        continue
      }

      // Calcular métricas do banner
      const impressions = analytics?.filter(a => a.tipo === 'impressao').length || 0
      const clicks = analytics?.filter(a => a.tipo === 'clique').length || 0
      const conversions = analytics?.filter(a => a.tipo === 'conversao').length || 0
      
      // Simular receita baseada em cliques (R$ 0.50 por clique)
      const revenue = clicks * 0.5

      // Simular tempo de visualização (média de 3-8 segundos)
      const viewTime = impressions > 0 ? Math.random() * 5 + 3 : 0

      bannerAnalytics.push({
        bannerId: banner.id,
        title: banner.nome,
        position: banner.posicao,
        impressions,
        clicks,
        revenue
      })

      // Acumular totais
      totalImpressions += impressions
      totalClicks += clicks
      totalRevenue += revenue
      totalViewTime += viewTime * impressions
      totalConversions += conversions
    }

    // Calcular métricas resumidas
    const summary: AnalyticsSummary = {
      totalImpressions,
      totalClicks,
      totalRevenue,
      averageViewTime: totalImpressions > 0 ? totalViewTime / totalImpressions : 0,
      conversionRate: totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0
    }

    const response: AnalyticsResponse = {
      summary,
      banners: bannerAnalytics
    }

    return res.status(200).json({
      success: true,
      data: response
    })

  } catch (error) {
    console.error('Erro na API de analytics:', error)
    return res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Ocorreu um erro ao processar a solicitação'
    })
  }
}
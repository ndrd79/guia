import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../../lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const { startDate, endDate, position } = req.query as { startDate?: string, endDate?: string, position?: string }

    // Buscar banners (opcionalmente por posição)
    let bannersQuery = supabase
      .from('banners')
      .select('id, nome, posicao, impressions, clicks, ordem, ativo')

    if (position) {
      bannersQuery = bannersQuery.eq('posicao', position)
    }

    // Buscar eventos de analytics no período para cálculo preciso
    let analyticsQuery = supabase
      .from('banner_analytics')
      .select('banner_id, tipo, created_at')

    // Default to last 30 days if no date range provided
    if (!startDate && !endDate) {
      const d = new Date()
      d.setDate(d.getDate() - 30)
      analyticsQuery = analyticsQuery.gte('created_at', d.toISOString())
    } else {
      if (startDate) analyticsQuery = analyticsQuery.gte('created_at', startDate)
      if (endDate) analyticsQuery = analyticsQuery.lte('created_at', endDate)
    }

    const { data: events, error: analyticsError } = await analyticsQuery
    if (analyticsError) {
      return res.status(500).json({ error: 'Erro ao buscar eventos', details: analyticsError.message })
    }

    const { data: banners, error: bannersError } = await bannersQuery
    if (bannersError) {
      return res.status(500).json({ error: 'Erro ao buscar banners', details: bannersError.message })
    }

    const byBanner: Record<string, { impressions: number, clicks: number }> = {}
    events?.forEach(ev => {
      const key = ev.banner_id
      if (!byBanner[key]) byBanner[key] = { impressions: 0, clicks: 0 }
      if (ev.tipo === 'impressao') byBanner[key].impressions++
      if (ev.tipo === 'clique') byBanner[key].clicks++
    })

    const report = (banners || []).map(b => {
      const runtime = byBanner[b.id] || { impressions: b.impressions || 0, clicks: b.clicks || 0 }
      const ctr = runtime.impressions > 0 ? (runtime.clicks / runtime.impressions) * 100 : 0
      // ROI simples: receita estimada por clique (R$0.50) menos custo hipotético por mil impressões (R$1.00 CPM)
      const revenue = runtime.clicks * 0.5
      const cost = (runtime.impressions / 1000) * 1.0
      const roi = cost > 0 ? ((revenue - cost) / cost) * 100 : (revenue > 0 ? 100 : 0)
      return {
        id: b.id,
        nome: b.nome,
        posicao: b.posicao,
        ativo: b.ativo,
        ordem: b.ordem ?? 0,
        impressions: runtime.impressions,
        clicks: runtime.clicks,
        ctr,
        revenue,
        cost,
        roi
      }
    }).sort((a, b) => b.ctr - a.ctr)

    res.status(200).json({ success: true, data: { report, count: report.length } })
  } catch (error) {
    console.error('Erro na API de CTR/ROI:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
}
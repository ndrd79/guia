import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../../../lib/supabase'

// Interface para as estatísticas resumidas
interface BannerStatsResumido {
  bannerId: string
  bannerNome: string
  posicao: string
  ativo: boolean
  impressoes: number
  cliques: number
  ctr: number
  ultimaAtividade: string | null
}

// Função simplificada para verificar autenticação
async function isAuthenticated(req: NextApiRequest): Promise<boolean> {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return false
    }
    const token = authHeader.substring(7)
    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (error || !user) return false
    return true
  } catch (error) {
    console.error('Erro ao verificar autenticação:', error)
    return false
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      error: 'Método não permitido',
      message: 'Apenas GET é aceito neste endpoint'
    })
  }

  try {
    const authenticated = await isAuthenticated(req)
    if (!authenticated) {
      return res.status(401).json({
        error: 'Token de autorização necessário',
        message: 'Forneça um token Bearer válido'
      })
    }

    // 1. Buscar todos os banners
    const { data: banners, error: bannersError } = await supabase
      .from('banners')
      .select('id, nome, posicao, ativo')
      .order('nome')

    if (bannersError) {
      console.error('Erro ao buscar banners:', bannersError)
      return res.status(500).json({ error: 'Erro interno', message: 'Não foi possível buscar os banners' })
    }

    if (!banners || banners.length === 0) {
      return res.status(200).json({ success: true, data: [], message: 'Nenhum banner encontrado' })
    }

    // 2. Buscar eventos de analytics (últimos 30 dias por padrão para performance)
    const d = new Date()
    d.setDate(d.getDate() - 30)

    const { data: events, error: analyticsError } = await supabase
      .from('banner_analytics')
      .select('banner_id, tipo, created_at')
      .gte('created_at', d.toISOString())

    if (analyticsError) {
      console.error('Erro ao buscar analytics:', analyticsError)
      // Não falhar tudo, apenas retornar zerado
    }

    // 3. Agregar em memória
    const statsMap: Record<string, { impressoes: number, clicks: number, lastActive: string | null }> = {}

    events?.forEach(ev => {
      if (!statsMap[ev.banner_id]) {
        statsMap[ev.banner_id] = { impressoes: 0, clicks: 0, lastActive: null }
      }
      if (ev.tipo === 'impressao') statsMap[ev.banner_id].impressoes++
      if (ev.tipo === 'clique') statsMap[ev.banner_id].clicks++

      // Track last activity
      if (!statsMap[ev.banner_id].lastActive || new Date(ev.created_at) > new Date(statsMap[ev.banner_id].lastActive!)) {
        statsMap[ev.banner_id].lastActive = ev.created_at
      }
    })

    // 4. Montar resposta
    const allStats: BannerStatsResumido[] = banners.map(banner => {
      const s = statsMap[banner.id] || { impressoes: 0, clicks: 0, lastActive: null }
      const ctr = s.impressoes > 0 ? (s.clicks / s.impressoes) * 100 : 0

      return {
        bannerId: banner.id,
        bannerNome: banner.nome,
        posicao: banner.posicao,
        ativo: banner.ativo,
        impressoes: s.impressoes,
        cliques: s.clicks,
        ctr: Math.round(ctr * 100) / 100,
        ultimaAtividade: s.lastActive
      }
    })

    // Calcular totais
    const totais = allStats.reduce((acc, stats) => ({
      totalImpressoes: acc.totalImpressoes + stats.impressoes,
      totalCliques: acc.totalCliques + stats.cliques,
      bannersAtivos: acc.bannersAtivos + (stats.ativo ? 1 : 0),
      totalBanners: acc.totalBanners + 1
    }), {
      totalImpressoes: 0,
      totalCliques: 0,
      bannersAtivos: 0,
      totalBanners: 0
    })

    const ctrGeral = totais.totalImpressoes > 0
      ? Math.round((totais.totalCliques / totais.totalImpressoes) * 10000) / 100
      : 0

    return res.status(200).json({
      success: true,
      data: allStats,
      resumo: {
        ...totais,
        ctrGeral
      }
    })

  } catch (error) {
    console.error('Erro no endpoint de estatísticas gerais:', error)
    return res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Ocorreu um erro inesperado'
    })
  }
}
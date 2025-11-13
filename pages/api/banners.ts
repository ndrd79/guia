import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../lib/supabase'
import { logger } from '../../lib/logger'

// Mapeamento de posições para compatibilidade
const positionMapping: Record<string, string> = {
  header: 'Header Inferior',
  footer: 'Footer',
  mobile: 'Mobile Banner',
  'content-top': 'Entre Conteúdo',
  'content-middle': 'Entre Conteúdo',
  'content-bottom': 'Entre Conteúdo',
  sidebar: 'Sidebar Direita',
  hero: 'Hero Carousel',
  // Sinônimos para evitar erro de escolha na UI/Admin
  'hero banner': 'Hero Carousel',
  hero_banner: 'Hero Carousel',
  content: 'Entre Conteúdo',
  // CTA
  cta: 'CTA Banner',
  'cta banner': 'CTA Banner',
  cta_banner: 'CTA Banner'
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { position, active, local } = req.query
    logger.api('Listagem de banners', '/api/banners', { position, active, local })

    let query = supabase
      .from('banners')
      .select('*')

    // Se uma posição foi especificada, aplicar filtro
    if (position && typeof position === 'string') {
      const posLower = position.toLowerCase().trim()
      const mappedPosition = positionMapping[posLower] || position
      query = query.eq('posicao', mappedPosition)
    }

    // Filtrar por status ativo se especificado
    if (active === 'true') {
      query = query.eq('ativo', true)
    }

    // Filtrar por local, incluindo banners gerais e sem local
    if (local && typeof local === 'string') {
      // Inclui banners com local específico, 'geral' ou null
      // Usamos or para cobrir múltiplas condições simultâneas
      query = query.or(`local.eq.${local},local.eq.geral,local.is.null`)
    }

    // Filtrar por período agendado (apenas banners que devem estar ativos agora)
    const now = new Date().toISOString()
    query = query.or(`data_inicio.is.null,data_inicio.lte.${now}`)
    query = query.or(`data_fim.is.null,data_fim.gte.${now}`)

    // Ordenar por ordem (prioridade menor primeiro), depois por created_at
    query = query.order('ordem', { ascending: true })
    query = query.order('created_at', { ascending: false })

    const { data, error } = await query

    if (error) {
      logger.error('Erro ao buscar banners', { error: error.message })
      return res.status(500).json({ 
        success: false, 
        error: 'Erro interno do servidor',
        details: error.message 
      })
    }

    const latestUpdatedAt = (data || []).reduce<string | null>((acc, item: any) => {
      const ts = item?.updated_at || item?.created_at || null
      if (!ts) return acc
      return !acc || ts > acc ? ts : acc
    }, null)
    const etag = `banners-${String(position || 'all')}-${String(local || 'all')}-${String(active || 'any')}-${latestUpdatedAt || (data?.length || 0)}`
    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300')
    res.setHeader('ETag', etag)

    return res.status(200).json({
      success: true,
      data: data || [],
      count: data?.length || 0
    })

  } catch (error) {
    logger.error('Erro na API de banners', { error: error instanceof Error ? error.message : String(error) })
    return res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    })
  }
}

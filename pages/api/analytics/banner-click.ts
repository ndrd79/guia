import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../../lib/supabase'

const ALLOWED_ORIGIN = process.env.NEXT_PUBLIC_SITE_URL
const RATE_LIMIT_MAX = Number(process.env.ANALYTICS_RATE_LIMIT_MAX || 10)
const RATE_LIMIT_WINDOW_MS = Number(process.env.ANALYTICS_RATE_LIMIT_WINDOW_MS || 60_000)
const rlStore: Record<string, { count: number; start: number }> = {}

function isAllowedOrigin(req: NextApiRequest) {
  const origin = req.headers.origin || ''
  const referer = req.headers.referer || ''
  if (!ALLOWED_ORIGIN) return true
  return origin.startsWith(ALLOWED_ORIGIN) || referer.startsWith(ALLOWED_ORIGIN)
}

function rateLimit(key: string) {
  const now = Date.now()
  const bucket = rlStore[key]
  if (!bucket || now - bucket.start > RATE_LIMIT_WINDOW_MS) {
    rlStore[key] = { count: 1, start: now }
    return true
  }
  if (bucket.count >= RATE_LIMIT_MAX) return false
  bucket.count++
  return true
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const { banner_id, position, link_url } = req.body

    if (!banner_id || !position) {
      return res.status(400).json({ error: 'banner_id e position são obrigatórios' })
    }

    // Registrar clique no banco (tabela de analytics)
    const { error: insertError } = await supabase
      .from('banner_analytics')
      .insert({
        banner_id,
        tipo: 'clique',
        posicao: position,
        link_url: typeof link_url === 'string' ? link_url : null,
        ip_address: null,
        user_agent: req.headers['user-agent']
      })

    if (insertError) {
      console.error('Erro ao registrar clique:', insertError)
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }

    // Buscar valor atual de cliques
    const { data: currentBanner, error: selectError } = await supabase
      .from('banners')
      .select('clicks')
      .eq('id', banner_id)
      .single()

    if (selectError) {
      console.error('Erro ao buscar cliques atuais:', selectError)
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }

    const currentClicks = currentBanner?.clicks ?? 0

    // Incrementar contador de cliques do banner
    const { error: updateError } = await supabase
      .from('banners')
      .update({ 
        clicks: currentClicks + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', banner_id)

    if (updateError) {
      console.error('Erro ao atualizar cliques do banner:', updateError)
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }

    res.status(200).json({ success: true })
  } catch (error) {
    console.error('Erro na API de analytics de clique:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
}
    if (!isAllowedOrigin(req)) {
      return res.status(403).json({ error: 'origin não permitida' })
    }

    const ipRaw = String(req.headers['x-forwarded-for'] || (req.socket as any)?.remoteAddress || '')
    const ipKey = ipRaw.split(',')[0].trim() || 'unknown'
    if (!rateLimit(`bc:${ipKey}:${banner_id}`)) {
      return res.status(429).json({ error: 'rate limit' })
    }

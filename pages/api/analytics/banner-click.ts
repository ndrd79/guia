import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../../lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const { banner_id, position, url, timestamp } = req.body

    if (!banner_id || !position) {
      return res.status(400).json({ error: 'banner_id e position são obrigatórios' })
    }

    // Registrar clique no banco
    const { error } = await supabase
      .from('banner_analytics')
      .insert({
        banner_id,
        tipo: 'clique',
        ip_address: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        user_agent: req.headers['user-agent']
      })

    if (error) {
      console.error('Erro ao registrar clique:', error)
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }

    // Incrementar contador de cliques do banner
    // Primeiro, buscar o valor atual
    const { data: bannerData } = await supabase
      .from('banners')
      .select('clicks')
      .eq('id', banner_id)
      .single()

    const currentClicks = bannerData?.clicks || 0

    // Depois, atualizar com o valor incrementado
    await supabase
      .from('banners')
      .update({ 
        clicks: currentClicks + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', banner_id)

    res.status(200).json({ success: true })
  } catch (error) {
    console.error('Erro na API de analytics:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
}
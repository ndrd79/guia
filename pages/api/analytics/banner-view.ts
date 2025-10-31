import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../../lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const { banner_id, position, timestamp } = req.body

    if (!banner_id || !position) {
      return res.status(400).json({ error: 'banner_id e position são obrigatórios' })
    }

    // Registrar visualização no banco
    const { error } = await supabase
      .from('banner_analytics')
      .insert({
        banner_id,
        event_type: 'view',
        position,
        timestamp: new Date(timestamp),
        ip_address: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        user_agent: req.headers['user-agent']
      })

    if (error) {
      console.error('Erro ao registrar visualização:', error)
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }

    // Buscar valor atual de views
    const { data: currentBanner } = await supabase
      .from('banners')
      .select('views')
      .eq('id', banner_id)
      .single()

    const currentViews = currentBanner?.views || 0

    // Incrementar contador de visualizações do banner
    await supabase
      .from('banners')
      .update({ 
        views: currentViews + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', banner_id)

    res.status(200).json({ success: true })
  } catch (error) {
    console.error('Erro na API de analytics:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
}
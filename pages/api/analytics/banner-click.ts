import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../../lib/supabase'

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
        ip_address: req.headers['x-forwarded-for'] || (req.socket as any)?.remoteAddress,
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
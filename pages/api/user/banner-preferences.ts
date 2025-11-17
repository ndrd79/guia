import type { NextApiRequest, NextApiResponse } from 'next'
import { createServerSupabaseClient } from '../../../lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createServerSupabaseClient({ req, res } as any)
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return res.status(401).json({ error: 'Não autorizado' })

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('banner_favorites, banner_recents')
      .eq('id', session.user.id)
      .single()
    if (error) return res.status(200).json({ data: { banner_favorites: [], banner_recents: [] }, note: 'colunas ausentes ou não configuradas' })
    return res.status(200).json({ data: data || { banner_favorites: [], banner_recents: [] } })
  }

  if (req.method === 'PUT') {
    const { banner_favorites, banner_recents } = req.body || {}
    try {
      const payload: any = { id: session.user.id }
      if (Array.isArray(banner_favorites)) payload.banner_favorites = banner_favorites
      if (Array.isArray(banner_recents)) payload.banner_recents = banner_recents
      const { error } = await supabase.from('user_profiles').upsert(payload)
      if (error) return res.status(200).json({ ok: true, note: 'preferências não persistidas (colunas ausentes)' })
      return res.status(200).json({ ok: true })
    } catch (e: any) {
      return res.status(200).json({ ok: true, note: 'falha tolerada' })
    }
  }

  res.setHeader('Allow', 'GET, PUT')
  return res.status(405).end('Method Not Allowed')
}
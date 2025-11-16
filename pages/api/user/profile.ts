import type { NextApiRequest, NextApiResponse } from 'next'
import { createServerSupabaseClient } from '../../../lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createServerSupabaseClient({ req, res } as any)
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return res.status(401).json({ error: 'Não autorizado' })

  if (req.method === 'GET') {
    const { data } = await supabase
      .from('user_profiles')
      .select('id, name, phone, whatsapp, avatar_url')
      .eq('id', session.user.id)
      .single()
    return res.status(200).json({ data })
  }

  if (req.method === 'PUT') {
    const { name, phone, whatsapp, avatar_url } = req.body || {}
    const payload: any = {}
    if (typeof name === 'string') payload.name = name.trim()
    if (typeof phone === 'string') payload.phone = phone.trim()
    if (typeof whatsapp === 'string') payload.whatsapp = whatsapp.trim()
    if (typeof avatar_url === 'string') payload.avatar_url = avatar_url.trim()
    const { error } = await supabase
      .from('user_profiles')
      .upsert({ id: session.user.id, ...payload })
    if (error) return res.status(400).json({ error: error.message })
    return res.status(200).json({ ok: true })
  }

  res.setHeader('Allow', 'GET, PUT')
  return res.status(405).end('Method Not Allowed')
}
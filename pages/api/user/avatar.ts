import type { NextApiRequest, NextApiResponse } from 'next'
import formidable from 'formidable'
import fs from 'fs'
import { createClient } from '@supabase/supabase-js'
import { createServerSupabaseClient } from '../../../lib/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

export const config = { api: { bodyParser: false } }

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).end('Method Not Allowed')
  }

  const supabase = createServerSupabaseClient({ req, res } as any)
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return res.status(401).json({ error: 'Não autorizado' })

  try {
    const form = formidable({ maxFileSize: 5 * 1024 * 1024 })
    const [fields, files] = await form.parse(req)
    const file = Array.isArray(files.file) ? files.file[0] : files.file
    if (!file) return res.status(400).json({ error: 'Arquivo não enviado' })

    const mime = file.mimetype || ''
    if (!/^image\/(jpeg|png|webp)$/i.test(mime)) {
      return res.status(400).json({ error: 'Tipo de arquivo inválido' })
    }

    const buffer = fs.readFileSync(file.filepath)
    const ext = (file.originalFilename?.split('.').pop() || 'jpg').toLowerCase()
    const ts = Date.now()
    const rand = Math.random().toString(36).slice(2, 8)
    const clean = (file.originalFilename || 'avatar').replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()
    const path = `avatars/${session.user.id}/${ts}-${rand}-${clean}.${ext}`

    const { error: upErr } = await supabaseAdmin.storage
      .from('avatars')
      .upload(path, buffer, { contentType: mime, cacheControl: '3600', upsert: false })
    if (upErr) return res.status(400).json({ error: upErr.message })

    const { data: pub } = supabaseAdmin.storage.from('avatars').getPublicUrl(path)
    const avatar_url = pub.publicUrl

    const { error: dbErr } = await supabase
      .from('user_profiles')
      .upsert({ id: session.user.id, avatar_url })
    if (dbErr) return res.status(400).json({ error: dbErr.message })

    return res.status(200).json({ url: avatar_url, path })
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'Falha no upload' })
  }
}
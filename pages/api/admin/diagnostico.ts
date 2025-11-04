import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Cliente com service role para garantir leitura de profiles
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : undefined

    let userInfo: any = null
    let userError: string | null = null
    let profileInfo: any = null
    let profileError: string | null = null

    if (token) {
      const { data: userData, error } = await supabase.auth.getUser(token)
      if (error) {
        userError = error.message
      }
      if (userData?.user) {
        userInfo = {
          id: userData.user.id,
          email: userData.user.email,
        }
        // Buscar perfil
        const { data: profile, error: pErr } = await supabase
          .from('profiles')
          .select('id, role, email')
          .eq('id', userData.user.id)
          .single()
        if (pErr) {
          profileError = pErr.message
        }
        profileInfo = profile || null
      }
    }

    const isAdmin = profileInfo?.role === 'admin'

    return res.status(200).json({
      ok: true,
      env: {
        NEXT_PUBLIC_SUPABASE_URL_present: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_ANON_KEY_present: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        SUPABASE_SERVICE_ROLE_KEY_present: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      },
      headers: {
        authorization_present: !!authHeader,
        content_type: req.headers['content-type'] || null,
        user_agent: req.headers['user-agent'] || null,
      },
      token: token
        ? {
            preview: token.slice(0, 10) + '...' + token.slice(-6),
            length: token.length,
          }
        : null,
      auth: {
        user: userInfo,
        error: userError,
      },
      profile: {
        data: profileInfo,
        error: profileError,
      },
      isAdmin,
      hint: isAdmin
        ? 'Usuário reconhecido como admin.'
        : 'Usuário NÃO reconhecido como admin. Verifique token, perfil e variáveis.',
    })
  } catch (error: any) {
    console.error('Erro em /api/admin/diagnostico:', error)
    return res.status(500).json({ ok: false, error: error?.message || String(error) })
  }
}
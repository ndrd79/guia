import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const authHeader = request.headers.get('authorization') || ''
    const token = authHeader.toLowerCase().startsWith('bearer ') ? authHeader.slice(7) : ''
    const hostHeader = request.headers.get('x-forwarded-host') || request.headers.get('host') || ''

    let userId: string | null = null
    if (token) {
      const publicClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      const { data: tokenUser, error: tokenErr } = await publicClient.auth.getUser(token)
      if (!tokenErr && tokenUser?.user?.id) {
        userId = tokenUser.user.id
      }
    }

    if (!userId) {
      const { data: cookieUser } = await supabase.auth.getUser()
      userId = cookieUser?.user?.id || null
    }
    const isDev = process.env.NODE_ENV !== 'production'
    const isLocal = /localhost|127\.0\.0\.1/.test(hostHeader)
    if (!userId && !(isDev || isLocal)) {
      return NextResponse.json({ success: false, message: 'Não autorizado: sessão ausente' }, { status: 401 })
    }

    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    if (userId) {
      const { data: profile, error: profileError } = await adminClient
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single()
      if (profileError || profile?.role !== 'admin') {
        return NextResponse.json({ success: false, message: 'Acesso negado: requer role=admin' }, { status: 403 })
      }
    }

    const body = await request.json()
    const payload = {
      nome: String(body?.nome || '').trim(),
      posicao: String(body?.posicao || '').trim(),
      imagem: String(body?.imagem || ''),
      link: body?.link ? String(body.link).trim() : null,
      largura: Math.round(Number(body?.largura || 0)) || null,
      altura: Math.round(Number(body?.altura || 0)) || null,
      ativo: Boolean(body?.ativo),
      data_inicio: body?.data_inicio ? new Date(body.data_inicio).toISOString() : null,
      data_fim: body?.data_fim ? new Date(body.data_fim).toISOString() : null,
      ordem: typeof body?.ordem === 'number' ? Math.round(body.ordem) : 0,
      tempo_exibicao: typeof body?.tempo_exibicao === 'number' ? Math.round(body.tempo_exibicao) : 5,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ success: false, message: 'Configuração Supabase ausente' }, { status: 500 })
    }

    const { data, error } = await adminClient
      .from('banners')
      .insert([payload])
      .select('id')
      .single()

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, id: data?.id, devBypass: !userId && (isDev || isLocal) })
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || 'Erro interno' }, { status: 500 })
  }
}

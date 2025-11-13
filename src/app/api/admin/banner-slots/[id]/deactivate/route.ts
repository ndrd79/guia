import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const body = await request.json()
    const local: string | undefined = body?.local
    const excludeBannerId: string | undefined = body?.exclude_banner_id

    const { data: slot, error: slotError } = await supabase
      .from('banner_slots')
      .select('id,name,is_active')
      .eq('id', params.id)
      .single()

    if (slotError || !slot) {
      return NextResponse.json({ error: 'Slot não encontrado' }, { status: 404 })
    }

    let affected = 0

    const nowIso = new Date().toISOString()

    let updateByPosition = supabase
      .from('banners')
      .update({ ativo: false, updated_at: nowIso })
      .eq('position', slot.id)
      .eq('ativo', true)
    if (local && local !== 'geral') {
      updateByPosition = updateByPosition.or(`local.eq.${local},local.eq.geral,local.is.null`)
    }
    if (excludeBannerId) {
      updateByPosition = updateByPosition.neq('id', excludeBannerId)
    }
    const resPos = await updateByPosition.select('id')
    affected += Array.isArray(resPos.data) ? resPos.data.length : 0

    let updateByName = supabase
      .from('banners')
      .update({ ativo: false, updated_at: nowIso })
      .eq('posicao', slot.name)
      .eq('ativo', true)
    if (local && local !== 'geral') {
      updateByName = updateByName.or(`local.eq.${local},local.eq.geral,local.is.null`)
    }
    if (excludeBannerId) {
      updateByName = updateByName.neq('id', excludeBannerId)
    }
    const resName = await updateByName.select('id')
    affected += Array.isArray(resName.data) ? resName.data.length : 0

    return NextResponse.json({ success: true, affected })
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

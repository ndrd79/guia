import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import { logger } from '../../../lib/logger'

// Usar cliente com service role para contornar RLS nas verificações administrativas
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: { autoRefreshToken: false, persistSession: false }
  }
)

interface ValidationRequest {
  posicao: string
  local?: string
  bannerId?: string
}

interface ValidationResponse {
  valid: boolean
  message?: string
  conflictingBanner?: {
    id: string
    nome: string
    ativo: boolean
  }
  // Mantém compatibilidade com "conflictingBanner" e adiciona lista completa
  conflictingBanners?: Array<{
    id: string
    nome: string
    ativo: boolean
    local?: string | null
  }>
  count?: number
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ValidationResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      valid: false, 
      message: 'Método não permitido' 
    })
  }

  try {
    // Validar configuração do Supabase
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return res.status(500).json({
        valid: false,
        message: 'Configuração do Supabase ausente. Verifique NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.'
      })
    }

    const { posicao, local, bannerId }: ValidationRequest = req.body

    if (!posicao) {
      return res.status(400).json({ 
        valid: false, 
        message: 'Posição é obrigatória' 
      })
    }

    logger.api('Validação de posição de banner', '/api/banners/validate', { posicao, local, bannerId })

    const { data: slot } = await supabaseAdmin
      .from('banner_slots')
      .select('*')
      .or(`name.eq.${posicao},slug.eq.${posicao}`)
      .eq('is_active', true)
      .single()

    const now = new Date().toISOString()
    let query = supabaseAdmin
      .from('banners')
      .select('id,nome,ativo,local')
      .eq('posicao', posicao)
      .eq('ativo', true)
      .or(`data_inicio.is.null,data_inicio.lte.${now}`)
      .or(`data_fim.is.null,data_fim.gte.${now}`)

    if (local && local !== 'geral') {
      query = query.or(`local.eq.${local},local.eq.geral,local.is.null`)
    }
    if (bannerId) {
      query = query.neq('id', bannerId)
    }

    const { data: activeBanners, error } = await query

    if (error) {
      logger.error('Erro ao verificar banners ativos', { error: error.message })
      return res.status(500).json({ valid: false, message: 'Falha ao validar posição' })
    }

    const count = activeBanners?.length || 0
    const maxAllowed = slot?.max_banners ?? Infinity

    if (count >= maxAllowed) {
      return res.status(200).json({
        valid: false,
        message: `Limite máximo atingido para esta posição (${maxAllowed}).`,
        conflictingBanners: (activeBanners || []).map(b => ({ id: b.id, nome: b.nome, ativo: true, local: b.local ?? null })),
        count
      })
    }

    return res.status(200).json({ valid: true, message: 'Posição disponível' })

  } catch (error) {
    logger.error('Erro na validação de banners', { error: error instanceof Error ? error.message : String(error) })
    return res.status(500).json({ 
      valid: false, 
      message: 'Erro interno do servidor' 
    })
  }
}

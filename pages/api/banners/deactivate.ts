import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

interface DeactivateRequest {
  posicao: string
  local: string
  excludeBannerId?: string
}

interface DeactivateResponse {
  success: boolean
  message?: string
  affected?: number
}

// Cliente admin com service role para contornar RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DeactivateResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Método não permitido' })
  }

  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return res.status(500).json({ success: false, message: 'Configuração do Supabase ausente' })
    }

    const { posicao, local, excludeBannerId }: DeactivateRequest = req.body

    if (!posicao || !local) {
      return res.status(400).json({ success: false, message: 'Posição e local são obrigatórios' })
    }

    console.info('[DEACTIVATE] Início desativação', { posicao, local, excludeBannerId })

    // Base query: desativar banners ativos na posição
    let query = supabaseAdmin
      .from('banners')
      .update({ ativo: false, updated_at: new Date().toISOString() })
      .eq('posicao', posicao)
      .eq('ativo', true)

    // Se local for 'geral', desativa todos os banners ativos dessa posição
    // Caso contrário, desativa banners com local específico OU 'geral' OU null
    if (local !== 'geral') {
      query = query.or(`local.eq.${local},local.eq.geral,local.is.null`)
    }

    if (excludeBannerId) {
      query = query.neq('id', excludeBannerId)
    }

    const resp = await query
    const { data, error, status } = resp as { data: any; error: any; status: number }

    if (error) {
      console.error('Erro ao desativar banners:', error)
      return res.status(500).json({ success: false, message: `Erro ao desativar banners: ${error.message}` })
    }

    const affected = Array.isArray(data) ? (data as any[]).length : (status === 204 ? 0 : undefined)
    return res.status(200).json({ success: true, message: 'Banners desativados com sucesso', affected })
  } catch (error: any) {
    console.error('Erro na API deactivate banners:', error)
    return res.status(500).json({ success: false, message: 'Erro interno do servidor' })
  }
}
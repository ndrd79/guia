import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

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

    console.info('[VALIDATE] Validação permissiva para múltiplos banners', { posicao, local, bannerId })

    // A validação agora é permissiva: permite múltiplos banners por posição e local.
    // Mantemos a estrutura da resposta para compatibilidade.
    return res.status(200).json({
      valid: true,
      message: 'Posição disponível (múltiplos banners permitidos)'
    })

  } catch (error) {
    console.error('Erro na validação:', error)
    return res.status(500).json({ 
      valid: false, 
      message: 'Erro interno do servidor' 
    })
  }
}
import { NextApiRequest, NextApiResponse } from 'next'
import { z } from 'zod'
import { supabase } from '../../../../lib/supabase'

// Schema de validação para o bannerId
const bannerIdSchema = z.string().uuid('ID do banner deve ser um UUID válido')

// Interface para as estatísticas
interface BannerStats {
  bannerId: string
  bannerNome: string
  impressoes: number
  cliques: number
  ctr: number
  ultimoClique: string | null
  ultimaImpressao: string | null
  periodo: {
    inicio: string
    fim: string
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Apenas método GET é permitido
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      error: 'Método não permitido',
      message: 'Apenas GET é aceito neste endpoint' 
    })
  }

  try {
    const { bannerId } = req.query
    
    // Validar bannerId
    const validatedBannerId = bannerIdSchema.parse(bannerId)

    // Verificar se o banner existe
    const { data: banner, error: bannerError } = await supabase
      .from('banners')
      .select('id, nome, ativo')
      .eq('id', validatedBannerId)
      .single()

    if (bannerError || !banner) {
      return res.status(404).json({
        error: 'Banner não encontrado',
        message: 'O banner especificado não existe'
      })
    }

    // Buscar estatísticas de impressões
    const { data: impressoesData, error: impressoesError } = await supabase
      .from('banner_analytics')
      .select('created_at')
      .eq('banner_id', validatedBannerId)
      .eq('tipo', 'impressao')
      .order('created_at', { ascending: false })

    if (impressoesError) {
      console.error('Erro ao buscar impressões:', impressoesError)
      return res.status(500).json({
        error: 'Erro interno',
        message: 'Não foi possível buscar as estatísticas de impressões'
      })
    }

    // Buscar estatísticas de cliques
    const { data: cliquesData, error: cliquesError } = await supabase
      .from('banner_analytics')
      .select('created_at')
      .eq('banner_id', validatedBannerId)
      .eq('tipo', 'clique')
      .order('created_at', { ascending: false })

    if (cliquesError) {
      console.error('Erro ao buscar cliques:', cliquesError)
      return res.status(500).json({
        error: 'Erro interno',
        message: 'Não foi possível buscar as estatísticas de cliques'
      })
    }

    // Calcular estatísticas
    const impressoes = impressoesData?.length || 0
    const cliques = cliquesData?.length || 0
    const ctr = impressoes > 0 ? (cliques / impressoes) * 100 : 0

    // Obter últimos eventos
    const ultimaImpressao = impressoesData?.[0]?.created_at || null
    const ultimoClique = cliquesData?.[0]?.created_at || null

    // Determinar período de análise
    const agora = new Date()
    const trintaDiasAtras = new Date(agora.getTime() - (30 * 24 * 60 * 60 * 1000))

    const stats: BannerStats = {
      bannerId: validatedBannerId,
      bannerNome: banner.nome,
      impressoes,
      cliques,
      ctr: Math.round(ctr * 100) / 100, // Arredondar para 2 casas decimais
      ultimoClique,
      ultimaImpressao,
      periodo: {
        inicio: trintaDiasAtras.toISOString(),
        fim: agora.toISOString()
      }
    }

    return res.status(200).json({
      success: true,
      data: stats
    })

  } catch (error) {
    // Tratar erros de validação
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Dados inválidos',
        message: 'O ID do banner não é válido',
        details: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      })
    }

    // Erro genérico
    console.error('Erro no endpoint de estatísticas:', error)
    return res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Ocorreu um erro inesperado'
    })
  }
}
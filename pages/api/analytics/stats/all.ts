import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../../../lib/supabase'

// Interface para as estatísticas resumidas
interface BannerStatsResumido {
  bannerId: string
  bannerNome: string
  posicao: string
  ativo: boolean
  impressoes: number
  cliques: number
  ctr: number
  ultimaAtividade: string | null
}

// Função simplificada para verificar autenticação
async function isAuthenticated(req: NextApiRequest): Promise<boolean> {
  try {
    // Verificar se há token de autorização
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return false
    }

    const token = authHeader.substring(7)
    
    // Verificar o token com Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token)
    
    if (error || !user) {
      return false
    }

    return true
  } catch (error) {
    console.error('Erro ao verificar autenticação:', error)
    return false
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
    // Verificar se o usuário está autenticado
    const authenticated = await isAuthenticated(req)
    if (!authenticated) {
      return res.status(401).json({
        error: 'Token de autorização necessário',
        message: 'Forneça um token Bearer válido'
      })
    }

    // Buscar todos os banners
    const { data: banners, error: bannersError } = await supabase
      .from('banners')
      .select('id, nome, posicao, ativo')
      .order('nome')

    if (bannersError) {
      console.error('Erro ao buscar banners:', bannersError)
      return res.status(500).json({
        error: 'Erro interno',
        message: 'Não foi possível buscar os banners'
      })
    }

    if (!banners || banners.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        message: 'Nenhum banner encontrado'
      })
    }

    // Buscar estatísticas para todos os banners
    const statsPromises = banners.map(async (banner) => {
      try {
        // Buscar impressões
        const { data: impressoesData, error: impressoesError } = await supabase
          .from('banner_analytics')
          .select('created_at')
          .eq('banner_id', banner.id)
          .eq('tipo', 'impressao')

        // Buscar cliques
        const { data: cliquesData, error: cliquesError } = await supabase
          .from('banner_analytics')
          .select('created_at')
          .eq('banner_id', banner.id)
          .eq('tipo', 'clique')

        // Buscar última atividade
        const { data: ultimaAtividadeData, error: ultimaAtividadeError } = await supabase
          .from('banner_analytics')
          .select('created_at')
          .eq('banner_id', banner.id)
          .order('created_at', { ascending: false })
          .limit(1)

        if (impressoesError || cliquesError || ultimaAtividadeError) {
          console.error(`Erro ao buscar stats para banner ${banner.id}:`, {
            impressoesError,
            cliquesError,
            ultimaAtividadeError
          })
          // Retornar dados zerados em caso de erro
          return {
            bannerId: banner.id,
            bannerNome: banner.nome,
            posicao: banner.posicao,
            ativo: banner.ativo,
            impressoes: 0,
            cliques: 0,
            ctr: 0,
            ultimaAtividade: null
          }
        }

        const impressoes = impressoesData?.length || 0
        const cliques = cliquesData?.length || 0
        const ctr = impressoes > 0 ? (cliques / impressoes) * 100 : 0
        const ultimaAtividade = ultimaAtividadeData?.[0]?.created_at || null

        const stats: BannerStatsResumido = {
          bannerId: banner.id,
          bannerNome: banner.nome,
          posicao: banner.posicao,
          ativo: banner.ativo,
          impressoes,
          cliques,
          ctr: Math.round(ctr * 100) / 100, // Arredondar para 2 casas decimais
          ultimaAtividade
        }

        return stats
      } catch (error) {
        console.error(`Erro ao processar banner ${banner.id}:`, error)
        // Retornar dados zerados em caso de erro
        return {
          bannerId: banner.id,
          bannerNome: banner.nome,
          posicao: banner.posicao,
          ativo: banner.ativo,
          impressoes: 0,
          cliques: 0,
          ctr: 0,
          ultimaAtividade: null
        }
      }
    })

    // Aguardar todas as consultas
    const allStats = await Promise.all(statsPromises)

    // Calcular totais
    const totais = allStats.reduce((acc, stats) => ({
      totalImpressoes: acc.totalImpressoes + stats.impressoes,
      totalCliques: acc.totalCliques + stats.cliques,
      bannersAtivos: acc.bannersAtivos + (stats.ativo ? 1 : 0),
      totalBanners: acc.totalBanners + 1
    }), {
      totalImpressoes: 0,
      totalCliques: 0,
      bannersAtivos: 0,
      totalBanners: 0
    })

    const ctrGeral = totais.totalImpressoes > 0 
      ? Math.round((totais.totalCliques / totais.totalImpressoes) * 10000) / 100 
      : 0

    return res.status(200).json({
      success: true,
      data: allStats,
      resumo: {
        ...totais,
        ctrGeral
      }
    })

  } catch (error) {
    // Erro genérico
    console.error('Erro no endpoint de estatísticas gerais:', error)
    return res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Ocorreu um erro inesperado'
    })
  }
}
import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { 
      search = '', 
      category = '', 
      location = '', 
      page = '1', 
      limit = '12',
      planType = 'basic' 
    } = req.query

    const offset = (parseInt(page as string) - 1) * parseInt(limit as string)

    // Construir query base - apenas empresas que devem aparecer na página empresas-locais
    let query = supabase
      .from('empresas')
      .select(`
        id,
        name,
        description,
        category,
        rating,
        reviews,
        location,
        phone,
        email,
        website,
        address,
        plan_type,
        created_at
      `)
      .eq('ativo', true)
      .eq('exibir_em_empresas_locais', true)

    // Filtrar por tipo de plano (básico por padrão)
    if (planType === 'basic') {
      query = query.eq('plan_type', 'basic')
    } else if (planType === 'premium') {
      query = query.eq('plan_type', 'premium')
    }

    // Filtros de busca
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    if (category && category !== 'all') {
      query = query.eq('category', category)
    }

    if (location && location !== 'all') {
      query = query.eq('location', location)
    }

    // Ordenação: empresas mais recentes primeiro
    query = query.order('created_at', { ascending: false })

    // Paginação
    query = query.range(offset, offset + parseInt(limit as string) - 1)

    const { data: empresas, error, count } = await query

    if (error) {
      console.error('Erro ao buscar empresas:', error)
      return res.status(500).json({ error: 'Erro interno do servidor' })
    }

    // Buscar total de empresas para paginação
    let countQuery = supabase
      .from('empresas')
      .select('*', { count: 'exact', head: true })
      .eq('ativo', true)
      .eq('exibir_em_empresas_locais', true)

    if (planType === 'basic') {
      countQuery = countQuery.eq('plan_type', 'basic')
    } else if (planType === 'premium') {
      countQuery = countQuery.eq('plan_type', 'premium')
    }

    if (search) {
      countQuery = countQuery.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    if (category && category !== 'all') {
      countQuery = countQuery.eq('category', category)
    }

    if (location && location !== 'all') {
      countQuery = countQuery.eq('location', location)
    }

    const { count: totalCount } = await countQuery

    // Buscar categorias disponíveis (apenas das empresas visíveis)
    const { data: categorias } = await supabase
      .from('empresas')
      .select('category')
      .eq('ativo', true)
      .eq('exibir_em_empresas_locais', true)
      .eq('plan_type', planType)

    const categoriasUnicas = [...new Set(categorias?.map(c => c.category) || [])]
      .sort()

    // Buscar localizações disponíveis (apenas das empresas visíveis)
    const { data: localizacoes } = await supabase
      .from('empresas')
      .select('location')
      .eq('ativo', true)
      .eq('exibir_em_empresas_locais', true)
      .eq('plan_type', planType)

    const localizacoesUnicas = [...new Set(localizacoes?.map(l => l.location) || [])]
      .sort()

    // Adicionar informação de status (aberto/fechado) baseado no horário
    const empresasComStatus = empresas?.map(empresa => ({
      ...empresa,
      isOpen: isBusinessOpen(), // Função simples para demonstração
      distance: null // Pode ser implementado com geolocalização
    }))

    const totalPages = Math.ceil((totalCount || 0) / parseInt(limit as string))

    return res.status(200).json({
      empresas: empresasComStatus,
      pagination: {
        currentPage: parseInt(page as string),
        totalPages,
        totalItems: totalCount || 0,
        itemsPerPage: parseInt(limit as string),
        hasNextPage: parseInt(page as string) < totalPages,
        hasPrevPage: parseInt(page as string) > 1
      },
      filters: {
        categorias: categoriasUnicas,
        localizacoes: localizacoesUnicas
      },
      stats: {
        totalEmpresas: totalCount || 0,
        planType
      }
    })

  } catch (error) {
    console.error('Erro na API empresas-locais:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

// Função simples para determinar se o negócio está aberto
function isBusinessOpen(): boolean {
  const now = new Date()
  const hour = now.getHours()
  const day = now.getDay() // 0 = domingo, 6 = sábado
  
  // Horário comercial padrão: Segunda a Sexta 8h-18h, Sábado 8h-12h
  if (day >= 1 && day <= 5) { // Segunda a Sexta
    return hour >= 8 && hour < 18
  } else if (day === 6) { // Sábado
    return hour >= 8 && hour < 12
  } else { // Domingo
    return false
  }
}
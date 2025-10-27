import { NextApiRequest, NextApiResponse } from 'next'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'

// Usar service role key para contornar RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Schema de validação para o request
const trackEventSchema = z.object({
  bannerId: z.string().uuid('ID do banner deve ser um UUID válido'),
  tipo: z.enum(['impressao', 'clique'], {
    errorMap: () => ({ message: 'Tipo deve ser "impressao" ou "clique"' })
  }),
  posicao: z.string().optional()
})

// Cache para throttling (em produção, usar Redis)
const eventCache = new Map<string, number>()
const THROTTLE_TIME = 5000 // 5 segundos

// Função para obter IP do cliente
function getClientIP(req: NextApiRequest): string {
  const forwarded = req.headers['x-forwarded-for']
  const ip = forwarded 
    ? (Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0])
    : req.connection.remoteAddress || req.socket.remoteAddress || 'unknown'
  
  return ip.trim()
}

// Função para gerar chave de cache
function getCacheKey(ip: string, bannerId: string, tipo: string): string {
  return `${ip}:${bannerId}:${tipo}`
}

// Função para verificar throttling
function isThrottled(ip: string, bannerId: string, tipo: string): boolean {
  const cacheKey = getCacheKey(ip, bannerId, tipo)
  const lastEvent = eventCache.get(cacheKey)
  const now = Date.now()
  
  if (lastEvent && (now - lastEvent) < THROTTLE_TIME) {
    return true
  }
  
  eventCache.set(cacheKey, now)
  return false
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Apenas método POST é permitido
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Método não permitido',
      message: 'Apenas POST é aceito neste endpoint' 
    })
  }

  try {
    // Validar dados do request
    const validatedData = trackEventSchema.parse(req.body)
    const { bannerId, tipo, posicao } = validatedData

    // Obter informações do cliente
    const ip = getClientIP(req)
    const userAgent = req.headers['user-agent'] || 'unknown'
    
    // Verificar throttling
    if (isThrottled(ip, bannerId, tipo)) {
      return res.status(429).json({
        error: 'Rate limit excedido',
        message: 'Aguarde alguns segundos antes de registrar o mesmo evento novamente'
      })
    }

    // Verificar se o banner existe
    const { data: banner, error: bannerError } = await supabaseAdmin
      .from('banners')
      .select('id, nome, ativo')
      .eq('id', bannerId)
      .single()

    if (bannerError || !banner) {
      console.error('Banner não encontrado:', bannerError)
      return res.status(404).json({
        error: 'Banner não encontrado',
        message: 'O banner especificado não existe'
      })
    }

    if (!banner.ativo) {
      return res.status(400).json({
        error: 'Banner inativo',
        message: 'Não é possível registrar eventos para banners inativos'
      })
    }

    // Gerar session_id simples (em produção, usar algo mais robusto)
    const sessionId = `${ip}-${Date.now()}`

    // Inserir evento de analytics;

    const { data: analyticsData, error: analyticsError } = await supabaseAdmin
      .from('banner_analytics')
      .insert({
        banner_id: bannerId,
        tipo,
        ip_address: ip,
        user_agent: userAgent,
        session_id: sessionId
      })
      .select()

    if (analyticsError) {
      console.error('Erro ao inserir analytics:', analyticsError)
      console.error('Detalhes do erro:', JSON.stringify(analyticsError, null, 2))
      return res.status(500).json({
        error: 'Erro interno',
        message: 'Não foi possível registrar o evento',
        debug: analyticsError
      })
    }

    // Log para debug
    console.log(`Analytics registrado: ${tipo} para banner ${banner.nome} (${bannerId}) - IP: ${ip}`)

    // Resposta de sucesso
    return res.status(201).json({
      success: true,
      message: 'Evento registrado com sucesso',
      data: {
        id: analyticsData?.[0]?.id,
        bannerId,
        tipo,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    // Tratar erros de validação
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Dados inválidos',
        message: 'Os dados enviados não são válidos',
        details: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      })
    }

    // Erro genérico
    console.error('Erro no endpoint de tracking:', error)
    return res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Ocorreu um erro inesperado'
    })
  }
}
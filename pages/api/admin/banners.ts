import { NextApiRequest, NextApiResponse } from 'next'
import { createServerSupabaseClient } from '../../../lib/supabase'
import { log } from '../../../lib/logger'

/**
 * API de administração de banners
 * Suporta GET (listar), POST (criar), PUT (atualizar), DELETE (excluir)
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const supabase = createServerSupabaseClient()

    try {
        // Verificar autenticação
        const authHeader = req.headers.authorization
        let userId: string | null = null

        if (authHeader?.startsWith('Bearer ')) {
            const token = authHeader.slice(7)
            const { data: { user }, error } = await supabase.auth.getUser(token)
            if (error || !user) {
                log.warn('[API admin/banners] Token inválido ou expirado')
                return res.status(401).json({ success: false, message: 'Não autorizado' })
            }
            userId = user.id
        } else {
            // Tentar pegar sessão via cookie
            const { data: { session } } = await supabase.auth.getSession()
            if (!session?.user) {
                log.warn('[API admin/banners] Usuário não autenticado')
                return res.status(401).json({ success: false, message: 'Não autorizado' })
            }
            userId = session.user.id
        }

        // Verificar se é admin
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', userId)
            .single()

        if (profile?.role !== 'admin') {
            log.warn('[API admin/banners] Usuário não é admin', { userId })
            return res.status(403).json({ success: false, message: 'Acesso negado' })
        }

        switch (req.method) {
            case 'GET':
                return handleGet(req, res, supabase)
            case 'POST':
                return handlePost(req, res, supabase)
            case 'PUT':
                return handlePut(req, res, supabase)
            case 'DELETE':
                return handleDelete(req, res, supabase)
            default:
                return res.status(405).json({ success: false, message: 'Método não permitido' })
        }
    } catch (error) {
        log.error('[API admin/banners] Erro interno', { error })
        return res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            details: error instanceof Error ? error.message : String(error)
        })
    }
}

/**
 * GET - Listar todos os banners (incluindo inativos)
 */
async function handleGet(req: NextApiRequest, res: NextApiResponse, supabase: any) {
    const { data, error } = await supabase
        .from('banners')
        .select('*')
        .order('created_at', { ascending: false })
        .order('ordem', { ascending: true })

    if (error) {
        log.error('[API admin/banners] Erro ao listar', { error: error.message })
        return res.status(500).json({ success: false, message: error.message })
    }

    return res.status(200).json({ success: true, data: data || [] })
}

/**
 * POST - Criar novo banner
 */
async function handlePost(req: NextApiRequest, res: NextApiResponse, supabase: any) {
    const { nome, posicao, imagem, link, largura, altura, ordem, tempo_exibicao, local, ativo, data_inicio, data_fim } = req.body

    // Validações básicas
    if (!nome || !posicao || !imagem) {
        return res.status(400).json({
            success: false,
            message: 'Nome, posição e imagem são obrigatórios'
        })
    }

    const bannerData = {
        nome,
        posicao,
        imagem,
        link: link || null,
        largura: largura || 400,
        altura: altura || 200,
        ordem: ordem || 0,
        tempo_exibicao: tempo_exibicao || 5,
        local: local || 'geral',
        ativo: ativo !== false,
        data_inicio: data_inicio || null,
        data_fim: data_fim || null,
    }

    log.info('[API admin/banners] Criando banner', { nome, posicao })

    const { data, error } = await supabase
        .from('banners')
        .insert([bannerData])
        .select()
        .single()

    if (error) {
        log.error('[API admin/banners] Erro ao criar', { error: error.message })
        return res.status(500).json({ success: false, message: error.message })
    }

    log.info('[API admin/banners] Banner criado com sucesso', { id: data.id })
    return res.status(201).json({ success: true, id: data.id, data })
}

/**
 * PUT - Atualizar banner existente
 */
async function handlePut(req: NextApiRequest, res: NextApiResponse, supabase: any) {
    const { id, ...updateData } = req.body

    if (!id) {
        return res.status(400).json({ success: false, message: 'ID é obrigatório' })
    }

    log.info('[API admin/banners] Atualizando banner', { id })

    // Remover campos undefined
    const cleanData = Object.fromEntries(
        Object.entries(updateData).filter(([_, v]) => v !== undefined)
    )

    const { data, error } = await supabase
        .from('banners')
        .update(cleanData)
        .eq('id', id)
        .select()
        .single()

    if (error) {
        log.error('[API admin/banners] Erro ao atualizar', { error: error.message })
        return res.status(500).json({ success: false, message: error.message })
    }

    log.info('[API admin/banners] Banner atualizado com sucesso', { id })
    return res.status(200).json({ success: true, data })
}

/**
 * DELETE - Excluir banner
 */
async function handleDelete(req: NextApiRequest, res: NextApiResponse, supabase: any) {
    const { id } = req.query

    if (!id || typeof id !== 'string') {
        return res.status(400).json({ success: false, message: 'ID é obrigatório' })
    }

    log.info('[API admin/banners] Excluindo banner', { id })

    const { error } = await supabase
        .from('banners')
        .delete()
        .eq('id', id)

    if (error) {
        log.error('[API admin/banners] Erro ao excluir', { error: error.message })
        return res.status(500).json({ success: false, message: error.message })
    }

    log.info('[API admin/banners] Banner excluído com sucesso', { id })
    return res.status(200).json({ success: true })
}

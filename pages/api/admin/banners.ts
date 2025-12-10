import { NextApiRequest, NextApiResponse } from 'next'
import { withAdminAuth, AdminApiHandler } from '../../../lib/api/withAdminAuth'
import { log } from '../../../lib/logger'

/**
 * API de administração de banners
 * Suporta GET (listar), POST (criar), PUT (atualizar), DELETE (excluir)
 * 
 * Segurança: Usa withAdminAuth para validação centralizada
 */
const handler: AdminApiHandler = async (req, res, { userId, adminClient }) => {
    try {
        switch (req.method) {
            case 'GET':
                return handleGet(req, res, adminClient)
            case 'POST':
                return handlePost(req, res, adminClient)
            case 'PUT':
                return handlePut(req, res, adminClient)
            case 'DELETE':
                return handleDelete(req, res, adminClient)
            default:
                return res.status(405).json({ success: false, message: 'Método não permitido' })
        }
    } catch (error) {
        log.error('[API admin/banners] Erro interno', { error, userId })
        return res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            details: error instanceof Error ? error.message : String(error)
        })
    }
}

export default withAdminAuth(handler)

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
    const body = req.body

    // Validações básicas
    if (!body.nome || !body.posicao || !body.imagem) {
        return res.status(400).json({
            success: false,
            message: 'Nome, posição e imagem são obrigatórios'
        })
    }

    const bannerData = {
        nome: String(body.nome).trim(),
        posicao: String(body.posicao).trim(),
        imagem: String(body.imagem),
        link: body.link ? String(body.link).trim() : null,
        largura: Math.round(Number(body.largura || 400)),
        altura: Math.round(Number(body.altura || 200)),
        ordem: typeof body.ordem === 'number' ? Math.round(body.ordem) : 0,
        tempo_exibicao: typeof body.tempo_exibicao === 'number' ? Math.round(body.tempo_exibicao) : 5,
        local: body.local ? String(body.local).trim() : 'geral',
        ativo: body.ativo !== false,
        data_inicio: body.data_inicio ? new Date(body.data_inicio).toISOString() : null,
        data_fim: body.data_fim ? new Date(body.data_fim).toISOString() : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    }

    log.info('[API admin/banners] Criando banner', { nome: bannerData.nome, posicao: bannerData.posicao })

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

    // Preparar dados para atualização
    const cleanData: any = {
        updated_at: new Date().toISOString()
    }

    if (updateData.nome !== undefined) cleanData.nome = String(updateData.nome).trim()
    if (updateData.posicao !== undefined) cleanData.posicao = String(updateData.posicao).trim()
    if (updateData.imagem !== undefined) cleanData.imagem = String(updateData.imagem)
    if (updateData.link !== undefined) cleanData.link = updateData.link ? String(updateData.link).trim() : null
    if (updateData.largura !== undefined) cleanData.largura = Math.round(Number(updateData.largura))
    if (updateData.altura !== undefined) cleanData.altura = Math.round(Number(updateData.altura))
    if (updateData.ordem !== undefined) cleanData.ordem = Math.round(Number(updateData.ordem))
    if (updateData.tempo_exibicao !== undefined) cleanData.tempo_exibicao = Math.round(Number(updateData.tempo_exibicao))
    if (updateData.local !== undefined) cleanData.local = String(updateData.local).trim()
    if (updateData.ativo !== undefined) cleanData.ativo = Boolean(updateData.ativo)
    if (updateData.data_inicio !== undefined) cleanData.data_inicio = updateData.data_inicio ? new Date(updateData.data_inicio).toISOString() : null
    if (updateData.data_fim !== undefined) cleanData.data_fim = updateData.data_fim ? new Date(updateData.data_fim).toISOString() : null

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

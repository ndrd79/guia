/**
 * API para atualizar banner existente usando autenticação via cookies
 */

import { NextApiRequest, NextApiResponse } from 'next'
import { createServerClient } from '@supabase/ssr'
import { log } from '../../../lib/logger'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'PUT') {
        return res.status(405).json({ success: false, message: 'Método não permitido' })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
        return res.status(500).json({ success: false, message: 'Configuração do servidor ausente' })
    }

    try {
        // Criar cliente Supabase usando cookies da requisição
        const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
            cookies: {
                get(name: string) {
                    return req.cookies[name]
                },
                set() { },
                remove() { },
            },
        })

        // Verificar usuário via cookies
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            log.warn('[API updateBanner] Usuário não autenticado')
            return res.status(401).json({
                success: false,
                message: 'Não autenticado. Faça login novamente.',
                code: 'NOT_AUTHENTICATED'
            })
        }

        // Criar cliente admin para bypass RLS
        const { createClient } = await import('@supabase/supabase-js')
        const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
            auth: { autoRefreshToken: false, persistSession: false }
        })

        // Verificar se é admin
        const { data: profile } = await adminClient
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (!profile || profile.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Acesso negado. Apenas administradores.',
                code: 'FORBIDDEN'
            })
        }

        // Extrair dados do body
        const body = req.body
        const bannerId = body.id

        if (!bannerId) {
            return res.status(400).json({
                success: false,
                message: 'ID do banner é obrigatório'
            })
        }

        if (!body.nome || !body.imagem) {
            return res.status(400).json({
                success: false,
                message: 'Nome e imagem são obrigatórios'
            })
        }

        // Atualizar banner
        const bannerData = {
            nome: String(body.nome).trim(),
            imagem: String(body.imagem),
            link: body.link ? String(body.link).trim() : null,
            ordem: typeof body.ordem === 'number' ? Math.round(body.ordem) : 0,
            tempo_exibicao: typeof body.tempo_exibicao === 'number' ? Math.round(body.tempo_exibicao) : 5,
            ativo: body.ativo !== false,
            data_inicio: body.data_inicio || null,
            data_fim: body.data_fim || null,
            updated_at: new Date().toISOString(),
        }

        log.info('[API updateBanner] Atualizando banner', { id: bannerId, nome: bannerData.nome, userId: user.id })

        const { data, error } = await adminClient
            .from('banners')
            .update(bannerData)
            .eq('id', bannerId)
            .select()
            .single()

        if (error) {
            log.error('[API updateBanner] Erro ao atualizar', { error: error.message })
            return res.status(500).json({ success: false, message: error.message })
        }

        log.info('[API updateBanner] Banner atualizado com sucesso', { id: data.id })
        return res.status(200).json({ success: true, id: data.id, data })

    } catch (error) {
        log.error('[API updateBanner] Erro interno', { error })
        return res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            details: error instanceof Error ? error.message : String(error)
        })
    }
}

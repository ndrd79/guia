/**
 * API para criar banner usando autenticação via cookies
 * Esta API não usa header Authorization, usa os cookies de sessão do Supabase
 */

import { NextApiRequest, NextApiResponse } from 'next'
import { createServerClient } from '@supabase/ssr'
import { log } from '../../../lib/logger'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
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
                set() { }, // API route não precisa setar cookies
                remove() { },
            },
        })

        // Verificar usuário via cookies
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            log.warn('[API createBanner] Usuário não autenticado')
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

        if (!body.nome || !body.posicao || !body.imagem) {
            return res.status(400).json({
                success: false,
                message: 'Nome, posição e imagem são obrigatórios'
            })
        }

        // Criar banner
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
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        }

        log.info('[API createBanner] Criando banner', { nome: bannerData.nome, userId: user.id })

        const { data, error } = await adminClient
            .from('banners')
            .insert([bannerData])
            .select()
            .single()

        if (error) {
            log.error('[API createBanner] Erro ao criar', { error: error.message })
            return res.status(500).json({ success: false, message: error.message })
        }

        log.info('[API createBanner] Banner criado com sucesso', { id: data.id })
        return res.status(201).json({ success: true, id: data.id, data })

    } catch (error) {
        log.error('[API createBanner] Erro interno', { error })
        return res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            details: error instanceof Error ? error.message : String(error)
        })
    }
}

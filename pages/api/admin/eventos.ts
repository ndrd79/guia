import type { NextApiRequest, NextApiResponse } from 'next'
import { createServerClient } from '@supabase/ssr'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Criar cliente Supabase com cookies
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return req.cookies[name]
                },
                set(name: string, value: string, options: any) {
                    res.setHeader('Set-Cookie', `${name}=${value}; Path=/; ${Object.entries(options).map(([k, v]) => `${k}=${v}`).join('; ')}`)
                },
                remove(name: string, options: any) {
                    res.setHeader('Set-Cookie', `${name}=; Path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`)
                },
            },
        }
    )

    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        return res.status(401).json({ error: 'Não autenticado' })
    }

    // Verificar se é admin
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin') {
        return res.status(403).json({ error: 'Acesso negado' })
    }

    // Handle methods
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
            return res.status(405).json({ error: 'Method not allowed' })
    }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse, supabase: any) {
    try {
        const { data: eventos, error } = await supabase
            .from('eventos')
            .select('*')
            .order('data_hora', { ascending: true })

        if (error) throw error

        return res.status(200).json({ eventos })
    } catch (error: any) {
        return res.status(500).json({ error: error.message })
    }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse, supabase: any) {
    try {
        const { titulo, tipo, descricao, data_hora, local, imagem } = req.body

        if (!titulo || !tipo || !descricao || !data_hora || !local) {
            return res.status(400).json({ error: 'Campos obrigatórios faltando' })
        }

        const { data: evento, error } = await supabase
            .from('eventos')
            .insert([{
                titulo,
                tipo,
                descricao,
                data_hora,
                local,
                imagem: imagem || null,
            }])
            .select()
            .single()

        if (error) throw error

        return res.status(201).json({ evento })
    } catch (error: any) {
        return res.status(500).json({ error: error.message })
    }
}

async function handlePut(req: NextApiRequest, res: NextApiResponse, supabase: any) {
    try {
        const { id, titulo, tipo, descricao, data_hora, local, imagem } = req.body

        if (!id) {
            return res.status(400).json({ error: 'ID do evento é obrigatório' })
        }

        const { data: evento, error } = await supabase
            .from('eventos')
            .update({
                titulo,
                tipo,
                descricao,
                data_hora,
                local,
                imagem: imagem || null,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single()

        if (error) throw error

        return res.status(200).json({ evento })
    } catch (error: any) {
        return res.status(500).json({ error: error.message })
    }
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse, supabase: any) {
    try {
        const { id } = req.query

        if (!id) {
            return res.status(400).json({ error: 'ID do evento é obrigatório' })
        }

        const { error } = await supabase
            .from('eventos')
            .delete()
            .eq('id', id)

        if (error) throw error

        return res.status(200).json({ success: true })
    } catch (error: any) {
        return res.status(500).json({ error: error.message })
    }
}

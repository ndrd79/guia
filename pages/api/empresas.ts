import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
        const { featured, limit = '10', category } = req.query

        let query = supabase
            .from('empresas')
            .select('id, name, description, category, image, rating, reviews, location, featured, plan_type')
            .eq('ativo', true)

        // Filtrar por destaque
        if (featured === 'true') {
            query = query.or('featured.eq.true,plan_type.eq.premium')
        }

        // Filtrar por categoria
        if (category && typeof category === 'string') {
            query = query.eq('category', category)
        }

        // Ordenar e limitar
        query = query
            .order('featured', { ascending: false })
            .order('rating', { ascending: false })
            .limit(parseInt(limit as string, 10))

        const { data: empresas, error } = await query

        if (error) {
            console.error('Erro ao buscar empresas:', error)
            return res.status(500).json({ error: 'Erro ao buscar empresas' })
        }

        return res.status(200).json({
            empresas: empresas || [],
            total: empresas?.length || 0
        })
    } catch (error) {
        console.error('Erro na API empresas:', error)
        return res.status(500).json({ error: 'Erro interno do servidor' })
    }
}

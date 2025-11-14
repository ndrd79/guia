import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Cliente administrativo (bypass RLS)
const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

function createSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
    .replace(/\s+/g, '-') // Substitui espaços por hífens
    .replace(/-+/g, '-') // Remove hífens duplicados
    .trim();
}

async function isAdmin(req: NextApiRequest): Promise<boolean> {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) return false

    const token = authHeader.substring(7)
    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (error || !user) return false

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    return profile?.role === 'admin'
  } catch (e) {
    return false
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ error: 'Configuração do Supabase ausente' })
  }

  const allowed = await isAdmin(req)
  if (!allowed) {
    return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' })
  }

  try {
    if (req.method === 'POST') {
      const data = req.body || {}

      // Se marcar como destaque, desmarcar outras
      if (data.destaque) {
        await supabase.from('noticias').update({ destaque: false })
      }

      const slug = createSlug(data.titulo);
      
      const payload = {
        titulo: data.titulo,
        categoria: data.categoria,
        data: data.data,
        imagem: data.imagem || null,
        descricao: data.descricao,
        conteudo: data.conteudo,
        banner_id: data.banner_id || null,
        destaque: !!data.destaque,
        workflow_status: 'published', // Definir como publicado para aparecer nas páginas
        slug: slug, // Adicionar slug para URL amigável
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase.from('noticias').insert([payload])
      if (error) throw error
      return res.status(201).json({ message: 'Notícia criada com sucesso' })
    }

    if (req.method === 'PUT') {
      const { id, ...data } = req.body || {}
      if (!id) return res.status(400).json({ error: 'ID da notícia é obrigatório' })

      // Se marcar como destaque, desmarcar outras (exceto a atual)
      if (data.destaque) {
        await supabase
          .from('noticias')
          .update({ destaque: false })
          .neq('id', id)
      }

      const payload = {
        titulo: data.titulo,
        categoria: data.categoria,
        data: data.data,
        imagem: data.imagem || null,
        descricao: data.descricao,
        conteudo: data.conteudo,
        banner_id: data.banner_id || null,
        destaque: !!data.destaque,
        workflow_status: 'published', // Garantir que permaneça publicada
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase
        .from('noticias')
        .update(payload)
        .eq('id', id)

      if (error) throw error
      return res.status(200).json({ message: 'Notícia atualizada com sucesso' })
    }

    if (req.method === 'DELETE') {
      const { id } = req.query
      const noticiaId = Array.isArray(id) ? id[0] : id
      if (!noticiaId) return res.status(400).json({ error: 'ID da notícia é obrigatório' })

      const { error } = await supabase
        .from('noticias')
        .delete()
        .eq('id', noticiaId)
      if (error) throw error
      return res.status(200).json({ message: 'Notícia excluída com sucesso' })
    }

    return res.status(405).json({ error: 'Método não permitido' })
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || 'Erro interno' })
  }
}
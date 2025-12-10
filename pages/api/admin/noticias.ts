import { withAdminAuth, AdminApiHandler } from '../../../lib/api/withAdminAuth'

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

/**
 * API de administração de notícias
 * Suporta POST (criar), PUT (atualizar), DELETE (excluir)
 * 
 * Segurança: Usa withAdminAuth para validação centralizada
 */
const handler: AdminApiHandler = async (req, res, { adminClient }) => {
  try {
    if (req.method === 'POST') {
      const data = req.body || {}

      // Se marcar como destaque, desmarcar outras
      if (data.destaque) {
        await adminClient.from('noticias').update({ destaque: false })
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
        credito_foto: data.credito_foto || null,
        fonte: data.fonte || null,
        workflow_status: 'published', // Definir como publicado para aparecer nas páginas
        slug: slug, // Adicionar slug para URL amigável
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const { error } = await adminClient.from('noticias').insert([payload])
      if (error) throw error
      return res.status(201).json({ message: 'Notícia criada com sucesso' })
    }

    if (req.method === 'PUT') {
      const { id, ...data } = req.body || {}
      if (!id) return res.status(400).json({ error: 'ID da notícia é obrigatório' })

      // Se marcar como destaque, desmarcar outras (exceto a atual)
      if (data.destaque) {
        await adminClient
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
        credito_foto: data.credito_foto || null,
        fonte: data.fonte || null,
        workflow_status: 'published', // Garantir que permaneça publicada
        updated_at: new Date().toISOString(),
      }

      const { error } = await adminClient
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

      const { error } = await adminClient
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

export default withAdminAuth(handler)
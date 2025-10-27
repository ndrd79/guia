import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { action, ids, data } = req.body;

    if (!action || !ids || !Array.isArray(ids)) {
      return res.status(400).json({ error: 'Ação e IDs são obrigatórios' });
    }

    switch (action) {
      case 'delete':
        return await handleBulkDelete(ids, res);
      case 'move':
        return await handleBulkMove(ids, data?.folder_path, res);
      case 'update_tags':
        return await handleBulkUpdateTags(ids, data?.tags, res);
      case 'update_alt_text':
        return await handleBulkUpdateAltText(ids, data?.alt_text, res);
      default:
        return res.status(400).json({ error: 'Ação não suportada' });
    }
  } catch (error) {
    console.error('Erro na ação em massa:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

// Deletar múltiplos arquivos
async function handleBulkDelete(ids: string[], res: NextApiResponse) {
  try {
    // Buscar dados dos arquivos
    const { data: mediaFiles, error: fetchError } = await supabase
      .from('media_library')
      .select('*')
      .in('id', ids);

    if (fetchError) {
      return res.status(500).json({ error: fetchError.message });
    }

    // Deletar do storage
    const filesToDelete: string[] = [];
    const thumbnailsToDelete: string[] = [];
    const optimizedToDelete: string[] = [];

    mediaFiles?.forEach(file => {
      filesToDelete.push(file.file_path);
      
      if (file.thumbnail_url) {
        const thumbnailPath = file.thumbnail_url.split('/').pop();
        thumbnailsToDelete.push(`thumbnails/${thumbnailPath}`);
      }
      
      if (file.optimized_url) {
        const optimizedPath = file.optimized_url.split('/').pop();
        optimizedToDelete.push(`optimized/${optimizedPath}`);
      }
    });

    // Deletar arquivos do storage
    if (filesToDelete.length > 0) {
      await supabase.storage.from('media-library').remove(filesToDelete);
    }
    if (thumbnailsToDelete.length > 0) {
      await supabase.storage.from('media-library').remove(thumbnailsToDelete);
    }
    if (optimizedToDelete.length > 0) {
      await supabase.storage.from('media-library').remove(optimizedToDelete);
    }

    // Deletar do banco
    const { error: deleteError } = await supabase
      .from('media_library')
      .delete()
      .in('id', ids);

    if (deleteError) {
      return res.status(500).json({ error: deleteError.message });
    }

    return res.status(200).json({
      message: `${ids.length} arquivo(s) deletado(s) com sucesso`,
      deletedCount: ids.length
    });
  } catch (error) {
    console.error('Erro ao deletar arquivos:', error);
    return res.status(500).json({ error: 'Erro ao deletar arquivos' });
  }
}

// Mover múltiplos arquivos para uma pasta
async function handleBulkMove(ids: string[], folderPath: string, res: NextApiResponse) {
  if (!folderPath) {
    return res.status(400).json({ error: 'Caminho da pasta é obrigatório' });
  }

  try {
    const { data, error } = await supabase
      .from('media_library')
      .update({
        folder_path: folderPath,
        updated_at: new Date().toISOString()
      })
      .in('id', ids)
      .select();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({
      message: `${ids.length} arquivo(s) movido(s) para ${folderPath}`,
      data
    });
  } catch (error) {
    console.error('Erro ao mover arquivos:', error);
    return res.status(500).json({ error: 'Erro ao mover arquivos' });
  }
}

// Atualizar tags de múltiplos arquivos
async function handleBulkUpdateTags(ids: string[], tags: string[], res: NextApiResponse) {
  if (!tags || !Array.isArray(tags)) {
    return res.status(400).json({ error: 'Tags são obrigatórias' });
  }

  try {
    const { data, error } = await supabase
      .from('media_library')
      .update({
        tags,
        updated_at: new Date().toISOString()
      })
      .in('id', ids)
      .select();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({
      message: `Tags atualizadas para ${ids.length} arquivo(s)`,
      data
    });
  } catch (error) {
    console.error('Erro ao atualizar tags:', error);
    return res.status(500).json({ error: 'Erro ao atualizar tags' });
  }
}

// Atualizar texto alternativo de múltiplos arquivos
async function handleBulkUpdateAltText(ids: string[], altText: string, res: NextApiResponse) {
  if (!altText) {
    return res.status(400).json({ error: 'Texto alternativo é obrigatório' });
  }

  try {
    const { data, error } = await supabase
      .from('media_library')
      .update({
        alt_text: altText,
        updated_at: new Date().toISOString()
      })
      .in('id', ids)
      .select();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({
      message: `Texto alternativo atualizado para ${ids.length} arquivo(s)`,
      data
    });
  } catch (error) {
    console.error('Erro ao atualizar texto alternativo:', error);
    return res.status(500).json({ error: 'Erro ao atualizar texto alternativo' });
  }
}
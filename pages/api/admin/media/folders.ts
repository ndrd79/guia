import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { method } = req;

    switch (method) {
      case 'GET':
        return await handleGet(req, res);
      case 'POST':
        return await handlePost(req, res);
      case 'PUT':
        return await handlePut(req, res);
      case 'DELETE':
        return await handleDelete(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro na API de pastas:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

// GET - Listar pastas
async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { data, error } = await supabase
      .from('media_folders')
      .select('*')
      .order('name');

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // Buscar contagem de arquivos por pasta
    const { data: fileCounts, error: countError } = await supabase
      .from('media_library')
      .select('folder_path')
      .not('folder_path', 'is', null);

    if (countError) {
      console.error('Erro ao contar arquivos:', countError);
    }

    // Contar arquivos por pasta
    const folderCounts: { [key: string]: number } = {};
    fileCounts?.forEach(file => {
      folderCounts[file.folder_path] = (folderCounts[file.folder_path] || 0) + 1;
    });

    // Adicionar contagem às pastas
    const foldersWithCounts = data?.map(folder => ({
      ...folder,
      file_count: folderCounts[folder.path] || 0
    }));

    return res.status(200).json({ data: foldersWithCounts });
  } catch (error) {
    console.error('Erro ao listar pastas:', error);
    return res.status(500).json({ error: 'Erro ao listar pastas' });
  }
}

// POST - Criar nova pasta
async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { name, path, parent_path, description } = req.body;

    if (!name || !path) {
      return res.status(400).json({ error: 'Nome e caminho são obrigatórios' });
    }

    // Verificar se a pasta já existe
    const { data: existingFolder } = await supabase
      .from('media_folders')
      .select('id')
      .eq('path', path)
      .single();

    if (existingFolder) {
      return res.status(409).json({ error: 'Pasta já existe' });
    }

    const { data, error } = await supabase
      .from('media_folders')
      .insert({
        name,
        path,
        parent_path: parent_path || null,
        description: description || null
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(201).json({
      message: 'Pasta criada com sucesso',
      data
    });
  } catch (error) {
    console.error('Erro ao criar pasta:', error);
    return res.status(500).json({ error: 'Erro ao criar pasta' });
  }
}

// PUT - Atualizar pasta
async function handlePut(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Nome é obrigatório' });
    }

    const { data, error } = await supabase
      .from('media_folders')
      .update({
        name,
        description,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({
      message: 'Pasta atualizada com sucesso',
      data
    });
  } catch (error) {
    console.error('Erro ao atualizar pasta:', error);
    return res.status(500).json({ error: 'Erro ao atualizar pasta' });
  }
}

// DELETE - Deletar pasta
async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;

    // Buscar dados da pasta
    const { data: folder, error: fetchError } = await supabase
      .from('media_folders')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !folder) {
      return res.status(404).json({ error: 'Pasta não encontrada' });
    }

    // Verificar se há arquivos na pasta
    const { data: filesInFolder, error: filesError } = await supabase
      .from('media_library')
      .select('id')
      .eq('folder_path', folder.path);

    if (filesError) {
      return res.status(500).json({ error: 'Erro ao verificar arquivos na pasta' });
    }

    if (filesInFolder && filesInFolder.length > 0) {
      return res.status(409).json({
        error: 'Não é possível deletar pasta que contém arquivos',
        fileCount: filesInFolder.length
      });
    }

    // Verificar se há subpastas
    const { data: subfolders, error: subfoldersError } = await supabase
      .from('media_folders')
      .select('id')
      .eq('parent_path', folder.path);

    if (subfoldersError) {
      return res.status(500).json({ error: 'Erro ao verificar subpastas' });
    }

    if (subfolders && subfolders.length > 0) {
      return res.status(409).json({
        error: 'Não é possível deletar pasta que contém subpastas',
        subfolderCount: subfolders.length
      });
    }

    // Deletar pasta
    const { error: deleteError } = await supabase
      .from('media_folders')
      .delete()
      .eq('id', id);

    if (deleteError) {
      return res.status(500).json({ error: deleteError.message });
    }

    return res.status(200).json({ message: 'Pasta deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar pasta:', error);
    return res.status(500).json({ error: 'Erro ao deletar pasta' });
  }
}
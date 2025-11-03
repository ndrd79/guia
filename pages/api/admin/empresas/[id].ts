import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Check admin authentication
async function checkAdminAuth(req: NextApiRequest): Promise<boolean> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return false;
    }

    const token = authHeader.substring(7);
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return false;
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    return profile?.role === 'admin';
  } catch (error) {
    console.error('Auth check error:', error);
    return false;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Check authentication
  const isAdmin = await checkAdminAuth(req);
  if (!isAdmin) {
    return res.status(401).json({ error: 'Acesso negado' });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'ID da empresa é obrigatório' });
  }

  if (req.method === 'GET') {
    try {
      // Get empresa details
      const { data: empresa, error } = await supabase
        .from('empresas')
        .select(`
          id,
          nome,
          categoria,
          telefone,
          endereco,
          descricao,
          email,
          website,
          whatsapp,
          horario_funcionamento,
          imagem,
          imported_at,
          import_batch_id,
          plano,
          created_at,
          updated_at
        `)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({ error: 'Empresa não encontrada' });
        }
        console.error('Database error:', error);
        return res.status(500).json({ error: 'Erro ao buscar empresa' });
      }

      return res.status(200).json({ empresa });

    } catch (error) {
      console.error('API error:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      // Check if empresa exists
      const { data: existingEmpresa, error: checkError } = await supabase
        .from('empresas')
        .select('id, nome')
        .eq('id', id)
        .single();

      if (checkError) {
        if (checkError.code === 'PGRST116') {
          return res.status(404).json({ error: 'Empresa não encontrada' });
        }
        console.error('Database error:', checkError);
        return res.status(500).json({ error: 'Erro ao verificar empresa' });
      }

      // Delete empresa
      const { error: deleteError } = await supabase
        .from('empresas')
        .delete()
        .eq('id', id);

      if (deleteError) {
        console.error('Delete error:', deleteError);
        return res.status(500).json({ error: 'Erro ao excluir empresa' });
      }

      return res.status(200).json({ 
        message: 'Empresa excluída com sucesso',
        empresa: existingEmpresa
      });

    } catch (error) {
      console.error('API error:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const {
        nome,
        categoria,
        telefone,
        endereco,
        descricao,
        email,
        website,
        whatsapp,
        horario_funcionamento,
        plano
      } = req.body;

      // Validate required fields
      if (!nome || !categoria || !telefone || !endereco || !descricao) {
        return res.status(400).json({ 
          error: 'Campos obrigatórios: nome, categoria, telefone, endereco, descricao' 
        });
      }

      // Check if empresa exists
      const { data: existingEmpresa, error: checkError } = await supabase
        .from('empresas')
        .select('id')
        .eq('id', id)
        .single();

      if (checkError) {
        if (checkError.code === 'PGRST116') {
          return res.status(404).json({ error: 'Empresa não encontrada' });
        }
        console.error('Database error:', checkError);
        return res.status(500).json({ error: 'Erro ao verificar empresa' });
      }

      // Update empresa
      const { data: updatedEmpresa, error: updateError } = await supabase
        .from('empresas')
        .update({
          nome,
          categoria,
          telefone,
          endereco,
          descricao,
          email: email || null,
          website: website || null,
          whatsapp: whatsapp || null,
          horario_funcionamento: horario_funcionamento || null,
          plano: plano || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        console.error('Update error:', updateError);
        return res.status(500).json({ error: 'Erro ao atualizar empresa' });
      }

      return res.status(200).json({ 
        message: 'Empresa atualizada com sucesso',
        empresa: updatedEmpresa
      });

    } catch (error) {
      console.error('API error:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  return res.status(405).json({ error: 'Método não permitido' });
}
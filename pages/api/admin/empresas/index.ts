import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface EmpresaFilters {
  search?: string;
  categoria?: string;
  batch_id?: string;
  imported_only?: boolean;
  page?: number;
  limit?: number;
}

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

// Build query with filters
function buildQuery(filters: EmpresaFilters) {
  let query = supabase
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
    `, { count: 'exact' });

  // Search filter
  if (filters.search) {
    const searchTerm = `%${filters.search}%`;
    query = query.or(`nome.ilike.${searchTerm},categoria.ilike.${searchTerm},telefone.ilike.${searchTerm},endereco.ilike.${searchTerm}`);
  }

  // Category filter
  if (filters.categoria) {
    query = query.eq('categoria', filters.categoria);
  }

  // Batch filter
  if (filters.batch_id) {
    query = query.eq('import_batch_id', filters.batch_id);
  }

  // Imported only filter
  if (filters.imported_only) {
    query = query.not('imported_at', 'is', null);
  }

  return query;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Check authentication
  const isAdmin = await checkAdminAuth(req);
  if (!isAdmin) {
    return res.status(401).json({ error: 'Acesso negado' });
  }

  if (req.method === 'GET') {
    try {
      // Parse filters
      const filters: EmpresaFilters = {
        search: req.query.search as string,
        categoria: req.query.categoria as string,
        batch_id: req.query.batch_id as string,
        imported_only: req.query.imported_only === 'true',
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20
      };

      // Build and execute query
      let query = buildQuery(filters);

      // Add pagination
      const offset = (filters.page! - 1) * filters.limit!;
      query = query
        .order('created_at', { ascending: false })
        .range(offset, offset + filters.limit! - 1);

      const { data: empresas, error, count } = await query;

      if (error) {
        console.error('Database error:', error);
        return res.status(500).json({ error: 'Erro ao buscar empresas' });
      }

      // Calculate pagination info
      const totalItems = count || 0;
      const totalPages = Math.ceil(totalItems / filters.limit!);

      return res.status(200).json({
        empresas: empresas || [],
        pagination: {
          page: filters.page,
          limit: filters.limit,
          totalItems,
          totalPages,
          hasNext: filters.page! < totalPages,
          hasPrev: filters.page! > 1
        }
      });

    } catch (error) {
      console.error('API error:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  return res.status(405).json({ error: 'Método não permitido' });
}
import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Verificar se usuário é admin
const checkAdminAuth = async (req: NextApiRequest) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return false;

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) return false;

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  return profile?.role === 'admin';
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    // Verificar autenticação admin
    const isAdmin = await checkAdminAuth(req);
    if (!isAdmin) {
      return res.status(403).json({ error: 'Acesso negado. Apenas administradores podem ver o histórico.' });
    }

    // Parâmetros de paginação e filtros
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;

    const offset = (page - 1) * limit;

    // Construir query base
    let query = supabase
      .from('import_batches')
      .select(`
        id,
        filename,
        total_records,
        successful_records,
        failed_records,
        status,
        created_at,
        completed_at,
        processing_time_ms,
        error_details,
        profiles!import_batches_user_id_fkey (
          email
        )
      `)
      .order('created_at', { ascending: false });

    // Aplicar filtros
    if (status && ['processing', 'completed', 'failed', 'cancelled'].includes(status)) {
      query = query.eq('status', status);
    }

    if (startDate) {
      query = query.gte('created_at', startDate);
    }

    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    // Executar query com paginação
    const { data: imports, error: importsError, count } = await query
      .range(offset, offset + limit - 1)
      .limit(limit);

    if (importsError) {
      throw new Error(`Erro ao buscar histórico: ${importsError.message}`);
    }

    // Buscar estatísticas gerais
    const { data: stats, error: statsError } = await supabase
      .from('import_batches')
      .select(`
        status,
        total_records,
        successful_records,
        failed_records
      `);

    if (statsError) {
      console.error('Erro ao buscar estatísticas:', statsError);
    }

    // Calcular estatísticas
    const statistics = {
      totalImports: stats?.length || 0,
      totalRecordsProcessed: stats?.reduce((sum, batch) => sum + (batch.total_records || 0), 0) || 0,
      totalSuccessful: stats?.reduce((sum, batch) => sum + (batch.successful_records || 0), 0) || 0,
      totalFailed: stats?.reduce((sum, batch) => sum + (batch.failed_records || 0), 0) || 0,
      byStatus: {
        processing: stats?.filter(s => s.status === 'processing').length || 0,
        completed: stats?.filter(s => s.status === 'completed').length || 0,
        failed: stats?.filter(s => s.status === 'failed').length || 0,
        cancelled: stats?.filter(s => s.status === 'cancelled').length || 0
      }
    };

    // Formatar dados para resposta
    const formattedImports = imports?.map(importBatch => ({
      id: importBatch.id,
      filename: importBatch.filename,
      totalRecords: importBatch.total_records,
      successfulRecords: importBatch.successful_records,
      failedRecords: importBatch.failed_records,
      status: importBatch.status,
      createdAt: importBatch.created_at,
      completedAt: importBatch.completed_at,
      processingTimeMs: importBatch.processing_time_ms,
      errorDetails: importBatch.error_details,
      userEmail: Array.isArray(importBatch.profiles) && importBatch.profiles.length > 0 
        ? importBatch.profiles[0].email || 'N/A'
        : 'N/A',
      successRate: importBatch.total_records > 0 
        ? Math.round((importBatch.successful_records / importBatch.total_records) * 100)
        : 0
    })) || [];

    // Calcular informações de paginação
    const totalPages = Math.ceil((count || 0) / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.status(200).json({
      success: true,
      imports: formattedImports,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: count || 0,
        itemsPerPage: limit,
        hasNextPage,
        hasPrevPage
      },
      statistics,
      filters: {
        status,
        startDate,
        endDate
      }
    });

  } catch (error) {
    console.error('Erro ao buscar histórico de importações:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor ao buscar histórico',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}
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
      return res.status(403).json({ error: 'Acesso negado. Apenas administradores podem ver detalhes.' });
    }

    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'ID da importação é obrigatório' });
    }

    // Parâmetros de paginação e filtros para resultados
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const status = req.query.status as string;
    const offset = (page - 1) * limit;

    // Buscar dados da importação
    const { data: importBatch, error: batchError } = await supabase
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
      .eq('id', id)
      .single();

    if (batchError || !importBatch) {
      return res.status(404).json({ error: 'Importação não encontrada' });
    }

    // Construir query para resultados
    let resultsQuery = supabase
      .from('import_results')
      .select(`
        id,
        row_number,
        empresa_id,
        status,
        data,
        error_message,
        warning_message,
        created_at,
        empresas (
          id,
          name,
          category,
          phone,
          ativo
        )
      `)
      .eq('import_batch_id', id)
      .order('row_number', { ascending: true });

    // Aplicar filtro de status se fornecido
    if (status && ['success', 'error', 'warning'].includes(status)) {
      resultsQuery = resultsQuery.eq('status', status);
    }

    // Executar query com paginação
    const { data: results, error: resultsError, count } = await resultsQuery
      .range(offset, offset + limit - 1);

    if (resultsError) {
      throw new Error(`Erro ao buscar resultados: ${resultsError.message}`);
    }

    // Buscar estatísticas detalhadas dos resultados
    const { data: resultStats, error: statsError } = await supabase
      .from('import_results')
      .select('status')
      .eq('import_batch_id', id);

    if (statsError) {
      console.error('Erro ao buscar estatísticas dos resultados:', statsError);
    }

    // Calcular estatísticas dos resultados
    const detailedStats = {
      total: resultStats?.length || 0,
      success: resultStats?.filter(r => r.status === 'success').length || 0,
      error: resultStats?.filter(r => r.status === 'error').length || 0,
      warning: resultStats?.filter(r => r.status === 'warning').length || 0
    };

    // Formatar dados da importação
    const formattedImport = {
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
    };

    // Formatar resultados
    const formattedResults = results?.map(result => ({
      id: result.id,
      rowNumber: result.row_number,
      empresaId: result.empresa_id,
      status: result.status,
      data: result.data,
      errorMessage: result.error_message,
      warningMessage: result.warning_message,
      createdAt: result.created_at,
      empresa: Array.isArray(result.empresas) && result.empresas.length > 0 ? {
        id: result.empresas[0].id,
        nome: result.empresas[0].name,
        categoria: result.empresas[0].category,
        telefone: result.empresas[0].phone,
        ativo: result.empresas[0].ativo
      } : null
    })) || [];

    // Calcular informações de paginação
    const totalPages = Math.ceil((count || 0) / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Buscar exemplos de erros mais comuns (top 5)
    const { data: errorExamples } = await supabase
      .from('import_results')
      .select('error_message')
      .eq('import_batch_id', id)
      .eq('status', 'error')
      .not('error_message', 'is', null)
      .limit(100);

    // Agrupar erros por mensagem
    const errorGroups = errorExamples?.reduce((acc: any, result) => {
      const message = result.error_message;
      if (message) {
        acc[message] = (acc[message] || 0) + 1;
      }
      return acc;
    }, {}) || {};

    const topErrors = Object.entries(errorGroups)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 5)
      .map(([message, count]) => ({ message, count }));

    res.status(200).json({
      success: true,
      import: formattedImport,
      results: formattedResults,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: count || 0,
        itemsPerPage: limit,
        hasNextPage,
        hasPrevPage
      },
      statistics: detailedStats,
      topErrors,
      filters: {
        status
      }
    });

  } catch (error) {
    console.error('Erro ao buscar detalhes da importação:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor ao buscar detalhes',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}
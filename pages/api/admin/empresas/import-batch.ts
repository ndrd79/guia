import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface ImportEmpresa {
  nome: string;
  categoria: string;
  telefone: string;
  endereco: string;
  descricao: string;
  email?: string;
  website?: string;
  whatsapp?: string;
  horario_funcionamento?: string;
  imagem?: string;
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  twitter?: string;
  _rowNumber: number;
}

interface ImportResult {
  success: boolean;
  empresa_id?: string;
  error?: string;
  row_number: number;
  data: ImportEmpresa;
}

// Verificar se usuário é admin
const checkAdminAuth = async (req: NextApiRequest) => {
  const authHeader = req.headers.authorization;
  console.log('[import-batch] Authorization header present:', !!authHeader);
  if (!authHeader) return null;

  const token = authHeader.replace('Bearer ', '');
  try {
    console.log('[import-batch] Token preview:', token ? token.slice(0, 10) + '...' + token.slice(-6) : null, 'length:', token?.length || 0);
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error) {
      console.log('[import-batch] supabase.auth.getUser error:', error.message);
    }
    if (error || !user) return null;

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.log('[import-batch] profile fetch error:', profileError.message);
    }
    console.log('[import-batch] User:', user.id, 'Role:', profile?.role);
    return profile?.role === 'admin' ? user : null;
  } catch (e: any) {
    console.log('[import-batch] Unexpected auth error:', e?.message || String(e));
    return null;
  }
};

// Processar empresas em chunks para evitar timeout
const processInChunks = async <T>(
  items: T[],
  chunkSize: number,
  processor: (chunk: T[]) => Promise<any[]>
): Promise<any[]> => {
  const results = [];
  
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    const chunkResults = await processor(chunk);
    results.push(...chunkResults);
  }
  
  return results;
};

// Inserir uma empresa no banco
const insertEmpresa = async (empresa: ImportEmpresa, importBatchId: string): Promise<ImportResult> => {
  try {
    // Preparar dados para inserção
    const empresaData = {
      nome: empresa.nome,
      categoria: empresa.categoria,
      telefone: empresa.telefone,
      endereco: empresa.endereco,
      descricao: empresa.descricao,
      email: empresa.email || null,
      website: empresa.website || null,
      whatsapp: empresa.whatsapp || null,
      horario_funcionamento: empresa.horario_funcionamento || null,
      imagem: empresa.imagem || null,
      facebook: empresa.facebook || null,
      instagram: empresa.instagram || null,
      linkedin: empresa.linkedin || null,
      twitter: empresa.twitter || null,
      plano: 'basico',
      imported_at: new Date().toISOString(),
      import_batch_id: importBatchId,
      ativo: true,
      destaque: false
    };

    // Inserir empresa
    const { data: insertedEmpresa, error: insertError } = await supabase
      .from('empresas')
      .insert(empresaData)
      .select('id')
      .single();

    if (insertError) {
      throw new Error(`Erro ao inserir empresa: ${insertError.message}`);
    }

    return {
      success: true,
      empresa_id: insertedEmpresa.id,
      row_number: empresa._rowNumber,
      data: empresa
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      row_number: empresa._rowNumber,
      data: empresa
    };
  }
};

// Processar chunk de empresas
const processChunk = async (empresas: ImportEmpresa[], importBatchId: string): Promise<ImportResult[]> => {
  const results = await Promise.all(
    empresas.map(empresa => insertEmpresa(empresa, importBatchId))
  );
  
  return results;
};

// Salvar resultado no banco
const saveImportResult = async (result: ImportResult, importBatchId: string) => {
  const resultData = {
    import_batch_id: importBatchId,
    row_number: result.row_number,
    empresa_id: result.empresa_id || null,
    status: result.success ? 'success' : 'error',
    data: result.data,
    error_message: result.error || null
  };

  await supabase
    .from('import_results')
    .insert(resultData);
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  let importBatchId: string | null = null;

  try {
    console.log('[import-batch] Incoming request headers:', {
      authorization_present: !!req.headers.authorization,
      content_type: req.headers['content-type'] || null,
      user_agent: req.headers['user-agent'] || null,
    });

    // Verificar autenticação admin
    const user = await checkAdminAuth(req);
    if (!user) {
      console.log('[import-batch] Access denied: user is not admin or token invalid');
      return res.status(403).json({ error: 'Acesso negado. Apenas administradores podem importar empresas.' });
    }

    const { empresas, filename } = req.body;

    if (!empresas || !Array.isArray(empresas) || empresas.length === 0) {
      return res.status(400).json({ error: 'Dados de empresas inválidos ou vazios' });
    }

    if (empresas.length > 1000) {
      return res.status(400).json({ error: 'Máximo de 1000 empresas por importação' });
    }

    const startTime = Date.now();
    console.log('[import-batch] Starting import:', { count: empresas.length, filename });

    // Criar registro de importação
    const { data: importBatch, error: batchError } = await supabase
      .from('import_batches')
      .insert({
        user_id: user.id,
        filename: filename || 'arquivo_importacao.xlsx',
        total_records: empresas.length,
        status: 'processing'
      })
      .select('id')
      .single();

    if (batchError || !importBatch) {
      throw new Error(`Erro ao criar batch de importação: ${batchError?.message}`);
    }

    importBatchId = importBatch.id;
    console.log('[import-batch] Created batch:', importBatchId);

    // Processar empresas em chunks de 25
    const CHUNK_SIZE = 25;
    const allResults = await processInChunks(
      empresas,
      CHUNK_SIZE,
      (chunk) => processChunk(chunk, importBatchId!)
    );

    console.log('[import-batch] Processed chunks. Total results:', allResults.length);

    // Salvar todos os resultados
    await Promise.all(
      allResults.map(result => saveImportResult(result, importBatchId!))
    );

    // Calcular estatísticas
    const successCount = allResults.filter(r => r.success).length;
    const errorCount = allResults.filter(r => !r.success).length;
    const processingTime = Date.now() - startTime;
    console.log('[import-batch] Summary:', { successCount, errorCount, processingTime });

    // Atualizar status do batch
    await supabase
      .from('import_batches')
      .update({
        status: 'completed',
        successful_records: successCount,
        failed_records: errorCount,
        completed_at: new Date().toISOString(),
        processing_time_ms: processingTime
      })
      .eq('id', importBatchId);

    // Preparar resposta
    const errors = allResults.filter(r => !r.success);
    const successes = allResults.filter(r => r.success);

    res.status(200).json({
      success: true,
      importId: importBatchId,
      summary: {
        total: empresas.length,
        successful: successCount,
        failed: errorCount,
        processingTimeMs: processingTime
      },
      results: {
        successes: successes.slice(0, 10), // Primeiros 10 sucessos
        errors: errors.slice(0, 10) // Primeiros 10 erros
      },
      hasMoreResults: allResults.length > 20
    });

  } catch (error) {
    console.error('[import-batch] Erro na importação em lote:', error);

    // Marcar batch como falhou se foi criado
    if (importBatchId) {
      await supabase
        .from('import_batches')
        .update({
          status: 'failed',
          error_details: {
            message: error instanceof Error ? error.message : 'Erro desconhecido',
            timestamp: new Date().toISOString()
          }
        })
        .eq('id', importBatchId);
    }

    res.status(500).json({ 
      error: 'Erro interno do servidor na importação',
      details: error instanceof Error ? error.message : 'Erro desconhecido',
      importId: importBatchId
    });
  }
}
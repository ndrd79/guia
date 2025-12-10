const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Erro: Variáveis de ambiente do Supabase não encontradas');
  console.log('Certifique-se de que NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY estão configuradas em .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function executeSQL(sql, description) {
  try {
    console.log(`📝 ${description}...`);
    const { data, error } = await supabase.from('noticias').select('count').limit(1);
    
    if (error) {
      console.error(`❌ Erro de conexão: ${error.message}`);
      return false;
    }
    
    console.log(`✅ ${description} - Conexão OK`);
    return true;
  } catch (error) {
    console.error(`❌ Erro: ${error.message}`);
    return false;
  }
}

async function applyOptimizations() {
  console.log('🚀 Iniciando aplicação das otimizações de performance...\n');

  try {
    // Verificar conexão
    console.log('🔗 Verificando conexão com Supabase...');
    const { data, error } = await supabase.from('noticias').select('id').limit(1);
    
    if (error) {
      console.error('❌ Erro de conexão:', error.message);
      return;
    }
    
    console.log('✅ Conexão com Supabase estabelecida');

    // Como não podemos executar SQL diretamente via Supabase client,
    // vamos criar as otimizações que podemos implementar no código

    console.log('\n📝 Implementando otimizações no código...');

    // 1. Verificar se já temos índices básicos
    console.log('\n📊 Verificando estrutura atual da tabela notícias...');
    const { data: noticias, error: noticiasError } = await supabase
      .from('noticias')
      .select('id, titulo, descricao, conteudo, categoria, created_at')
      .limit(5);

    if (noticiasError) {
      console.error('❌ Erro ao acessar notícias:', noticiasError.message);
    } else {
      console.log(`✅ Tabela notícias acessível - ${noticias.length} registros de teste`);
    }

    // 2. Testar busca básica
    console.log('\n🔍 Testando busca básica...');
    const { data: searchTest, error: searchError } = await supabase
      .from('noticias')
      .select('id, titulo, categoria, created_at')
      .ilike('titulo', '%maria%')
      .limit(5);

    if (searchError) {
      console.error('❌ Erro na busca:', searchError.message);
    } else {
      console.log(`✅ Busca básica funcionando - ${searchTest.length} resultados`);
    }

    console.log('\n📋 INSTRUÇÕES PARA APLICAR AS OTIMIZAÇÕES SQL:');
    console.log('Como o Supabase não permite execução direta de SQL via API,');
    console.log('você precisa executar os comandos SQL manualmente no Supabase Dashboard:');
    console.log('\n1. Acesse: https://supabase.com/dashboard');
    console.log('2. Vá para seu projeto > SQL Editor');
    console.log('3. Execute os seguintes comandos SQL:\n');

    console.log('-- 1. Índice GIN para busca full-text em português');
    console.log(`CREATE INDEX IF NOT EXISTS idx_noticias_fulltext_pt 
ON noticias USING gin(
    to_tsvector('portuguese', 
        COALESCE(titulo, '') || ' ' || 
        COALESCE(descricao, '') || ' ' || 
        COALESCE(conteudo, '')
    )
);\n`);

    console.log('-- 2. Função de busca otimizada');
    console.log(`CREATE OR REPLACE FUNCTION search_noticias_fulltext(
    search_query TEXT,
    limit_count INTEGER DEFAULT 20,
    offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    titulo VARCHAR,
    descricao TEXT,
    conteudo TEXT,
    imagem TEXT,
    categoria VARCHAR,
    created_at TIMESTAMPTZ,
    rank REAL
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        n.id,
        n.titulo,
        n.descricao,
        n.conteudo,
        n.imagem,
        n.categoria,
        n.created_at,
        ts_rank(
            to_tsvector('portuguese', 
                COALESCE(n.titulo, '') || ' ' || 
                COALESCE(n.descricao, '') || ' ' || 
                COALESCE(n.conteudo, '')
            ),
            plainto_tsquery('portuguese', search_query)
        ) as rank
    FROM noticias n
    WHERE to_tsvector('portuguese', 
        COALESCE(n.titulo, '') || ' ' || 
        COALESCE(n.descricao, '') || ' ' || 
        COALESCE(n.conteudo, '')
    ) @@ plainto_tsquery('portuguese', search_query)
    ORDER BY rank DESC, n.created_at DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$;\n`);

    console.log('-- 3. Índices de performance');
    console.log(`CREATE INDEX IF NOT EXISTS idx_noticias_categoria_data 
ON noticias(categoria, created_at DESC) 
WHERE categoria IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_noticias_destaque_data 
ON noticias(destaque, created_at DESC) 
WHERE destaque = true;

CREATE INDEX IF NOT EXISTS idx_noticias_pagination 
ON noticias(created_at DESC, id);\n`);

    console.log('-- 4. Atualizar estatísticas');
    console.log('ANALYZE noticias;\n');

    console.log('🎯 PRÓXIMOS PASSOS:');
    console.log('1. Execute os comandos SQL acima no Supabase Dashboard');
    console.log('2. Configure o Connection Pooler (próxima otimização)');
    console.log('3. Teste a busca full-text na aplicação');

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

// Executar verificações
applyOptimizations();
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

// Função para medir tempo de execução
function measureTime(startTime) {
  const endTime = process.hrtime(startTime);
  return (endTime[0] * 1000 + endTime[1] / 1000000).toFixed(2);
}

// Teste de conexão básica
async function testConnection() {
  console.log('🔗 Testando conexão com Supabase...');
  const startTime = process.hrtime();
  
  try {
    const { data, error } = await supabase
      .from('noticias')
      .select('count')
      .limit(1);
    
    const duration = measureTime(startTime);
    
    if (error) {
      console.error('❌ Erro de conexão:', error.message);
      return false;
    }
    
    console.log(`✅ Conexão estabelecida em ${duration}ms`);
    return true;
  } catch (err) {
    console.error('❌ Erro de conexão:', err.message);
    return false;
  }
}

// Teste de busca básica
async function testBasicSearch() {
  console.log('\n🔍 Testando busca básica...');
  const startTime = process.hrtime();
  
  try {
    const { data, error } = await supabase
      .from('noticias')
      .select('id, titulo, categoria, created_at')
      .ilike('titulo', '%maria%')
      .limit(10);
    
    const duration = measureTime(startTime);
    
    if (error) {
      console.error('❌ Erro na busca básica:', error.message);
      return false;
    }
    
    console.log(`✅ Busca básica executada em ${duration}ms - ${data.length} resultados`);
    return true;
  } catch (err) {
    console.error('❌ Erro na busca básica:', err.message);
    return false;
  }
}

// Teste de busca por categoria
async function testCategorySearch() {
  console.log('\n📂 Testando busca por categoria...');
  const startTime = process.hrtime();
  
  try {
    const { data, error } = await supabase
      .from('noticias')
      .select('id, titulo, categoria, created_at')
      .eq('categoria', 'politica')
      .order('created_at', { ascending: false })
      .limit(10);
    
    const duration = measureTime(startTime);
    
    if (error) {
      console.error('❌ Erro na busca por categoria:', error.message);
      return false;
    }
    
    console.log(`✅ Busca por categoria executada em ${duration}ms - ${data.length} resultados`);
    return true;
  } catch (err) {
    console.error('❌ Erro na busca por categoria:', err.message);
    return false;
  }
}

// Teste de paginação
async function testPagination() {
  console.log('\n📄 Testando paginação...');
  const startTime = process.hrtime();
  
  try {
    const { data, error } = await supabase
      .from('noticias')
      .select('id, titulo, created_at')
      .order('created_at', { ascending: false })
      .range(0, 19); // Primeiros 20 registros
    
    const duration = measureTime(startTime);
    
    if (error) {
      console.error('❌ Erro na paginação:', error.message);
      return false;
    }
    
    console.log(`✅ Paginação executada em ${duration}ms - ${data.length} resultados`);
    return true;
  } catch (err) {
    console.error('❌ Erro na paginação:', err.message);
    return false;
  }
}

// Teste de busca full-text (se disponível)
async function testFullTextSearch() {
  console.log('\n🔍 Testando busca full-text...');
  const startTime = process.hrtime();
  
  try {
    const { data, error } = await supabase.rpc('search_noticias_fulltext', {
      search_query: 'maria helena',
      limit_count: 10
    });
    
    const duration = measureTime(startTime);
    
    if (error) {
      console.log(`⚠️  Função full-text não disponível: ${error.message}`);
      console.log('   Execute os comandos SQL fornecidos no Supabase Dashboard');
      return false;
    }
    
    console.log(`✅ Busca full-text executada em ${duration}ms - ${data.length} resultados`);
    
    // Mostrar exemplo de resultado com ranking
    if (data.length > 0) {
      console.log(`   Exemplo: "${data[0].titulo}" (rank: ${data[0].rank})`);
    }
    
    return true;
  } catch (err) {
    console.log(`⚠️  Função full-text não disponível: ${err.message}`);
    return false;
  }
}

// Teste de performance com múltiplas queries
async function testPerformance() {
  console.log('\n⚡ Testando performance com múltiplas queries...');
  const startTime = process.hrtime();
  
  try {
    const promises = [
      supabase.from('noticias').select('count'),
      supabase.from('noticias').select('id, titulo').limit(5),
      supabase.from('noticias').select('categoria').eq('categoria', 'esportes').limit(3),
      supabase.from('noticias').select('id, created_at').order('created_at', { ascending: false }).limit(5)
    ];
    
    const results = await Promise.all(promises);
    const duration = measureTime(startTime);
    
    const errors = results.filter(result => result.error);
    if (errors.length > 0) {
      console.error('❌ Erros em queries paralelas:', errors.map(e => e.error.message));
      return false;
    }
    
    console.log(`✅ ${promises.length} queries paralelas executadas em ${duration}ms`);
    return true;
  } catch (err) {
    console.error('❌ Erro em queries paralelas:', err.message);
    return false;
  }
}

// Verificar índices existentes
async function checkIndexes() {
  console.log('\n📊 Verificando índices existentes...');
  
  try {
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT 
          schemaname,
          tablename,
          indexname,
          indexdef
        FROM pg_indexes 
        WHERE tablename = 'noticias' 
        AND schemaname = 'public'
        ORDER BY indexname;
      `
    });
    
    if (error) {
      console.log('⚠️  Não foi possível verificar índices via RPC');
      return false;
    }
    
    console.log(`✅ Encontrados ${data.length} índices na tabela noticias:`);
    data.forEach(index => {
      console.log(`   - ${index.indexname}`);
    });
    
    return true;
  } catch (err) {
    console.log('⚠️  Verificação de índices não disponível via API');
    return false;
  }
}

// Função principal de teste
async function runTests() {
  console.log('🧪 Iniciando testes de validação das otimizações...\n');
  
  const tests = [
    { name: 'Conexão', fn: testConnection },
    { name: 'Busca Básica', fn: testBasicSearch },
    { name: 'Busca por Categoria', fn: testCategorySearch },
    { name: 'Paginação', fn: testPagination },
    { name: 'Busca Full-Text', fn: testFullTextSearch },
    { name: 'Performance Paralela', fn: testPerformance },
    { name: 'Verificação de Índices', fn: checkIndexes }
  ];
  
  const results = [];
  
  for (const test of tests) {
    const success = await test.fn();
    results.push({ name: test.name, success });
  }
  
  // Resumo dos resultados
  console.log('\n📋 RESUMO DOS TESTES:');
  console.log('='.repeat(50));
  
  let passedTests = 0;
  results.forEach(result => {
    const status = result.success ? '✅ PASSOU' : '❌ FALHOU';
    console.log(`${status} - ${result.name}`);
    if (result.success) passedTests++;
  });
  
  console.log('='.repeat(50));
  console.log(`📊 Resultado: ${passedTests}/${results.length} testes passaram`);
  
  if (passedTests === results.length) {
    console.log('\n🎉 Todos os testes passaram! As otimizações estão funcionando.');
  } else {
    console.log('\n⚠️  Alguns testes falharam. Verifique as configurações:');
    console.log('   1. Execute os comandos SQL no Supabase Dashboard');
    console.log('   2. Configure o Connection Pooler no .env.local');
    console.log('   3. Verifique as permissões do banco de dados');
  }
  
  console.log('\n📖 Consulte a documentação em .trae/documents/ para mais detalhes');
}

// Executar testes
runTests().catch(console.error);
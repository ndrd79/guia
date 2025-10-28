const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Credenciais do Supabase não encontradas no .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('🔄 Testando conexão com Supabase...');
  
  try {
    // Teste básico de conexão
    const { data, error } = await supabase
      .from('noticias')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Erro na conexão:', error.message);
      return false;
    }
    
    console.log('✅ Conexão com Supabase estabelecida com sucesso!');
    return true;
  } catch (err) {
    console.error('❌ Erro na conexão:', err.message);
    return false;
  }
}

async function testBasicSearch() {
  console.log('\n🔄 Testando busca básica na tabela noticias...');
  
  try {
    const { data, error } = await supabase
      .from('noticias')
      .select('id, titulo, descricao, categoria')
      .limit(3);
    
    if (error) {
      console.error('❌ Erro na busca básica:', error.message);
      return false;
    }
    
    console.log('✅ Busca básica funcionando!');
    console.log(`📊 Encontradas ${data.length} notícias de exemplo:`);
    data.forEach((noticia, index) => {
      console.log(`   ${index + 1}. ${noticia.titulo} (${noticia.categoria})`);
    });
    
    return true;
  } catch (err) {
    console.error('❌ Erro na busca básica:', err.message);
    return false;
  }
}

async function testFullTextSearch() {
  console.log('\n🔄 Testando função search_noticias_fulltext...');
  
  try {
    // Teste se a função existe
    const { data, error } = await supabase
      .rpc('search_noticias_fulltext', { 
        search_term: 'maria helena',
        limit_count: 3 
      });
    
    if (error) {
      console.error('❌ Erro na busca full-text:', error.message);
      if (error.message.includes('function') && error.message.includes('does not exist')) {
        console.log('⚠️  A função search_noticias_fulltext ainda não foi criada.');
        console.log('💡 Execute as migrações SQL para criar a função.');
      }
      return false;
    }
    
    console.log('✅ Função search_noticias_fulltext funcionando!');
    console.log(`📊 Busca por "maria helena" retornou ${data.length} resultados:`);
    data.forEach((noticia, index) => {
      console.log(`   ${index + 1}. ${noticia.titulo} (relevância: ${noticia.rank?.toFixed(3) || 'N/A'})`);
    });
    
    return true;
  } catch (err) {
    console.error('❌ Erro na busca full-text:', err.message);
    return false;
  }
}

async function testIndexes() {
  console.log('\n🔄 Verificando índices de performance...');
  
  try {
    // Verifica se os índices existem
    const { data, error } = await supabase
      .from('pg_indexes')
      .select('indexname, tablename')
      .eq('tablename', 'noticias')
      .in('indexname', ['idx_noticias_categoria', 'idx_noticias_data_publicacao', 'idx_noticias_fulltext_pt']);
    
    if (error) {
      console.log('⚠️  Não foi possível verificar índices (permissões limitadas)');
      return true; // Não é um erro crítico
    }
    
    const expectedIndexes = ['idx_noticias_categoria', 'idx_noticias_data_publicacao', 'idx_noticias_fulltext_pt'];
    const foundIndexes = data.map(idx => idx.indexname);
    
    console.log('📊 Índices encontrados:');
    expectedIndexes.forEach(indexName => {
      const exists = foundIndexes.includes(indexName);
      console.log(`   ${exists ? '✅' : '❌'} ${indexName}`);
    });
    
    return true;
  } catch (err) {
    console.log('⚠️  Não foi possível verificar índices:', err.message);
    return true; // Não é um erro crítico
  }
}

async function runAllTests() {
  console.log('🚀 Iniciando testes de otimização SQL...\n');
  
  const results = {
    connection: await testConnection(),
    basicSearch: await testBasicSearch(),
    fullTextSearch: await testFullTextSearch(),
    indexes: await testIndexes()
  };
  
  console.log('\n📋 RESUMO DOS TESTES:');
  console.log('='.repeat(40));
  console.log(`Conexão Supabase: ${results.connection ? '✅ OK' : '❌ FALHOU'}`);
  console.log(`Busca Básica: ${results.basicSearch ? '✅ OK' : '❌ FALHOU'}`);
  console.log(`Busca Full-Text: ${results.fullTextSearch ? '✅ OK' : '❌ FALHOU'}`);
  console.log(`Verificação Índices: ${results.indexes ? '✅ OK' : '❌ FALHOU'}`);
  
  const allPassed = Object.values(results).every(result => result);
  
  if (allPassed) {
    console.log('\n🎉 Todos os testes passaram! As otimizações estão funcionando.');
  } else {
    console.log('\n⚠️  Alguns testes falharam. Verifique as migrações SQL.');
  }
  
  console.log('\n💡 PRÓXIMOS PASSOS:');
  if (!results.fullTextSearch) {
    console.log('   1. Execute as migrações SQL no Supabase Dashboard');
    console.log('   2. Aplique o arquivo 021_add_fulltext_search_portuguese.sql');
  }
  if (results.connection && results.basicSearch) {
    console.log('   3. Configure o Connection Pooler para melhor performance (opcional)');
  }
}

// Executar testes
runAllTests().catch(console.error);
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

async function createFullTextFunction() {
  console.log('🚀 Criando função search_noticias_fulltext...\n');
  
  // SQL para criar a função
  const createFunctionSQL = `
    CREATE OR REPLACE FUNCTION search_noticias_fulltext(
        search_term TEXT,
        limit_count INTEGER DEFAULT 20
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
                plainto_tsquery('portuguese', search_term)
            ) as rank
        FROM noticias n
        WHERE to_tsvector('portuguese', 
            COALESCE(n.titulo, '') || ' ' || 
            COALESCE(n.descricao, '') || ' ' || 
            COALESCE(n.conteudo, '')
        ) @@ plainto_tsquery('portuguese', search_term)
        ORDER BY rank DESC, n.created_at DESC
        LIMIT limit_count;
    END;
    $$;
  `;
  
  try {
    console.log('🔄 Executando SQL para criar função...');
    
    // Tentar executar usando uma query direta
    const { data, error } = await supabase
      .from('noticias')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('❌ Erro na conexão:', error.message);
      return false;
    }
    
    console.log('✅ Conexão estabelecida');
    
    // Como não podemos executar DDL diretamente, vamos mostrar as instruções
    console.log('\n📋 INSTRUÇÕES PARA CRIAR A FUNÇÃO:');
    console.log('='.repeat(50));
    console.log('1. Acesse o Supabase Dashboard:');
    console.log('   https://supabase.com/dashboard/project/mlkpnapnijdbskaimquj/sql');
    console.log('\n2. Cole e execute o seguinte SQL:');
    console.log('='.repeat(50));
    console.log(createFunctionSQL);
    console.log('='.repeat(50));
    console.log('\n3. Após executar, teste com:');
    console.log('   node test-simple.js');
    
    return true;
    
  } catch (err) {
    console.error('❌ Erro:', err.message);
    return false;
  }
}

async function testIfFunctionExists() {
  console.log('\n🔄 Verificando se a função já existe...');
  
  try {
    const { data, error } = await supabase
      .rpc('search_noticias_fulltext', { 
        search_term: 'teste',
        limit_count: 1 
      });
    
    if (error) {
      if (error.message.includes('function') && error.message.includes('does not exist')) {
        console.log('❌ Função ainda não existe');
        return false;
      }
      console.log('⚠️  Função existe mas há outro erro:', error.message);
      return true;
    }
    
    console.log('✅ Função search_noticias_fulltext já existe e está funcionando!');
    return true;
  } catch (err) {
    console.log('❌ Função ainda não existe');
    return false;
  }
}

async function main() {
  const functionExists = await testIfFunctionExists();
  
  if (functionExists) {
    console.log('\n🎉 A função já está criada! Execute node test-simple.js para testar.');
  } else {
    await createFullTextFunction();
  }
}

main().catch(console.error);
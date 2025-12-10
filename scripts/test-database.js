require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não configuradas');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Configurada' : 'Não configurada');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? 'Configurada' : 'Não configurada');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabase() {
  console.log('🔍 Testando conexão com o banco de dados...');
  
  try {
    // Testar se a tabela noticias existe
    console.log('\n📰 Testando tabela noticias...');
    const { data: noticias, error: noticiasError } = await supabase
      .from('noticias')
      .select('*')
      .limit(1);
    
    if (noticiasError) {
      console.error('❌ Erro na tabela noticias:', noticiasError.message);
    } else {
      console.log('✅ Tabela noticias existe e está acessível');
      console.log('📊 Registros encontrados:', noticias?.length || 0);
    }
    
    // Testar se a tabela banners existe
    console.log('\n🎯 Testando tabela banners...');
    const { data: banners, error: bannersError } = await supabase
      .from('banners')
      .select('*')
      .limit(1);
    
    if (bannersError) {
      console.error('❌ Erro na tabela banners:', bannersError.message);
    } else {
      console.log('✅ Tabela banners existe e está acessível');
      console.log('📊 Registros encontrados:', banners?.length || 0);
    }
    
    // Testar inserção de uma notícia de teste
    console.log('\n📝 Testando inserção de notícia...');
    const testNoticia = {
      titulo: 'Teste de Notícia',
      categoria: 'Geral',
      data: '2024-01-15',
      descricao: 'Esta é uma notícia de teste',
      conteudo: 'Conteúdo da notícia de teste'
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('noticias')
      .insert([testNoticia])
      .select();
    
    if (insertError) {
      console.error('❌ Erro ao inserir notícia:', insertError.message);
      console.error('Detalhes do erro:', insertError);
    } else {
      console.log('✅ Notícia inserida com sucesso');
      console.log('📄 Dados inseridos:', insertData);
      
      // Deletar a notícia de teste
      if (insertData && insertData[0]) {
        const { error: deleteError } = await supabase
          .from('noticias')
          .delete()
          .eq('id', insertData[0].id);
        
        if (deleteError) {
          console.error('❌ Erro ao deletar notícia de teste:', deleteError.message);
        } else {
          console.log('✅ Notícia de teste deletada com sucesso');
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testDatabase();
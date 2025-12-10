require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixPublicAccess() {
  console.log('\n🔧 === CORRIGINDO ACESSO PÚBLICO ===\n');
  
  try {
    // Primeiro, vamos testar o acesso atual
    console.log('📊 Testando acesso atual...');
    
    // Teste com chave anônima
    const anonSupabase = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    
    console.log('\n1. Testando acesso a empresas com chave anônima...');
    const { data: empresasTest, error: empresasError } = await anonSupabase
      .from('empresas')
      .select('id, name, category')
      .limit(3);
    
    if (empresasError) {
      console.log('❌ Erro ao acessar empresas:', empresasError.message);
    } else {
      console.log(`✅ Empresas acessíveis: ${empresasTest.length} registros`);
    }
    
    console.log('\n2. Testando acesso a notícias com chave anônima...');
    const { data: noticiasTest, error: noticiasError } = await anonSupabase
      .from('noticias')
      .select('id, titulo, categoria')
      .limit(3);
    
    if (noticiasError) {
      console.log('❌ Erro ao acessar notícias:', noticiasError.message);
    } else {
      console.log(`✅ Notícias acessíveis: ${noticiasTest.length} registros`);
    }
    
    // Se houver erros, vamos criar políticas de acesso público
    if (empresasError || noticiasError) {
      console.log('\n🔧 Criando políticas de acesso público...');
      
      // Política para empresas
      if (empresasError) {
        console.log('Criando política de leitura pública para empresas...');
        const { error: empresasPolicyError } = await supabase.rpc('exec_sql', {
          sql_query: `
            DROP POLICY IF EXISTS "Allow public read access" ON public.empresas;
            CREATE POLICY "Allow public read access" ON public.empresas 
            FOR SELECT USING (true);
          `
        });
        
        if (empresasPolicyError) {
          console.log('❌ Erro ao criar política para empresas:', empresasPolicyError.message);
        } else {
          console.log('✅ Política de leitura pública criada para empresas');
        }
      }
      
      // Política para notícias
      if (noticiasError) {
        console.log('Criando política de leitura pública para notícias...');
        const { error: noticiasPolicyError } = await supabase.rpc('exec_sql', {
          sql_query: `
            DROP POLICY IF EXISTS "Allow public read access" ON public.noticias;
            CREATE POLICY "Allow public read access" ON public.noticias 
            FOR SELECT USING (true);
          `
        });
        
        if (noticiasPolicyError) {
          console.log('❌ Erro ao criar política para notícias:', noticiasPolicyError.message);
        } else {
          console.log('✅ Política de leitura pública criada para notícias');
        }
      }
      
      // Testar novamente após criar as políticas
      console.log('\n🧪 Testando acesso após criar políticas...');
      
      const { data: empresasTest2, error: empresasError2 } = await anonSupabase
        .from('empresas')
        .select('id, name, category')
        .limit(3);
      
      if (empresasError2) {
        console.log('❌ Ainda há erro ao acessar empresas:', empresasError2.message);
      } else {
        console.log(`✅ Empresas agora acessíveis: ${empresasTest2.length} registros`);
      }
      
      const { data: noticiasTest2, error: noticiasError2 } = await anonSupabase
        .from('noticias')
        .select('id, titulo, categoria')
        .limit(3);
      
      if (noticiasError2) {
        console.log('❌ Ainda há erro ao acessar notícias:', noticiasError2.message);
      } else {
        console.log(`✅ Notícias agora acessíveis: ${noticiasTest2.length} registros`);
      }
    }
    
    console.log('\n🎉 Verificação de acesso público concluída!');
    
  } catch (error) {
    console.error('❌ Erro durante correção:', error.message);
  }
}

fixPublicAccess();
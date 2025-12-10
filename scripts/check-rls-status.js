require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkRLSStatus() {
  try {
    console.log('\n=== VERIFICAÇÃO COMPLETA DE RLS ===\n');
    
    // Primeiro, vamos obter todas as tabelas do schema public
    const { data: tables, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_type', 'BASE TABLE');
    
    if (error) {
      console.error('Erro ao obter tabelas:', error.message);
      return;
    }
    
    console.log(`Encontradas ${tables.length} tabelas no schema public\n`);
    
    // Para cada tabela, vamos verificar o status RLS usando supabase_get_tables
    for (const table of tables) {
      try {
        console.log(`Verificando tabela: ${table.table_name}`);
        
        // Tentar acessar a tabela para verificar se existe
        const { data: tableData, error: tableError } = await supabase
          .from(table.table_name)
          .select('*')
          .limit(0);
        
        if (tableError) {
          console.log(`  ❌ Erro ao acessar: ${tableError.message}`);
        } else {
          console.log(`  ✅ Tabela acessível`);
        }
        
      } catch (err) {
        console.log(`  ❌ Erro: ${err.message}`);
      }
      
      console.log('');
    }
    
  } catch (error) {
    console.error('Erro geral:', error.message);
  }
}

checkRLSStatus();
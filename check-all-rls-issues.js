const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://mlkpnapnijdbskaimquj.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1sa3BuYXBuaWpkYnNrYWltcXVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzY1NzQyNSwiZXhwIjoyMDY5MjMzNDI1fQ.yhrc1YYwt4r-FOa3Iqa094hNEmGPj3PDEF0GkLmLZ6s';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAllTablesRLS() {
  console.log('🔍 Verificando todas as tabelas para problemas de RLS...');
  
  try {
    // Get all tables in public schema
    const { data: tables, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_type', 'BASE TABLE');
    
    if (error) {
      console.error('❌ Erro ao buscar tabelas:', error);
      return;
    }
    
    console.log(`📊 Encontradas ${tables.length} tabelas no schema public`);
    
    const problematicTables = [];
    
    for (const table of tables) {
      const tableName = table.table_name;
      
      try {
        // Check if table has policies
        const { data: policies, error: policiesError } = await supabase
          .from('pg_policies')
          .select('policyname')
          .eq('schemaname', 'public')
          .eq('tablename', tableName);
        
        if (policiesError) {
          console.log(`⚠️ Não foi possível verificar políticas para ${tableName}:`, policiesError.message);
          continue;
        }
        
        const hasPolicies = policies && policies.length > 0;
        
        if (hasPolicies) {
          // Check if RLS is enabled
          const { data: tableInfo, error: tableError } = await supabase
            .from('pg_tables')
            .select('rowsecurity')
            .eq('schemaname', 'public')
            .eq('tablename', tableName);
          
          if (tableError) {
            console.log(`⚠️ Não foi possível verificar RLS para ${tableName}:`, tableError.message);
            continue;
          }
          
          const rlsEnabled = tableInfo && tableInfo.length > 0 ? tableInfo[0].rowsecurity : false;
          
          if (!rlsEnabled) {
            problematicTables.push({
              table: tableName,
              policies: policies.map(p => p.policyname),
              rlsEnabled: false
            });
          }
          
          console.log(`${rlsEnabled ? '✅' : '❌'} ${tableName}: RLS ${rlsEnabled ? 'habilitado' : 'DESABILITADO'}, ${policies.length} política(s)`);
        } else {
          console.log(`⚪ ${tableName}: Sem políticas RLS`);
        }
        
      } catch (err) {
        console.log(`⚠️ Erro ao verificar ${tableName}:`, err.message);
      }
    }
    
    console.log('\n📋 RESUMO DOS PROBLEMAS ENCONTRADOS:');
    console.log('═══════════════════════════════════════════════════════════════');
    
    if (problematicTables.length === 0) {
      console.log('✅ Nenhum problema de RLS encontrado!');
    } else {
      console.log(`❌ ${problematicTables.length} tabela(s) com problemas de RLS:`);
      
      problematicTables.forEach(table => {
        console.log(`\n🔧 Tabela: ${table.table}`);
        console.log(`   Políticas: ${table.policies.join(', ')}`);
        console.log(`   Comando para corrigir: ALTER TABLE public.${table.table} ENABLE ROW LEVEL SECURITY;`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

checkAllTablesRLS();
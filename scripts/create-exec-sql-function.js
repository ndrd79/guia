const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://mlkpnapnijdbskaimquj.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1sa3BuYXBuaWpkYnNrYWltcXVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzY1NzQyNSwiZXhwIjoyMDY5MjMzNDI1fQ.yhrc1YYwt4r-FOa3Iqa094hNEmGPj3PDEF0GkLmLZ6s';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function enableRLSDirectly() {
  console.log('🔧 Tentando habilitar RLS diretamente...');
  
  try {
    // Try to use a simple approach - check if we can access system tables
    const { data, error } = await supabase
      .from('pg_tables')
      .select('schemaname, tablename, rowsecurity')
      .eq('schemaname', 'public')
      .eq('tablename', 'audit_logs');
    
    if (error) {
      console.error('❌ Erro ao acessar pg_tables:', error);
      
      // Try alternative approach using information_schema
      console.log('🔄 Tentando via information_schema...');
      
      const { data: altData, error: altError } = await supabase
        .from('information_schema.tables')
        .select('table_schema, table_name')
        .eq('table_schema', 'public')
        .eq('table_name', 'audit_logs');
      
      if (altError) {
        console.error('❌ Erro alternativo:', altError);
      } else {
        console.log('✅ Tabela encontrada via information_schema:', altData);
      }
    } else {
      console.log('📊 Status atual da tabela audit_logs:', data);
      
      if (data && data.length > 0) {
        const table = data[0];
        if (table.rowsecurity === false) {
          console.log('⚠️ RLS está desabilitado. Precisa ser habilitado.');
        } else {
          console.log('✅ RLS já está habilitado!');
        }
      }
    }
    
  } catch (err) {
    console.error('❌ Erro geral:', err);
  }
}

enableRLSDirectly();
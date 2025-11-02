const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://mlkpnapnijdbskaimquj.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1sa3BuYXBuaWpkYnNrYWltcXVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzY1NzQyNSwiZXhwIjoyMDY5MjMzNDI1fQ.yhrc1YYwt4r-FOa3Iqa094hNEmGPj3PDEF0GkLmLZ6s';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  console.log('🚀 Habilitando RLS na tabela audit_logs...');
  
  try {
    // Test connection first
    console.log('🔍 Testando conexão...');
    const { data: testData, error: testError } = await supabase
      .from('audit_logs')
      .select('count', { count: 'exact', head: true });
    
    if (testError) {
      console.error('❌ Erro de conexão:', testError);
      return;
    }
    
    console.log('✅ Conexão OK');
    
    // Execute SQL to enable RLS
    console.log('🔧 Executando ALTER TABLE...');
    
    // Use raw SQL execution
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        sql: 'ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;'
      })
    });
    
    console.log('📊 Status da resposta:', response.status);
    
    if (response.ok) {
      console.log('✅ RLS habilitado com sucesso!');
    } else {
      const errorText = await response.text();
      console.error('❌ Erro:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

main();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://mlkpnapnijdbskaimquj.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1sa3BuYXBuaWpkYnNrYWltcXVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzY1NzQyNSwiZXhwIjoyMDY5MjMzNDI1fQ.yhrc1YYwt4r-FOa3Iqa094hNEmGPj3PDEF0GkLmLZ6s';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function enableRLSOnAuditLogs() {
  console.log('🔧 Habilitando RLS na tabela audit_logs...');
  
  try {
    // Enable RLS on audit_logs table using direct query
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .limit(0); // Just to test connection
    
    if (error) {
      console.error('❌ Erro de conexão:', error);
      return;
    }
    
    console.log('✅ Conexão estabelecida com audit_logs');
    
    // Now try to enable RLS using a raw SQL query
    const { data: rlsData, error: rlsError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;'
    });
    
    if (rlsError) {
      console.error('❌ Erro ao habilitar RLS:', rlsError);
      
      // Try alternative method
      console.log('🔄 Tentando método alternativo...');
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'apikey': supabaseServiceKey
        },
        body: JSON.stringify({
          sql: 'ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;'
        })
      });
      
      if (response.ok) {
        console.log('✅ RLS habilitado via método alternativo');
      } else {
        console.error('❌ Falha no método alternativo:', await response.text());
      }
    } else {
      console.log('✅ RLS habilitado com sucesso na tabela audit_logs');
    }
    
  } catch (err) {
    console.error('❌ Erro geral:', err);
  }
}

async function verifyRLSStatus() {
  console.log('🔍 Verificando status do RLS...');
  
  try {
    // Check if we can query the table info
    const { data, error } = await supabase
      .from('audit_logs')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ Erro ao acessar audit_logs:', error);
    } else {
      console.log('✅ Tabela audit_logs acessível');
    }
    
  } catch (err) {
    console.error('❌ Erro na verificação:', err);
  }
}

async function main() {
  console.log('🚀 Iniciando correção de segurança RLS para audit_logs...');
  
  await enableRLSOnAuditLogs();
  await verifyRLSStatus();
  
  console.log('✅ Processo concluído!');
}

main().catch(console.error);
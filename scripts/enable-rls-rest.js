const fetch = require('node-fetch');

const supabaseUrl = 'https://mlkpnapnijdbskaimquj.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1sa3BuYXBuaWpkYnNrYWltcXVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzY1NzQyNSwiZXhwIjoyMDY5MjMzNDI1fQ.yhrc1YYwt4r-FOa3Iqa094hNEmGPj3PDEF0GkLmLZ6s';

async function enableRLS() {
  console.log('🔧 Habilitando RLS na tabela audit_logs via API REST...');
  
  try {
    // Execute SQL via REST API
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        query: 'ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;'
      })
    });
    
    console.log('📊 Status da resposta:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ RLS habilitado com sucesso!', result);
    } else {
      const errorText = await response.text();
      console.error('❌ Erro:', errorText);
      
      // Try alternative endpoint
      console.log('🔄 Tentando endpoint alternativo...');
      
      const altResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
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
      
      console.log('📊 Status alternativo:', altResponse.status);
      
      if (altResponse.ok) {
        console.log('✅ RLS habilitado via endpoint alternativo!');
      } else {
        const altErrorText = await altResponse.text();
        console.error('❌ Erro alternativo:', altErrorText);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

enableRLS();
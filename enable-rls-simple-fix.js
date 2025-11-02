#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔧 Habilitando RLS na tabela audit_logs...');
console.log('URL:', supabaseUrl ? '✅ Configurada' : '❌ Não encontrada');
console.log('Service Key:', supabaseServiceKey ? '✅ Configurada' : '❌ Não encontrada');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente não configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function enableRLS() {
  try {
    console.log('\n📊 Verificando acesso à tabela...');
    const { data, error } = await supabase
      .from('audit_logs')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Erro ao acessar tabela:', error.message);
      return;
    }
    
    console.log('✅ Tabela acessível');
    
    // Tentar via diferentes métodos
    console.log('\n🔧 Tentando habilitar RLS...');
    
    // Método 1: Usando fetch direto
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
    
    console.log('📡 Response status:', response.status);
    const responseText = await response.text();
    console.log('📡 Response:', responseText);
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

enableRLS();
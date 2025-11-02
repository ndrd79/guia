#!/usr/bin/env node

/**
 * Script para habilitar RLS na tabela audit_logs
 * Corrige vulnerabilidade crítica de segurança
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Erro: Variáveis de ambiente do Supabase não encontradas');
  console.error('Verifique NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function enableRLSOnAuditLogs() {
  console.log('🔧 Iniciando correção de segurança RLS para audit_logs...\n');

  try {
    // 1. Verificar estado atual
    console.log('1️⃣ Verificando estado atual da tabela...');
    const { data: currentState, error: stateError } = await supabase
      .from('audit_logs')
      .select('id')
      .limit(1);

    if (stateError) {
      console.error('❌ Erro ao verificar tabela:', stateError.message);
      return false;
    }
    console.log('✅ Tabela audit_logs acessível');

    // 2. Tentar habilitar RLS via query direta
    console.log('\n2️⃣ Tentando habilitar RLS...');
    
    // Método 1: Via rpc (se disponível)
    try {
      const { data: rlsResult, error: rlsError } = await supabase.rpc('exec_sql', {
        sql: 'ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;'
      });
      
      if (!rlsError) {
        console.log('✅ RLS habilitado via RPC');
      } else {
        throw new Error('RPC não disponível: ' + rlsError.message);
      }
    } catch (rpcError) {
      console.log('⚠️ RPC não disponível, tentando método alternativo...');
      
      // Método 2: Via SQL direto (usando query raw se possível)
      try {
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'apikey': supabaseServiceKey
          },
          body: JSON.stringify({
            query: 'ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;'
          })
        });

        if (response.ok) {
          console.log('✅ RLS habilitado via API REST');
        } else {
          throw new Error(`API REST falhou: ${response.status}`);
        }
      } catch (apiError) {
        console.log('⚠️ Método API REST não funcionou:', apiError.message);
        console.log('📋 Será necessário habilitar manualmente via Dashboard');
      }
    }

    // 3. Verificar se RLS foi habilitado
    console.log('\n3️⃣ Verificando se RLS foi habilitado...');
    
    // Tentar acessar informações da tabela via system tables
    try {
      const { data: tableInfo, error: tableError } = await supabase
        .from('pg_tables')
        .select('schemaname, tablename, rowsecurity')
        .eq('schemaname', 'public')
        .eq('tablename', 'audit_logs');

      if (tableInfo && tableInfo.length > 0) {
        const isRLSEnabled = tableInfo[0].rowsecurity;
        console.log(`📊 Status RLS: ${isRLSEnabled ? '✅ HABILITADO' : '❌ DESABILITADO'}`);
        
        if (isRLSEnabled) {
          console.log('\n🎉 SUCESSO: RLS foi habilitado na tabela audit_logs!');
          return true;
        }
      }
    } catch (verifyError) {
      console.log('⚠️ Não foi possível verificar via pg_tables:', verifyError.message);
    }

    // 4. Verificar políticas existentes
    console.log('\n4️⃣ Verificando políticas RLS existentes...');
    try {
      const { data: policies, error: policiesError } = await supabase
        .from('pg_policies')
        .select('policyname, cmd, roles')
        .eq('schemaname', 'public')
        .eq('tablename', 'audit_logs');

      if (policies && policies.length > 0) {
        console.log('📋 Políticas encontradas:');
        policies.forEach(policy => {
          console.log(`  - ${policy.policyname} (${policy.cmd})`);
        });
      } else {
        console.log('⚠️ Nenhuma política encontrada');
      }
    } catch (policiesError) {
      console.log('⚠️ Não foi possível verificar políticas:', policiesError.message);
    }

    return false;

  } catch (error) {
    console.error('❌ Erro durante execução:', error.message);
    return false;
  }
}

async function main() {
  const success = await enableRLSOnAuditLogs();
  
  if (!success) {
    console.log('\n📋 AÇÃO MANUAL NECESSÁRIA:');
    console.log('1. Acesse o Supabase Dashboard');
    console.log('2. Vá para SQL Editor');
    console.log('3. Execute: ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;');
    console.log('\n🔗 Link direto: https://supabase.com/dashboard/project/mlkpnapnijdbskaimquj/sql');
  }
  
  console.log('\n✅ Script finalizado');
}

main().catch(console.error);
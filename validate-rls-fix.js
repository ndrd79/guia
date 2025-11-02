const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

console.log('🔍 Validando correção do RLS na tabela audit_logs...\n');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function validateRLSFix() {
  try {
    console.log('📊 Verificando status do RLS...');
    
    // Verificar RLS usando query SQL direta
    const { data: rlsStatus, error: rlsError } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT 
            schemaname,
            tablename,
            rowsecurity as rls_enabled,
            hasrls as has_rls_policies
          FROM pg_tables 
          WHERE schemaname = 'public' 
          AND tablename = 'audit_logs';
        `
      });

    if (rlsError) {
      console.log('⚠️  Usando método alternativo de verificação...');
      
      // Método alternativo: tentar acessar a tabela
      const { data, error } = await supabase
        .from('audit_logs')
        .select('count', { count: 'exact', head: true });
      
      if (error) {
        console.log('❌ Erro ao acessar audit_logs:', error.message);
        return;
      }
      
      console.log('✅ Tabela audit_logs acessível');
      console.log('📊 Total de registros:', data);
      
      // Verificar políticas
      const { data: policies, error: policiesError } = await supabase
        .rpc('exec_sql', {
          sql: `
            SELECT policyname, cmd, qual 
            FROM pg_policies 
            WHERE schemaname = 'public' 
            AND tablename = 'audit_logs';
          `
        });
      
      if (!policiesError && policies) {
        console.log('\n📋 Políticas encontradas:');
        policies.forEach(policy => {
          console.log(`- ${policy.policyname} (${policy.cmd})`);
        });
      }
      
    } else if (rlsStatus && rlsStatus.length > 0) {
      const table = rlsStatus[0];
      console.log(`\n📋 Status da tabela ${table.tablename}:`);
      console.log(`- RLS habilitado: ${table.rls_enabled ? '✅ SIM' : '❌ NÃO'}`);
      console.log(`- Possui políticas: ${table.has_rls_policies ? '✅ SIM' : '❌ NÃO'}`);
      
      if (table.rls_enabled) {
        console.log('\n🎉 CORREÇÃO APLICADA COM SUCESSO!');
        console.log('✅ RLS está habilitado na tabela audit_logs');
      } else {
        console.log('\n⚠️  CORREÇÃO AINDA NECESSÁRIA');
        console.log('❌ RLS não está habilitado na tabela audit_logs');
      }
    }
    
    console.log('\n🔧 INSTRUÇÕES PARA CORREÇÃO MANUAL:');
    console.log('1. Acesse o Supabase Dashboard');
    console.log('2. Vá para SQL Editor');
    console.log('3. Execute: ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;');
    console.log('4. Execute novamente este script para validar');
    
  } catch (error) {
    console.error('❌ Erro durante validação:', error.message);
  }
}

validateRLSFix();
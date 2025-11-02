#!/usr/bin/env node

/**
 * Script para verificar políticas RLS da tabela audit_logs
 * Identifica problemas de configuração de segurança
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyAuditLogsPolicies() {
  console.log('🔍 Verificando políticas RLS da tabela audit_logs...\n');

  try {
    // 1. Verificar se a tabela existe e está acessível
    console.log('1️⃣ Verificando acesso à tabela audit_logs...');
    const { data: tableTest, error: tableError } = await supabase
      .from('audit_logs')
      .select('id')
      .limit(1);

    if (tableError) {
      console.error('❌ Erro ao acessar tabela:', tableError.message);
      return;
    }
    console.log('✅ Tabela audit_logs acessível');

    // 2. Verificar políticas via query direta (se possível)
    console.log('\n2️⃣ Tentando verificar políticas RLS...');
    
    try {
      // Tentar via RPC se disponível
      const { data: policies, error: policiesError } = await supabase.rpc('exec_sql', {
        sql: `
          SELECT 
            policyname,
            cmd,
            permissive,
            roles,
            qual,
            with_check
          FROM pg_policies 
          WHERE schemaname = 'public' 
          AND tablename = 'audit_logs'
          ORDER BY policyname;
        `
      });

      if (!policiesError && policies) {
        console.log('📋 Políticas encontradas via RPC:');
        if (policies.length === 0) {
          console.log('⚠️ Nenhuma política encontrada');
        } else {
          policies.forEach(policy => {
            console.log(`\n📝 Política: ${policy.policyname}`);
            console.log(`   Comando: ${policy.cmd}`);
            console.log(`   Roles: ${policy.roles}`);
            console.log(`   Condição: ${policy.qual || 'N/A'}`);
            console.log(`   With Check: ${policy.with_check || 'N/A'}`);
          });
        }
      } else {
        throw new Error('RPC não disponível');
      }
    } catch (rpcError) {
      console.log('⚠️ RPC não disponível, tentando método alternativo...');
      
      // Método alternativo: verificar via API REST
      try {
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'apikey': supabaseServiceKey
          },
          body: JSON.stringify({
            sql: `
              SELECT 
                schemaname,
                tablename,
                policyname,
                cmd,
                permissive,
                roles,
                qual,
                with_check
              FROM pg_policies 
              WHERE schemaname = 'public' 
              AND tablename = 'audit_logs'
              ORDER BY policyname;
            `
          })
        });

        if (response.ok) {
          const result = await response.json();
          console.log('📋 Políticas encontradas via API:');
          console.log(JSON.stringify(result, null, 2));
        } else {
          console.log('⚠️ Não foi possível verificar políticas via API');
        }
      } catch (apiError) {
        console.log('⚠️ Erro na API:', apiError.message);
      }
    }

    // 3. Verificar status RLS da tabela
    console.log('\n3️⃣ Verificando status RLS da tabela...');
    try {
      const { data: tableInfo, error: tableInfoError } = await supabase.rpc('exec_sql', {
        sql: `
          SELECT 
            schemaname,
            tablename,
            rowsecurity as rls_enabled,
            (SELECT count(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = 'audit_logs') as policy_count
          FROM pg_tables 
          WHERE schemaname = 'public' 
          AND tablename = 'audit_logs';
        `
      });

      if (!tableInfoError && tableInfo) {
        console.log('📊 Status da tabela:');
        console.log(JSON.stringify(tableInfo, null, 2));
        
        if (tableInfo.length > 0) {
          const info = tableInfo[0];
          console.log(`\n📈 Resumo:`);
          console.log(`   RLS Habilitado: ${info.rls_enabled ? '✅ SIM' : '❌ NÃO'}`);
          console.log(`   Número de Políticas: ${info.policy_count}`);
          
          if (!info.rls_enabled && info.policy_count > 0) {
            console.log('\n🚨 PROBLEMA IDENTIFICADO:');
            console.log('   Políticas existem mas RLS não está habilitado!');
            console.log('   Isso representa uma vulnerabilidade de segurança.');
          }
        }
      }
    } catch (statusError) {
      console.log('⚠️ Não foi possível verificar status RLS:', statusError.message);
    }

    // 4. Listar políticas esperadas
    console.log('\n4️⃣ Políticas esperadas para audit_logs:');
    console.log('📝 super_admin_can_view_all_audit_logs - Permite SELECT para super_admin');
    console.log('📝 system_can_insert_audit_logs - Permite INSERT para sistema');

    console.log('\n✅ Verificação concluída');

  } catch (error) {
    console.error('❌ Erro durante verificação:', error.message);
  }
}

verifyAuditLogsPolicies();
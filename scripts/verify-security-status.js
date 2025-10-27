#!/usr/bin/env node

/**
 * SCRIPT DE VERIFICAÇÃO DE STATUS DE SEGURANÇA
 * 
 * Este script verifica o status atual das correções de segurança
 * implementadas no Portal Maria Helena.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Erro: Variáveis de ambiente do Supabase não encontradas');
  console.error('Certifique-se de que NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY estão definidas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkFunctionSecurity() {
  console.log('\n🔍 VERIFICANDO SEGURANÇA DAS FUNÇÕES...\n');
  
  const vulnerableFunctions = [
    'update_banner_video_analytics_updated_at',
    'update_video_ads_updated_at', 
    'get_video_ad_analytics_summary',
    'update_updated_at_column',
    'get_active_video_ads'
  ];

  try {
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT 
            proname as function_name,
            CASE 
                WHEN 'search_path=''' = ANY(proconfig) THEN 'SEGURO'
                ELSE 'VULNERÁVEL'
            END as security_status,
            CASE 
                WHEN 'search_path=''' = ANY(proconfig) THEN '✅'
                ELSE '❌'
            END as status_icon
        FROM pg_proc 
        WHERE proname = ANY($1)
        AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
        ORDER BY proname;
      `,
      params: [vulnerableFunctions]
    });

    if (error) {
      console.error('❌ Erro ao verificar funções:', error.message);
      return false;
    }

    let allSecure = true;
    
    console.log('📋 STATUS DAS FUNÇÕES:');
    console.log('─'.repeat(60));
    
    for (const func of vulnerableFunctions) {
      const result = data?.find(row => row.function_name === func);
      if (result) {
        console.log(`${result.status_icon} ${func}: ${result.security_status}`);
        if (result.security_status === 'VULNERÁVEL') {
          allSecure = false;
        }
      } else {
        console.log(`⚠️  ${func}: FUNÇÃO NÃO ENCONTRADA`);
        allSecure = false;
      }
    }

    console.log('─'.repeat(60));
    console.log(allSecure ? '✅ TODAS AS FUNÇÕES ESTÃO SEGURAS!' : '❌ ALGUMAS FUNÇÕES AINDA ESTÃO VULNERÁVEIS!');
    
    return allSecure;
  } catch (error) {
    console.error('❌ Erro inesperado:', error.message);
    return false;
  }
}

async function checkPostgresVersion() {
  console.log('\n🔍 VERIFICANDO VERSÃO DO POSTGRESQL...\n');
  
  try {
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT 
            version() as postgres_version,
            CASE 
                WHEN version() LIKE '%17.5%' OR version() LIKE '%17.6%' OR version() LIKE '%17.7%' 
                THEN 'ATUALIZADO'
                ELSE 'PRECISA ATUALIZAR'
            END as update_status
      `
    });

    if (error) {
      console.error('❌ Erro ao verificar versão:', error.message);
      return false;
    }

    const result = data?.[0];
    if (result) {
      console.log('📋 VERSÃO DO POSTGRESQL:');
      console.log('─'.repeat(60));
      console.log(`Versão: ${result.postgres_version}`);
      console.log(`Status: ${result.update_status === 'ATUALIZADO' ? '✅' : '⚠️'} ${result.update_status}`);
      console.log('─'.repeat(60));
      
      return result.update_status === 'ATUALIZADO';
    }
    
    return false;
  } catch (error) {
    console.error('❌ Erro inesperado:', error.message);
    return false;
  }
}

async function checkRLSPolicies() {
  console.log('\n🔍 VERIFICANDO POLÍTICAS RLS...\n');
  
  try {
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT 
            schemaname,
            tablename,
            rowsecurity as rls_enabled,
            CASE 
                WHEN rowsecurity THEN '✅'
                ELSE '❌'
            END as status_icon
        FROM pg_tables 
        WHERE schemaname = 'public'
        AND tablename IN ('banners', 'banner_positions', 'empresas', 'noticias', 'profiles')
        ORDER BY tablename;
      `
    });

    if (error) {
      console.error('❌ Erro ao verificar RLS:', error.message);
      return false;
    }

    let allEnabled = true;
    
    console.log('📋 STATUS RLS DAS TABELAS:');
    console.log('─'.repeat(60));
    
    if (data && data.length > 0) {
      for (const table of data) {
        console.log(`${table.status_icon} ${table.tablename}: ${table.rls_enabled ? 'HABILITADO' : 'DESABILITADO'}`);
        if (!table.rls_enabled) {
          allEnabled = false;
        }
      }
    } else {
      console.log('⚠️  Nenhuma tabela encontrada ou erro na consulta');
      allEnabled = false;
    }

    console.log('─'.repeat(60));
    console.log(allEnabled ? '✅ RLS HABILITADO EM TODAS AS TABELAS!' : '❌ ALGUMAS TABELAS SEM RLS!');
    
    return allEnabled;
  } catch (error) {
    console.error('❌ Erro inesperado:', error.message);
    return false;
  }
}

async function generateSecurityReport() {
  console.log('🛡️  RELATÓRIO DE SEGURANÇA - PORTAL MARIA HELENA');
  console.log('═'.repeat(70));
  console.log(`Data: ${new Date().toLocaleString('pt-BR')}`);
  console.log('═'.repeat(70));

  const functionsSecure = await checkFunctionSecurity();
  const postgresUpdated = await checkPostgresVersion();
  const rlsEnabled = await checkRLSPolicies();

  console.log('\n📊 RESUMO GERAL:');
  console.log('═'.repeat(70));
  console.log(`${functionsSecure ? '✅' : '❌'} Funções com search_path seguro: ${functionsSecure ? 'OK' : 'PENDENTE'}`);
  console.log(`${postgresUpdated ? '✅' : '⚠️'} PostgreSQL atualizado: ${postgresUpdated ? 'OK' : 'PENDENTE'}`);
  console.log(`${rlsEnabled ? '✅' : '❌'} RLS habilitado: ${rlsEnabled ? 'OK' : 'PENDENTE'}`);
  
  // Itens que precisam ser configurados manualmente no Dashboard
  console.log('\n🔧 CONFIGURAÇÕES MANUAIS NECESSÁRIAS:');
  console.log('─'.repeat(70));
  console.log('⚠️  Proteção contra senhas vazadas: VERIFICAR NO DASHBOARD');
  console.log('⚠️  Configuração MFA (TOTP + SMS): VERIFICAR NO DASHBOARD');
  console.log('⚠️  Upgrade PostgreSQL: EXECUTAR NO DASHBOARD');

  const overallScore = [functionsSecure, rlsEnabled].filter(Boolean).length;
  const totalChecks = 2; // Apenas verificações automáticas
  
  console.log('\n🎯 SCORE DE SEGURANÇA AUTOMÁTICA:');
  console.log('═'.repeat(70));
  console.log(`Score: ${overallScore}/${totalChecks} (${Math.round((overallScore/totalChecks)*100)}%)`);
  
  if (overallScore === totalChecks) {
    console.log('🎉 PARABÉNS! Todas as verificações automáticas passaram!');
    console.log('📋 Próximos passos: Configure as opções manuais no Dashboard Supabase');
  } else {
    console.log('⚠️  Algumas verificações falharam. Revise as correções necessárias.');
  }

  console.log('\n📖 Para configurações manuais, consulte: SECURITY-AUTH-CONFIG.md');
  console.log('═'.repeat(70));
}

// Executar verificação
generateSecurityReport().catch(error => {
  console.error('❌ Erro fatal:', error.message);
  process.exit(1);
});
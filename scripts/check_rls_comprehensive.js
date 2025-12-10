require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkRLSComprehensive() {
  console.log('\n🔍 === VERIFICAÇÃO COMPLETA DE RLS ===\n');
  
  try {
    // Query SQL para verificar status RLS de todas as tabelas
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: `
        SELECT 
          schemaname,
          tablename,
          rowsecurity as rls_enabled,
          (SELECT count(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = t.tablename) as policy_count,
          CASE 
            WHEN rowsecurity = false AND (SELECT count(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = t.tablename) > 0 
            THEN 'PROBLEMA: Políticas existem mas RLS desabilitado'
            WHEN rowsecurity = true AND (SELECT count(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = t.tablename) > 0 
            THEN 'OK: RLS habilitado com políticas'
            WHEN rowsecurity = false AND (SELECT count(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = t.tablename) = 0 
            THEN 'OK: Sem RLS e sem políticas'
            WHEN rowsecurity = true AND (SELECT count(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = t.tablename) = 0 
            THEN 'ATENÇÃO: RLS habilitado mas sem políticas'
            ELSE 'Status desconhecido'
          END as status_description
        FROM pg_tables t
        WHERE schemaname = 'public'
        ORDER BY 
          CASE 
            WHEN rowsecurity = false AND (SELECT count(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = t.tablename) > 0 
            THEN 1
            ELSE 2
          END,
          tablename;
      `
    });

    if (error) {
      console.error('❌ Erro ao executar query:', error);
      return;
    }

    console.log('📊 Status RLS de todas as tabelas:');
    console.log('=====================================\n');

    let problemTables = [];
    let okTables = [];
    let attentionTables = [];

    data.forEach(table => {
      const status = table.status_description;
      const info = `${table.tablename} (Políticas: ${table.policy_count})`;
      
      if (status.startsWith('PROBLEMA')) {
        problemTables.push(table);
        console.log(`🚨 ${info} - ${status}`);
      } else if (status.startsWith('ATENÇÃO')) {
        attentionTables.push(table);
        console.log(`⚠️  ${info} - ${status}`);
      } else {
        okTables.push(table);
        console.log(`✅ ${info} - ${status}`);
      }
    });

    console.log('\n📋 RESUMO:');
    console.log('==========');
    console.log(`🚨 Tabelas com PROBLEMAS: ${problemTables.length}`);
    console.log(`⚠️  Tabelas com ATENÇÃO: ${attentionTables.length}`);
    console.log(`✅ Tabelas OK: ${okTables.length}`);

    if (problemTables.length > 0) {
      console.log('\n🔧 TABELAS QUE PRECISAM DE CORREÇÃO:');
      console.log('====================================');
      problemTables.forEach(table => {
        console.log(`- ${table.tablename} (${table.policy_count} políticas)`);
      });

      console.log('\n💡 COMANDOS PARA CORREÇÃO:');
      console.log('==========================');
      problemTables.forEach(table => {
        console.log(`ALTER TABLE public.${table.tablename} ENABLE ROW LEVEL SECURITY;`);
      });
    }

    if (attentionTables.length > 0) {
      console.log('\n⚠️  TABELAS QUE MERECEM ATENÇÃO:');
      console.log('===============================');
      attentionTables.forEach(table => {
        console.log(`- ${table.tablename} (RLS habilitado mas sem políticas)`);
      });
    }

  } catch (error) {
    console.error('❌ Erro durante verificação:', error.message);
  }
}

checkRLSComprehensive();
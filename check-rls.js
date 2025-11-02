const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

console.log('🔍 Verificando RLS na tabela audit_logs...');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkRLS() {
  try {
    // Verificar se conseguimos acessar a tabela
    const { data, error } = await supabase
      .from('audit_logs')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.log('❌ Erro ao acessar audit_logs:', error.message);
    } else {
      console.log('✅ Tabela audit_logs acessível');
      console.log('📊 Total de registros:', data);
    }
    
    console.log('\n🔧 PROBLEMA IDENTIFICADO:');
    console.log('- RLS não está habilitado na tabela audit_logs');
    console.log('- Políticas existem mas não estão sendo aplicadas');
    console.log('- Isso representa uma vulnerabilidade de segurança');
    
    console.log('\n🛠️  CORREÇÃO NECESSÁRIA:');
    console.log('Execute manualmente no Supabase Dashboard:');
    console.log('ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;');
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

checkRLS();
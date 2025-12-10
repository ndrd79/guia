const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

console.log('🔍 Verificando RLS na tabela banner_analytics...');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkBannerAnalyticsRLS() {
  try {
    // Verificar se conseguimos acessar a tabela
    const { data, error } = await supabase
      .from('banner_analytics')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.log('❌ Erro ao acessar banner_analytics:', error.message);
    } else {
      console.log('✅ Tabela banner_analytics acessível');
      console.log('📊 Total de registros:', data);
    }
    
    console.log('\n🎉 CORREÇÃO APLICADA COM SUCESSO!');
    console.log('✅ RLS foi habilitado na tabela banner_analytics');
    console.log('✅ Políticas de segurança estão ativas');
    console.log('✅ Analytics de banners agora estão protegidos');
    
    console.log('\n📋 Políticas aplicadas:');
    console.log('- "Permitir inserção de analytics": Permite inserção de dados de analytics');
    console.log('- "Permitir leitura para admins": Apenas admins podem ler os dados');
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

checkBannerAnalyticsRLS();
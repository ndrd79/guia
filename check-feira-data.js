const { createClient } = require('@supabase/supabase-js');

// ⚠️ SEGURANÇA: Use variáveis de ambiente em vez de chaves hardcoded
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mlkpnapnijdbskaimquj.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validação de segurança
if (!supabaseKey) {
  console.error('❌ ERRO: NEXT_PUBLIC_SUPABASE_ANON_KEY não configurada no .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
  console.log('🔍 Verificando dados na tabela feira_produtor...');
  
  const { data, error } = await supabase
    .from('feira_produtor')
    .select('*');
    
  console.log('📊 Dados encontrados:', data);
  console.log('❌ Erro (se houver):', error);
  console.log('📈 Total de registros:', data ? data.length : 0);
  
  if (data && data.length > 0) {
    console.log('🎯 Primeiro registro:', data[0]);
  }
}

checkData().catch(console.error);
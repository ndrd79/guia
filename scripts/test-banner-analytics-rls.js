const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function testBannerAnalyticsRLS() {
  console.log('🔍 Testando RLS na tabela banner_analytics...\n');

  // Cliente anônimo
  const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);
  
  // Cliente com service role (bypass RLS)
  const supabaseService = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // 1. Verificar se a tabela existe e RLS está habilitado
    console.log('1. Verificando status da tabela...');
    const { data: tableInfo, error: tableError } = await supabaseService
      .from('information_schema.tables')
      .select('*')
      .eq('table_schema', 'public')
      .eq('table_name', 'banner_analytics');

    if (tableError) {
      console.error('❌ Erro ao verificar tabela:', tableError);
      return;
    }

    console.log('✅ Tabela banner_analytics encontrada');

    // 2. Verificar políticas RLS
    console.log('\n2. Verificando políticas RLS...');
    const { data: policies, error: policiesError } = await supabaseService
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'banner_analytics');

    if (policies && policies.length > 0) {
      console.log('✅ Políticas RLS encontradas:');
      policies.forEach(policy => {
        console.log(`   - ${policy.policyname}: ${policy.cmd} para ${policy.roles}`);
      });
    } else {
      console.log('⚠️  Nenhuma política RLS encontrada');
    }

    // 3. Testar inserção com cliente anônimo
    console.log('\n3. Testando inserção com cliente anônimo...');
    const testData = {
      banner_id: '00000000-0000-0000-0000-000000000001', // UUID fictício
      tipo: 'impressao',
      ip_address: '127.0.0.1',
      user_agent: 'Test User Agent',
      session_id: 'test-session-' + Date.now()
    };

    const { data: insertData, error: insertError } = await supabaseAnon
      .from('banner_analytics')
      .insert(testData)
      .select();

    if (insertError) {
      console.log('❌ Inserção negada:', insertError.message);
    } else {
      console.log('✅ Inserção permitida:', insertData);
    }

    // 4. Testar leitura com cliente anônimo
    console.log('\n4. Testando leitura com cliente anônimo...');
    const { data: readData, error: readError } = await supabaseAnon
      .from('banner_analytics')
      .select('*')
      .limit(5);

    if (readError) {
      console.log('❌ Leitura negada:', readError.message);
    } else {
      console.log('✅ Leitura permitida. Registros encontrados:', readData?.length || 0);
    }

    // 5. Testar com service role (deve sempre funcionar)
    console.log('\n5. Testando com service role (bypass RLS)...');
    const { data: serviceData, error: serviceError } = await supabaseService
      .from('banner_analytics')
      .select('count(*)')
      .single();

    if (serviceError) {
      console.log('❌ Erro inesperado com service role:', serviceError.message);
    } else {
      console.log('✅ Service role funcionando. Total de registros:', serviceData?.count || 0);
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }

  console.log('\n🏁 Teste concluído!');
}

// Executar teste
if (require.main === module) {
  testBannerAnalyticsRLS().catch(console.error);
}

module.exports = { testBannerAnalyticsRLS };
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function testBannerSave() {
  console.log('🔍 Iniciando teste de salvamento de banners...');
  
  // Teste 1: Verificar configuração
  console.log('\n1️⃣ Verificando configuração:');
  console.log('URL:', supabaseUrl ? '✅ Configurada' : '❌ Não configurada');
  console.log('Anon Key:', supabaseAnonKey ? '✅ Configurada' : '❌ Não configurada');
  console.log('Service Key:', supabaseServiceKey ? '✅ Configurada' : '❌ Não configurada');
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Configuração incompleta!');
    return;
  }
  
  // Cliente com chave anônima (como no frontend)
  const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);
  
  // Cliente com chave de serviço (bypass RLS)
  const supabaseService = createClient(supabaseUrl, supabaseServiceKey);
  
  // Teste 2: Verificar conexão
  console.log('\n2️⃣ Testando conexão com o banco:');
  try {
    const { data, error } = await supabaseAnon.from('banners').select('count').limit(1);
    if (error) {
      console.error('❌ Erro de conexão:', error.message);
      return;
    }
    console.log('✅ Conexão estabelecida com sucesso');
  } catch (err) {
    console.error('❌ Erro de conexão:', err.message);
    return;
  }
  
  // Teste 3: Autenticar usuário admin
  console.log('\n3️⃣ Testando autenticação do admin:');
  try {
    const { data: authData, error: authError } = await supabaseAnon.auth.signInWithPassword({
      email: 'admin@portal.com',
      password: '123456'
    });
    
    if (authError) {
      console.error('❌ Erro de autenticação:', authError.message);
      return;
    }
    
    if (authData.user) {
      console.log('✅ Admin autenticado com sucesso');
      console.log('User ID:', authData.user.id);
      console.log('Email:', authData.user.email);
    }
  } catch (err) {
    console.error('❌ Erro na autenticação:', err.message);
    return;
  }
  
  // Teste 4: Tentar inserir banner com usuário autenticado
  console.log('\n4️⃣ Testando inserção de banner (usuário autenticado):');
  const testBanner = {
    nome: 'Teste Banner ' + Date.now(),
    posicao: 'Header Superior',
    imagem: 'https://via.placeholder.com/728x90',
    link: 'https://example.com',
    largura: 728,
    altura: 90,
    ativo: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  try {
    const { data: insertData, error: insertError } = await supabaseAnon
      .from('banners')
      .insert([testBanner])
      .select();
    
    if (insertError) {
      console.error('❌ Erro ao inserir banner (autenticado):', insertError.message);
      console.error('Código do erro:', insertError.code);
      console.error('Detalhes:', insertError.details);
    } else {
      console.log('✅ Banner inserido com sucesso (autenticado)!');
      console.log('Banner criado:', insertData[0]);
      
      // Limpar teste
      await supabaseAnon.from('banners').delete().eq('id', insertData[0].id);
      console.log('🧹 Banner de teste removido');
    }
  } catch (err) {
    console.error('❌ Erro na inserção (autenticado):', err.message);
  }
  
  // Teste 5: Tentar inserir banner com service role (bypass RLS)
  console.log('\n5️⃣ Testando inserção de banner (service role - bypass RLS):');
  try {
    const { data: serviceData, error: serviceError } = await supabaseService
      .from('banners')
      .insert([{ ...testBanner, nome: 'Teste Service ' + Date.now() }])
      .select();
    
    if (serviceError) {
      console.error('❌ Erro ao inserir banner (service role):', serviceError.message);
    } else {
      console.log('✅ Banner inserido com sucesso (service role)!');
      console.log('Banner criado:', serviceData[0]);
      
      // Limpar teste
      await supabaseService.from('banners').delete().eq('id', serviceData[0].id);
      console.log('🧹 Banner de teste removido');
    }
  } catch (err) {
    console.error('❌ Erro na inserção (service role):', err.message);
  }
  
  // Teste 6: Verificar políticas RLS
  console.log('\n6️⃣ Verificando políticas RLS:');
  try {
    const { data: policies } = await supabaseService
      .rpc('get_table_policies', { table_name: 'banners' })
      .select();
    
    if (policies && policies.length > 0) {
      console.log('✅ Políticas RLS encontradas:');
      policies.forEach(policy => {
        console.log(`- ${policy.policyname}: ${policy.cmd}`);
      });
    } else {
      console.log('⚠️ Nenhuma política RLS encontrada');
    }
  } catch (err) {
    console.log('⚠️ Não foi possível verificar políticas RLS');
  }
  
  console.log('\n🏁 Teste concluído!');
}

testBannerSave().catch(console.error);
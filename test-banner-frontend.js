require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function testFrontendBannerSave() {
  console.log('🔍 Testando salvamento de banner (simulação frontend)...');
  
  // Verificar configuração
  console.log('\n1️⃣ Verificando configuração:');
  console.log('URL:', supabaseUrl ? '✅ Configurada' : '❌ Não configurada');
  console.log('Anon Key:', supabaseAnonKey ? '✅ Configurada' : '❌ Não configurada');
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Configuração incompleta!');
    return;
  }
  
  // Cliente igual ao frontend
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  // Teste de conexão
  console.log('\n2️⃣ Testando conexão:');
  try {
    const { data, error } = await supabase.from('banners').select('count').limit(1);
    if (error) {
      console.error('❌ Erro de conexão:', error.message);
      return;
    }
    console.log('✅ Conexão OK');
  } catch (err) {
    console.error('❌ Erro de conexão:', err.message);
    return;
  }
  
  // Autenticar como admin
  console.log('\n3️⃣ Autenticando como admin:');
  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'admin@portal.com',
      password: '123456'
    });
    
    if (authError) {
      console.error('❌ Erro de autenticação:', authError.message);
      return;
    }
    
    console.log('✅ Admin autenticado:', authData.user.email);
  } catch (err) {
    console.error('❌ Erro na autenticação:', err.message);
    return;
  }
  
  // Simular dados do formulário
  const bannerData = {
    nome: 'Teste Banner Frontend',
    posicao: 'Hero Carousel',
    imagem: '/images/placeholder-banner-1270x250.svg',
    link: 'https://exemplo.com',
    largura: 1270,
    altura: 250,
    ativo: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  console.log('\n4️⃣ Tentando salvar banner:');
  console.log('Dados:', bannerData);
  
  try {
    const { data, error } = await supabase
      .from('banners')
      .insert([bannerData])
      .select();
    
    if (error) {
      console.error('❌ Erro ao salvar banner:', error);
      console.error('Código:', error.code);
      console.error('Detalhes:', error.details);
      console.error('Hint:', error.hint);
      return;
    }
    
    console.log('✅ Banner salvo com sucesso!');
    console.log('ID do banner:', data[0].id);
    
    // Verificar se aparece na listagem
    console.log('\n5️⃣ Verificando se aparece na listagem:');
    const { data: banners, error: listError } = await supabase
      .from('banners')
      .select('*')
      .eq('posicao', 'Hero Carousel')
      .eq('ativo', true);
    
    if (listError) {
      console.error('❌ Erro ao listar banners:', listError.message);
    } else {
      console.log('✅ Banners encontrados:', banners.length);
      banners.forEach(banner => {
        console.log(`  - ${banner.nome} (ID: ${banner.id})`);
      });
    }
    
    // Limpar teste
    console.log('\n6️⃣ Removendo banner de teste:');
    const { error: deleteError } = await supabase
      .from('banners')
      .delete()
      .eq('id', data[0].id);
    
    if (deleteError) {
      console.error('❌ Erro ao remover banner de teste:', deleteError.message);
    } else {
      console.log('✅ Banner de teste removido');
    }
    
  } catch (err) {
    console.error('❌ Erro inesperado:', err.message);
  }
  
  console.log('\n🏁 Teste concluído!');
}

testFrontendBannerSave().catch(console.error);
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;

async function testHeroBanners() {
  console.log('🔍 Testando banners do Hero Carousel...');
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Variáveis de ambiente não configuradas');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const supabaseAdmin = createClient(supabaseUrl, serviceKey);

  try {
    // 1. Verificar banners existentes na posição Hero Carousel
    console.log('\n1️⃣ Verificando banners existentes na posição "Hero Carousel":');
    const { data: existingBanners, error: queryError } = await supabase
      .from('banners')
      .select('*')
      .eq('posicao', 'Hero Carousel')
      .order('created_at', { ascending: false });

    if (queryError) {
      console.error('❌ Erro na consulta:', queryError);
      return;
    }

    console.log(`📊 Total de banners encontrados: ${existingBanners?.length || 0}`);
    
    if (existingBanners && existingBanners.length > 0) {
      console.log('\n📋 Banners encontrados:');
      existingBanners.forEach((banner, index) => {
        console.log(`   ${index + 1}. ${banner.nome} - Ativo: ${banner.ativo ? '✅' : '❌'}`);
        console.log(`      Imagem: ${banner.imagem}`);
        console.log(`      Dimensões: ${banner.largura}x${banner.altura}`);
        console.log(`      Criado em: ${banner.created_at}`);
        console.log('');
      });
    } else {
      console.log('⚠️ Nenhum banner encontrado na posição "Hero Carousel"');
    }

    // 2. Verificar banners ativos especificamente
    console.log('\n2️⃣ Verificando banners ATIVOS na posição "Hero Carousel":');
    const { data: activeBanners, error: activeError } = await supabase
      .from('banners')
      .select('*')
      .eq('posicao', 'Hero Carousel')
      .eq('ativo', true)
      .order('created_at', { ascending: false });

    if (activeError) {
      console.error('❌ Erro na consulta de ativos:', activeError);
      return;
    }

    console.log(`📊 Banners ativos: ${activeBanners?.length || 0}`);
    
    if (activeBanners && activeBanners.length > 0) {
      activeBanners.forEach((banner, index) => {
        console.log(`   ${index + 1}. ${banner.nome}`);
      });
    }

    // 3. Testar criação de um banner de teste para Hero Carousel
    console.log('\n3️⃣ Testando criação de banner para Hero Carousel:');
    
    // Primeiro, autenticar como admin usando as variáveis de ambiente
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword
    });

    if (authError) {
      console.error('❌ Erro na autenticação:', authError);
      return;
    }

    console.log('✅ Admin autenticado');

    const testBanner = {
      nome: `Teste Hero Banner ${Date.now()}`,
      posicao: 'Hero Carousel',
      imagem: '/images/placeholder-banner-1270x250.svg',
      link: 'https://example.com',
      largura: 1270,
      altura: 250,
      ativo: true
    };

    const { data: newBanner, error: insertError } = await supabase
      .from('banners')
      .insert([testBanner])
      .select()
      .single();

    if (insertError) {
      console.error('❌ Erro ao criar banner:', insertError);
      return;
    }

    console.log('✅ Banner de teste criado com sucesso!');
    console.log('Banner criado:', {
      id: newBanner.id,
      nome: newBanner.nome,
      posicao: newBanner.posicao,
      ativo: newBanner.ativo
    });

    // 4. Verificar se o banner aparece na consulta da página inicial
    console.log('\n4️⃣ Simulando consulta da página inicial:');
    const { data: pageQuery, error: pageError } = await supabase
      .from('banners')
      .select('*')
      .eq('ativo', true)
      .eq('posicao', 'Hero Carousel')
      .limit(5);

    if (pageError) {
      console.error('❌ Erro na consulta da página:', pageError);
    } else {
      console.log(`✅ Consulta da página retornou ${pageQuery?.length || 0} banners`);
    }

    // 5. Limpar banner de teste
    console.log('\n5️⃣ Removendo banner de teste...');
    const { error: deleteError } = await supabase
      .from('banners')
      .delete()
      .eq('id', newBanner.id);

    if (deleteError) {
      console.error('❌ Erro ao remover banner de teste:', deleteError);
    } else {
      console.log('🧹 Banner de teste removido');
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }

  console.log('\n🏁 Teste concluído!');
}

testHeroBanners();
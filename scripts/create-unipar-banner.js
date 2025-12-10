require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;

async function createUniparBanner() {
  console.log('🎯 Criando banner UNIPAR - Medicina 2026...');
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Variáveis de ambiente não configuradas');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const supabaseAdmin = createClient(supabaseUrl, serviceKey);

  try {
    // 1. Verificar se a imagem existe
    const imagePath = 'C:\\Downloads\\1170x330-medicina-2026-unipar-685b09f91ab81';
    
    // Tentar diferentes extensões
    const possibleExtensions = ['.jpg', '.jpeg', '.png', '.webp', ''];
    let fullImagePath = null;
    
    for (const ext of possibleExtensions) {
      const testPath = imagePath + ext;
      if (fs.existsSync(testPath)) {
        fullImagePath = testPath;
        break;
      }
    }
    
    if (!fullImagePath) {
      console.error('❌ Imagem não encontrada em:', imagePath);
      console.log('📁 Tentativas:');
      possibleExtensions.forEach(ext => {
        console.log(`   - ${imagePath}${ext}`);
      });
      return;
    }
    
    console.log('✅ Imagem encontrada:', fullImagePath);
    
    // 2. Ler a imagem
    const imageBuffer = fs.readFileSync(fullImagePath);
    const fileExtension = path.extname(fullImagePath) || '.jpg';
    const fileName = `unipar-medicina-2026-${Date.now()}${fileExtension}`;
    
    console.log('📁 Arquivo:', fileName);
    console.log('📏 Tamanho:', (imageBuffer.length / 1024).toFixed(2), 'KB');
    
    // 3. Autenticar como admin
    console.log('\n🔐 Autenticando como admin...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword
    });

    if (authError) {
      console.error('❌ Erro na autenticação:', authError.message);
      return;
    }
    
    console.log('✅ Admin autenticado');
    
    // 4. Upload da imagem para o Supabase Storage
    console.log('\n📤 Fazendo upload da imagem...');
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('banners')
      .upload(fileName, imageBuffer, {
        contentType: `image/${fileExtension.replace('.', '')}`,
        upsert: false
      });

    if (uploadError) {
      console.error('❌ Erro no upload:', uploadError.message);
      return;
    }
    
    console.log('✅ Upload realizado:', uploadData.path);
    
    // 5. Obter URL pública da imagem
    const { data: urlData } = supabase.storage
      .from('banners')
      .getPublicUrl(fileName);
    
    const imageUrl = urlData.publicUrl;
    console.log('🔗 URL da imagem:', imageUrl);
    
    // 6. Criar o banner no banco de dados
    console.log('\n💾 Criando banner no banco de dados...');
    const bannerData = {
      nome: 'UNIPAR - Vestibular Medicina 2026',
      posicao: 'Hero Carousel',
      imagem: imageUrl,
      link: 'https://www.unipar.br/vestibular', // Link exemplo - ajuste conforme necessário
      largura: 1170,
      altura: 330,
      ativo: true,
      descricao: 'Banner promocional do vestibular de Medicina 2026 da UNIPAR'
    };

    const { data: newBanner, error: insertError } = await supabase
      .from('banners')
      .insert([bannerData])
      .select()
      .single();

    if (insertError) {
      console.error('❌ Erro ao criar banner:', insertError.message);
      return;
    }

    console.log('✅ Banner criado com sucesso!');
    console.log('📋 Detalhes do banner:');
    console.log(`   ID: ${newBanner.id}`);
    console.log(`   Nome: ${newBanner.nome}`);
    console.log(`   Posição: ${newBanner.posicao}`);
    console.log(`   Dimensões: ${newBanner.largura}x${newBanner.altura}`);
    console.log(`   Status: ${newBanner.ativo ? 'Ativo' : 'Inativo'}`);
    console.log(`   URL: ${newBanner.imagem}`);
    
    // 7. Verificar se o banner aparece na consulta da página inicial
    console.log('\n🔍 Verificando se o banner aparece na página inicial...');
    const { data: pageQuery, error: pageError } = await supabase
      .from('banners')
      .select('*')
      .eq('ativo', true)
      .eq('posicao', 'Hero Carousel')
      .order('created_at', { ascending: false });

    if (pageError) {
      console.error('❌ Erro na consulta da página:', pageError.message);
    } else {
      console.log(`✅ Total de banners ativos no Hero Carousel: ${pageQuery?.length || 0}`);
      if (pageQuery && pageQuery.length > 0) {
        pageQuery.forEach((banner, index) => {
          console.log(`   ${index + 1}. ${banner.nome}`);
        });
      }
    }
    
    console.log('\n🎉 Processo concluído com sucesso!');
    console.log('📱 Acesse a página inicial para ver o banner: http://localhost:3000');
    console.log('⚙️ Gerencie banners em: http://localhost:3000/admin/banners');

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

createUniparBanner();
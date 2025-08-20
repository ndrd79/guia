require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;

function findImageInDownloads() {
  console.log('🔍 Procurando imagem da UNIPAR na pasta Downloads...');
  
  const downloadsPath = 'C:\\Downloads';
  
  if (!fs.existsSync(downloadsPath)) {
    console.error('❌ Pasta Downloads não encontrada:', downloadsPath);
    return null;
  }
  
  try {
    const files = fs.readdirSync(downloadsPath);
    console.log(`📁 Encontrados ${files.length} arquivos na pasta Downloads`);
    
    // Procurar por arquivos que contenham "medicina", "unipar" ou "1170x330"
    const searchTerms = ['medicina', 'unipar', '1170x330', '1170', '330'];
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp'];
    
    const candidates = files.filter(file => {
      const fileName = file.toLowerCase();
      const hasSearchTerm = searchTerms.some(term => fileName.includes(term.toLowerCase()));
      const hasImageExtension = imageExtensions.some(ext => fileName.endsWith(ext));
      return hasSearchTerm && hasImageExtension;
    });
    
    console.log('🎯 Candidatos encontrados:');
    candidates.forEach((file, index) => {
      const filePath = path.join(downloadsPath, file);
      const stats = fs.statSync(filePath);
      console.log(`   ${index + 1}. ${file} (${(stats.size / 1024).toFixed(2)} KB)`);
    });
    
    if (candidates.length === 0) {
      console.log('❌ Nenhuma imagem relacionada à UNIPAR encontrada');
      console.log('💡 Procure por arquivos que contenham: medicina, unipar, 1170x330');
      return null;
    }
    
    // Retornar o primeiro candidato (ou o que contém mais termos)
    const bestCandidate = candidates[0];
    const fullPath = path.join(downloadsPath, bestCandidate);
    console.log('✅ Imagem selecionada:', bestCandidate);
    
    return fullPath;
    
  } catch (error) {
    console.error('❌ Erro ao ler pasta Downloads:', error.message);
    return null;
  }
}

async function createUniparBanner() {
  console.log('🎯 Criando banner UNIPAR - Medicina 2026...');
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Variáveis de ambiente não configuradas');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // 1. Encontrar a imagem
    const imagePath = findImageInDownloads();
    
    if (!imagePath) {
      console.log('\n📋 Instruções para localizar a imagem:');
      console.log('1. Verifique se a imagem está na pasta C:\\Downloads');
      console.log('2. Certifique-se que o nome contém "medicina", "unipar" ou "1170x330"');
      console.log('3. Formatos aceitos: .jpg, .jpeg, .png, .webp, .gif, .bmp');
      return;
    }
    
    // 2. Ler a imagem
    const imageBuffer = fs.readFileSync(imagePath);
    const fileExtension = path.extname(imagePath);
    const fileName = `unipar-medicina-2026-${Date.now()}${fileExtension}`;
    
    console.log('\n📁 Detalhes do arquivo:');
    console.log(`   Nome: ${path.basename(imagePath)}`);
    console.log(`   Tamanho: ${(imageBuffer.length / 1024).toFixed(2)} KB`);
    console.log(`   Novo nome: ${fileName}`);
    
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
      link: 'https://www.unipar.br/vestibular',
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
    console.log('\n📋 Detalhes do banner:');
    console.log(`   ID: ${newBanner.id}`);
    console.log(`   Nome: ${newBanner.nome}`);
    console.log(`   Posição: ${newBanner.posicao}`);
    console.log(`   Dimensões: ${newBanner.largura}x${newBanner.altura}`);
    console.log(`   Status: ${newBanner.ativo ? 'Ativo ✅' : 'Inativo ❌'}`);
    console.log(`   URL: ${newBanner.imagem}`);
    
    // 7. Verificar se o banner aparece na consulta da página inicial
    console.log('\n🔍 Verificando banners ativos no Hero Carousel...');
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
          console.log(`   ${index + 1}. ${banner.nome} (ID: ${banner.id})`);
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
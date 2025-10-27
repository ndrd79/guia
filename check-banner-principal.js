const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkBannerPrincipal() {
  try {
    console.log('🔍 Verificando banners na posição "Banner Principal"...\n');

    // Buscar banners na posição "Banner Principal"
    const { data: banners, error } = await supabase
      .from('banners')
      .select('*')
      .eq('posicao', 'Banner Principal')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Erro ao buscar banners:', error);
      return;
    }

    console.log(`📊 Banners encontrados na posição "Banner Principal": ${banners.length}\n`);

    if (banners.length > 0) {
      banners.forEach((banner, index) => {
        console.log(`--- Banner ${index + 1} ---`);
        console.log(`ID: ${banner.id}`);
        console.log(`Título: ${banner.titulo || 'N/A'}`);
        console.log(`Descrição: ${banner.descricao || 'N/A'}`);
        console.log(`Imagem: ${banner.imagem || 'N/A'}`);
        console.log(`Link: ${banner.link || 'N/A'}`);
        console.log(`Posição: ${banner.posicao || 'N/A'}`);
        console.log(`Ativo: ${banner.ativo ? 'Sim' : 'Não'}`);
        console.log(`Largura: ${banner.largura || 'N/A'}`);
        console.log(`Altura: ${banner.altura || 'N/A'}`);
        console.log(`Criado em: ${new Date(banner.created_at).toLocaleString('pt-BR')}`);
        console.log('');
      });
    } else {
      console.log('ℹ️ Nenhum banner encontrado na posição "Banner Principal".');
    }

    // Também verificar outras posições que podem estar relacionadas
    console.log('\n🔍 Verificando outras posições de banner...\n');
    
    const { data: allBanners, error: allError } = await supabase
      .from('banners')
      .select('*')
      .eq('ativo', true)
      .order('created_at', { ascending: false });

    if (allError) {
      console.error('❌ Erro ao buscar todos os banners:', allError);
      return;
    }

    // Agrupar por posição
    const bannersByPosition = {};
    allBanners.forEach(banner => {
      const pos = banner.posicao || 'Sem posição';
      if (!bannersByPosition[pos]) {
        bannersByPosition[pos] = [];
      }
      bannersByPosition[pos].push(banner);
    });

    console.log('📍 Todas as posições de banner ativas:');
    Object.keys(bannersByPosition).sort().forEach(position => {
      console.log(`\n${position}: ${bannersByPosition[position].length} banner(s)`);
      bannersByPosition[position].forEach(banner => {
        const title = banner.titulo || 'Sem título';
        const hasTestText = title.toLowerCase().includes('teste') || 
                           title.toLowerCase().includes('rotação') ||
                           title.toLowerCase().includes('rotacao');
        const marker = hasTestText ? '🚨 TESTE' : '';
        console.log(`  - ID: ${banner.id}, Título: "${title}" ${marker}`);
      });
    });

  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

checkBannerPrincipal()
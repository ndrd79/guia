const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function findTestBanners() {
  try {
    console.log('🔍 Procurando banners de teste...\n');

    // Buscar todos os banners ativos
    const { data: banners, error } = await supabase
      .from('banners')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Erro ao buscar banners:', error);
      return;
    }

    console.log(`📊 Total de banners encontrados: ${banners.length}\n`);

    // Filtrar banners que podem ser de teste
    const testBanners = banners.filter(banner => {
      const titulo = (banner.titulo || '').toLowerCase();
      const descricao = (banner.descricao || '').toLowerCase();
      const link = (banner.link || '').toLowerCase();
      
      return titulo.includes('teste') || 
             titulo.includes('rotação') || 
             titulo.includes('rotacao') ||
             descricao.includes('teste') || 
             descricao.includes('rotação') || 
             descricao.includes('rotacao') ||
             link.includes('placeholder') ||
             link.includes('via.placeholder');
    });

    console.log(`🎯 Banners de teste encontrados: ${testBanners.length}\n`);

    if (testBanners.length > 0) {
      testBanners.forEach((banner, index) => {
        console.log(`--- Banner ${index + 1} ---`);
        console.log(`ID: ${banner.id}`);
        console.log(`Título: ${banner.titulo || 'N/A'}`);
        console.log(`Descrição: ${banner.descricao || 'N/A'}`);
        console.log(`Posição: ${banner.posicao || 'N/A'}`);
        console.log(`Link: ${banner.link || 'N/A'}`);
        console.log(`Ativo: ${banner.ativo ? 'Sim' : 'Não'}`);
        console.log(`Criado em: ${new Date(banner.created_at).toLocaleString('pt-BR')}`);
        console.log('');
      });

      // Mostrar banners por posição
      console.log('📍 Banners por posição:');
      const bannersByPosition = {};
      banners.forEach(banner => {
        const pos = banner.posicao || 'Sem posição';
        if (!bannersByPosition[pos]) {
          bannersByPosition[pos] = [];
        }
        bannersByPosition[pos].push(banner);
      });

      Object.keys(bannersByPosition).forEach(position => {
        console.log(`\n${position}: ${bannersByPosition[position].length} banner(s)`);
        bannersByPosition[position].forEach(banner => {
          console.log(`  - ID: ${banner.id}, Título: ${banner.titulo || 'N/A'}, Ativo: ${banner.ativo ? 'Sim' : 'Não'}`);
        });
      });
    } else {
      console.log('✅ Nenhum banner de teste encontrado com os critérios especificados.');
    }

  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

findTestBanners();
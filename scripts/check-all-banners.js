const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function checkAllBanners() {
  const { data: banners, error } = await supabase
    .from('banners')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Erro:', error);
    return;
  }

  console.log('📋 TODOS OS BANNERS (incluindo inativos):');
  console.log('============================================================');
  
  banners.forEach((banner, index) => {
    console.log(`${index + 1}. ${banner.nome}`);
    console.log(`   Posição: ${banner.posicao}`);
    console.log(`   Dimensões: ${banner.largura}x${banner.altura}`);
    console.log(`   Status: ${banner.ativo ? '✅ Ativo' : '❌ Inativo'}`);
    console.log(`   Imagem: ${banner.imagem ? '✅ Definida' : '❌ Não definida'}`);
    console.log('');
  });
  
  // Verificar especificamente banners de sidebar
  const sidebarBanners = banners.filter(b => 
    b.posicao.toLowerCase().includes('sidebar') || 
    b.posicao.toLowerCase().includes('esquerda') ||
    b.posicao.toLowerCase().includes('direita')
  );
  
  console.log('🔍 BANNERS DE SIDEBAR:');
  console.log('============================================================');
  if (sidebarBanners.length === 0) {
    console.log('❌ Nenhum banner de sidebar encontrado');
  } else {
    sidebarBanners.forEach((banner, index) => {
      console.log(`${index + 1}. ${banner.nome} - ${banner.posicao} (${banner.ativo ? 'Ativo' : 'Inativo'})`);
    });
  }
}

checkAllBanners();
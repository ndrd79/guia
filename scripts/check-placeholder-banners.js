const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://mlkpnapnijdbskaimquj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1sa3BuYXBuaWpkYnNrYWltcXVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2NTc0MjUsImV4cCI6MjA2OTIzMzQyNX0.p4OR5eltxJ9jRMMY1r51REhByxHA26XK27uAztUsuF8'
);

async function checkPlaceholderBanners() {
  try {
    console.log('🔍 Verificando banners com URLs do via.placeholder.com no banco...');
    
    const { data: banners, error } = await supabase
      .from('banners')
      .select('id, nome, imagem, posicao, ativo')
      .like('imagem', '%via.placeholder.com%');
    
    if (error) {
      console.error('❌ Erro ao buscar banners:', error);
      return;
    }
    
    if (!banners || banners.length === 0) {
      console.log('✅ Nenhum banner encontrado com URLs do via.placeholder.com no banco');
      return;
    }
    
    console.log(`📋 Encontrados ${banners.length} banners com via.placeholder.com:`);
    banners.forEach(banner => {
      console.log(`- ID: ${banner.id}, Nome: ${banner.nome}`);
      console.log(`  Posição: ${banner.posicao}, Ativo: ${banner.ativo}`);
      console.log(`  URL: ${banner.imagem}`);
      console.log('');
    });
    
    const problematicUrls = [
      'https://via.placeholder.com/400x300/0891B2/FFFFFF?text=Banner+Principal',
      'https://via.placeholder.com/728x90/059669/FFFFFF?text=Footer+Banner'
    ];
    
    console.log('🎯 Verificando URLs específicas que estão dando erro:');
    for (const url of problematicUrls) {
      const { data: specificBanners, error: specificError } = await supabase
        .from('banners')
        .select('id, nome, posicao, ativo')
        .eq('imagem', url);
        
      if (specificError) {
        console.error(`❌ Erro ao buscar banner com URL ${url}:`, specificError);
        continue;
      }
      
      if (specificBanners && specificBanners.length > 0) {
        console.log(`🔴 Encontrado banner problemático: ${url}`);
        specificBanners.forEach(banner => {
          console.log(`  - ID: ${banner.id}, Nome: ${banner.nome}, Posição: ${banner.posicao}, Ativo: ${banner.ativo}`);
        });
      } else {
        console.log(`✅ URL não encontrada no banco: ${url}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

checkPlaceholderBanners();
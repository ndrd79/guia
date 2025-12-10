const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://mlkpnapnijdbskaimquj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1sa3BuYXBuaWpkYnNrYWltcXVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzY1NzQyNSwiZXhwIjoyMDY5MjMzNDI1fQ.yhrc1YYwt4r-FOa3Iqa094hNEmGPj3PDEF0GkLmLZ6s'
);

// Mapeamento de URLs externas para locais
const urlMappings = {
  'https://via.placeholder.com/970x90/4F46E5/FFFFFF?text=Header+Banner': '/images/placeholder-banner-970x90.svg',
  'https://via.placeholder.com/728x90/059669/FFFFFF?text=Footer+Banner': '/images/placeholder-banner-728x90.svg',
  'https://via.placeholder.com/320x50/DC2626/FFFFFF?text=Mobile+Banner': '/images/placeholder-banner-320x50.svg',
  'https://via.placeholder.com/336x280/7C3AED/FFFFFF?text=Content+Banner': '/images/placeholder-banner-336x280.svg',
  'https://via.placeholder.com/300x600/EA580C/FFFFFF?text=Sidebar+Banner': '/images/placeholder-banner-300x600.svg',
  'https://via.placeholder.com/400x300/0891B2/FFFFFF?text=Banner+Principal': '/images/placeholder-banner-400x300.svg'
};

async function updatePlaceholderUrls() {
  try {
    console.log('🔄 Atualizando URLs de placeholders no banco de dados...');
    console.log('🔧 Usando service_role_key para atualizações...');
    
    // Buscar todos os banners com URLs do via.placeholder.com
    const { data: banners, error } = await supabase
      .from('banners')
      .select('id, nome, imagem')
      .like('imagem', '%via.placeholder.com%');
    
    if (error) {
      console.error('❌ Erro ao buscar banners:', error);
      return;
    }
    
    if (!banners || banners.length === 0) {
      console.log('✅ Nenhum banner encontrado com URLs do via.placeholder.com');
      return;
    }
    
    console.log(`📋 Encontrados ${banners.length} banners para atualizar:`);
    
    let updatedCount = 0;
    
    for (const banner of banners) {
      const newUrl = urlMappings[banner.imagem];
      
      if (newUrl) {
        console.log(`🔄 Atualizando banner "${banner.nome}" (ID: ${banner.id})`);
        console.log(`   De: ${banner.imagem}`);
        console.log(`   Para: ${newUrl}`);
        
        const { error: updateError } = await supabase
          .from('banners')
          .update({ imagem: newUrl })
          .eq('id', banner.id);
        
        if (updateError) {
          console.error(`❌ Erro ao atualizar banner ${banner.id}:`, updateError);
        } else {
          console.log(`✅ Banner "${banner.nome}" atualizado com sucesso!`);
          updatedCount++;
        }
      } else {
        console.log(`⚠️ Nenhum mapeamento encontrado para: ${banner.imagem}`);
      }
      
      console.log('');
    }
    
    console.log(`🎉 Processo concluído! ${updatedCount} banners atualizados.`);
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

updatePlaceholderUrls();
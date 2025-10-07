require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function fixPlaceholderUrls() {
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Variáveis de ambiente do Supabase não encontradas');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    console.log('🔍 Verificando banners com URLs do via.placeholder.com...');

    // Buscar banners que usam via.placeholder.com
    const { data: bannersToUpdate, error: fetchError } = await supabase
      .from('banners')
      .select('*')
      .like('imagem', '%via.placeholder.com%');

    if (fetchError) {
      console.error('❌ Erro ao buscar banners:', fetchError);
      return;
    }

    if (!bannersToUpdate || bannersToUpdate.length === 0) {
      console.log('✅ Nenhum banner encontrado com URLs do via.placeholder.com');
      return;
    }

    console.log(`📋 Encontrados ${bannersToUpdate.length} banners para atualizar:`);
    bannersToUpdate.forEach(banner => {
      console.log(`  - ${banner.nome}: ${banner.imagem}`);
    });

    // Mapear URLs antigas para novas
    const urlMapping = {
      'https://via.placeholder.com/728x90': '/images/placeholder-banner-728x90.svg',
      'https://via.placeholder.com/600x300': '/images/placeholder-banner-600x300.svg',
      'https://via.placeholder.com/800x200': '/images/placeholder-banner-800x200.svg',
      'https://via.placeholder.com/1270x250': '/images/placeholder-banner-1270x250.svg',
      // Variações com parâmetros
      'https://via.placeholder.com/728x90/FF6B35/FFFFFF?text=Header+Banner': '/images/placeholder-banner-728x90.svg',
      'https://via.placeholder.com/600x300/4ECDC4/FFFFFF?text=Banner+Principal': '/images/placeholder-banner-600x300.svg',
      'https://via.placeholder.com/800x200/45B7D1/FFFFFF?text=Empresas+Destaque': '/images/placeholder-banner-800x200.svg',
      'https://via.placeholder.com/1270x250/ff6b6b/ffffff?text=Banner+Teste': '/images/placeholder-banner-1270x250.svg'
    };

    // Atualizar cada banner
    for (const banner of bannersToUpdate) {
      let newImageUrl = urlMapping[banner.imagem];
      
      // Se não encontrou mapeamento exato, tentar por tamanho
      if (!newImageUrl) {
        if (banner.imagem.includes('728x90')) {
          newImageUrl = '/images/placeholder-banner-728x90.svg';
        } else if (banner.imagem.includes('600x300')) {
          newImageUrl = '/images/placeholder-banner-600x300.svg';
        } else if (banner.imagem.includes('800x200')) {
          newImageUrl = '/images/placeholder-banner-800x200.svg';
        } else if (banner.imagem.includes('1270x250')) {
          newImageUrl = '/images/placeholder-banner-1270x250.svg';
        } else {
          // Fallback para tamanho padrão
          newImageUrl = '/images/placeholder-banner-1270x250.svg';
        }
      }

      console.log(`🔄 Atualizando banner "${banner.nome}"`);
      console.log(`   De: ${banner.imagem}`);
      console.log(`   Para: ${newImageUrl}`);

      const { error: updateError } = await supabase
        .from('banners')
        .update({ imagem: newImageUrl })
        .eq('id', banner.id);

      if (updateError) {
        console.error(`❌ Erro ao atualizar banner ${banner.nome}:`, updateError);
      } else {
        console.log(`✅ Banner "${banner.nome}" atualizado com sucesso`);
      }
    }

    console.log('\n🎉 Processo de atualização concluído!');

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

fixPlaceholderUrls().catch(console.error);
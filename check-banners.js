const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkBanners() {
  try {
    console.log('Consultando banners...');
    
    const { data: banners, error } = await supabase
      .from('banners')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao consultar banners:', error);
      return;
    }

    console.log(`\nEncontrados ${banners.length} banners:`);
    banners.forEach((banner, index) => {
      console.log(`\n${index + 1}. Banner: ${banner.nome}`);
      console.log(`   ID: ${banner.id}`);
      console.log(`   Posição: ${banner.posicao}`);
      console.log(`   Ativo: ${banner.ativo}`);
      console.log(`   Imagem: ${banner.imagem}`);
      if (banner.link) {
        console.log(`   Link: ${banner.link}`);
      }
    });

    // Procurar especificamente por banners com "petShop" no nome
    const petShopBanners = banners.filter(banner => 
      banner.nome.toLowerCase().includes('petshop') || 
      banner.nome.toLowerCase().includes('pet shop')
    );

    if (petShopBanners.length > 0) {
      console.log('\n=== BANNERS PETSHOP ENCONTRADOS ===');
      petShopBanners.forEach(banner => {
        console.log(`Nome: ${banner.nome}, ID: ${banner.id}, Ativo: ${banner.ativo}`);
      });
    } else {
      console.log('\n❌ Nenhum banner com "petShop" encontrado');
    }

  } catch (error) {
    console.error('Erro:', error);
  }
}

checkBanners();
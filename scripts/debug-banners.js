require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

console.log('✅ dotenv carregado');
console.log('✅ supabase-js importado');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('URL:', supabaseUrl ? 'Definida' : 'Não definida');
console.log('Key:', supabaseKey ? 'Definida' : 'Não definida');

const supabase = createClient(supabaseUrl, supabaseKey);
console.log('✅ Cliente Supabase criado');

async function debugBanners() {
  console.log('📊 Buscando banners...');
  
  try {
    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .eq('ativo', true)
      .limit(10);

    if (error) {
      console.error('❌ Erro ao buscar banners:', error);
      return;
    }

    console.log(`✅ Dados recebidos: ${data.length} banners`);
    
    if (data.length > 0) {
      data.forEach(banner => {
        console.log(`- ${banner.nome} (${banner.posicao})`);
      });
    } else {
      console.log('⚠️ Nenhum banner encontrado');
    }

  } catch (error) {
    console.error('❌ Erro durante busca:', error.message);
  }
}

debugBanners();
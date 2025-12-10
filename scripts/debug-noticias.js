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

async function debugNoticias() {
  console.log('📊 Buscando notícias...');
  
  try {
    const { data, error } = await supabase
      .from('noticias')
      .select('*')
      .limit(10);

    if (error) {
      console.error('❌ Erro ao buscar notícias:', error);
      return;
    }

    console.log(`✅ Dados recebidos: ${data.length} notícias`);
    
    if (data.length > 0) {
      data.forEach(noticia => {
        console.log(`- ${noticia.titulo} (${noticia.categoria})`);
      });
    } else {
      console.log('⚠️ Nenhuma notícia encontrada');
    }

  } catch (error) {
    console.error('❌ Erro durante busca:', error.message);
  }
}

debugNoticias();
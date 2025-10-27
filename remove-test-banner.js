const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function removeTestBanner() {
  try {
    const bannerId = 'f4f29b9e-e058-4269-b58e-ca55c2bd82f2';
    
    console.log(`🗑️ Removendo banner de teste com ID: ${bannerId}...\n`);

    // Primeiro, vamos verificar o banner antes de remover
    const { data: banner, error: fetchError } = await supabase
      .from('banners')
      .select('*')
      .eq('id', bannerId)
      .single();

    if (fetchError) {
      console.error('❌ Erro ao buscar banner:', fetchError);
      return;
    }

    if (!banner) {
      console.log('ℹ️ Banner não encontrado.');
      return;
    }

    console.log('📋 Detalhes do banner a ser removido:');
    console.log(`ID: ${banner.id}`);
    console.log(`Título: ${banner.titulo || 'N/A'}`);
    console.log(`Descrição: ${banner.descricao || 'N/A'}`);
    console.log(`Imagem: ${banner.imagem || 'N/A'}`);
    console.log(`Posição: ${banner.posicao || 'N/A'}`);
    console.log(`Ativo: ${banner.ativo ? 'Sim' : 'Não'}`);
    console.log('');

    // Remover o banner
    const { error: deleteError } = await supabase
      .from('banners')
      .delete()
      .eq('id', bannerId);

    if (deleteError) {
      console.error('❌ Erro ao remover banner:', deleteError);
      return;
    }

    console.log('✅ Banner de teste removido com sucesso!');
    
    // Verificar se foi realmente removido
    const { data: checkBanner, error: checkError } = await supabase
      .from('banners')
      .select('*')
      .eq('id', bannerId)
      .single();

    if (checkError && checkError.code === 'PGRST116') {
      console.log('✅ Confirmado: Banner não existe mais no banco de dados.');
    } else if (checkBanner) {
      console.log('⚠️ Atenção: Banner ainda existe no banco de dados.');
    }

  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

removeTestBanner();
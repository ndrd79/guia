const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkFeaturedEmpresas() {
  console.log('🔍 Verificando empresas em destaque...\n');

  try {
    // Buscar empresas em destaque
    const { data: empresasDestaque, error } = await supabase
      .from('empresas')
      .select('id, name, featured, ativo, category')
      .eq('featured', true);

    if (error) {
      console.error('❌ Erro ao buscar empresas:', error.message);
      return;
    }

    console.log(`💎 Empresas marcadas como destaque: ${empresasDestaque?.length || 0}`);

    if (empresasDestaque && empresasDestaque.length > 0) {
      console.log('\n📋 Lista de empresas em destaque:');
      empresasDestaque.forEach((empresa, index) => {
        console.log(`   ${index + 1}. ${empresa.name}`);
        console.log(`      - Ativo: ${empresa.ativo ? 'Sim' : 'Não'}`);
        console.log(`      - Categoria: ${empresa.category || 'N/A'}`);
        console.log('');
      });

      // Verificar quantas estão ativas
      const ativas = empresasDestaque.filter(e => e.ativo);
      console.log(`✅ Empresas ativas em destaque: ${ativas.length}`);
      
      if (ativas.length === 0) {
        console.log('\n⚠️  PROBLEMA: Nenhuma empresa em destaque está ativa!');
        console.log('   Para resolver:');
        console.log('   1. Acesse http://localhost:3000/admin/empresas');
        console.log('   2. Ative algumas empresas em destaque');
      }
    } else {
      console.log('\n⚠️  PROBLEMA: Nenhuma empresa está marcada como destaque!');
      console.log('   Para resolver:');
      console.log('   1. Acesse http://localhost:3000/admin/empresas');
      console.log('   2. Edite algumas empresas e marque "Em Destaque"');
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

checkFeaturedEmpresas();
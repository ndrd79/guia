const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkFeaturedEmpresas() {
  console.log('🔍 Verificando empresas em destaque...\n');

  try {
    // 1. Verificar se o campo "featured" existe na tabela
    console.log('📋 Verificando estrutura da tabela empresas...');
    const { data: tableInfo, error: tableError } = await supabase
      .from('empresas')
      .select('*')
      .limit(1);

    if (tableError) {
      console.error('❌ Erro ao acessar tabela empresas:', tableError.message);
      return;
    }

    if (tableInfo && tableInfo.length > 0) {
      const columns = Object.keys(tableInfo[0]);
      console.log('✅ Colunas encontradas na tabela empresas:');
      columns.forEach(col => console.log(`   - ${col}`));
      
      if (!columns.includes('featured')) {
        console.log('\n⚠️  ATENÇÃO: Campo "featured" não encontrado na tabela empresas!');
        console.log('   Isso pode explicar por que as empresas em destaque não aparecem.');
        return;
      } else {
        console.log('\n✅ Campo "featured" encontrado na tabela empresas.');
      }
    }

    // 2. Buscar todas as empresas
    console.log('\n📊 Buscando todas as empresas...');
    const { data: todasEmpresas, error: allError } = await supabase
      .from('empresas')
      .select('id, name, featured, ativo');

    if (allError) {
      console.error('❌ Erro ao buscar todas as empresas:', allError.message);
      return;
    }

    console.log(`📈 Total de empresas no banco: ${todasEmpresas?.length || 0}`);

    // 3. Buscar empresas em destaque
    console.log('\n⭐ Buscando empresas em destaque...');
    const { data: empresasDestaque, error: featuredError } = await supabase
      .from('empresas')
      .select('id, name, featured, ativo, category, description, location')
      .eq('featured', true);

    if (featuredError) {
      console.error('❌ Erro ao buscar empresas em destaque:', featuredError.message);
      return;
    }

    console.log(`💎 Empresas marcadas como destaque: ${empresasDestaque?.length || 0}`);

    if (empresasDestaque && empresasDestaque.length > 0) {
      console.log('\n📋 Lista de empresas em destaque:');
      empresasDestaque.forEach((empresa, index) => {
        console.log(`   ${index + 1}. ${empresa.name}`);
        console.log(`      - ID: ${empresa.id}`);
        console.log(`      - Ativo: ${empresa.ativo ? 'Sim' : 'Não'}`);
        console.log(`      - Categoria: ${empresa.category || 'N/A'}`);
        console.log(`      - Localização: ${empresa.location || 'N/A'}`);
        console.log('');
      });
    } else {
      console.log('\n⚠️  Nenhuma empresa está marcada como destaque (featured = true)');
    }

    // 4. Buscar empresas ativas em destaque
    console.log('\n🔍 Buscando empresas ativas em destaque...');
    const { data: empresasAtivasDestaque, error: activeError } = await supabase
      .from('empresas')
      .select('id, name, featured, ativo, category')
      .eq('featured', true)
      .eq('ativo', true);

    if (activeError) {
      console.error('❌ Erro ao buscar empresas ativas em destaque:', activeError.message);
      return;
    }

    console.log(`✅ Empresas ativas em destaque: ${empresasAtivasDestaque?.length || 0}`);

    // 5. Estatísticas gerais
    console.log('\n📊 Estatísticas gerais:');
    const empresasAtivas = todasEmpresas?.filter(e => e.ativo) || [];
    const empresasInativas = todasEmpresas?.filter(e => !e.ativo) || [];
    const empresasComDestaque = todasEmpresas?.filter(e => e.featured) || [];
    
    console.log(`   📈 Total de empresas: ${todasEmpresas?.length || 0}`);
    console.log(`   ✅ Empresas ativas: ${empresasAtivas.length}`);
    console.log(`   ❌ Empresas inativas: ${empresasInativas.length}`);
    console.log(`   ⭐ Empresas em destaque: ${empresasComDestaque.length}`);
    console.log(`   💎 Empresas ativas em destaque: ${empresasAtivasDestaque?.length || 0}`);

    // 6. Recomendações
    console.log('\n💡 Recomendações:');
    if (empresasAtivasDestaque?.length === 0) {
      console.log('   ⚠️  Para ver empresas em destaque na página inicial:');
      console.log('   1. Acesse o painel admin em http://localhost:3000/admin/empresas');
      console.log('   2. Edite algumas empresas e marque o campo "Em Destaque"');
      console.log('   3. Certifique-se de que as empresas estejam ativas');
    } else {
      console.log('   ✅ Empresas em destaque configuradas corretamente!');
      console.log('   📱 Verifique a página inicial em http://localhost:3000');
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

checkFeaturedEmpresas();
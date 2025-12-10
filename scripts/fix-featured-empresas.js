const { createClient } = require('@supabase/supabase-js');
const { execSync } = require('child_process');
require('dotenv').config({ path: '.env.local' });

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Credenciais do Supabase não encontradas no .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixFeaturedEmpresas() {
  console.log('🔍 Verificando empresas no banco de dados...\n');

  try {
    // 1. Verificar se existem empresas
    const { data: empresas, error: empresasError } = await supabase
      .from('empresas')
      .select('*');

    if (empresasError) {
      console.error('❌ Erro ao buscar empresas:', empresasError);
      return;
    }

    console.log(`📊 Total de empresas encontradas: ${empresas.length}`);

    // 2. Se não existirem empresas, executar script de exemplo
    if (empresas.length === 0) {
      console.log('📝 Nenhuma empresa encontrada. Executando script de empresas de exemplo...');
      try {
        execSync('node add-sample-empresas.js', { stdio: 'inherit' });
        console.log('✅ Empresas de exemplo adicionadas com sucesso!');
        
        // Buscar empresas novamente
        const { data: newEmpresas, error: newError } = await supabase
          .from('empresas')
          .select('*');
        
        if (newError) {
          console.error('❌ Erro ao buscar empresas após adicionar exemplos:', newError);
          return;
        }
        
        empresas.splice(0, empresas.length, ...newEmpresas);
        console.log(`📊 Total de empresas após adicionar exemplos: ${empresas.length}`);
      } catch (error) {
        console.error('❌ Erro ao executar script de empresas de exemplo:', error.message);
        return;
      }
    }

    // 3. Verificar quantas empresas estão marcadas como featured
    const featuredEmpresas = empresas.filter(empresa => empresa.featured === true);
    console.log(`⭐ Empresas marcadas como destaque: ${featuredEmpresas.length}`);

    // 4. Se não há empresas em destaque, marcar algumas
    if (featuredEmpresas.length === 0) {
      console.log('🔧 Marcando empresas como destaque...');
      
      // Pegar as primeiras 6 empresas ativas para marcar como destaque
      const empresasAtivas = empresas.filter(empresa => empresa.ativo === true);
      const empresasParaDestacar = empresasAtivas.slice(0, 6);
      
      for (const empresa of empresasParaDestacar) {
        const { error: updateError } = await supabase
          .from('empresas')
          .update({ featured: true })
          .eq('id', empresa.id);
        
        if (updateError) {
          console.error(`❌ Erro ao marcar empresa ${empresa.name} como destaque:`, updateError);
        } else {
          console.log(`✅ Empresa "${empresa.name}" marcada como destaque`);
        }
      }
    }

    // 5. Verificar consulta da página inicial
    console.log('\n🔍 Testando consulta da página inicial...');
    const { data: featuredQuery, error: queryError } = await supabase
      .from('empresas')
      .select('id, name, description, category, location, phone, email, website, image, featured, ativo, created_at')
      .eq('featured', true)
      .eq('ativo', true)
      .order('created_at', { ascending: false })
      .limit(8);

    if (queryError) {
      console.error('❌ Erro na consulta da página inicial:', queryError);
      return;
    }

    console.log(`📋 Empresas retornadas pela consulta da página inicial: ${featuredQuery.length}`);
    
    if (featuredQuery.length > 0) {
      console.log('\n✅ Empresas em destaque encontradas:');
      featuredQuery.forEach((empresa, index) => {
        console.log(`${index + 1}. ${empresa.name} (${empresa.category}) - ${empresa.location}`);
      });
    } else {
      console.log('⚠️ Nenhuma empresa em destaque ativa encontrada!');
    }

    // 6. Resumo final
    console.log('\n📊 RESUMO FINAL:');
    console.log(`- Total de empresas: ${empresas.length}`);
    console.log(`- Empresas em destaque: ${featuredQuery.length}`);
    console.log(`- Status: ${featuredQuery.length > 0 ? '✅ OK' : '❌ PROBLEMA'}`);

    if (featuredQuery.length > 0) {
      console.log('\n🎉 Sucesso! As empresas em destaque devem aparecer na página inicial.');
      console.log('🌐 Acesse http://localhost:3000 para verificar.');
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar o script
fixFeaturedEmpresas();
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Verificando empresas na categoria Saúde...');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Configuração do Supabase incompleta');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verificarCategoriaSaude() {
  try {
    console.log('📊 Buscando empresas da categoria Saúde...');
    
    const { data: empresas, error } = await supabase
      .from('empresas')
      .select('id, nome, categoria, descricao, endereco')
      .eq('categoria', 'Saúde')
      .order('nome');

    if (error) {
      console.error('❌ Erro ao buscar empresas:', error);
      return;
    }

    console.log(`\n📈 Encontradas ${empresas.length} empresas na categoria Saúde:\n`);
    
    empresas.forEach((empresa, index) => {
      console.log(`${index + 1}. ${empresa.nome}`);
      console.log(`   Descrição: ${empresa.descricao || 'N/A'}`);
      console.log(`   Endereço: ${empresa.endereco || 'N/A'}`);
      console.log('');
    });

    // Verificar se há empresas que não deveriam estar na categoria Saúde
    console.log('🔍 Analisando se as empresas estão na categoria correta...\n');
    
    const problemas = [];
    
    empresas.forEach(empresa => {
      const nomeCompleto = `${empresa.nome} ${empresa.descricao || ''}`.toLowerCase();
      
      // Palavras que indicam que NÃO deveria estar em Saúde
      const palavrasProblematicas = [
        'padaria', 'panificadora', 'confeitaria', 'pão', 'doce',
        'academia', 'fitness', 'ginásio', 'musculação', 'crossfit',
        'tecnologia', 'informática', 'software', 'computador', 'sistema',
        'restaurante', 'lanchonete', 'pizzaria', 'hamburgueria',
        'loja', 'roupa', 'vestuário', 'calçado', 'sapato',
        'oficina', 'mecânica', 'auto', 'carro', 'veículo'
      ];
      
      const palavraEncontrada = palavrasProblematicas.find(palavra => 
        nomeCompleto.includes(palavra)
      );
      
      if (palavraEncontrada) {
        problemas.push({
          empresa,
          palavraProblematica: palavraEncontrada
        });
      }
    });

    if (problemas.length > 0) {
      console.log(`⚠️  PROBLEMAS ENCONTRADOS (${problemas.length} empresas):\n`);
      
      problemas.forEach((problema, index) => {
        console.log(`${index + 1}. ❌ ${problema.empresa.nome}`);
        console.log(`   Palavra problemática: "${problema.palavraProblematica}"`);
        console.log(`   Descrição: ${problema.empresa.descricao || 'N/A'}`);
        console.log(`   → Esta empresa provavelmente NÃO deveria estar na categoria Saúde\n`);
      });
    } else {
      console.log('✅ Todas as empresas parecem estar corretamente categorizadas em Saúde');
    }

  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

verificarCategoriaSaude();
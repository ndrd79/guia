require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🚀 Iniciando análise detalhada de empresas por categoria...');
console.log('🔧 Verificando configuração...');
console.log('URL:', supabaseUrl ? '✅ Definida' : '❌ Não definida');
console.log('Key:', supabaseKey ? '✅ Definida' : '❌ Não definida');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Configuração do Supabase incompleta');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Mapeamento de palavras-chave para categorias corretas
const categorizacaoCorreta = {
  // Saúde
  'farmacia': 'Saúde',
  'farmácia': 'Saúde',
  'clinica': 'Saúde',
  'clínica': 'Saúde',
  'hospital': 'Saúde',
  'laboratorio': 'Saúde',
  'laboratório': 'Saúde',
  'medico': 'Saúde',
  'médico': 'Saúde',
  'dentista': 'Saúde',
  'odontologia': 'Saúde',
  'fisioterapia': 'Saúde',
  'psicologia': 'Saúde',
  'veterinaria': 'Saúde',
  'veterinária': 'Saúde',
  
  // Alimentação
  'padaria': 'Alimentação',
  'panificadora': 'Alimentação',
  'confeitaria': 'Alimentação',
  'lanchonete': 'Alimentação',
  'pizzaria': 'Alimentação',
  'hamburgueria': 'Alimentação',
  'sorveteria': 'Alimentação',
  'açougue': 'Alimentação',
  'acougue': 'Alimentação',
  'mercado': 'Alimentação',
  'supermercado': 'Alimentação',
  'mercearia': 'Alimentação',
  'distribuidora': 'Alimentação',
  
  // Restaurante
  'restaurante': 'Restaurante',
  'churrascaria': 'Restaurante',
  'buffet': 'Restaurante',
  'bar': 'Restaurante',
  'pub': 'Restaurante',
  
  // Esporte/Fitness
  'academia': 'Esporte',
  'ginasio': 'Esporte',
  'ginásio': 'Esporte',
  'fitness': 'Esporte',
  'crossfit': 'Esporte',
  'pilates': 'Esporte',
  'yoga': 'Esporte',
  'natacao': 'Esporte',
  'natação': 'Esporte',
  'futebol': 'Esporte',
  'volei': 'Esporte',
  'vôlei': 'Esporte',
  'basquete': 'Esporte',
  'tenis': 'Esporte',
  'tênis': 'Esporte',
  
  // Tecnologia
  'informatica': 'Tecnologia',
  'informática': 'Tecnologia',
  'software': 'Tecnologia',
  'hardware': 'Tecnologia',
  'computador': 'Tecnologia',
  'notebook': 'Tecnologia',
  'celular': 'Tecnologia',
  'smartphone': 'Tecnologia',
  'eletronica': 'Tecnologia',
  'eletrônica': 'Tecnologia',
  'digital': 'Tecnologia',
  'internet': 'Tecnologia',
  'web': 'Tecnologia',
  'app': 'Tecnologia',
  'sistema': 'Tecnologia',
  
  // Beleza
  'salao': 'Beleza',
  'salão': 'Beleza',
  'barbearia': 'Beleza',
  'estetica': 'Beleza',
  'estética': 'Beleza',
  'manicure': 'Beleza',
  'pedicure': 'Beleza',
  'cabeleireiro': 'Beleza',
  'spa': 'Beleza',
  'massagem': 'Beleza',
  
  // Automotivo
  'oficina': 'Automotivo',
  'mecanica': 'Automotivo',
  'mecânica': 'Automotivo',
  'auto': 'Automotivo',
  'carro': 'Automotivo',
  'veiculo': 'Automotivo',
  'veículo': 'Automotivo',
  'pneu': 'Automotivo',
  'combustivel': 'Automotivo',
  'combustível': 'Automotivo',
  'posto': 'Automotivo',
  'lavagem': 'Automotivo',
  
  // Educação
  'escola': 'Educação',
  'colegio': 'Educação',
  'colégio': 'Educação',
  'universidade': 'Educação',
  'faculdade': 'Educação',
  'curso': 'Educação',
  'ensino': 'Educação',
  'educacao': 'Educação',
  'educação': 'Educação',
  'professor': 'Educação',
  'aula': 'Educação',
  
  // Moda
  'roupa': 'Moda',
  'vestuario': 'Moda',
  'vestuário': 'Moda',
  'boutique': 'Moda',
  'loja': 'Moda',
  'calcado': 'Moda',
  'calçado': 'Moda',
  'sapato': 'Moda',
  'tenis': 'Moda',
  'tênis': 'Moda',
  'bolsa': 'Moda',
  'acessorio': 'Moda',
  'acessório': 'Moda',
  
  // Pet Shop
  'pet': 'Pet Shop',
  'animal': 'Pet Shop',
  'cachorro': 'Pet Shop',
  'gato': 'Pet Shop',
  'ração': 'Pet Shop',
  'racao': 'Pet Shop',
  'veterinario': 'Pet Shop',
  'veterinário': 'Pet Shop',
  
  // Decoração
  'decoracao': 'Decoração',
  'decoração': 'Decoração',
  'movel': 'Decoração',
  'móvel': 'Decoração',
  'casa': 'Decoração',
  'design': 'Decoração',
  'interiores': 'Decoração',
  'arquitetura': 'Decoração'
};

async function analisarEmpresasPorCategoria() {
  try {
    console.log('\n📊 Buscando todas as empresas...');
    
    const { data: empresas, error } = await supabase
      .from('empresas')
      .select('id, nome, categoria, descricao, endereco')
      .order('categoria', { ascending: true });

    if (error) {
      console.error('❌ Erro ao buscar empresas:', error);
      return;
    }

    console.log(`📈 Total de empresas encontradas: ${empresas.length}`);
    
    // Agrupar por categoria
    const empresasPorCategoria = {};
    empresas.forEach(empresa => {
      if (!empresasPorCategoria[empresa.categoria]) {
        empresasPorCategoria[empresa.categoria] = [];
      }
      empresasPorCategoria[empresa.categoria].push(empresa);
    });

    console.log('\n🔍 ANÁLISE DETALHADA POR CATEGORIA:\n');

    // Analisar cada categoria
    const problemas = [];
    
    for (const [categoria, empresasCategoria] of Object.entries(empresasPorCategoria)) {
      console.log(`\n📂 CATEGORIA: ${categoria.toUpperCase()}`);
      console.log(`   Total: ${empresasCategoria.length} empresas`);
      
      empresasCategoria.forEach(empresa => {
        const nomeCompleto = `${empresa.nome} ${empresa.descricao || ''} ${empresa.endereco || ''}`.toLowerCase();
        
        // Verificar se a empresa está na categoria correta
        let categoriaCorreta = null;
        let palavraEncontrada = null;
        
        for (const [palavra, catCorreta] of Object.entries(categorizacaoCorreta)) {
          if (nomeCompleto.includes(palavra.toLowerCase())) {
            categoriaCorreta = catCorreta;
            palavraEncontrada = palavra;
            break;
          }
        }
        
        if (categoriaCorreta && categoriaCorreta !== categoria) {
          console.log(`   ⚠️  ${empresa.nome}`);
          console.log(`       Categoria atual: ${categoria}`);
          console.log(`       Categoria sugerida: ${categoriaCorreta} (palavra: "${palavraEncontrada}")`);
          console.log(`       Descrição: ${empresa.descricao || 'N/A'}`);
          
          problemas.push({
            id: empresa.id,
            nome: empresa.nome,
            categoriaAtual: categoria,
            categoriaSugerida: categoriaCorreta,
            palavraChave: palavraEncontrada,
            descricao: empresa.descricao
          });
        } else {
          console.log(`   ✅ ${empresa.nome}`);
        }
      });
    }

    console.log('\n\n📋 RESUMO DOS PROBLEMAS ENCONTRADOS:\n');
    
    if (problemas.length === 0) {
      console.log('✅ Nenhum problema de categorização encontrado!');
    } else {
      console.log(`❌ ${problemas.length} empresas com categorização incorreta:`);
      
      const problemasPorCategoria = {};
      problemas.forEach(problema => {
        const key = `${problema.categoriaAtual} → ${problema.categoriaSugerida}`;
        if (!problemasPorCategoria[key]) {
          problemasPorCategoria[key] = [];
        }
        problemasPorCategoria[key].push(problema);
      });

      for (const [mudanca, empresasProblema] of Object.entries(problemasPorCategoria)) {
        console.log(`\n🔄 ${mudanca}:`);
        empresasProblema.forEach(problema => {
          console.log(`   • ${problema.nome} (palavra-chave: "${problema.palavraChave}")`);
        });
      }

      // Gerar script de correção
      console.log('\n\n💡 SCRIPT DE CORREÇÃO SQL:\n');
      console.log('-- Script para corrigir categorias incorretas');
      console.log('-- Execute este script no Supabase para corrigir os problemas\n');
      
      problemas.forEach(problema => {
        console.log(`UPDATE empresas SET categoria = '${problema.categoriaSugerida}' WHERE id = ${problema.id}; -- ${problema.nome}`);
      });
    }

    console.log('\n✅ Análise concluída!');
    return problemas;

  } catch (error) {
    console.error('❌ Erro durante a análise:', error);
  }
}

async function main() {
  await analisarEmpresasPorCategoria();
}

main();
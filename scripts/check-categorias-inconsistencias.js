const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

console.log('🚀 Iniciando verificação de categorias...');

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔧 Verificando configuração...');
console.log('URL:', supabaseUrl ? '✅ Definida' : '❌ Não definida');
console.log('Key:', supabaseKey ? '✅ Definida' : '❌ Não definida');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Categorias definidas no código (de [categoria].tsx)
const categoriasDefinidas = [
  'Restaurante',
  'Automotivo', 
  'Saúde',
  'Alimentação',
  'Beleza',
  'Tecnologia',
  'Comércio',
  'Serviços',
  'Educação',
  'Imóveis',
  'Decoração',
  'Esporte',
  'Moda',
  'Pet Shop'
];

async function verificarCategorias() {
  console.log('\n🔍 Verificando inconsistências de categorias...\n');

  try {
    // 1. Buscar todas as categorias únicas no banco de dados
    console.log('📊 Buscando categorias no banco de dados...');
    const { data: empresas, error } = await supabase
      .from('empresas')
      .select('category')
      .not('category', 'is', null);

    if (error) {
      console.error('❌ Erro ao buscar empresas:', error);
      return;
    }

    console.log(`📈 Total de empresas encontradas: ${empresas.length}`);

    // Extrair categorias únicas
    const categoriasNoBanco = [...new Set(empresas.map(e => e.category))].sort();
    
    console.log('\n📋 Categorias definidas no código:');
    categoriasDefinidas.forEach(cat => console.log(`  - ${cat}`));
    
    console.log('\n📋 Categorias encontradas no banco:');
    categoriasNoBanco.forEach(cat => console.log(`  - ${cat}`));

    // 2. Verificar categorias no banco que não estão no código
    const categoriasNaoDefinidas = categoriasNoBanco.filter(cat => 
      !categoriasDefinidas.includes(cat)
    );

    // 3. Verificar categorias do código que não estão no banco
    const categoriasNaoUsadas = categoriasDefinidas.filter(cat => 
      !categoriasNoBanco.includes(cat)
    );

    console.log('\n⚠️  INCONSISTÊNCIAS ENCONTRADAS:');
    
    if (categoriasNaoDefinidas.length > 0) {
      console.log('\n🔴 Categorias no banco que NÃO estão definidas no código:');
      categoriasNaoDefinidas.forEach(cat => console.log(`  - "${cat}"`));
    } else {
      console.log('\n✅ Todas as categorias do banco estão definidas no código');
    }

    if (categoriasNaoUsadas.length > 0) {
      console.log('\n🟡 Categorias definidas no código que NÃO estão sendo usadas:');
      categoriasNaoUsadas.forEach(cat => console.log(`  - "${cat}"`));
    } else {
      console.log('\n✅ Todas as categorias do código estão sendo usadas');
    }

    // 4. Verificar possíveis problemas de case sensitivity ou caracteres especiais
    console.log('\n🔍 Verificando possíveis problemas de formatação...');
    
    let problemasEncontrados = false;
    for (const catBanco of categoriasNoBanco) {
      for (const catCodigo of categoriasDefinidas) {
        if (catBanco.toLowerCase() === catCodigo.toLowerCase() && catBanco !== catCodigo) {
          console.log(`⚠️  Possível problema de case: "${catBanco}" vs "${catCodigo}"`);
          problemasEncontrados = true;
        }
      }
    }
    
    if (!problemasEncontrados) {
      console.log('✅ Nenhum problema de formatação encontrado');
    }

    // 5. Contar empresas por categoria
    console.log('\n📈 Contagem de empresas por categoria:');
    for (const categoria of categoriasNoBanco) {
      const count = empresas.filter(e => e.category === categoria).length;
      const status = categoriasDefinidas.includes(categoria) ? '✅' : '❌';
      console.log(`  ${status} ${categoria}: ${count} empresas`);
    }

    // 6. Verificar problemas específicos de encoding
    console.log('\n🔤 Verificando problemas de encoding...');
    let problemasEncoding = false;
    categoriasNoBanco.forEach(cat => {
      const encoded = encodeURIComponent(cat);
      const decoded = decodeURIComponent(encoded);
      if (cat !== decoded) {
        console.log(`⚠️  Problema de encoding: "${cat}" -> "${encoded}" -> "${decoded}"`);
        problemasEncoding = true;
      }
    });
    
    if (!problemasEncoding) {
      console.log('✅ Nenhum problema de encoding encontrado');
    }

    return {
      categoriasNaoDefinidas,
      categoriasNaoUsadas,
      categoriasNoBanco,
      empresas
    };

  } catch (error) {
    console.error('❌ Erro geral:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Executar verificação
async function main() {
  try {
    const resultado = await verificarCategorias();
    
    if (resultado && resultado.categoriasNaoDefinidas.length > 0) {
      console.log('\n💡 SUGESTÕES DE CORREÇÃO:');
      console.log('\n1. Adicionar categorias faltantes ao código:');
      console.log('   Arquivo: pages/guia/categoria/[categoria].tsx');
      console.log('   Adicionar ao array "categorias":');
      resultado.categoriasNaoDefinidas.forEach(cat => {
        console.log(`   '${cat}',`);
      });
    }
    
    console.log('\n✅ Verificação concluída!');
  } catch (error) {
    console.error('❌ Erro na função main:', error);
  }
}

main();
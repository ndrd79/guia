const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.log('Erro: Variáveis de ambiente não encontradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Mapeamento de palavras-chave para categorias corretas
const categoriasCorretas = {
  'Saúde': ['farmácia', 'clínica', 'médica', 'ótica', 'odontológico', 'dentista', 'hospital', 'laboratório', 'fisioterapia'],
  'Alimentação': ['padaria', 'açougue', 'mercado', 'supermercado', 'mercearia', 'quitanda', 'hortifruti', 'doces', 'confeitaria'],
  'Restaurante': ['restaurante', 'pizzaria', 'lanchonete', 'bar', 'café', 'choperia', 'hamburgueria', 'sorveteria'],
  'Tecnologia': ['informática', 'computador', 'celular', 'eletrônicos', 'software', 'internet', 'digital', 'tech'],
  'Esporte': ['academia', 'fitness', 'ginástica', 'musculação', 'pilates', 'crossfit', 'esporte', 'futebol'],
  'Automotivo': ['oficina', 'mecânica', 'pneus', 'auto', 'carro', 'moto', 'peças', 'combustível', 'posto'],
  'Beleza': ['salão', 'cabeleireiro', 'estética', 'manicure', 'pedicure', 'barbeiro', 'spa', 'cosméticos'],
  'Educação': ['escola', 'colégio', 'curso', 'faculdade', 'universidade', 'ensino', 'educação', 'aula'],
  'Moda': ['roupas', 'vestuário', 'calçados', 'sapatos', 'boutique', 'moda', 'fashion', 'tênis'],
  'Pet Shop': ['pet', 'veterinária', 'animais', 'ração', 'cachorro', 'gato', 'petshop'],
  'Decoração': ['móveis', 'decoração', 'casa', 'design', 'interiores', 'móvel', 'decorar']
}

async function analisarTodasCategorias() {
  try {
    console.log('🔍 Analisando todas as empresas para identificar categorizações incorretas...\n')
    
    // Buscar todas as empresas
    const { data: empresas, error } = await supabase
      .from('empresas')
      .select('id, name, category, description, address')
      .eq('ativo', true)
      .order('category')
    
    if (error) {
      console.error('❌ Erro ao buscar empresas:', error)
      return
    }
    
    console.log(`📊 Total de empresas analisadas: ${empresas.length}\n`)
    
    const problemas = []
    const estatisticas = {}
    
    empresas.forEach(empresa => {
      // Contar empresas por categoria
      if (!estatisticas[empresa.category]) {
        estatisticas[empresa.category] = 0
      }
      estatisticas[empresa.category]++
      
      // Verificar se a empresa está na categoria correta
      const textoCompleto = `${empresa.name} ${empresa.description || ''} ${empresa.address || ''}`.toLowerCase()
      
      let categoriasSugeridas = []
      
      // Verificar em qual categoria a empresa deveria estar baseada nas palavras-chave
      Object.keys(categoriasCorretas).forEach(categoria => {
        const palavrasChave = categoriasCorretas[categoria]
        const encontrou = palavrasChave.some(palavra => textoCompleto.includes(palavra.toLowerCase()))
        
        if (encontrou) {
          categoriasSugeridas.push(categoria)
        }
      })
      
      // Se a categoria atual não está entre as sugeridas, há um problema
      if (categoriasSugeridas.length > 0 && !categoriasSugeridas.includes(empresa.category)) {
        problemas.push({
          id: empresa.id,
          nome: empresa.name,
          categoriaAtual: empresa.category,
          categoriasSugeridas: categoriasSugeridas,
          motivo: `Palavras-chave sugerem: ${categoriasSugeridas.join(', ')}`
        })
      }
    })
    
    // Mostrar estatísticas
    console.log('📈 ESTATÍSTICAS POR CATEGORIA:')
    console.log('=' .repeat(50))
    Object.keys(estatisticas).sort().forEach(categoria => {
      console.log(`${categoria}: ${estatisticas[categoria]} empresas`)
    })
    
    console.log('\n🚨 PROBLEMAS ENCONTRADOS:')
    console.log('=' .repeat(50))
    
    if (problemas.length === 0) {
      console.log('✅ Nenhum problema de categorização encontrado!')
    } else {
      console.log(`❌ Encontrados ${problemas.length} problemas de categorização:\n`)
      
      problemas.forEach((problema, index) => {
        console.log(`${index + 1}. ${problema.nome}`)
        console.log(`   Categoria atual: ${problema.categoriaAtual}`)
        console.log(`   Categoria sugerida: ${problema.categoriasSugeridas.join(', ')}`)
        console.log(`   Motivo: ${problema.motivo}`)
        console.log('')
      })
      
      // Gerar script SQL para correção
      console.log('\n📝 SCRIPT SQL PARA CORREÇÃO:')
      console.log('=' .repeat(50))
      console.log('-- Execute este script para corrigir as categorias:')
      
      problemas.forEach(problema => {
        // Usar a primeira categoria sugerida como correção
        const novaCategoria = problema.categoriasSugeridas[0]
        console.log(`UPDATE empresas SET category = '${novaCategoria}' WHERE id = ${problema.id}; -- ${problema.nome}`)
      })
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

analisarTodasCategorias()
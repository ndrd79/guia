const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

// Mapeamento correto de empresas para categorias
const categorizacaoCorreta = {
  // Alimentação
  'Padaria Central': 'Alimentação',
  'Restaurante Sabor Caseiro': 'Alimentação',
  'Pizzaria Bella Vista': 'Alimentação',
  'Lanchonete do João': 'Alimentação',
  'Açougue Premium': 'Alimentação',
  'Mercado São José': 'Alimentação',
  
  // Saúde
  'Farmácia Central': 'Saúde',
  'Clínica Médica Vida': 'Saúde',
  'Consultório Odontológico Dr. Sorriso': 'Saúde',
  'Ótica Visão Clara': 'Saúde',
  'Laboratório Exames Rápidos': 'Saúde',
  
  // Tecnologia
  'TechSolutions': 'Tecnologia',
  'Informática Digital': 'Tecnologia',
  'Assistência Técnica Pro': 'Tecnologia',
  
  // Esporte
  'Academia Fitness Plus': 'Esporte',
  'Centro de Treinamento Atleta': 'Esporte',
  'Loja de Esportes Champion': 'Esporte',
  
  // Beleza
  'Salão Beleza Total': 'Beleza',
  'Barbearia Moderna': 'Beleza',
  'Estética Renovar': 'Beleza',
  
  // Moda
  'Boutique Elegance': 'Moda',
  'Loja de Roupas Fashion': 'Moda',
  'Calçados Premium': 'Moda',
  
  // Automotivo
  'Oficina Mecânica Expert': 'Automotivo',
  'Auto Peças Silva': 'Automotivo',
  'Lava Jato Brilho': 'Automotivo',
  
  // Educação
  'Escola Técnica Futuro': 'Educação',
  'Curso de Idiomas Global': 'Educação',
  'Centro de Capacitação Pro': 'Educação',
  
  // Pet Shop
  'Pet Shop Amigo Fiel': 'Pet Shop',
  'Veterinária Animal Care': 'Pet Shop',
  'Banho e Tosa Pet Clean': 'Pet Shop',
  
  // Decoração
  'Decorações Casa Bella': 'Decoração',
  'Móveis e Decoração Style': 'Decoração',
  'Artigos para Casa Decor': 'Decoração'
}

// Categorias válidas do sistema
const categoriasValidas = [
  'Alimentação',
  'Automotivo', 
  'Beleza',
  'Decoração',
  'Educação',
  'Esporte',
  'Moda',
  'Pet Shop',
  'Saúde',
  'Serviços',
  'Tecnologia',
  'Turismo',
  'Variedades',
  'Agronegócio'
]

async function verificarECorrigirCategorias() {
  try {
    console.log('🔍 Verificando categorização das empresas...\n')
    
    // Buscar todas as empresas
    const { data: empresas, error } = await supabase
      .from('empresas')
      .select('id, name, category')
      .eq('ativo', true)
    
    if (error) {
      console.error('❌ Erro ao buscar empresas:', error)
      return
    }
    
    console.log(`📊 Total de empresas encontradas: ${empresas.length}\n`)
    
    let empresasCorrigidas = 0
    let empresasComProblemas = []
    
    for (const empresa of empresas) {
      const { id, name, category } = empresa
      
      // Verificar se a categoria atual é válida
      if (!categoriasValidas.includes(category)) {
        console.log(`⚠️  Categoria inválida encontrada: "${category}" para empresa "${name}"`)
        empresasComProblemas.push({ nome: name, categoria: category, motivo: 'Categoria inválida' })
        continue
      }
      
      // Verificar se há mapeamento específico para correção
      if (categorizacaoCorreta[name] && categorizacaoCorreta[name] !== category) {
        console.log(`🔧 Corrigindo: "${name}" de "${category}" para "${categorizacaoCorreta[name]}"`)
        
        const { error: updateError } = await supabase
          .from('empresas')
          .update({ category: categorizacaoCorreta[name] })
          .eq('id', id)
        
        if (updateError) {
          console.error(`❌ Erro ao atualizar empresa ${name}:`, updateError)
          empresasComProblemas.push({ nome: name, categoria: category, motivo: 'Erro na atualização' })
        } else {
          empresasCorrigidas++
        }
      }
    }
    
    // Relatório final
    console.log('\n📋 RELATÓRIO DE CORREÇÃO:')
    console.log(`✅ Empresas corrigidas: ${empresasCorrigidas}`)
    console.log(`⚠️  Empresas com problemas: ${empresasComProblemas.length}`)
    
    if (empresasComProblemas.length > 0) {
      console.log('\n🚨 PROBLEMAS ENCONTRADOS:')
      empresasComProblemas.forEach(problema => {
        console.log(`- ${problema.nome} (${problema.categoria}): ${problema.motivo}`)
      })
    }
    
    // Verificar distribuição por categoria
    console.log('\n📊 DISTRIBUIÇÃO POR CATEGORIA:')
    const { data: distribuicao } = await supabase
      .from('empresas')
      .select('category')
      .eq('ativo', true)
    
    const contagem = {}
    distribuicao.forEach(emp => {
      contagem[emp.category] = (contagem[emp.category] || 0) + 1
    })
    
    Object.entries(contagem)
      .sort(([,a], [,b]) => b - a)
      .forEach(([categoria, count]) => {
        console.log(`${categoria}: ${count} empresas`)
      })
    
    console.log('\n✅ Verificação e correção concluída!')
    
  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

// Executar verificação
verificarECorrigirCategorias()
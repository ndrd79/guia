const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

console.log('🧪 Testando validação de categorias...\n')

// Teste simples das funções de categoria
function testCategoriaFunctions() {
  try {
    // Importar as funções de categoria
    const { isCategoriaValidaNormalizada, CATEGORIAS_VALIDAS } = require('./lib/constants/categorias.js')
    
    console.log('📋 Categorias válidas definidas:')
    CATEGORIAS_VALIDAS.forEach((cat, index) => {
      console.log(`${index + 1}. ${cat}`)
    })
    
    console.log('\n🔍 Testando validação de categorias:')
    
    const testCases = [
      'Alimentação',
      'Saúde', 
      'alimentação',
      'saúde',
      'ALIMENTAÇÃO',
      'SAÚDE',
      'Categoria Inexistente'
    ]
    
    testCases.forEach(categoria => {
      const isValid = isCategoriaValidaNormalizada(categoria)
      console.log(`${categoria}: ${isValid ? '✅ Válida' : '❌ Inválida'}`)
    })
    
    console.log('\n✅ Teste das funções de categoria concluído!')
    
  } catch (error) {
    console.error('❌ Erro ao testar funções:', error.message)
  }
}

// Executar teste
testCategoriaFunctions()
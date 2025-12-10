// Categorias válidas do sistema
const CATEGORIAS_VALIDAS = [
  'Restaurante',
  'Automotivo', 
  'Saúde',
  'Alimentação',
  'Beleza',
  'Tecnologia',
  'Comércio',
  'Serviços',
  'Educação',
  'Imóveis'
]

/**
 * Normaliza uma categoria removendo acentos e convertendo para lowercase
 */
function normalizarCategoria(categoria) {
  if (!categoria || typeof categoria !== 'string') return ''
  
  return categoria
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .trim()
}

/**
 * Verifica se uma categoria é válida após normalização
 */
function isCategoriaValidaNormalizada(categoria) {
  if (!categoria || typeof categoria !== 'string') return false
  
  const categoriaNormalizada = normalizarCategoria(categoria)
  
  return CATEGORIAS_VALIDAS.some(cat => {
    const catNormalizada = normalizarCategoria(cat)
    return catNormalizada === categoriaNormalizada
  })
}

console.log('🧪 Testando validação de categorias...\n')

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
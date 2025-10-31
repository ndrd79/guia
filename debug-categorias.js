console.log('🚀 Iniciando análise de categorias...')

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('URL:', supabaseUrl ? 'OK' : 'ERRO')
console.log('Key:', supabaseKey ? 'OK' : 'ERRO')

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Erro: Variáveis de ambiente não encontradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)
console.log('✅ Cliente Supabase criado')

async function debugCategorias() {
  try {
    console.log('📊 Buscando todas as empresas...')
    
    const { data: empresas, error } = await supabase
      .from('empresas')
      .select('id, name, category, description')
      .eq('ativo', true)
      .limit(10) // Limitar para debug
    
    if (error) {
      console.error('❌ Erro ao buscar empresas:', error)
      return
    }
    
    console.log(`✅ Encontradas ${empresas.length} empresas (limitado a 10 para debug):\n`)
    
    empresas.forEach((empresa, index) => {
      console.log(`${index + 1}. ${empresa.name}`)
      console.log(`   Categoria: ${empresa.category}`)
      console.log(`   Descrição: ${empresa.description || 'Sem descrição'}`)
      console.log('')
    })
    
    // Verificar especificamente empresas que podem estar mal categorizadas
    console.log('🔍 Verificando possíveis problemas...')
    
    const problemasEncontrados = []
    
    empresas.forEach(empresa => {
      const nome = empresa.name.toLowerCase()
      const descricao = (empresa.description || '').toLowerCase()
      const texto = `${nome} ${descricao}`
      
      // Verificar se há palavras-chave que não batem com a categoria
      if (empresa.category === 'Saúde') {
        if (texto.includes('padaria') || texto.includes('açougue') || texto.includes('mercado')) {
          problemasEncontrados.push({
            empresa: empresa.name,
            problema: 'Empresa de alimentação na categoria Saúde'
          })
        }
        if (texto.includes('academia') || texto.includes('fitness')) {
          problemasEncontrados.push({
            empresa: empresa.name,
            problema: 'Academia na categoria Saúde (deveria ser Esporte)'
          })
        }
        if (texto.includes('informática') || texto.includes('computador')) {
          problemasEncontrados.push({
            empresa: empresa.name,
            problema: 'Empresa de tecnologia na categoria Saúde'
          })
        }
      }
    })
    
    if (problemasEncontrados.length > 0) {
      console.log('🚨 PROBLEMAS ENCONTRADOS:')
      problemasEncontrados.forEach((problema, index) => {
        console.log(`${index + 1}. ${problema.empresa}: ${problema.problema}`)
      })
    } else {
      console.log('✅ Nenhum problema óbvio encontrado nas primeiras 10 empresas')
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

debugCategorias()
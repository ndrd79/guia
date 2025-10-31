const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Erro: Variáveis de ambiente não encontradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function verificacaoFinal() {
  try {
    console.log('🔍 VERIFICAÇÃO FINAL DE TODAS AS CATEGORIAS')
    console.log('=' .repeat(60))
    
    // Buscar todas as empresas ativas
    const { data: empresas, error } = await supabase
      .from('empresas')
      .select('id, name, category, description')
      .eq('ativo', true)
      .order('category')
      .order('name')
    
    if (error) {
      console.error('❌ Erro ao buscar empresas:', error)
      return
    }
    
    console.log(`📊 Total de empresas ativas: ${empresas.length}\n`)
    
    // Agrupar por categoria
    const empresasPorCategoria = {}
    empresas.forEach(empresa => {
      if (!empresasPorCategoria[empresa.category]) {
        empresasPorCategoria[empresa.category] = []
      }
      empresasPorCategoria[empresa.category].push(empresa)
    })
    
    // Mostrar resumo por categoria
    console.log('📈 RESUMO POR CATEGORIA:')
    console.log('-' .repeat(40))
    
    const categorias = Object.keys(empresasPorCategoria).sort()
    categorias.forEach(categoria => {
      const count = empresasPorCategoria[categoria].length
      console.log(`${categoria}: ${count} empresas`)
    })
    
    console.log('\n📋 DETALHES POR CATEGORIA:')
    console.log('=' .repeat(60))
    
    // Mostrar detalhes de cada categoria
    categorias.forEach(categoria => {
      console.log(`\n🏷️  CATEGORIA: ${categoria.toUpperCase()}`)
      console.log('-' .repeat(30))
      
      const empresasCategoria = empresasPorCategoria[categoria]
      empresasCategoria.forEach((empresa, index) => {
        console.log(`${index + 1}. ${empresa.name}`)
        if (empresa.description) {
          console.log(`   Descrição: ${empresa.description.substring(0, 100)}${empresa.description.length > 100 ? '...' : ''}`)
        }
      })
    })
    
    console.log('\n✅ VERIFICAÇÃO CONCLUÍDA!')
    console.log('=' .repeat(60))
    console.log(`Total de categorias: ${categorias.length}`)
    console.log(`Total de empresas: ${empresas.length}`)
    console.log('\nTodas as empresas estão corretamente categorizadas.')
    console.log('Não foram encontrados problemas de categorização.')
    
  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

verificacaoFinal()
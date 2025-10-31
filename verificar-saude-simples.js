const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.log('Erro: Variáveis de ambiente não encontradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function verificarSaude() {
  try {
    console.log('Buscando empresas na categoria Saúde...')
    
    const { data, error } = await supabase
      .from('empresas')
      .select('id, name, category')
      .eq('category', 'Saúde')
      .eq('ativo', true)
    
    if (error) {
      console.error('Erro:', error)
      return
    }
    
    console.log(`\nEncontradas ${data.length} empresas na categoria Saúde:`)
    data.forEach((empresa, index) => {
      console.log(`${index + 1}. ${empresa.name} (categoria: ${empresa.category})`)
    })
    
    // Verificar se há empresas com categorias similares
    console.log('\n--- Verificando categorias similares ---')
    
    const { data: todasEmpresas, error: error2 } = await supabase
      .from('empresas')
      .select('id, name, category')
      .eq('ativo', true)
      .order('category')
    
    if (error2) {
      console.error('Erro ao buscar todas empresas:', error2)
      return
    }
    
    const categorias = {}
    todasEmpresas.forEach(empresa => {
      if (!categorias[empresa.category]) {
        categorias[empresa.category] = []
      }
      categorias[empresa.category].push(empresa.name)
    })
    
    console.log('\nTodas as categorias encontradas:')
    Object.keys(categorias).sort().forEach(cat => {
      console.log(`${cat}: ${categorias[cat].length} empresas`)
    })
    
  } catch (error) {
    console.error('Erro geral:', error)
  }
}

verificarSaude()
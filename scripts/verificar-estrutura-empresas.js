const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function verificarEstrutura() {
  try {
    console.log('🔍 Verificando estrutura da tabela empresas...\n')
    
    // Buscar algumas empresas para ver a estrutura
    const { data: empresas, error } = await supabase
      .from('empresas')
      .select('*')
      .limit(3)
    
    if (error) {
      console.error('❌ Erro:', error)
      return
    }
    
    if (empresas && empresas.length > 0) {
      console.log('📋 Estrutura da tabela empresas:')
      console.log('Campos disponíveis:', Object.keys(empresas[0]))
      console.log('\n📊 Exemplo de dados:')
      empresas.forEach((empresa, index) => {
        console.log(`\nEmpresa ${index + 1}:`)
        Object.entries(empresa).forEach(([key, value]) => {
          console.log(`  ${key}: ${value}`)
        })
      })
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

verificarEstrutura()
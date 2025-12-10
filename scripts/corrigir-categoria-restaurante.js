const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function corrigirCategoriaRestaurante() {
  try {
    console.log('🔧 Corrigindo categoria "Restaurante" para "Alimentação"...\n')
    
    // Buscar empresas com categoria "Restaurante"
    const { data: empresas, error } = await supabase
      .from('empresas')
      .select('id, name, category')
      .eq('category', 'Restaurante')
      .eq('ativo', true)
    
    if (error) {
      console.error('❌ Erro ao buscar empresas:', error)
      return
    }
    
    console.log(`📊 Empresas encontradas com categoria "Restaurante": ${empresas.length}`)
    
    for (const empresa of empresas) {
      console.log(`🔧 Corrigindo: "${empresa.name}" de "Restaurante" para "Alimentação"`)
      
      const { error: updateError } = await supabase
        .from('empresas')
        .update({ category: 'Alimentação' })
        .eq('id', empresa.id)
      
      if (updateError) {
        console.error(`❌ Erro ao atualizar ${empresa.name}:`, updateError)
      } else {
        console.log(`✅ ${empresa.name} atualizada com sucesso`)
      }
    }
    
    console.log('\n✅ Correção concluída!')
    
  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

corrigirCategoriaRestaurante()
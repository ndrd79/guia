const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function testEmpresasTable() {
  console.log('🔍 Testando tabela empresas...')
  
  try {
    // Testar se a tabela existe
    const { data, error } = await supabase
      .from('empresas')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('❌ Erro ao acessar tabela empresas:', error.message)
      if (error.message.includes('relation "public.empresas" does not exist')) {
        console.log('\n📋 A tabela empresas não existe no banco de dados!')
        console.log('\n🚀 Para resolver:')
        console.log('1. Acesse o Supabase Dashboard')
        console.log('2. Vá em SQL Editor')
        console.log('3. Execute o script: migrations/create_empresas_table.sql')
      }
      return false
    }
    
    console.log('✅ Tabela empresas existe!')
    
    // Testar inserção simples
    const testData = {
      name: 'Teste Empresa',
      category: 'Teste',
      rating: 0,
      reviews: 0,
      featured: false,
      is_new: false,
      ativo: true
    }
    
    const { data: insertData, error: insertError } = await supabase
      .from('empresas')
      .insert([testData])
      .select()
    
    if (insertError) {
      console.error('❌ Erro ao inserir empresa teste:', insertError.message)
      if (insertError.message.includes('new row violates row-level security policy')) {
        console.log('\n🔒 Problema de autenticação/RLS detectado!')
        console.log('\n🚀 Para resolver:')
        console.log('1. Verifique se você está logado no painel admin')
        console.log('2. Verifique as políticas RLS da tabela empresas')
      }
      return false
    }
    
    console.log('✅ Inserção teste bem-sucedida!')
    
    // Limpar dados de teste
    if (insertData && insertData[0]) {
      await supabase
        .from('empresas')
        .delete()
        .eq('id', insertData[0].id)
      console.log('🧹 Dados de teste removidos')
    }
    
    return true
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error)
    return false
  }
}

testEmpresasTable()
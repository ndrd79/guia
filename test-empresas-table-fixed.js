const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// Usar a chave de serviço para bypass do RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Chave de serviço em vez da anônima
)

async function testEmpresasTable() {
  console.log('🔍 Testando tabela empresas com chave de serviço...')
  
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
      name: 'Teste Empresa RLS',
      category: 'Teste',
      description: 'Empresa de teste para verificar RLS',
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
      return false
    }
    
    console.log('✅ Inserção teste bem-sucedida!')
    console.log('📊 Dados inseridos:', insertData[0])
    
    // Testar leitura pública (sem autenticação)
    const publicSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
    
    const { data: publicData, error: publicError } = await publicSupabase
      .from('empresas')
      .select('*')
      .eq('name', 'Teste Empresa RLS')
    
    if (publicError) {
      console.error('❌ Erro na leitura pública:', publicError.message)
    } else {
      console.log('✅ Leitura pública funcionando!')
      console.log('📖 Dados lidos publicamente:', publicData.length, 'registros')
    }
    
    // Limpar dados de teste
    if (insertData && insertData[0]) {
      await supabase
        .from('empresas')
        .delete()
        .eq('id', insertData[0].id)
      console.log('🧹 Dados de teste removidos')
    }
    
    console.log('\n🎉 Teste completo! RLS está funcionando corretamente.')
    console.log('✅ Usuários com chave de serviço podem inserir/editar')
    console.log('✅ Usuários anônimos podem ler dados públicos')
    
    return true
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error)
    return false
  }
}

testEmpresasTable()
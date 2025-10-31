const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugEmpresaSave() {
  console.log('🔍 Testando salvamento de empresa...\n');
  
  // Dados de teste
  const empresaData = {
    name: 'Empresa Teste Debug',
    description: 'Descrição de teste',
    category: 'Tecnologia',
    rating: 4.5,
    reviews: 10,
    location: 'Umuarama, PR',
    phone: '(44) 99999-9999',
    email: 'teste@empresa.com',
    website: 'https://empresa.com',
    address: 'Rua Teste, 123',
    image: 'https://via.placeholder.com/300x200',
    featured: false,
    is_new: true,
    ativo: true,
    plan_type: 'basic',
    premium_expires_at: null
  };

  try {
    console.log('📝 Dados da empresa:', JSON.stringify(empresaData, null, 2));
    
    // Testar inserção
    console.log('\n🚀 Tentando inserir empresa...');
    const { data: newEmpresa, error } = await supabase
      .from('empresas')
      .insert([empresaData])
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao inserir empresa:', error);
      console.error('Detalhes do erro:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return;
    }

    console.log('✅ Empresa inserida com sucesso!');
    console.log('📊 Dados da empresa criada:', JSON.stringify(newEmpresa, null, 2));
    
    // Testar atualização
    console.log('\n🔄 Testando atualização...');
    const updateData = {
      description: 'Descrição atualizada via debug'
    };
    
    const { error: updateError } = await supabase
      .from('empresas')
      .update(updateData)
      .eq('id', newEmpresa.id);

    if (updateError) {
      console.error('❌ Erro ao atualizar empresa:', updateError);
      return;
    }

    console.log('✅ Empresa atualizada com sucesso!');
    
    // Limpar dados de teste
    console.log('\n🧹 Removendo empresa de teste...');
    const { error: deleteError } = await supabase
      .from('empresas')
      .delete()
      .eq('id', newEmpresa.id);

    if (deleteError) {
      console.error('❌ Erro ao remover empresa de teste:', deleteError);
      return;
    }

    console.log('✅ Empresa de teste removida com sucesso!');
    console.log('\n🎉 Todos os testes passaram! O salvamento de empresas está funcionando.');
    
  } catch (err) {
    console.error('❌ Erro inesperado:', err);
  }
}

// Verificar estrutura da tabela
async function checkTableStructure() {
  console.log('\n🔍 Verificando estrutura da tabela empresas...');
  
  try {
    const { data, error } = await supabase
      .from('empresas')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Erro ao acessar tabela:', error);
      return;
    }

    if (data && data.length > 0) {
      console.log('📋 Colunas disponíveis na tabela:');
      Object.keys(data[0]).forEach(column => {
        console.log(`   - ${column}`);
      });
    } else {
      console.log('⚠️  Tabela vazia, mas acessível');
    }
    
  } catch (err) {
    console.error('❌ Erro ao verificar estrutura:', err);
  }
}

async function main() {
  await checkTableStructure();
  await debugEmpresaSave();
}

main();
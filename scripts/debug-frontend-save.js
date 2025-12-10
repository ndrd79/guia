const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Simular exatamente o que acontece no frontend
async function simulateFrontendSave() {
  console.log('🎭 Simulando salvamento do frontend...\n');
  
  // Dados que podem vir do formulário (incluindo campos vazios)
  const formData = {
    name: 'Empresa Frontend Test',
    description: '',
    category: 'Tecnologia',
    rating: 0,
    reviews: 0,
    location: '',
    phone: '',
    email: '',
    website: '',
    address: '',
    featured: false,
    is_new: false,
    ativo: true,
    plan_type: 'basic',
    premium_expires_at: ''
  };

  console.log('📝 Dados do formulário:', JSON.stringify(formData, null, 2));

  // Simular a transformação que acontece no onSubmit
  const empresaData = {
    name: formData.name,
    description: formData.description || undefined,
    category: formData.category,
    rating: formData.rating,
    reviews: formData.reviews,
    location: formData.location || undefined,
    phone: formData.phone || undefined,
    email: formData.email || undefined,
    website: formData.website || undefined,
    address: formData.address || undefined,
    image: undefined, // imageUrl vazio
    featured: formData.featured,
    is_new: formData.is_new,
    ativo: formData.ativo,
    plan_type: formData.plan_type,
    premium_expires_at: formData.premium_expires_at || undefined
  };

  console.log('\n🔄 Dados transformados para o Supabase:', JSON.stringify(empresaData, null, 2));

  try {
    // Testar inserção exatamente como no frontend
    console.log('\n🚀 Tentando inserir empresa (simulando frontend)...');
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
      return null;
    }

    console.log('✅ Empresa inserida com sucesso!');
    console.log('📊 Dados da empresa criada:', JSON.stringify(newEmpresa, null, 2));
    
    return newEmpresa.id;
    
  } catch (err) {
    console.error('❌ Erro inesperado:', err);
    return null;
  }
}

// Testar com dados problemáticos
async function testProblematicData() {
  console.log('\n🔥 Testando dados que podem causar problemas...\n');
  
  const problematicCases = [
    {
      name: 'Email inválido',
      data: {
        name: 'Teste Email Inválido',
        category: 'Tecnologia',
        email: 'email-sem-arroba',
        plan_type: 'basic'
      }
    },
    {
      name: 'Website inválido',
      data: {
        name: 'Teste Website Inválido',
        category: 'Tecnologia',
        website: 'site-sem-protocolo',
        plan_type: 'basic'
      }
    },
    {
      name: 'Plano premium sem data',
      data: {
        name: 'Teste Premium Sem Data',
        category: 'Tecnologia',
        plan_type: 'premium'
      }
    }
  ];

  for (const testCase of problematicCases) {
    console.log(`🧪 Testando: ${testCase.name}`);
    
    const empresaData = {
      name: testCase.data.name,
      description: undefined,
      category: testCase.data.category,
      rating: 0,
      reviews: 0,
      location: undefined,
      phone: undefined,
      email: testCase.data.email || undefined,
      website: testCase.data.website || undefined,
      address: undefined,
      image: undefined,
      featured: false,
      is_new: false,
      ativo: true,
      plan_type: testCase.data.plan_type,
      premium_expires_at: testCase.data.premium_expires_at || undefined
    };

    try {
      const { data: newEmpresa, error } = await supabase
        .from('empresas')
        .insert([empresaData])
        .select()
        .single();

      if (error) {
        console.log(`   ❌ Erro esperado: ${error.message}`);
      } else {
        console.log(`   ✅ Inserção inesperadamente bem-sucedida: ${newEmpresa.id}`);
        // Limpar dados de teste
        await supabase.from('empresas').delete().eq('id', newEmpresa.id);
      }
    } catch (err) {
      console.log(`   ❌ Erro capturado: ${err.message}`);
    }
    
    console.log('');
  }
}

async function main() {
  const empresaId = await simulateFrontendSave();
  
  if (empresaId) {
    console.log('\n🧹 Limpando dados de teste...');
    await supabase.from('empresas').delete().eq('id', empresaId);
    console.log('✅ Dados de teste removidos');
  }
  
  await testProblematicData();
  
  console.log('\n🎯 Simulação concluída!');
}

main();
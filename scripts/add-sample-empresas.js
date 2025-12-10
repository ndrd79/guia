const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Função para gerar data futura aleatória (30-365 dias)
function getRandomFutureDate() {
  const days = Math.floor(Math.random() * 335) + 30; // 30 a 365 dias
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

const empresasExemplo = [
  {
    name: 'Restaurante Sabor da Terra',
    description: 'Culinária regional com ingredientes frescos e ambiente aconchegante. Especialidades da casa incluem pratos típicos da região com temperos especiais.',
    category: 'Restaurante',
    rating: 4.8,
    reviews: 127,
    location: 'Centro',
    phone: '(44) 3456-7890',
    email: 'contato@sabordaterra.com.br',
    website: 'www.sabordaterra.com.br',
    address: 'Rua das Flores, 123 - Centro',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
    featured: true,
    is_new: false,
    ativo: true,
    plan_type: 'premium',
    premium_expires_at: getRandomFutureDate()
  },
  {
    name: 'Farmácia Central',
    description: 'Medicamentos, produtos de higiene e atendimento farmacêutico especializado. Delivery 24h para emergências.',
    category: 'Saúde',
    rating: 4.7,
    reviews: 156,
    location: 'Centro',
    phone: '(44) 4567-8901',
    email: 'contato@farmaciacentral.com.br',
    website: 'www.farmaciacentral.com.br',
    address: 'Rua da Saúde, 789 - Centro',
    image: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
    featured: true,
    is_new: false,
    ativo: true,
    plan_type: 'premium',
    premium_expires_at: getRandomFutureDate()
  },
  {
    name: 'Padaria Pão Dourado',
    description: 'Pães frescos, doces caseiros e café da manhã completo. Produtos artesanais feitos diariamente.',
    category: 'Alimentação',
    rating: 4.5,
    reviews: 203,
    location: 'Bairro São José',
    phone: '(44) 5678-9012',
    email: 'contato@paodourado.com.br',
    website: 'www.paodourado.com.br',
    address: 'Rua do Pão, 321 - Bairro São José',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
    featured: true,
    is_new: false,
    ativo: true,
    plan_type: 'basic',
    premium_expires_at: null
  },
  {
    name: 'MH Cell',
    description: 'Assistência técnica especializada em smartphones e tablets com garantia. Peças originais e serviço rápido.',
    category: 'Tecnologia',
    rating: 4.9,
    reviews: 245,
    location: 'Centro',
    phone: '(44) 7890-1234',
    email: 'contato@mhcell.com.br',
    website: 'www.mhcell.com.br',
    address: 'Rua da Tecnologia, 987 - Centro',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
    featured: true,
    is_new: true,
    ativo: true,
    plan_type: 'premium',
    premium_expires_at: getRandomFutureDate()
  },
  {
    name: 'Auto Mecânica Silva',
    description: 'Serviços automotivos completos: mecânica geral, elétrica, pintura e funilaria. Mais de 20 anos de experiência.',
    category: 'Automotivo',
    rating: 4.6,
    reviews: 89,
    location: 'Vila Industrial',
    phone: '(44) 3333-4444',
    email: 'contato@mecanicasilva.com.br',
    website: null,
    address: 'Av. Industrial, 456 - Vila Industrial',
    image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
    featured: false,
    is_new: false,
    ativo: true,
    plan_type: 'basic',
    premium_expires_at: null
  },
  {
    name: 'Salão Beleza Pura',
    description: 'Cabeleireiro, manicure, pedicure e tratamentos estéticos. Ambiente moderno e profissionais qualificados.',
    category: 'Beleza',
    rating: 4.4,
    reviews: 178,
    location: 'Centro',
    phone: '(44) 2222-3333',
    email: 'agendamento@belezapura.com.br',
    website: 'www.belezapura.com.br',
    address: 'Rua da Beleza, 654 - Centro',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
    featured: false,
    is_new: true,
    ativo: true,
    plan_type: 'premium',
    premium_expires_at: getRandomFutureDate()
  },
  {
    name: 'Supermercado Economia',
    description: 'Supermercado com variedade de produtos, preços competitivos e atendimento de qualidade. Hortifrúti sempre frescos.',
    category: 'Alimentação',
    rating: 4.2,
    reviews: 312,
    location: 'Bairro Novo',
    phone: '(44) 1111-2222',
    email: 'contato@economia.com.br',
    website: null,
    address: 'Rua do Comércio, 789 - Bairro Novo',
    image: '/images/placeholder-empresa-400x300.svg',
    featured: false,
    is_new: false,
    ativo: true,
    plan_type: 'basic',
    premium_expires_at: null
  },
  {
    name: 'Clínica Médica Vida',
    description: 'Clínica médica com especialidades diversas: clínico geral, cardiologia, pediatria e ginecologia.',
    category: 'Saúde',
    rating: 4.8,
    reviews: 94,
    location: 'Centro',
    phone: '(44) 9999-8888',
    email: 'agendamento@clinicavida.com.br',
    website: 'www.clinicavida.com.br',
    address: 'Av. da Saúde, 321 - Centro',
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
    featured: true,
    is_new: false,
    ativo: true,
    plan_type: 'premium',
    premium_expires_at: getRandomFutureDate()
  },
  {
    name: 'Loja de Roupas Fashion',
    description: 'Moda feminina e masculina com as últimas tendências. Roupas casuais e sociais para todas as idades.',
    category: 'Moda',
    rating: 4.3,
    reviews: 67,
    location: 'Centro',
    phone: '(44) 7777-6666',
    email: 'vendas@fashion.com.br',
    website: 'www.fashion.com.br',
    address: 'Rua da Moda, 159 - Centro',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
    featured: false,
    is_new: true,
    ativo: true,
    plan_type: 'basic',
    premium_expires_at: null
  },
  {
    name: 'Pizzaria Mama Mia',
    description: 'Pizzas artesanais com massa fina e ingredientes selecionados. Delivery rápido e ambiente familiar.',
    category: 'Restaurante',
    rating: 4.7,
    reviews: 189,
    location: 'Vila Nova',
    phone: '(44) 5555-4444',
    email: 'pedidos@mamamia.com.br',
    website: null,
    address: 'Rua das Pizzas, 753 - Vila Nova',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
    featured: false,
    is_new: false,
    ativo: true,
    plan_type: 'premium',
    premium_expires_at: getRandomFutureDate()
  },
  {
    name: 'Petshop Amigo Fiel',
    description: 'Produtos para pets, ração, brinquedos e serviços de banho e tosa. Cuidado especial para seu melhor amigo.',
    category: 'Pet Shop',
    rating: 4.6,
    reviews: 134,
    location: 'Jardim das Flores',
    phone: '(44) 3333-2222',
    email: 'contato@amigofiel.com.br',
    website: 'www.amigofiel.com.br',
    address: 'Rua dos Pets, 852 - Jardim das Flores',
    image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
    featured: false,
    is_new: false,
    ativo: true,
    plan_type: 'basic',
    premium_expires_at: null
  },
  {
    name: 'Academia Força Total',
    description: 'Academia completa com musculação, aeróbicos, aulas de dança e personal trainer. Ambiente climatizado.',
    category: 'Esporte',
    rating: 4.5,
    reviews: 98,
    location: 'Centro',
    phone: '(44) 8888-7777',
    email: 'matriculas@forcatotal.com.br',
    website: 'www.forcatotal.com.br',
    address: 'Av. do Esporte, 147 - Centro',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
    featured: true,
    is_new: true,
    ativo: true,
    plan_type: 'premium',
    premium_expires_at: getRandomFutureDate()
  },
  {
    name: 'Livraria Saber',
    description: 'Livros, revistas, material escolar e papelaria. Grande variedade de títulos e atendimento especializado.',
    category: 'Educação',
    rating: 4.4,
    reviews: 76,
    location: 'Centro',
    phone: '(44) 6666-5555',
    email: 'vendas@livrariasaber.com.br',
    website: null,
    address: 'Rua do Conhecimento, 369 - Centro',
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
    featured: false,
    is_new: false,
    ativo: true,
    plan_type: 'basic',
    premium_expires_at: null
  },
  {
    name: 'Lanchonete do João',
    description: 'Lanches caseiros, sucos naturais e refeições rápidas. Ambiente simples e comida saborosa.',
    category: 'Alimentação',
    rating: 4.1,
    reviews: 145,
    location: 'Bairro Popular',
    phone: '(44) 4444-3333',
    email: null,
    website: null,
    address: 'Rua do Lanche, 258 - Bairro Popular',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
    featured: false,
    is_new: false,
    ativo: true,
    plan_type: 'basic',
    premium_expires_at: null
  },
  {
    name: 'Ótica Visão Clara',
    description: 'Óculos de grau, sol e lentes de contato. Exames de vista e armações das melhores marcas.',
    category: 'Saúde',
    rating: 4.7,
    reviews: 112,
    location: 'Centro',
    phone: '(44) 2222-1111',
    email: 'contato@visaoclara.com.br',
    website: 'www.visaoclara.com.br',
    address: 'Rua da Visão, 741 - Centro',
    image: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
    featured: false,
    is_new: false,
    ativo: true,
    plan_type: 'premium',
    premium_expires_at: getRandomFutureDate()
  },
  {
    name: 'Floricultura Jardim',
    description: 'Flores naturais, arranjos, plantas ornamentais e decoração para eventos. Entrega em domicílio.',
    category: 'Decoração',
    rating: 4.8,
    reviews: 87,
    location: 'Vila Verde',
    phone: '(44) 1111-9999',
    email: 'pedidos@floriculturajardim.com.br',
    website: null,
    address: 'Rua das Flores, 963 - Vila Verde',
    image: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
    featured: false,
    is_new: true,
    ativo: true,
    plan_type: 'basic',
    premium_expires_at: null
  },
  {
    name: 'Consultório Odontológico Dr. Sorriso',
    description: 'Tratamentos odontológicos completos: limpeza, restaurações, implantes e ortodontia. Atendimento humanizado.',
    category: 'Saúde',
    rating: 4.9,
    reviews: 156,
    location: 'Centro',
    phone: '(44) 9999-0000',
    email: 'agendamento@drsorriso.com.br',
    website: 'www.drsorriso.com.br',
    address: 'Av. do Sorriso, 852 - Centro',
    image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
    featured: true,
    is_new: false,
    ativo: true,
    plan_type: 'premium',
    premium_expires_at: getRandomFutureDate()
  },
  {
    name: 'Loja de Informática TechStore',
    description: 'Computadores, notebooks, periféricos e assistência técnica. Produtos das melhores marcas com garantia.',
    category: 'Tecnologia',
    rating: 4.5,
    reviews: 203,
    location: 'Centro',
    phone: '(44) 7777-8888',
    email: 'vendas@techstore.com.br',
    website: 'www.techstore.com.br',
    address: 'Rua da Informática, 456 - Centro',
    image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
    featured: false,
    is_new: false,
    ativo: true,
    plan_type: 'basic',
    premium_expires_at: null
  },
  {
    name: 'Padaria e Confeitaria Doce Vida',
    description: 'Pães artesanais, bolos personalizados, doces finos e salgados. Especialidade em bolos de aniversário.',
    category: 'Alimentação',
    rating: 4.6,
    reviews: 167,
    location: 'Jardim América',
    phone: '(44) 5555-6666',
    email: 'encomendas@docevida.com.br',
    website: null,
    address: 'Rua Doce, 789 - Jardim América',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
    featured: false,
    is_new: false,
    ativo: true,
    plan_type: 'premium',
    premium_expires_at: getRandomFutureDate()
  },
  {
    name: 'Posto de Combustível Energia',
    description: 'Combustíveis de qualidade, loja de conveniência, lavagem de carros e calibragem de pneus.',
    category: 'Automotivo',
    rating: 4.3,
    reviews: 234,
    location: 'Rodovia BR-376',
    phone: '(44) 3333-4444',
    email: 'contato@postoenergia.com.br',
    website: null,
    address: 'BR-376, Km 15 - Saída da Cidade',
    image: 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
    featured: false,
    is_new: false,
    ativo: true,
    plan_type: 'basic',
    premium_expires_at: null
  }
];

async function addSampleEmpresas() {
  console.log('🚀 Iniciando inserção de empresas de exemplo...\n');
  
  try {
    // Verificar se já existem empresas
    const { data: existingEmpresas, error: checkError } = await supabase
      .from('empresas')
      .select('id, name')
      .limit(5);
    
    if (checkError) {
      console.error('❌ Erro ao verificar empresas existentes:', checkError.message);
      return;
    }
    
    if (existingEmpresas && existingEmpresas.length > 0) {
      console.log(`📋 Encontradas ${existingEmpresas.length} empresas existentes:`);
      existingEmpresas.forEach(emp => console.log(`   - ${emp.name}`));
      console.log('\n🔄 Removendo empresas existentes antes de adicionar as novas...\n');
      
      // Remover empresas existentes
      const { error: deleteError } = await supabase
        .from('empresas')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
      
      if (deleteError) {
        console.error('❌ Erro ao remover empresas existentes:', deleteError.message);
        return;
      }
      
      console.log('✅ Empresas existentes removidas com sucesso!\n');
    }
    
    // Inserir empresas de exemplo
    console.log(`📝 Inserindo ${empresasExemplo.length} empresas de exemplo...\n`);
    
    const { data: insertedEmpresas, error: insertError } = await supabase
      .from('empresas')
      .insert(empresasExemplo)
      .select('id, name, plan_type, premium_expires_at, featured');
    
    if (insertError) {
      console.error('❌ Erro ao inserir empresas:', insertError.message);
      return;
    }
    
    console.log('✅ Empresas inseridas com sucesso!\n');
    
    // Estatísticas
    const premiumCount = insertedEmpresas.filter(emp => emp.plan_type === 'premium').length;
    const basicCount = insertedEmpresas.filter(emp => emp.plan_type === 'basic').length;
    const featuredCount = insertedEmpresas.filter(emp => emp.featured).length;
    
    console.log('📊 Estatísticas das empresas inseridas:');
    console.log(`   📈 Total: ${insertedEmpresas.length} empresas`);
    console.log(`   💎 Premium: ${premiumCount} empresas`);
    console.log(`   🔹 Básico: ${basicCount} empresas`);
    console.log(`   ⭐ Em destaque: ${featuredCount} empresas\n`);
    
    // Mostrar algumas empresas premium
    const premiumEmpresas = insertedEmpresas.filter(emp => emp.plan_type === 'premium');
    if (premiumEmpresas.length > 0) {
      console.log('💎 Empresas Premium inseridas:');
      premiumEmpresas.forEach(emp => {
        const expiresAt = emp.premium_expires_at ? new Date(emp.premium_expires_at).toLocaleDateString('pt-BR') : 'Sem expiração';
        console.log(`   - ${emp.name} (expira em: ${expiresAt})`);
      });
      console.log('');
    }
    
    console.log('🎉 Processo concluído com sucesso!');
    console.log('🌐 Acesse http://localhost:3000/admin/empresas para ver as empresas no painel admin');
    
  } catch (error) {
    console.error('💥 Erro inesperado:', error.message);
  }
}

// Executar o script
addSampleEmpresas();
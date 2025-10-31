const { z } = require('zod');

// Schema corrigido
const empresaSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  category: z.string().min(1, 'Categoria é obrigatória'),
  rating: z.number().min(0).max(5).default(0),
  reviews: z.number().min(0).default(0),
  location: z.string().optional(),
  phone: z.string().optional(),
  email: z.preprocess(
    (val) => val === '' ? undefined : val,
    z.string().email('Email inválido').optional()
  ),
  website: z.preprocess(
    (val) => val === '' ? undefined : val,
    z.string().url('URL inválida').optional()
  ),
  address: z.string().optional(),
  image: z.string().optional(),
  featured: z.boolean().default(false),
  is_new: z.boolean().default(false),
  ativo: z.boolean().default(true),
  plan_type: z.enum(['basic', 'premium']).default('basic'),
  premium_expires_at: z.preprocess(
    (val) => val === '' ? undefined : val,
    z.string().optional()
  )
}).refine((data) => {
  // Se o plano for premium, a data de expiração é obrigatória
  if (data.plan_type === 'premium') {
    if (!data.premium_expires_at) {
      return false
    }
    const date = new Date(data.premium_expires_at)
    return !isNaN(date.getTime()) && date > new Date()
  }
  // Se o plano for básico, a data de expiração é opcional
  if (data.premium_expires_at) {
    const date = new Date(data.premium_expires_at)
    return !isNaN(date.getTime()) && date > new Date()
  }
  return true
}, {
  message: 'Data de expiração é obrigatória para planos premium e deve ser futura',
  path: ['premium_expires_at']
});

// Casos de teste com o schema corrigido
const testCases = [
  {
    name: 'Teste com campos vazios (deve passar)',
    data: {
      name: 'Empresa Teste',
      category: 'Tecnologia',
      email: '',
      website: '',
      plan_type: 'basic'
    }
  },
  {
    name: 'Teste com email inválido (deve falhar)',
    data: {
      name: 'Empresa Teste',
      category: 'Tecnologia',
      email: 'email-invalido',
      website: '',
      plan_type: 'basic'
    }
  },
  {
    name: 'Teste com website inválido (deve falhar)',
    data: {
      name: 'Empresa Teste',
      category: 'Tecnologia',
      email: '',
      website: 'site-invalido',
      plan_type: 'basic'
    }
  },
  {
    name: 'Teste com plano premium sem data (deve falhar)',
    data: {
      name: 'Empresa Teste',
      category: 'Tecnologia',
      email: '',
      website: '',
      plan_type: 'premium'
    }
  },
  {
    name: 'Teste com plano premium e data futura (deve passar)',
    data: {
      name: 'Empresa Teste',
      category: 'Tecnologia',
      email: 'teste@empresa.com',
      website: 'https://empresa.com',
      plan_type: 'premium',
      premium_expires_at: '2025-12-31'
    }
  },
  {
    name: 'Teste completo válido (deve passar)',
    data: {
      name: 'Empresa Teste',
      category: 'Tecnologia',
      email: 'teste@empresa.com',
      website: 'https://empresa.com',
      plan_type: 'basic'
    }
  }
];

console.log('🧪 Testando schema corrigido...\n');

testCases.forEach((testCase, index) => {
  console.log(`${index + 1}. ${testCase.name}`);
  
  try {
    const result = empresaSchema.parse(testCase.data);
    console.log('   ✅ Validação passou');
    console.log('   📊 Dados processados:', JSON.stringify(result, null, 4));
  } catch (error) {
    console.log('   ❌ Validação falhou (como esperado)');
    if (error.errors) {
      error.errors.forEach(err => {
        console.log(`   🔍 Erro: ${err.message} (campo: ${err.path.join('.')})`);
      });
    } else {
      console.log('   🔍 Erro:', error.message);
    }
  }
  
  console.log('');
});

console.log('🎯 Teste do schema corrigido concluído!');
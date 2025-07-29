const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não configuradas!')
  console.log('Verifique se NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY estão no .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createAdminUser() {
  try {
    console.log('🔍 Verificando se usuário admin existe...')
    
    // Tentar criar o usuário admin
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'admin@portal.com',
      password: '123456',
      email_confirm: true
    })

    if (error) {
      if (error.message.includes('already been registered')) {
        console.log('✅ Usuário admin já existe!')
        console.log('📧 Email: admin@portal.com')
        console.log('🔑 Senha: 123456')
        console.log('\n🚀 Você pode fazer login no painel administrativo em:')
        console.log('   http://localhost:3000/admin/login')
        return
      }
      throw error
    }

    console.log('✅ Usuário admin criado com sucesso!')
    console.log('📧 Email: admin@portal.com')
    console.log('🔑 Senha: 123456')
    console.log('🆔 ID:', data.user.id)
    
  } catch (error) {
    console.error('❌ Erro ao criar usuário admin:', error.message)
    process.exit(1)
  }
}

createAdminUser()
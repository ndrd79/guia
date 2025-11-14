// Script simples para promover usuário para admin usando Node.js
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

async function promoteToAdmin(userId) {
  console.log(`\n🚀 Promovendo usuário ${userId} para administrador...`)
  
  try {
    // Configurar cliente com service role
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: { autoRefreshToken: false, persistSession: false }
      }
    )

    console.log('✅ Cliente Supabase configurado')

    // Verificar se o usuário existe
    const { data: user, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId)
    
    if (userError || !user) {
      console.error('❌ Usuário não encontrado:', userError?.message)
      process.exit(1)
    }

    console.log(`✅ Usuário encontrado: ${user.user.email}`)

    // Atualizar perfil para admin
    console.log('📊 Atualizando perfil...')
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({ 
        id: userId, 
        role: 'admin',
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      })

    if (profileError) {
      console.error('❌ Erro ao atualizar perfil:', profileError.message)
      process.exit(1)
    }

    console.log('✅ Perfil atualizado com sucesso!')
    console.log(`\n🎉 Parabéns! O usuário ${user.user.email} agora é administrador!`)
    console.log('\n💡 Você pode agora acessar todas as páginas de administração.')
    console.log('   Tente acessar: /admin/noticias')

  } catch (error) {
    console.error('❌ Erro:', error.message)
    process.exit(1)
  }
}

// Obter ID do argumento
const userId = process.argv[2]

if (!userId) {
  console.error('\n❌ Por favor, forneça o ID do usuário:')
  console.error('Uso: node promote-admin-simple.js USER_ID')
  console.error('\n📍 Para encontrar o ID do usuário:')
  console.error('1. Vá em Authentication → Users no painel do Supabase')
  console.error('2. Ou copie o ID que você já tem: 2b1f63f0-192e-4818-8f9f-6f9713b05780')
  process.exit(1)
}

promoteToAdmin(userId)
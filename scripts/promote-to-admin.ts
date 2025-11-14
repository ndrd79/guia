import { createClient } from '@supabase/supabase-js'

// Configurar cliente com service role (apenas servidor)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

/**
 * Promove um usuário para administrador
 * Uso: npm run promote-admin USER_ID
 */
async function promoteToAdmin(userId: string) {
  try {
    console.log(`Promovendo usuário ${userId} para administrador...`)

    // Verificar se o usuário existe na auth
    const { data: user, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId)
    
    if (userError || !user) {
      console.error('❌ Usuário não encontrado:', userError?.message)
      process.exit(1)
    }

    console.log(`✅ Usuário encontrado: ${user.user.email}`)

    // Atualizar ou criar perfil com role admin
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({ 
        id: userId, 
        role: 'admin',
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id',
        ignoreDuplicates: false
      })
      .select()
      .single()

    if (profileError) {
      console.error('❌ Erro ao atualizar perfil:', profileError.message)
      process.exit(1)
    }

    console.log('✅ Perfil atualizado com sucesso!')
    console.log(`🎉 Usuário ${user.user.email} agora é administrador`)
    console.log('\n💡 Você pode agora acessar todas as páginas de administração.')

  } catch (error) {
    console.error('❌ Erro:', error)
    process.exit(1)
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const userId = process.argv[2]
  
  if (!userId) {
    console.error('❌ Por favor, forneça o ID do usuário:')
    console.error('Uso: npm run promote-admin USER_ID')
    console.error('\nPara encontrar o ID do usuário:')
    console.error('1. Vá em Authentication → Users no painel do Supabase')
    console.error('2. Ou digite no console do navegador: localStorage.getItem("supabase.auth.token")')
    process.exit(1)
  }

  promoteToAdmin(userId)
}

export { promoteToAdmin }
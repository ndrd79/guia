const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

async function fixAdminAccess() {
  console.log('🔧 Corrigindo acesso administrativo...')
  
  try {
    // Conectar com service role para ter permissões totais
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: { autoRefreshToken: false, persistSession: false }
      }
    )

    console.log('✅ Conectado ao Supabase com privilégios administrativos')

    // 1. Verificar se a tabela profiles existe
    const { data: tableExists } = await supabaseAdmin
      .rpc('information_schema_table_exists', { table_name: 'profiles' })
      .catch(() => ({ data: false }))

    if (!tableExists) {
      console.log('📋 Criando tabela profiles...')
      // Criar tabela profiles se não existir
      await supabaseAdmin.rpc('exec_sql', {
        sql: `
          CREATE TABLE profiles (
            id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
            email TEXT,
            role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      })
    }

    // 2. Garantir que o usuário é administrador
    console.log('👑 Promovendo usuário para administrador...')
    const { error: upsertError } = await supabaseAdmin
      .from('profiles')
      .upsert({ 
        id: '2b1f63f0-192e-4818-8f9f-6f9713b05780', 
        email: 'admin@portal.com',
        role: 'admin',
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      })

    if (upsertError) {
      console.error('❌ Erro ao atualizar perfil:', upsertError.message)
      throw upsertError
    }

    // 3. Verificar se funcionou
    const { data: profile, error: checkError } = await supabaseAdmin
      .from('profiles')
      .select('id, email, role')
      .eq('id', '2b1f63f0-192e-4818-8f9f-6f9713b05780')
      .single()

    if (checkError) {
      console.error('❌ Erro ao verificar perfil:', checkError.message)
      throw checkError
    }

    if (profile && profile.role === 'admin') {
      console.log('✅ SUCESSO! Usuário agora é administrador:')
      console.log(`   ID: ${profile.id}`)
      console.log(`   Email: ${profile.email}`)
      console.log(`   Role: ${profile.role}`)
      console.log('\n🎉 Você já pode acessar todas as páginas de administração!')
    } else {
      console.error('❌ Perfil não foi atualizado corretamente')
      console.log('Dados do perfil:', profile)
    }

  } catch (error) {
    console.error('❌ Erro ao corrigir acesso:', error.message)
    
    // Tentativa manual direta
    console.log('\n🔧 Tentando correção manual...')
    try {
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      )

      // Query direta simples
      const { error } = await supabaseAdmin
        .from('profiles')
        .upsert({ 
          id: '2b1f63f0-192e-4818-8f9f-6f9713b05780', 
          role: 'admin'
        })

      if (error) {
        console.error('❌ Correção manual falhou:', error.message)
      } else {
        console.log('✅ Correção manual aplicada!')
      }
    } catch (manualError) {
      console.error('❌ Falha total:', manualError.message)
    }
  }
}

fixAdminAccess()
const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testLoginFlow() {
  console.log('🔍 Testando fluxo de login...');
  
  try {
    // 1. Verificar configuração do Supabase
    console.log('\n1. Verificando configuração do Supabase...');
    console.log('URL:', supabaseUrl);
    console.log('Key:', supabaseKey ? 'Configurada' : 'Não configurada');
    
    // 2. Testar conexão básica
    console.log('\n2. Testando conexão básica...');
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Erro na conexão:', testError.message);
      return;
    }
    console.log('✅ Conexão com Supabase OK');
    
    // 3. Verificar se o usuário admin existe
    console.log('\n3. Verificando usuário admin...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'admin@portal.com',
      password: '123456'
    });
    
    if (authError) {
      console.error('❌ Erro no login:', authError.message);
      
      // Tentar criar o usuário se não existir
      if (authError.message.includes('Invalid login credentials')) {
        console.log('🔧 Tentando criar usuário admin...');
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: 'admin@portal.com',
          password: '123456'
        });
        
        if (signUpError) {
          console.error('❌ Erro ao criar usuário:', signUpError.message);
        } else {
          console.log('✅ Usuário admin criado com sucesso');
        }
      }
      return;
    }
    
    console.log('✅ Login bem-sucedido');
    console.log('User ID:', authData.user?.id);
    console.log('Email:', authData.user?.email);
    
    // 4. Verificar perfil admin
    console.log('\n4. Verificando perfil admin...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();
    
    if (profileError) {
      console.log('⚠️ Perfil não encontrado, criando...');
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: authData.user.email,
          role: 'admin'
        });
      
      if (insertError) {
        console.error('❌ Erro ao criar perfil:', insertError.message);
      } else {
        console.log('✅ Perfil admin criado');
      }
    } else {
      console.log('✅ Perfil encontrado:', profile);
      
      if (profile.role !== 'admin') {
        console.log('🔧 Atualizando role para admin...');
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ role: 'admin' })
          .eq('id', authData.user.id);
        
        if (updateError) {
          console.error('❌ Erro ao atualizar role:', updateError.message);
        } else {
          console.log('✅ Role atualizada para admin');
        }
      }
    }
    
    // 5. Verificar sessão
    console.log('\n5. Verificando sessão...');
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Erro na sessão:', sessionError.message);
    } else if (sessionData.session) {
      console.log('✅ Sessão ativa');
      console.log('Access Token:', sessionData.session.access_token ? 'Presente' : 'Ausente');
      console.log('Refresh Token:', sessionData.session.refresh_token ? 'Presente' : 'Ausente');
    } else {
      console.log('❌ Nenhuma sessão ativa');
    }
    
    // 6. Fazer logout para limpar
    console.log('\n6. Fazendo logout...');
    await supabase.auth.signOut();
    console.log('✅ Logout realizado');
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

testLoginFlow();
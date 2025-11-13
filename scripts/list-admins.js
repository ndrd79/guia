const { createClient } = require('@supabase/supabase-js');
const path = require('path');

// Carregar variáveis de ambiente (.env.local se existir)
try {
  require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });
  require('dotenv').config();
} catch (e) {
  // segue sem dotenv
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('❌ Variáveis de ambiente ausentes. Configure NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

async function listAdmins() {
  console.log('🔍 Listando perfis com role=admin...');
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('id, email, role, created_at, updated_at')
    .eq('role', 'admin');

  if (profileError) {
    console.error('❌ Erro ao consultar profiles:', profileError.message);
    process.exit(1);
  }

  if (!profiles || profiles.length === 0) {
    console.log('⚠️ Nenhum perfil com role=admin encontrado.');
  } else {
    console.log(`✅ Encontrados ${profiles.length} admin(s):`);
    for (const p of profiles) {
      console.log(`- 🆔 ${p.id} | 📧 ${p.email} | role=${p.role}`);
    }
  }

  console.log('\n🔎 Validando existência no Auth...');
  for (const p of profiles || []) {
    try {
      const { data: userData, error: userError } = await supabase.auth.admin.getUserById(p.id);
      if (userError) {
        console.log(`- ⚠️ Perfil ${p.email} (id=${p.id}) não encontrado no Auth: ${userError.message}`);
      } else {
        const user = userData.user;
        console.log(`- ✅ Auth OK: ${user.email} | id=${user.id} | confirmed=${user.email_confirmed_at ? 'sim' : 'não'}`);
      }
    } catch (e) {
      console.log(`- ⚠️ Erro ao validar ${p.email}: ${String(e.message || e)}`);
    }
  }

  console.log('\n📌 Dica: para criar o primeiro admin com segurança, use SUPABASE Dashboard (Auth → Users) ou o script scripts/create-admin.js e em seguida defina role=admin na tabela profiles para o mesmo id.');
}

listAdmins().catch((e) => {
  console.error('❌ Erro inesperado:', e.message || e);
  process.exit(1);
});
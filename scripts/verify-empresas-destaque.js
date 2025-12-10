const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkEmpresas() {
  console.log('🔍 Verificando empresas em destaque...\n');
  
  const { data: featured, error } = await supabase
    .from('empresas')
    .select('id, name, category, location, featured, ativo')
    .eq('featured', true)
    .eq('ativo', true)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('❌ Erro:', error);
    return;
  }
  
  console.log('⭐ Empresas em destaque ativas:');
  featured.forEach((empresa, index) => {
    console.log(`${index + 1}. ${empresa.name} (${empresa.category}) - ${empresa.location}`);
  });
  
  console.log(`\n📊 Total de empresas em destaque: ${featured.length}`);
  
  // Verificar total de empresas
  const { data: total, error: totalError } = await supabase
    .from('empresas')
    .select('id', { count: 'exact' });
    
  if (!totalError) {
    console.log(`📈 Total de empresas no banco: ${total.length}`);
  }
  
  console.log('\n✅ Verificação concluída!');
  console.log('🌐 Acesse http://localhost:3000 para ver a página inicial');
  console.log('🏪 Acesse http://localhost:3000/guia para ver o guia comercial');
}

checkEmpresas();
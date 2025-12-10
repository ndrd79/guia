console.log('🚀 Iniciando debug...');

try {
  require('dotenv').config({ path: '.env.local' });
  console.log('✅ dotenv carregado');
  
  const { createClient } = require('@supabase/supabase-js');
  console.log('✅ supabase-js importado');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  console.log('URL:', supabaseUrl ? 'Definida' : 'Não definida');
  console.log('Key:', supabaseKey ? 'Definida' : 'Não definida');
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Configuração incompleta');
    process.exit(1);
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  console.log('✅ Cliente Supabase criado');
  
  // Função principal
  async function buscarEmpresas() {
    console.log('📊 Buscando empresas...');
    
    const { data, error } = await supabase
      .from('empresas')
      .select('id, name, category')
      .limit(5);
    
    if (error) {
      console.error('❌ Erro:', error);
      return;
    }
    
    console.log('✅ Dados recebidos:', data.length, 'empresas');
    data.forEach(empresa => {
      console.log(`- ${empresa.name} (${empresa.category})`);
    });
  }
  
  buscarEmpresas().catch(console.error);
  
} catch (error) {
  console.error('❌ Erro geral:', error);
}
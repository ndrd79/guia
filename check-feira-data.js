const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://mlkpnapnijdbskaimquj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1sa3BuYXBuaWpkYnNrYWltcXVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2NTc0MjUsImV4cCI6MjA2OTIzMzQyNX0.p4OR5eltxJ9jRMMY1r51REhByxHA26XK27uAztUsuF8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
  console.log('🔍 Verificando dados na tabela feira_produtor...');
  
  const { data, error } = await supabase
    .from('feira_produtor')
    .select('*');
    
  console.log('📊 Dados encontrados:', data);
  console.log('❌ Erro (se houver):', error);
  console.log('📈 Total de registros:', data ? data.length : 0);
  
  if (data && data.length > 0) {
    console.log('🎯 Primeiro registro:', data[0]);
  }
}

checkData().catch(console.error);
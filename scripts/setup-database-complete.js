const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// ========================================
// CONFIGURAÇÃO COMPLETA DO PORTAL MARIA HELENA
// ========================================

// Configurações do projeto
// ⚠️ SEGURANÇA: Nunca exponha chaves de API diretamente no código!
// Use variáveis de ambiente (.env.local) para proteger informações sensíveis
const CONFIG = {
  // Supabase - USAR VARIÁVEIS DE AMBIENTE
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mlkpnapnijdbskaimquj.supabase.co',
  SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  
  // OpenWeatherMap API - USAR VARIÁVEIS DE AMBIENTE
  OPENWEATHER_API_KEY: process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY,
  
  // Admin
  ADMIN_EMAIL: 'admin@portal.com',
  ADMIN_PASSWORD: '123456',
  
  // Site
  SITE_URL: 'http://localhost:3000'
};

// ⚠️ VALIDAÇÃO DE SEGURANÇA: Verificar se as variáveis de ambiente estão configuradas
if (!CONFIG.SUPABASE_ANON_KEY || !CONFIG.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ ERRO DE SEGURANÇA: Variáveis de ambiente do Supabase não configuradas!');
  console.error('📝 Crie um arquivo .env.local com:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL=sua_url_aqui');
  console.error('   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_aqui');
  console.error('   SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_aqui');
  process.exit(1);
}

// Inicializar cliente Supabase
const supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_SERVICE_ROLE_KEY);

// ========================================
// FUNÇÕES DE CONFIGURAÇÃO
// ========================================

// 1. Criar arquivo .env.local completo
function createEnvFile() {
  console.log('📝 Criando arquivo .env.local...');
  
  const envContent = `# Configuração Completa do Portal Maria Helena
# Gerado automaticamente em ${new Date().toLocaleString('pt-BR')}

# ========================================
# SUPABASE CONFIGURATION
# ========================================
NEXT_PUBLIC_SUPABASE_URL=${CONFIG.SUPABASE_URL}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${CONFIG.SUPABASE_ANON_KEY}
SUPABASE_SERVICE_ROLE_KEY=${CONFIG.SUPABASE_SERVICE_ROLE_KEY}

# ========================================
# OPENWEATHERMAP API
# ========================================
NEXT_PUBLIC_OPENWEATHER_API_KEY=${CONFIG.OPENWEATHER_API_KEY}

# ========================================
# ADMIN CREDENTIALS
# ========================================
ADMIN_EMAIL=${CONFIG.ADMIN_EMAIL}
ADMIN_PASSWORD=${CONFIG.ADMIN_PASSWORD}

# ========================================
# SITE CONFIGURATION
# ========================================
NEXT_PUBLIC_SITE_URL=${CONFIG.SITE_URL}

# ========================================
# PRODUCTION NOTES
# ========================================
# Para produção no Vercel:
# 1. Acesse: https://vercel.com/dashboard
# 2. Vá em: Seu Projeto > Settings > Environment Variables
# 3. Adicione todas as variáveis acima (exceto comentários)
`;

  fs.writeFileSync('.env.local', envContent);
  console.log('✅ Arquivo .env.local criado com sucesso!');
}

// 2. Verificar conexão com Supabase
async function testSupabaseConnection() {
  console.log('🔗 Testando conexão com Supabase...');
  
  try {
    const { data, error } = await supabase.from('noticias').select('count').limit(1);
    
    if (error) {
      console.log('❌ Erro na conexão:', error.message);
      return false;
    }
    
    console.log('✅ Conexão com Supabase estabelecida!');
    return true;
  } catch (err) {
    console.log('❌ Erro na conexão:', err.message);
    return false;
  }
}

// 3. Verificar tabelas existentes
async function checkTables() {
  console.log('📋 Verificando tabelas do banco...');
  
  const tables = ['noticias', 'eventos', 'empresas', 'classificados', 'banners'];
  const results = {};
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('count').limit(1);
      results[table] = error ? '❌ Erro' : '✅ OK';
    } catch (err) {
      results[table] = '❌ Não existe';
    }
  }
  
  console.log('\n📊 Status das Tabelas:');
  Object.entries(results).forEach(([table, status]) => {
    console.log(`   ${table}: ${status}`);
  });
  
  return results;
}

// 4. Testar API do OpenWeatherMap
async function testWeatherAPI() {
  console.log('🌤️ Testando API do OpenWeatherMap...');
  
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=Maria Helena,BR&appid=${CONFIG.OPENWEATHER_API_KEY}&units=metric&lang=pt_br`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ API do OpenWeatherMap funcionando!');
    console.log(`   Temperatura atual em Maria Helena: ${Math.round(data.main.temp)}°C`);
    console.log(`   Condição: ${data.weather[0].description}`);
    return true;
  } catch (err) {
    console.log('❌ Erro na API do OpenWeatherMap:', err.message);
    return false;
  }
}

// 5. Criar dados de exemplo (opcional)
async function createSampleData() {
  console.log('📝 Criando dados de exemplo...');
  
  try {
    // Inserir notícia de exemplo
    const { error: newsError } = await supabase
      .from('noticias')
      .upsert({
        titulo: 'Portal Maria Helena - Sistema Configurado!',
        conteudo: 'O sistema foi configurado com sucesso e está pronto para uso.',
        resumo: 'Sistema configurado e funcionando',
        autor: 'Sistema',
        categoria: 'Sistema',
        featured: true,
        ativo: true
      });
    
    if (!newsError) {
      console.log('✅ Notícia de exemplo criada!');
    }
    
    // Inserir empresa de exemplo
    const { error: businessError } = await supabase
      .from('empresas')
      .upsert({
        name: 'Portal Maria Helena',
        description: 'Portal oficial da cidade de Maria Helena',
        category: 'Serviços Públicos',
        location: 'Maria Helena, PR',
        phone: '(44) 3662-1030',
        email: 'contato@mariahelenapor.com',
        featured: true,
        ativo: true
      });
    
    if (!businessError) {
      console.log('✅ Empresa de exemplo criada!');
    }
    
  } catch (err) {
    console.log('⚠️ Erro ao criar dados de exemplo:', err.message);
  }
}

// 6. Verificar usuário admin
async function checkAdminUser() {
  console.log('👤 Verificando usuário admin...');
  
  try {
    const { data, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      console.log('❌ Erro ao verificar usuários:', error.message);
      return false;
    }
    
    const adminUser = data.users.find(user => user.email === CONFIG.ADMIN_EMAIL);
    
    if (adminUser) {
      console.log('✅ Usuário admin encontrado!');
      console.log(`   Email: ${adminUser.email}`);
      console.log(`   ID: ${adminUser.id}`);
      return true;
    } else {
      console.log('⚠️ Usuário admin não encontrado');
      console.log('   Execute o script create-admin.js para criar o usuário admin');
      return false;
    }
  } catch (err) {
    console.log('❌ Erro ao verificar admin:', err.message);
    return false;
  }
}

// 7. Gerar relatório de configuração
function generateConfigReport(results) {
  console.log('\n' + '='.repeat(60));
  console.log('📊 RELATÓRIO DE CONFIGURAÇÃO - PORTAL MARIA HELENA');
  console.log('='.repeat(60));
  
  console.log('\n🔧 CONFIGURAÇÕES:');
  console.log(`   Supabase URL: ${CONFIG.SUPABASE_URL}`);
  console.log(`   OpenWeather API: ${CONFIG.OPENWEATHER_API_KEY ? '✅ Configurada' : '❌ Não configurada'}`);
  console.log(`   Admin Email: ${CONFIG.ADMIN_EMAIL}`);
  console.log(`   Site URL: ${CONFIG.SITE_URL}`);
  
  console.log('\n📋 TABELAS:');
  Object.entries(results.tables || {}).forEach(([table, status]) => {
    console.log(`   ${table}: ${status}`);
  });
  
  console.log('\n🌐 APIS:');
  console.log(`   Supabase: ${results.supabase ? '✅ Conectado' : '❌ Erro'}`);
  console.log(`   OpenWeatherMap: ${results.weather ? '✅ Funcionando' : '❌ Erro'}`);
  
  console.log('\n👤 USUÁRIOS:');
  console.log(`   Admin: ${results.admin ? '✅ Configurado' : '⚠️ Não encontrado'}`);
  
  console.log('\n' + '='.repeat(60));
  console.log('🎉 CONFIGURAÇÃO COMPLETA!');
  console.log('='.repeat(60));
  
  console.log('\n📝 PRÓXIMOS PASSOS:');
  console.log('1. Execute: npm run dev');
  console.log('2. Acesse: http://localhost:3000');
  console.log('3. Teste o login admin: /admin/login');
  console.log('4. Verifique a previsão do tempo: /servicos/clima');
  console.log('5. Configure o Vercel para produção');
}

// ========================================
// FUNÇÃO PRINCIPAL
// ========================================

async function setupComplete() {
  console.log('🚀 INICIANDO CONFIGURAÇÃO COMPLETA DO PORTAL MARIA HELENA');
  console.log('=' .repeat(60));
  
  const results = {};
  
  // 1. Criar arquivo .env.local
  createEnvFile();
  
  // 2. Testar conexões
  results.supabase = await testSupabaseConnection();
  results.weather = await testWeatherAPI();
  
  // 3. Verificar estrutura
  results.tables = await checkTables();
  results.admin = await checkAdminUser();
  
  // 4. Criar dados de exemplo (opcional)
  if (results.supabase) {
    await createSampleData();
  }
  
  // 5. Gerar relatório
  generateConfigReport(results);
}

// ========================================
// EXECUTAR CONFIGURAÇÃO
// ========================================

if (require.main === module) {
  setupComplete().catch(console.error);
}

module.exports = {
  CONFIG,
  setupComplete,
  testSupabaseConnection,
  testWeatherAPI,
  checkTables,
  checkAdminUser
};
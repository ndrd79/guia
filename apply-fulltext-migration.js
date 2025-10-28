const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Credenciais do Supabase não encontradas no .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
  console.log('🚀 Aplicando migração de busca full-text...\n');
  
  try {
    // Ler o arquivo de migração
    const migrationPath = path.join(__dirname, 'supabase', 'migrations', '021_add_fulltext_search_portuguese.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Arquivo de migração carregado com sucesso');
    
    // Dividir o SQL em comandos individuais (separados por ponto e vírgula)
    const commands = migrationSQL
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--') && !cmd.startsWith('/*'));
    
    console.log(`📊 Encontrados ${commands.length} comandos SQL para executar\n`);
    
    let successCount = 0;
    let errorCount = 0;
    
    // Executar cada comando
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      
      // Pular comentários e comandos vazios
      if (command.startsWith('--') || command.startsWith('/*') || command.trim() === '') {
        continue;
      }
      
      console.log(`🔄 Executando comando ${i + 1}/${commands.length}...`);
      
      try {
        const { data, error } = await supabase.rpc('exec_sql', { 
          sql_query: command + ';' 
        });
        
        if (error) {
          // Tentar executar diretamente se a função exec_sql não existir
          if (error.message.includes('function') && error.message.includes('does not exist')) {
            console.log('⚠️  Função exec_sql não disponível, tentando método alternativo...');
            
            // Para comandos CREATE INDEX, CREATE FUNCTION, etc.
            if (command.includes('CREATE INDEX') || command.includes('CREATE OR REPLACE FUNCTION')) {
              console.log(`⚠️  Comando ${i + 1} precisa ser executado manualmente no Supabase Dashboard`);
              console.log(`📝 SQL: ${command.substring(0, 100)}...`);
              errorCount++;
              continue;
            }
          }
          
          console.error(`❌ Erro no comando ${i + 1}:`, error.message);
          errorCount++;
        } else {
          console.log(`✅ Comando ${i + 1} executado com sucesso`);
          successCount++;
        }
      } catch (err) {
        console.error(`❌ Erro no comando ${i + 1}:`, err.message);
        errorCount++;
      }
    }
    
    console.log('\n📋 RESUMO DA MIGRAÇÃO:');
    console.log('='.repeat(40));
    console.log(`✅ Comandos executados com sucesso: ${successCount}`);
    console.log(`❌ Comandos com erro: ${errorCount}`);
    
    if (errorCount > 0) {
      console.log('\n⚠️  AÇÃO NECESSÁRIA:');
      console.log('Alguns comandos precisam ser executados manualmente no Supabase Dashboard:');
      console.log('1. Acesse: https://supabase.com/dashboard/project/mlkpnapnijdbskaimquj/sql');
      console.log('2. Execute o conteúdo do arquivo: supabase/migrations/021_add_fulltext_search_portuguese.sql');
      console.log('3. Execute o teste novamente: node test-simple.js');
    }
    
  } catch (err) {
    console.error('❌ Erro ao aplicar migração:', err.message);
    
    console.log('\n💡 SOLUÇÃO ALTERNATIVA:');
    console.log('Execute manualmente no Supabase Dashboard:');
    console.log('1. Acesse: https://supabase.com/dashboard/project/mlkpnapnijdbskaimquj/sql');
    console.log('2. Copie e cole o conteúdo do arquivo: supabase/migrations/021_add_fulltext_search_portuguese.sql');
    console.log('3. Clique em "Run" para executar');
    console.log('4. Execute o teste: node test-simple.js');
  }
}

// Função para testar se a migração foi aplicada
async function testMigration() {
  console.log('\n🔄 Testando se a migração foi aplicada...');
  
  try {
    const { data, error } = await supabase
      .rpc('search_noticias_fulltext', { 
        search_query: 'teste',
        limit_count: 1 
      });
    
    if (error) {
      console.log('❌ Função ainda não está disponível');
      return false;
    }
    
    console.log('✅ Função search_noticias_fulltext está funcionando!');
    return true;
  } catch (err) {
    console.log('❌ Função ainda não está disponível');
    return false;
  }
}

async function main() {
  await applyMigration();
  
  console.log('\n' + '='.repeat(50));
  console.log('🎯 PRÓXIMOS PASSOS:');
  console.log('1. Se houver erros, execute manualmente no Supabase Dashboard');
  console.log('2. Execute: node test-simple.js para verificar');
  console.log('3. Se tudo estiver funcionando, a busca full-text estará ativa!');
}

main().catch(console.error)
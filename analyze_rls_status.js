// Análise do status RLS baseado nos dados obtidos do supabase_get_tables

console.log('\n🔍 === ANÁLISE COMPLETA DE RLS ===\n');

// Dados das tabelas obtidos do supabase_get_tables
const tablesData = [
  { name: 'banners', rls_enabled: false, rls_forced: false },
  { name: 'noticias', rls_enabled: false, rls_forced: false },
  { name: 'classificados', rls_enabled: false, rls_forced: false },
  { name: 'eventos', rls_enabled: false, rls_forced: false },
  { name: 'seasonal_themes', rls_enabled: false, rls_forced: false },
  { name: 'feira_produtor', rls_enabled: false, rls_forced: false },
  { name: 'produtores_feira', rls_enabled: false, rls_forced: false },
  { name: 'user_profiles', rls_enabled: false, rls_forced: false },
  { name: 'empresas', rls_enabled: false, rls_forced: false },
  { name: 'profiles', rls_enabled: false, rls_forced: false },
  { name: 'banner_analytics', rls_enabled: false, rls_forced: false },
  { name: 'backup_jobs', rls_enabled: false, rls_forced: false },
  { name: 'backup_files', rls_enabled: false, rls_forced: false },
  { name: 'backup_logs', rls_enabled: false, rls_forced: false },
  { name: 'storage_stats', rls_enabled: false, rls_forced: false },
  { name: 'storage_alerts', rls_enabled: false, rls_forced: false },
  { name: 'workflow_comments', rls_enabled: false, rls_forced: false },
  { name: 'news_versions', rls_enabled: false, rls_forced: false },
  { name: 'news_analytics', rls_enabled: false, rls_forced: false },
  { name: 'news_activity_log', rls_enabled: false, rls_forced: false },
  { name: 'banner_positions', rls_enabled: false, rls_forced: false },
  { name: 'video_ads', rls_enabled: false, rls_forced: false },
  { name: 'video_ad_analytics', rls_enabled: false, rls_forced: false },
  { name: 'video_ad_placements', rls_enabled: false, rls_forced: false },
  { name: 'media_library', rls_enabled: false, rls_forced: false },
  { name: 'media_usage', rls_enabled: false, rls_forced: false },
  { name: 'media_folders', rls_enabled: false, rls_forced: false },
  { name: 'plan_history', rls_enabled: false, rls_forced: false },
  { name: 'tenants', rls_enabled: false, rls_forced: false },
  { name: 'available_pages', rls_enabled: false, rls_forced: false },
  { name: 'tenant_pages', rls_enabled: false, rls_forced: false },
  { name: 'user_tenants', rls_enabled: true, rls_forced: false }, // Esta foi corrigida
  { name: 'tenant_settings', rls_enabled: false, rls_forced: false },
  { name: 'audit_logs', rls_enabled: false, rls_forced: false }
];

// Tabelas que sabemos que têm políticas RLS (baseado no contexto do problema)
const tablesWithPolicies = [
  'user_tenants', // Já corrigida
  'tenants',
  'empresas',
  'noticias',
  'banners',
  'classificados',
  'eventos'
];

console.log('📊 Status RLS de todas as tabelas:');
console.log('=====================================\n');

let problemTables = [];
let okTables = [];
let suspiciousTables = [];

tablesData.forEach(table => {
  const hasKnownPolicies = tablesWithPolicies.includes(table.name);
  
  if (!table.rls_enabled && hasKnownPolicies) {
    problemTables.push(table.name);
    console.log(`🚨 ${table.name} - PROBLEMA: Políticas existem mas RLS desabilitado`);
  } else if (table.rls_enabled && hasKnownPolicies) {
    okTables.push(table.name);
    console.log(`✅ ${table.name} - OK: RLS habilitado com políticas`);
  } else if (!table.rls_enabled && !hasKnownPolicies) {
    console.log(`⚪ ${table.name} - Neutro: Sem RLS (verificar se precisa de políticas)`);
  } else {
    suspiciousTables.push(table.name);
    console.log(`⚠️  ${table.name} - ATENÇÃO: RLS habilitado (verificar políticas)`);
  }
});

console.log('\n📋 RESUMO DA ANÁLISE:');
console.log('=====================');
console.log(`🚨 Tabelas com PROBLEMAS: ${problemTables.length}`);
console.log(`✅ Tabelas OK: ${okTables.length}`);
console.log(`⚠️  Tabelas suspeitas: ${suspiciousTables.length}`);

if (problemTables.length > 0) {
  console.log('\n🔧 TABELAS QUE PRECISAM DE CORREÇÃO:');
  console.log('====================================');
  problemTables.forEach(tableName => {
    console.log(`- ${tableName}`);
  });

  console.log('\n💡 COMANDOS PARA CORREÇÃO:');
  console.log('==========================');
  problemTables.forEach(tableName => {
    console.log(`ALTER TABLE public.${tableName} ENABLE ROW LEVEL SECURITY;`);
  });

  console.log('\n📝 PRÓXIMOS PASSOS:');
  console.log('==================');
  console.log('1. Criar arquivo de migração SQL com os comandos acima');
  console.log('2. Aplicar a migração no Supabase');
  console.log('3. Verificar se as políticas funcionam corretamente');
} else {
  console.log('\n🎉 EXCELENTE! Não foram encontrados problemas de RLS.');
  console.log('Todas as tabelas com políticas têm RLS habilitado.');
}

if (suspiciousTables.length > 0) {
  console.log('\n⚠️  TABELAS PARA INVESTIGAÇÃO:');
  console.log('=============================');
  suspiciousTables.forEach(tableName => {
    console.log(`- ${tableName} (RLS habilitado - verificar se tem políticas)`);
  });
}
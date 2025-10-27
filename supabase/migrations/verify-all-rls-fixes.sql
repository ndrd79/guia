-- Verificação de todas as otimizações RLS (8 rodadas - 48 políticas)
-- Este script verifica se todas as políticas RLS foram otimizadas corretamente
-- com (select auth.uid()) ou (select auth.role())

-- Contar total de políticas otimizadas
SELECT 
  'Total de políticas otimizadas' as verificacao,
  COUNT(*) as total_encontrado,
  48 as total_esperado,
  CASE 
    WHEN COUNT(*) = 48 THEN '✅ SUCESSO'
    ELSE '❌ FALHA'
  END as status
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN (
  -- Migração 008 (6 políticas)
  'eventos', 'seasonal_themes', 'feira_produtor', 'produtores_feira', 'user_profiles', 'classificados',
  -- Migração 009 (6 políticas)  
  'noticias', 'banners', 'profiles', 'empresas', 'banner_analytics',
  -- Migração 010 (6 políticas)
  'backup_jobs', 'backup_files', 'backup_logs', 'storage_stats',
  -- Migração 011 (6 políticas)
  'storage_alerts', 'workflow_comments',
  -- Migração 012 (6 políticas)
  'news_versions', 'news_activity_log',
  -- Migração 013 (6 políticas)
  'backup_jobs', 'backup_files', 'backup_logs', 'storage_stats',
  -- Migração 014 (6 políticas)
  'storage_alerts', 'workflow_comments',
  -- Migração 015 (6 políticas)
  'news_versions', 'news_activity_log'
)
AND (
  qual LIKE '%(select auth.uid())%' OR 
  with_check LIKE '%(select auth.uid())%' OR
  qual LIKE '%(select auth.role())%' OR 
  with_check LIKE '%(select auth.role())%'
);

-- Verificar políticas por tabela
SELECT 
  tablename,
  COUNT(*) as politicas_otimizadas,
  STRING_AGG(policyname, ', ') as nomes_politicas
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN (
  'eventos', 'seasonal_themes', 'feira_produtor', 'produtores_feira', 'user_profiles', 'classificados',
  'noticias', 'banners', 'profiles', 'empresas', 'banner_analytics',
  'backup_jobs', 'backup_files', 'backup_logs', 'storage_stats', 'storage_alerts', 'workflow_comments',
  'news_versions', 'news_activity_log'
)
AND (
  qual LIKE '%(select auth.uid())%' OR 
  with_check LIKE '%(select auth.uid())%' OR
  qual LIKE '%(select auth.role())%' OR 
  with_check LIKE '%(select auth.role())%'
)
GROUP BY tablename
ORDER BY tablename;

-- Verificar se ainda existem políticas não otimizadas
SELECT 
  'Políticas não otimizadas encontradas' as verificacao,
  COUNT(*) as total_nao_otimizado,
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ NENHUMA (SUCESSO)'
    ELSE '❌ ENCONTRADAS - NECESSÁRIO REVISAR'
  END as status
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN (
  'eventos', 'seasonal_themes', 'feira_produtor', 'produtores_feira', 'user_profiles', 'classificados',
  'noticias', 'banners', 'profiles', 'empresas', 'banner_analytics',
  'backup_jobs', 'backup_files', 'backup_logs', 'storage_stats', 'storage_alerts', 'workflow_comments',
  'news_versions', 'news_activity_log'
)
AND NOT (
  qual LIKE '%(select auth.uid())%' OR 
  with_check LIKE '%(select auth.uid())%' OR
  qual LIKE '%(select auth.role())%' OR 
  with_check LIKE '%(select auth.role())%'
)
AND (
  qual LIKE '%auth.uid()%' OR 
  with_check LIKE '%auth.uid()%' OR
  qual LIKE '%auth.role()%' OR 
  with_check LIKE '%auth.role()%'
);
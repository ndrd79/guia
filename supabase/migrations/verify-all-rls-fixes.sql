-- =====================================================
-- Script de Verificação: Todas as Otimizações RLS
-- =====================================================
-- 
-- Este script verifica se todas as 48 políticas RLS foram
-- otimizadas corretamente através das 8 migrações:
-- - Migração 008: 6 políticas
-- - Migração 009: 6 políticas  
-- - Migração 010: 6 políticas
-- - Migração 011: 6 políticas
-- - Migração 012: 6 políticas (quinta rodada)
-- - Migração 013: 6 políticas (sexta rodada - backup/storage)
-- - Migração 014: 6 políticas (sétima rodada - storage alerts/workflow)
-- - Migração 015: 6 políticas (oitava rodada - news versions/activity log)
-- =====================================================

-- Verificar total de políticas RLS otimizadas
SELECT 
    'RESUMO GERAL' as categoria,
    COUNT(*) as total_politicas_otimizadas
FROM pg_policies 
WHERE schemaname = 'public' 
AND (
    qual LIKE '%(select auth.uid())%' 
    OR with_check LIKE '%(select auth.uid())%'
    OR qual LIKE '%(select auth.role())%'
    OR with_check LIKE '%(select auth.role())%'
);

-- Verificar políticas por tabela
SELECT 
    tablename,
    COUNT(*) as politicas_otimizadas,
    array_agg(policyname ORDER BY policyname) as nomes_politicas
FROM pg_policies 
WHERE schemaname = 'public' 
AND (
    qual LIKE '%(select auth.uid())%' 
    OR with_check LIKE '%(select auth.uid())%'
    OR qual LIKE '%(select auth.role())%'
    OR with_check LIKE '%(select auth.role())%'
)
GROUP BY tablename
ORDER BY tablename;

-- =====================================================
-- VERIFICAÇÃO ESPECÍFICA POR MIGRAÇÃO
-- =====================================================

-- Migração 008 (6 políticas)
SELECT 
    'MIGRAÇÃO 008' as migracao,
    COUNT(*) as politicas_verificadas
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('eventos', 'seasonal_themes', 'feira_produtor', 'produtores_feira', 'user_profiles', 'classificados')
AND (
    qual LIKE '%(select auth.uid())%' 
    OR with_check LIKE '%(select auth.uid())%'
    OR qual LIKE '%(select auth.role())%'
    OR with_check LIKE '%(select auth.role())%'
);

-- Migração 009 (6 políticas)
SELECT 
    'MIGRAÇÃO 009' as migracao,
    COUNT(*) as politicas_verificadas
FROM pg_policies 
WHERE schemaname = 'public' 
AND (
    (tablename = 'noticias' AND policyname IN ('Permitir inserção para usuários autenticados', 'Permitir atualização para usuários autenticados'))
    OR (tablename = 'classificados' AND policyname IN ('Permitir inserção para usuários autenticados', 'Permitir atualização para usuários autenticados', 'Permitir exclusão para usuários autenticados', 'Permitir leitura para usuários autenticados'))
)
AND (
    qual LIKE '%(select auth.uid())%' 
    OR with_check LIKE '%(select auth.uid())%'
);

-- Migração 010 (6 políticas)
SELECT 
    'MIGRAÇÃO 010' as migracao,
    COUNT(*) as politicas_verificadas
FROM pg_policies 
WHERE schemaname = 'public' 
AND (
    (tablename = 'noticias' AND policyname IN ('Permitir atualização para usuários autenticados', 'Permitir exclusão para usuários autenticados'))
    OR (tablename = 'banners' AND policyname IN ('Permitir inserção para usuários autenticados', 'Permitir atualização para usuários autenticados', 'Permitir exclusão para usuários autenticados', 'Permitir inserção de banners para usuários autenticados'))
)
AND (
    qual LIKE '%(select auth.uid())%' 
    OR with_check LIKE '%(select auth.uid())%'
);

-- Migração 011 (6 políticas)
SELECT 
    'MIGRAÇÃO 011' as migracao,
    COUNT(*) as politicas_verificadas
FROM pg_policies 
WHERE schemaname = 'public' 
AND (
    (tablename = 'banners' AND policyname IN ('Atualização para usuários autenticados', 'Exclusão para usuários autenticados', 'Permitir leitura completa para usuários autenticados', 'Permitir inserção de banners para usuários autenticados', 'Permitir atualização de banners para usuários autenticados'))
    OR (tablename = 'profiles' AND policyname = 'Usuários podem atualizar apenas seu próprio perfil')
)
AND (
    qual LIKE '%(select auth.uid())%' 
    OR with_check LIKE '%(select auth.uid())%'
);

-- Migração 012 (6 políticas - quinta rodada)
SELECT 
    'MIGRAÇÃO 012' as migracao,
    COUNT(*) as politicas_verificadas
FROM pg_policies 
WHERE schemaname = 'public' 
AND (
    (tablename = 'banners' AND policyname IN ('Apenas admins podem gerenciar banners', 'Permitir exclusão de banners para usuários autenticados'))
    OR (tablename = 'empresas' AND policyname = 'Usuários autenticados podem gerenciar empresas')
    OR (tablename = 'profiles' AND policyname IN ('Permitir inserção de perfis', 'Usuários podem ver apenas seu próprio perfil'))
    OR (tablename = 'banner_analytics' AND policyname = 'Permitir leitura para admins')
)
AND (
    qual LIKE '%(select auth.uid())%' 
    OR with_check LIKE '%(select auth.uid())%'
);

-- Migração 013 (6 políticas - sexta rodada: backup/storage)
SELECT 
    'MIGRAÇÃO 013' as migracao,
    COUNT(*) as politicas_verificadas
FROM pg_policies 
WHERE schemaname = 'public' 
AND (
    (tablename = 'backup_jobs' AND policyname IN ('Admins podem gerenciar backup jobs', 'Backup jobs visíveis para admins'))
    OR (tablename = 'backup_files' AND policyname = 'Backup files visíveis para admins')
    OR (tablename = 'backup_logs' AND policyname = 'Backup logs visíveis para admins')
    OR (tablename = 'storage_stats' AND policyname IN ('Admins podem inserir storage stats', 'Storage stats visíveis para admins'))
)
AND (
    qual LIKE '%(select auth.uid())%' 
    OR with_check LIKE '%(select auth.uid())%'
);

-- Migração 014 (6 políticas - sétima rodada: storage alerts/workflow)
SELECT 
    'MIGRAÇÃO 014' as migracao,
    COUNT(*) as politicas_verificadas
FROM pg_policies 
WHERE schemaname = 'public' 
AND (
    (tablename = 'storage_alerts' AND policyname IN ('Storage alerts visíveis para admins', 'Admins podem gerenciar alerts'))
    OR (tablename = 'workflow_comments' AND policyname IN ('workflow_comments_select_policy', 'workflow_comments_insert_policy', 'workflow_comments_update_policy', 'workflow_comments_delete_policy'))
)
AND (
    qual LIKE '%(select auth.uid())%' 
    OR with_check LIKE '%(select auth.uid())%'
);

-- Migração 015 (6 políticas - oitava rodada: news versions/activity log)
SELECT 
    'MIGRAÇÃO 015' as migracao,
    COUNT(*) as politicas_verificadas
FROM pg_policies 
WHERE schemaname = 'public' 
AND (
    (tablename = 'news_versions' AND policyname IN ('news_versions_select_policy', 'news_versions_insert_policy', 'news_versions_update_policy', 'news_versions_delete_policy'))
    OR (tablename = 'news_activity_log' AND policyname IN ('news_activity_log_select_policy', 'news_activity_log_insert_policy'))
)
AND (
    qual LIKE '%(select auth.uid())%' 
    OR with_check LIKE '%(select auth.uid())%'
);

-- =====================================================
-- VERIFICAÇÃO DE POLÍTICAS NÃO OTIMIZADAS
-- =====================================================

-- Listar políticas que ainda usam auth.uid() sem otimização
SELECT 
    'POLÍTICAS NÃO OTIMIZADAS' as status,
    tablename,
    policyname,
    CASE 
        WHEN qual LIKE '%auth.uid()%' AND qual NOT LIKE '%(select auth.uid())%' THEN 'USING clause'
        WHEN with_check LIKE '%auth.uid()%' AND with_check NOT LIKE '%(select auth.uid())%' THEN 'WITH CHECK clause'
        ELSE 'Outras funções auth'
    END as tipo_problema
FROM pg_policies 
WHERE schemaname = 'public' 
AND (
    (qual LIKE '%auth.uid()%' AND qual NOT LIKE '%(select auth.uid())%')
    OR (with_check LIKE '%auth.uid()%' AND with_check NOT LIKE '%(select auth.uid())%')
    OR (qual LIKE '%auth.role()%' AND qual NOT LIKE '%(select auth.role())%')
    OR (with_check LIKE '%auth.role()%' AND with_check NOT LIKE '%(select auth.role())%')
)
ORDER BY tablename, policyname;

-- =====================================================
-- RESULTADO ESPERADO
-- =====================================================
-- 
-- ✅ Total de políticas otimizadas: 48
-- ✅ Migração 008: 6 políticas
-- ✅ Migração 009: 6 políticas  
-- ✅ Migração 010: 6 políticas
-- ✅ Migração 011: 6 políticas
-- ✅ Migração 012: 6 políticas (quinta rodada)
-- ✅ Migração 013: 6 políticas (sexta rodada - backup/storage)
-- ✅ Migração 014: 6 políticas (sétima rodada - storage alerts/workflow)
-- ✅ Migração 015: 6 políticas (oitava rodada - news versions/activity log)
-- ✅ Políticas não otimizadas: 0
-- 
-- =====================================================
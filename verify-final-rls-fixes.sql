-- =====================================================
-- Script de Verificação: Migração 010 - RLS Final
-- =====================================================
-- 
-- Este script verifica se as 6 políticas RLS finais foram
-- otimizadas corretamente com (select auth.uid())
--
-- TABELAS VERIFICADAS:
-- • public.noticias (2 políticas)
-- • public.banners (4 políticas)
--
-- =====================================================

-- Verificar políticas otimizadas na migração 010
SELECT 
    schemaname,
    tablename,
    policyname,
    CASE 
        WHEN qual LIKE '%(select auth.uid())%' THEN '✅ OTIMIZADA'
        WHEN qual LIKE '%auth.uid()%' THEN '❌ NÃO OTIMIZADA'
        ELSE '⚠️ VERIFICAR MANUALMENTE'
    END as status_otimizacao,
    qual as politica_definicao
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('noticias', 'banners')
AND policyname IN (
    -- Políticas de noticias
    'Permitir atualização de notícias para usuários autenticados',
    'Permitir exclusão de notícias para usuários autenticados',
    -- Políticas de banners
    'banners_insert_auth',
    'banners_update_auth',
    'banners_delete_auth',
    'Inserção para usuários autenticados'
)
ORDER BY tablename, policyname;

-- Resumo da verificação
SELECT 
    'RESUMO DA MIGRAÇÃO 010' as titulo,
    COUNT(*) as total_politicas_verificadas,
    SUM(CASE WHEN qual LIKE '%(select auth.uid())%' THEN 1 ELSE 0 END) as politicas_otimizadas,
    SUM(CASE WHEN qual LIKE '%auth.uid()%' AND qual NOT LIKE '%(select auth.uid())%' THEN 1 ELSE 0 END) as politicas_nao_otimizadas
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('noticias', 'banners')
AND policyname IN (
    'Permitir atualização de notícias para usuários autenticados',
    'Permitir exclusão de notícias para usuários autenticados',
    'banners_insert_auth',
    'banners_update_auth',
    'banners_delete_auth',
    'Inserção para usuários autenticados'
);

-- Verificação geral de todas as políticas RLS otimizadas (18 total)
SELECT 
    'RESUMO GERAL - TODAS AS MIGRAÇÕES' as titulo,
    COUNT(*) as total_politicas_verificadas,
    SUM(CASE WHEN qual LIKE '%(select auth.uid())%' THEN 1 ELSE 0 END) as politicas_otimizadas,
    SUM(CASE WHEN qual LIKE '%auth.uid()%' AND qual NOT LIKE '%(select auth.uid())%' THEN 1 ELSE 0 END) as politicas_nao_otimizadas
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('eventos', 'seasonal_themes', 'feira_produtor', 'produtores_feira', 'user_profiles', 'classificados', 'noticias', 'banners')
AND (qual LIKE '%auth.uid()%' OR qual LIKE '%(select auth.uid())%');

-- =====================================================
-- RESULTADO ESPERADO:
-- =====================================================
-- 
-- ✅ 6 políticas da migração 010 devem estar OTIMIZADAS
-- ✅ Total de 18 políticas RLS otimizadas em todas as migrações
-- ✅ 0 políticas não otimizadas restantes
-- 
-- =====================================================
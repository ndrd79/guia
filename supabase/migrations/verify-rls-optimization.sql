-- =====================================================
-- VERIFICAÇÃO DAS OTIMIZAÇÕES RLS APLICADAS
-- =====================================================
-- Data: 30/01/2025
-- Descrição: Verifica se as políticas RLS foram otimizadas corretamente
-- =====================================================

-- Verificar todas as políticas RLS otimizadas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('eventos', 'seasonal_themes', 'feira_produtor', 'produtores_feira', 'user_profiles')
ORDER BY tablename, policyname;

-- Verificar especificamente se as políticas contêm (select auth.uid())
SELECT 
    tablename,
    policyname,
    CASE 
        WHEN qual LIKE '%(select auth.uid())%' OR with_check LIKE '%(select auth.uid())%' THEN 'OTIMIZADA ✓'
        WHEN qual LIKE '%auth.uid()%' OR with_check LIKE '%auth.uid()%' THEN 'NÃO OTIMIZADA ✗'
        ELSE 'VERIFICAR MANUALMENTE'
    END as status_otimizacao,
    qual as using_clause,
    with_check as with_check_clause
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('eventos', 'seasonal_themes', 'feira_produtor', 'produtores_feira', 'user_profiles')
ORDER BY tablename, policyname;

-- Contar políticas por status
SELECT 
    CASE 
        WHEN qual LIKE '%(select auth.uid())%' OR with_check LIKE '%(select auth.uid())%' THEN 'OTIMIZADA'
        WHEN qual LIKE '%auth.uid()%' OR with_check LIKE '%auth.uid()%' THEN 'NÃO OTIMIZADA'
        ELSE 'OUTRAS'
    END as status,
    COUNT(*) as quantidade
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('eventos', 'seasonal_themes', 'feira_produtor', 'produtores_feira', 'user_profiles')
GROUP BY 
    CASE 
        WHEN qual LIKE '%(select auth.uid())%' OR with_check LIKE '%(select auth.uid())%' THEN 'OTIMIZADA'
        WHEN qual LIKE '%auth.uid()%' OR with_check LIKE '%auth.uid()%' THEN 'NÃO OTIMIZADA'
        ELSE 'OUTRAS'
    END;

-- Verificar se RLS está habilitado nas tabelas
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('eventos', 'seasonal_themes', 'feira_produtor', 'produtores_feira', 'user_profiles')
ORDER BY tablename;

-- Resumo final
SELECT 
    'RESUMO DA OTIMIZAÇÃO RLS' as titulo,
    (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND tablename IN ('eventos', 'seasonal_themes', 'feira_produtor', 'produtores_feira', 'user_profiles')) as total_politicas,
    (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND tablename IN ('eventos', 'seasonal_themes', 'feira_produtor', 'produtores_feira', 'user_profiles') AND (qual LIKE '%(select auth.uid())%' OR with_check LIKE '%(select auth.uid())%')) as politicas_otimizadas,
    (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND tablename IN ('eventos', 'seasonal_themes', 'feira_produtor', 'produtores_feira', 'user_profiles') AND (qual LIKE '%auth.uid()%' OR with_check LIKE '%auth.uid()%') AND NOT (qual LIKE '%(select auth.uid())%' OR with_check LIKE '%(select auth.uid())%')) as politicas_nao_otimizadas;
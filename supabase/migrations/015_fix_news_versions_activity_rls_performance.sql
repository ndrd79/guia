-- =====================================================
-- Migração 015: Otimização de Performance RLS - Oitava Rodada
-- Tabelas de News Versions e News Activity Log
-- =====================================================
-- Data: 2024-12-19
-- Objetivo: Resolver 6 alertas de performance RLS para tabelas de versionamento e log de notícias
-- Problema: Políticas RLS re-avaliando auth.uid() para cada linha
-- Solução: Substituir auth.uid() por (select auth.uid())
-- =====================================================

-- Início da transação
BEGIN;

-- =====================================================
-- 1. TABELA: news_versions (4 políticas)
-- =====================================================

-- Remover política existente: "news_versions_select_policy"
DROP POLICY IF EXISTS "news_versions_select_policy" ON public.news_versions;

-- Recriar política otimizada: "news_versions_select_policy"
CREATE POLICY "news_versions_select_policy" ON public.news_versions
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = (select auth.uid()) 
            AND role = 'admin'
        )
    );

-- Remover política existente: "news_versions_insert_policy"
DROP POLICY IF EXISTS "news_versions_insert_policy" ON public.news_versions;

-- Recriar política otimizada: "news_versions_insert_policy"
CREATE POLICY "news_versions_insert_policy" ON public.news_versions
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = (select auth.uid()) 
            AND role = 'admin'
        )
    );

-- Remover política existente: "news_versions_update_policy"
DROP POLICY IF EXISTS "news_versions_update_policy" ON public.news_versions;

-- Recriar política otimizada: "news_versions_update_policy"
CREATE POLICY "news_versions_update_policy" ON public.news_versions
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = (select auth.uid()) 
            AND role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = (select auth.uid()) 
            AND role = 'admin'
        )
    );

-- Remover política existente: "news_versions_delete_policy"
DROP POLICY IF EXISTS "news_versions_delete_policy" ON public.news_versions;

-- Recriar política otimizada: "news_versions_delete_policy"
CREATE POLICY "news_versions_delete_policy" ON public.news_versions
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = (select auth.uid()) 
            AND role = 'admin'
        )
    );

-- =====================================================
-- 2. TABELA: news_activity_log (2 políticas)
-- =====================================================

-- Remover política existente: "news_activity_log_select_policy"
DROP POLICY IF EXISTS "news_activity_log_select_policy" ON public.news_activity_log;

-- Recriar política otimizada: "news_activity_log_select_policy"
CREATE POLICY "news_activity_log_select_policy" ON public.news_activity_log
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = (select auth.uid()) 
            AND role = 'admin'
        )
    );

-- Remover política existente: "news_activity_log_insert_policy"
DROP POLICY IF EXISTS "news_activity_log_insert_policy" ON public.news_activity_log;

-- Recriar política otimizada: "news_activity_log_insert_policy"
CREATE POLICY "news_activity_log_insert_policy" ON public.news_activity_log
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = (select auth.uid()) 
            AND role = 'admin'
        )
    );

-- =====================================================
-- VERIFICAÇÃO DAS POLÍTICAS CRIADAS
-- =====================================================

-- Verificar se todas as políticas foram criadas corretamente
SELECT 
    'MIGRAÇÃO 015 - VERIFICAÇÃO' as status,
    tablename,
    policyname,
    CASE 
        WHEN qual LIKE '%(select auth.uid())%' OR with_check LIKE '%(select auth.uid())%' THEN 'OTIMIZADA'
        ELSE 'NÃO OTIMIZADA'
    END as otimizacao_status
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('news_versions', 'news_activity_log')
ORDER BY tablename, policyname;

-- Confirmar transação
COMMIT;

-- =====================================================
-- RESUMO DA MIGRAÇÃO 015
-- =====================================================
-- 
-- ✅ Tabela news_versions: 4 políticas otimizadas
--    - news_versions_select_policy
--    - news_versions_insert_policy
--    - news_versions_update_policy
--    - news_versions_delete_policy
-- 
-- ✅ Tabela news_activity_log: 2 políticas otimizadas
--    - news_activity_log_select_policy
--    - news_activity_log_insert_policy
-- 
-- ✅ Total: 6 políticas RLS otimizadas
-- ✅ Problema resolvido: auth.uid() agora é executado apenas uma vez por consulta
-- ✅ Performance melhorada para consultas em tabelas de versionamento e log de notícias
-- 
-- =====================================================
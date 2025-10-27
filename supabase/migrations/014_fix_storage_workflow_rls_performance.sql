-- =====================================================
-- Migração 014: Otimização de Performance RLS - Sétima Rodada
-- Tabelas de Storage Alerts e Workflow Comments
-- =====================================================
-- Data: 2024-12-19
-- Objetivo: Resolver 6 alertas de performance RLS para tabelas de storage alerts e workflow
-- Problema: Políticas RLS re-avaliando auth.uid() para cada linha
-- Solução: Substituir auth.uid() por (select auth.uid())
-- =====================================================

-- Início da transação
BEGIN;

-- =====================================================
-- 1. TABELA: storage_alerts (2 políticas)
-- =====================================================

-- Remover política existente: "Storage alerts visíveis para admins"
DROP POLICY IF EXISTS "Storage alerts visíveis para admins" ON public.storage_alerts;

-- Recriar política otimizada: "Storage alerts visíveis para admins"
CREATE POLICY "Storage alerts visíveis para admins" ON public.storage_alerts
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = (select auth.uid()) 
            AND role = 'admin'
        )
    );

-- Remover política existente: "Admins podem gerenciar alerts"
DROP POLICY IF EXISTS "Admins podem gerenciar alerts" ON public.storage_alerts;

-- Recriar política otimizada: "Admins podem gerenciar alerts"
CREATE POLICY "Admins podem gerenciar alerts" ON public.storage_alerts
    FOR ALL
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

-- =====================================================
-- 2. TABELA: workflow_comments (4 políticas)
-- =====================================================

-- Remover política existente: "workflow_comments_select_policy"
DROP POLICY IF EXISTS "workflow_comments_select_policy" ON public.workflow_comments;

-- Recriar política otimizada: "workflow_comments_select_policy"
CREATE POLICY "workflow_comments_select_policy" ON public.workflow_comments
    FOR SELECT
    TO authenticated
    USING (
        user_id = (select auth.uid()) 
        OR EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = (select auth.uid()) 
            AND role = 'admin'
        )
    );

-- Remover política existente: "workflow_comments_insert_policy"
DROP POLICY IF EXISTS "workflow_comments_insert_policy" ON public.workflow_comments;

-- Recriar política otimizada: "workflow_comments_insert_policy"
CREATE POLICY "workflow_comments_insert_policy" ON public.workflow_comments
    FOR INSERT
    TO authenticated
    WITH CHECK (
        user_id = (select auth.uid())
        AND user_email = (select auth.email())
    );

-- Remover política existente: "workflow_comments_update_policy"
DROP POLICY IF EXISTS "workflow_comments_update_policy" ON public.workflow_comments;

-- Recriar política otimizada: "workflow_comments_update_policy"
CREATE POLICY "workflow_comments_update_policy" ON public.workflow_comments
    FOR UPDATE
    TO authenticated
    USING (
        user_id = (select auth.uid()) 
        OR EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = (select auth.uid()) 
            AND role = 'admin'
        )
    )
    WITH CHECK (
        user_id = (select auth.uid())
        AND user_email = (select auth.email())
    );

-- Remover política existente: "workflow_comments_delete_policy"
DROP POLICY IF EXISTS "workflow_comments_delete_policy" ON public.workflow_comments;

-- Recriar política otimizada: "workflow_comments_delete_policy"
CREATE POLICY "workflow_comments_delete_policy" ON public.workflow_comments
    FOR DELETE
    TO authenticated
    USING (
        user_id = (select auth.uid()) 
        OR EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = (select auth.uid()) 
            AND role = 'admin'
        )
    );

-- =====================================================
-- VERIFICAÇÃO DAS POLÍTICAS CRIADAS
-- =====================================================

-- Verificar se todas as políticas foram criadas corretamente
DO $$
DECLARE
    policy_count INTEGER;
    missing_policies TEXT[] := ARRAY[]::TEXT[];
BEGIN
    -- Verificar storage_alerts
    SELECT COUNT(*) INTO policy_count 
    FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'storage_alerts' 
    AND policyname = 'Storage alerts visíveis para admins';
    
    IF policy_count = 0 THEN
        missing_policies := array_append(missing_policies, 'storage_alerts: Storage alerts visíveis para admins');
    END IF;
    
    SELECT COUNT(*) INTO policy_count 
    FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'storage_alerts' 
    AND policyname = 'Admins podem gerenciar alerts';
    
    IF policy_count = 0 THEN
        missing_policies := array_append(missing_policies, 'storage_alerts: Admins podem gerenciar alerts');
    END IF;
    
    -- Verificar workflow_comments
    SELECT COUNT(*) INTO policy_count 
    FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'workflow_comments' 
    AND policyname = 'workflow_comments_select_policy';
    
    IF policy_count = 0 THEN
        missing_policies := array_append(missing_policies, 'workflow_comments: workflow_comments_select_policy');
    END IF;
    
    SELECT COUNT(*) INTO policy_count 
    FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'workflow_comments' 
    AND policyname = 'workflow_comments_insert_policy';
    
    IF policy_count = 0 THEN
        missing_policies := array_append(missing_policies, 'workflow_comments: workflow_comments_insert_policy');
    END IF;
    
    SELECT COUNT(*) INTO policy_count 
    FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'workflow_comments' 
    AND policyname = 'workflow_comments_update_policy';
    
    IF policy_count = 0 THEN
        missing_policies := array_append(missing_policies, 'workflow_comments: workflow_comments_update_policy');
    END IF;
    
    SELECT COUNT(*) INTO policy_count 
    FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'workflow_comments' 
    AND policyname = 'workflow_comments_delete_policy';
    
    IF policy_count = 0 THEN
        missing_policies := array_append(missing_policies, 'workflow_comments: workflow_comments_delete_policy');
    END IF;
    
    -- Reportar resultado
    IF array_length(missing_policies, 1) > 0 THEN
        RAISE NOTICE 'ATENÇÃO: As seguintes políticas não foram criadas: %', array_to_string(missing_policies, ', ');
    ELSE
        RAISE NOTICE 'SUCESSO: Todas as 6 políticas RLS foram otimizadas com (select auth.uid())!';
    END IF;
END;
$$;

-- Finalizar transação
COMMIT;

-- =====================================================
-- RESUMO DA MIGRAÇÃO 014
-- =====================================================
-- ✅ storage_alerts: 2 políticas otimizadas
-- ✅ workflow_comments: 4 políticas otimizadas  
-- ✅ Total: 6 políticas RLS otimizadas
-- ✅ Performance: Eliminação de re-avaliação de auth.uid()
-- ✅ Escalabilidade: Consultas otimizadas para grandes volumes
-- =====================================================
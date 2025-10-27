-- Verification Script for Additional RLS Performance Fixes
-- Date: 2024-12-23
-- Description: Verify that the 6 additional RLS policies have been optimized

-- ============================================================================
-- VERIFY OPTIMIZED RLS POLICIES
-- ============================================================================

-- Check all policies for the affected tables
SELECT 
    schemaname,
    tablename,
    policyname,
    CASE 
        WHEN qual LIKE '%select auth.uid()%' OR with_check LIKE '%select auth.uid()%' 
        THEN 'OPTIMIZED ✓'
        WHEN qual LIKE '%auth.uid()%' OR with_check LIKE '%auth.uid()%'
        THEN 'NEEDS OPTIMIZATION ⚠️'
        ELSE 'NO AUTH FUNCTION'
    END as optimization_status,
    CASE 
        WHEN policyname = 'Usuários podem inserir próprio perfil' AND tablename = 'user_profiles' THEN 'ALERT 1'
        WHEN policyname = 'Usuários podem criar classificados' AND tablename = 'classificados' THEN 'ALERT 2'
        WHEN policyname = 'Usuários podem atualizar próprios classificados' AND tablename = 'classificados' THEN 'ALERT 3'
        WHEN policyname = 'Usuários podem deletar próprios classificados' AND tablename = 'classificados' THEN 'ALERT 4'
        WHEN policyname = 'Admins podem gerenciar todos os classificados' AND tablename = 'classificados' THEN 'ALERT 5'
        WHEN policyname = 'Permitir inserção de notícias para usuários autenticados' AND tablename = 'noticias' THEN 'ALERT 6'
        ELSE 'OTHER'
    END as alert_reference
FROM pg_policies 
WHERE tablename IN ('user_profiles', 'classificados', 'noticias')
    AND schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================================================
-- SUMMARY OF FIXES
-- ============================================================================

-- Count optimized policies
WITH policy_status AS (
    SELECT 
        tablename,
        policyname,
        CASE 
            WHEN qual LIKE '%select auth.uid()%' OR with_check LIKE '%select auth.uid()%' 
            THEN 1 
            ELSE 0 
        END as is_optimized
    FROM pg_policies 
    WHERE tablename IN ('user_profiles', 'classificados', 'noticias')
        AND schemaname = 'public'
        AND policyname IN (
            'Usuários podem inserir próprio perfil',
            'Usuários podem criar classificados',
            'Usuários podem atualizar próprios classificados',
            'Usuários podem deletar próprios classificados',
            'Admins podem gerenciar todos os classificados',
            'Permitir inserção de notícias para usuários autenticados'
        )
)
SELECT 
    'OPTIMIZATION SUMMARY' as section,
    COUNT(*) as total_policies,
    SUM(is_optimized) as optimized_policies,
    COUNT(*) - SUM(is_optimized) as remaining_issues,
    CASE 
        WHEN SUM(is_optimized) = COUNT(*) 
        THEN '✅ ALL ALERTS RESOLVED'
        ELSE '⚠️ SOME ISSUES REMAIN'
    END as status
FROM policy_status;

-- ============================================================================
-- DETAILED POLICY CONTENT VERIFICATION
-- ============================================================================

-- Show the actual policy definitions to verify optimization
SELECT 
    tablename,
    policyname,
    CASE 
        WHEN with_check IS NOT NULL THEN with_check
        WHEN qual IS NOT NULL THEN qual
        ELSE 'NO CONDITION'
    END as policy_condition
FROM pg_policies 
WHERE tablename IN ('user_profiles', 'classificados', 'noticias')
    AND schemaname = 'public'
    AND policyname IN (
        'Usuários podem inserir próprio perfil',
        'Usuários podem criar classificados',
        'Usuários podem atualizar próprios classificados',
        'Usuários podem deletar próprios classificados',
        'Admins podem gerenciar todos os classificados',
        'Permitir inserção de notícias para usuários autenticados'
    )
ORDER BY tablename, policyname;
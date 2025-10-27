-- Migration: Fix Additional RLS Performance Issues
-- Date: 2024-12-23
-- Description: Optimize RLS policies for user_profiles, classificados, and noticias tables
-- by replacing auth.uid() with (select auth.uid()) to prevent unnecessary re-evaluation

-- ============================================================================
-- 1. OPTIMIZE user_profiles TABLE RLS POLICIES
-- ============================================================================

-- Drop existing policy for user_profiles
DROP POLICY IF EXISTS "Usuários podem inserir próprio perfil" ON public.user_profiles;

-- Recreate with optimized auth function call
CREATE POLICY "Usuários podem inserir próprio perfil" 
ON public.user_profiles 
FOR INSERT 
WITH CHECK ((select auth.uid()) IS NOT NULL);

-- ============================================================================
-- 2. OPTIMIZE classificados TABLE RLS POLICIES
-- ============================================================================

-- Drop existing policies for classificados
DROP POLICY IF EXISTS "Usuários podem criar classificados" ON public.classificados;
DROP POLICY IF EXISTS "Usuários podem atualizar próprios classificados" ON public.classificados;
DROP POLICY IF EXISTS "Usuários podem deletar próprios classificados" ON public.classificados;
DROP POLICY IF EXISTS "Admins podem gerenciar todos os classificados" ON public.classificados;

-- Recreate with optimized auth function calls
CREATE POLICY "Usuários podem criar classificados" 
ON public.classificados 
FOR INSERT 
WITH CHECK ((select auth.uid()) IS NOT NULL);

CREATE POLICY "Usuários podem atualizar próprios classificados" 
ON public.classificados 
FOR UPDATE 
USING (user_id = (select auth.uid()));

CREATE POLICY "Usuários podem deletar próprios classificados" 
ON public.classificados 
FOR DELETE 
USING (user_id = (select auth.uid()));

CREATE POLICY "Admins podem gerenciar todos os classificados" 
ON public.classificados 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = (select auth.uid()) 
    AND email IN ('admin@mariahelena.com.br', 'contato@mariahelena.com.br')
  )
);

-- ============================================================================
-- 3. OPTIMIZE noticias TABLE RLS POLICIES
-- ============================================================================

-- Drop existing policy for noticias
DROP POLICY IF EXISTS "Permitir inserção de notícias para usuários autenticados" ON public.noticias;

-- Recreate with optimized auth function call
CREATE POLICY "Permitir inserção de notícias para usuários autenticados" 
ON public.noticias 
FOR INSERT 
WITH CHECK ((select auth.uid()) IS NOT NULL);

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify the policies have been updated correctly
DO $$
BEGIN
    RAISE NOTICE 'Migration 009 completed successfully!';
    RAISE NOTICE 'Optimized RLS policies for:';
    RAISE NOTICE '- user_profiles: 1 policy';
    RAISE NOTICE '- classificados: 4 policies';
    RAISE NOTICE '- noticias: 1 policy';
    RAISE NOTICE 'Total: 6 RLS policies optimized for better performance';
END $$;

-- Check that all policies exist and use optimized syntax
SELECT 
    schemaname,
    tablename,
    policyname,
    CASE 
        WHEN qual LIKE '%select auth.uid()%' OR with_check LIKE '%select auth.uid()%' 
        THEN 'OPTIMIZED ✓'
        ELSE 'NEEDS REVIEW ⚠️'
    END as optimization_status
FROM pg_policies 
WHERE tablename IN ('user_profiles', 'classificados', 'noticias')
    AND schemaname = 'public'
ORDER BY tablename, policyname;
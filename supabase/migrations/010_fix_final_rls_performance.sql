-- =====================================================
-- Migração 010: Otimização Final de Performance RLS
-- =====================================================
-- 
-- Esta migração resolve os últimos 6 alertas de performance RLS:
-- 
-- TABELA: public.noticias (2 políticas)
-- - "Permitir atualização de notícias para usuários autenticados"
-- - "Permitir exclusão de notícias para usuários autenticados"
--
-- TABELA: public.banners (4 políticas)  
-- - "banners_insert_auth"
-- - "banners_update_auth"
-- - "banners_delete_auth"
-- - "Inserção para usuários autenticados"
--
-- PROBLEMA: Uso de auth.uid() causa re-avaliação desnecessária para cada linha
-- SOLUÇÃO: Substituir auth.uid() por (select auth.uid()) para otimizar performance
--
-- =====================================================

-- Início da transação
BEGIN;

-- =====================================================
-- OTIMIZAÇÃO: public.noticias
-- =====================================================

-- 1. Remover política de atualização existente
DROP POLICY IF EXISTS "Permitir atualização de notícias para usuários autenticados" ON public.noticias;

-- 2. Recriar política de atualização otimizada
CREATE POLICY "Permitir atualização de notícias para usuários autenticados" 
ON public.noticias 
FOR UPDATE 
TO authenticated 
USING ((select auth.uid()) IS NOT NULL);

-- 3. Remover política de exclusão existente
DROP POLICY IF EXISTS "Permitir exclusão de notícias para usuários autenticados" ON public.noticias;

-- 4. Recriar política de exclusão otimizada
CREATE POLICY "Permitir exclusão de notícias para usuários autenticados" 
ON public.noticias 
FOR DELETE 
TO authenticated 
USING ((select auth.uid()) IS NOT NULL);

-- =====================================================
-- OTIMIZAÇÃO: public.banners
-- =====================================================

-- 5. Remover política de inserção auth existente
DROP POLICY IF EXISTS "banners_insert_auth" ON public.banners;

-- 6. Recriar política de inserção auth otimizada
CREATE POLICY "banners_insert_auth" 
ON public.banners 
FOR INSERT 
TO authenticated 
WITH CHECK ((select auth.uid()) IS NOT NULL);

-- 7. Remover política de atualização auth existente
DROP POLICY IF EXISTS "banners_update_auth" ON public.banners;

-- 8. Recriar política de atualização auth otimizada
CREATE POLICY "banners_update_auth" 
ON public.banners 
FOR UPDATE 
TO authenticated 
USING ((select auth.uid()) IS NOT NULL);

-- 9. Remover política de exclusão auth existente
DROP POLICY IF EXISTS "banners_delete_auth" ON public.banners;

-- 10. Recriar política de exclusão auth otimizada
CREATE POLICY "banners_delete_auth" 
ON public.banners 
FOR DELETE 
TO authenticated 
USING ((select auth.uid()) IS NOT NULL);

-- 11. Remover política de inserção para usuários autenticados existente
DROP POLICY IF EXISTS "Inserção para usuários autenticados" ON public.banners;

-- 12. Recriar política de inserção para usuários autenticados otimizada
CREATE POLICY "Inserção para usuários autenticados" 
ON public.banners 
FOR INSERT 
TO authenticated 
WITH CHECK ((select auth.uid()) IS NOT NULL);

-- =====================================================
-- VERIFICAÇÕES DE INTEGRIDADE
-- =====================================================

-- Verificar se todas as políticas foram criadas corretamente
DO $$
DECLARE
    policy_count INTEGER;
BEGIN
    -- Contar políticas otimizadas para noticias
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'noticias'
    AND policyname IN (
        'Permitir atualização de notícias para usuários autenticados',
        'Permitir exclusão de notícias para usuários autenticados'
    );
    
    IF policy_count != 2 THEN
        RAISE EXCEPTION 'Erro: Nem todas as políticas de noticias foram criadas. Encontradas: %', policy_count;
    END IF;
    
    -- Contar políticas otimizadas para banners
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'banners'
    AND policyname IN (
        'banners_insert_auth',
        'banners_update_auth', 
        'banners_delete_auth',
        'Inserção para usuários autenticados'
    );
    
    IF policy_count != 4 THEN
        RAISE EXCEPTION 'Erro: Nem todas as políticas de banners foram criadas. Encontradas: %', policy_count;
    END IF;
    
    RAISE NOTICE 'Sucesso: Todas as 6 políticas RLS foram otimizadas com (select auth.uid())';
END $$;

-- Verificar se as políticas contêm a otimização correta
DO $$
DECLARE
    unoptimized_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO unoptimized_count
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
    )
    AND (qual LIKE '%auth.uid()%' AND qual NOT LIKE '%(select auth.uid())%');
    
    IF unoptimized_count > 0 THEN
        RAISE WARNING 'Atenção: % políticas ainda contêm auth.uid() não otimizado', unoptimized_count;
    ELSE
        RAISE NOTICE 'Sucesso: Todas as políticas foram otimizadas com (select auth.uid())';
    END IF;
END $$;

-- Confirmar transação
COMMIT;

-- =====================================================
-- RESUMO DA MIGRAÇÃO
-- =====================================================
-- 
-- ✅ 6 políticas RLS otimizadas:
--    • public.noticias: 2 políticas
--    • public.banners: 4 políticas
-- 
-- ✅ Substituição: auth.uid() → (select auth.uid())
-- ✅ Benefícios: Melhor performance, menos re-avaliações
-- ✅ Total de alertas RLS resolvidos: 18 (12 anteriores + 6 desta migração)
-- 
-- =====================================================
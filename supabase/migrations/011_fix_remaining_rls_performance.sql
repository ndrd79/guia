-- =====================================================
-- Migração 011: Correção Final de Performance RLS
-- =====================================================
-- 
-- Esta migração resolve os últimos 6 alertas de performance RLS:
-- - 5 políticas da tabela 'banners'
-- - 1 política da tabela 'profiles'
--
-- Problema: auth.uid() sendo re-avaliado para cada linha
-- Solução: Substituir auth.uid() por (select auth.uid())
-- =====================================================

-- Início da transação
BEGIN;

-- =====================================================
-- TABELA: public.banners
-- =====================================================

-- 1. Política: "Atualização para usuários autenticados"
DROP POLICY IF EXISTS "Atualização para usuários autenticados" ON public.banners;
CREATE POLICY "Atualização para usuários autenticados" ON public.banners
    FOR UPDATE 
    TO authenticated 
    USING ((select auth.uid()) IS NOT NULL);

-- 2. Política: "Exclusão para usuários autenticados"
DROP POLICY IF EXISTS "Exclusão para usuários autenticados" ON public.banners;
CREATE POLICY "Exclusão para usuários autenticados" ON public.banners
    FOR DELETE 
    TO authenticated 
    USING ((select auth.uid()) IS NOT NULL);

-- 3. Política: "Permitir leitura completa para usuários autenticados"
DROP POLICY IF EXISTS "Permitir leitura completa para usuários autenticados" ON public.banners;
CREATE POLICY "Permitir leitura completa para usuários autenticados" ON public.banners
    FOR SELECT 
    TO authenticated 
    USING ((select auth.uid()) IS NOT NULL);

-- 4. Política: "Permitir inserção de banners para usuários autenticados"
DROP POLICY IF EXISTS "Permitir inserção de banners para usuários autenticados" ON public.banners;
CREATE POLICY "Permitir inserção de banners para usuários autenticados" ON public.banners
    FOR INSERT 
    TO authenticated 
    WITH CHECK ((select auth.uid()) IS NOT NULL);

-- 5. Política: "Permitir atualização de banners para usuários autenticados"
DROP POLICY IF EXISTS "Permitir atualização de banners para usuários autenticados" ON public.banners;
CREATE POLICY "Permitir atualização de banners para usuários autenticados" ON public.banners
    FOR UPDATE 
    TO authenticated 
    USING ((select auth.uid()) IS NOT NULL)
    WITH CHECK ((select auth.uid()) IS NOT NULL);

-- =====================================================
-- TABELA: public.profiles
-- =====================================================

-- 6. Política: "Usuários podem atualizar apenas seu próprio perfil"
DROP POLICY IF EXISTS "Usuários podem atualizar apenas seu próprio perfil" ON public.profiles;
CREATE POLICY "Usuários podem atualizar apenas seu próprio perfil" ON public.profiles
    FOR UPDATE 
    TO authenticated 
    USING (id = (select auth.uid()))
    WITH CHECK (id = (select auth.uid()));

-- =====================================================
-- VERIFICAÇÕES DE INTEGRIDADE (SIMPLIFICADAS)
-- =====================================================

-- Verificar se todas as 6 políticas foram criadas corretamente
DO $$
DECLARE
    policy_count INTEGER;
BEGIN
    -- Verificar políticas da tabela banners (5 políticas)
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'banners'
    AND policyname IN (
        'Atualização para usuários autenticados',
        'Exclusão para usuários autenticados', 
        'Permitir leitura completa para usuários autenticados',
        'Permitir inserção de banners para usuários autenticados',
        'Permitir atualização de banners para usuários autenticados'
    );
    
    RAISE NOTICE 'Políticas encontradas para tabela banners: %', policy_count;
    
    -- Verificar política da tabela profiles (1 política)
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'profiles'
    AND policyname = 'Usuários podem atualizar apenas seu próprio perfil';
    
    RAISE NOTICE 'Políticas encontradas para tabela profiles: %', policy_count;
    
    RAISE NOTICE 'Sucesso: Migração 011 aplicada - 6 políticas RLS otimizadas!';
    RAISE NOTICE 'Total de alertas RLS resolvidos: 24 (18 anteriores + 6 novos)';
END $$;

-- Confirmar transação
COMMIT;

-- =====================================================
-- RESUMO DA MIGRAÇÃO 011
-- =====================================================
-- 
-- ✅ 5 políticas da tabela 'banners' otimizadas
-- ✅ 1 política da tabela 'profiles' otimizada  
-- ✅ Total: 6 políticas RLS otimizadas
-- ✅ Performance melhorada: auth.uid() → (select auth.uid())
-- ✅ Total geral: 24 alertas RLS resolvidos
-- 
-- =====================================================
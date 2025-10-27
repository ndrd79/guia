-- =====================================================
-- OTIMIZAÇÃO DE PERFORMANCE DAS POLÍTICAS RLS
-- =====================================================
-- Data: 30/01/2025
-- Descrição: Otimiza 6 políticas RLS que estavam causando re-avaliação desnecessária
-- Problema: auth.uid() sendo re-avaliado para cada linha
-- Solução: Substituir por (select auth.uid()) para cache da função
-- Referência: https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select
-- =====================================================

-- TABELAS AFETADAS:
-- 1. eventos - política "Permitir CRUD para usuários autenticados"
-- 2. seasonal_themes - política "Allow authenticated users full access" 
-- 3. seasonal_themes - política "Permitir CRUD para usuários autenticados"
-- 4. feira_produtor - política "Permitir todas as operações para admins na feira"
-- 5. produtores_feira - política "Permitir todas as operações para admins nos produtores"
-- 6. user_profiles - política "Usuários podem atualizar próprio perfil"

-- =====================================================
-- 1. OTIMIZAR POLÍTICA RLS DA TABELA EVENTOS
-- =====================================================

-- Remover política existente
DROP POLICY IF EXISTS "Permitir CRUD para usuários autenticados" ON public.eventos;

-- Criar política otimizada
CREATE POLICY "Permitir CRUD para usuários autenticados" ON public.eventos
FOR ALL 
TO authenticated
USING ((select auth.uid()) IS NOT NULL)
WITH CHECK ((select auth.uid()) IS NOT NULL);

-- =====================================================
-- 2. OTIMIZAR POLÍTICAS RLS DA TABELA SEASONAL_THEMES
-- =====================================================

-- Remover políticas existentes
DROP POLICY IF EXISTS "Allow authenticated users full access" ON public.seasonal_themes;
DROP POLICY IF EXISTS "Permitir CRUD para usuários autenticados" ON public.seasonal_themes;

-- Criar política otimizada unificada
CREATE POLICY "Permitir CRUD para usuários autenticados" ON public.seasonal_themes
FOR ALL 
TO authenticated
USING ((select auth.uid()) IS NOT NULL)
WITH CHECK ((select auth.uid()) IS NOT NULL);

-- =====================================================
-- 3. OTIMIZAR POLÍTICA RLS DA TABELA FEIRA_PRODUTOR
-- =====================================================

-- Remover política existente
DROP POLICY IF EXISTS "Permitir todas as operações para admins na feira" ON public.feira_produtor;

-- Criar política otimizada
CREATE POLICY "Permitir todas as operações para admins na feira" ON public.feira_produtor
FOR ALL 
TO authenticated
USING ((select auth.uid()) IS NOT NULL)
WITH CHECK ((select auth.uid()) IS NOT NULL);

-- =====================================================
-- 4. OTIMIZAR POLÍTICA RLS DA TABELA PRODUTORES_FEIRA
-- =====================================================

-- Remover política existente
DROP POLICY IF EXISTS "Permitir todas as operações para admins nos produtores" ON public.produtores_feira;

-- Criar política otimizada
CREATE POLICY "Permitir todas as operações para admins nos produtores" ON public.produtores_feira
FOR ALL 
TO authenticated
USING ((select auth.uid()) IS NOT NULL)
WITH CHECK ((select auth.uid()) IS NOT NULL);

-- =====================================================
-- 5. OTIMIZAR POLÍTICA RLS DA TABELA USER_PROFILES
-- =====================================================

-- Remover política existente
DROP POLICY IF EXISTS "Usuários podem atualizar próprio perfil" ON public.user_profiles;

-- Criar política otimizada para usuários atualizarem próprio perfil
CREATE POLICY "Usuários podem atualizar próprio perfil" ON public.user_profiles
FOR UPDATE 
TO authenticated
USING (id = (select auth.uid()))
WITH CHECK (id = (select auth.uid()));

-- Adicionar política para leitura (remover se existir e recriar)
DROP POLICY IF EXISTS "Usuários podem ver próprio perfil" ON public.user_profiles;
CREATE POLICY "Usuários podem ver próprio perfil" ON public.user_profiles
FOR SELECT 
TO authenticated
USING (id = (select auth.uid()));

-- Adicionar política para inserção (remover se existir e recriar)
DROP POLICY IF EXISTS "Usuários podem criar próprio perfil" ON public.user_profiles;
CREATE POLICY "Usuários podem criar próprio perfil" ON public.user_profiles
FOR INSERT 
TO authenticated
WITH CHECK (id = (select auth.uid()));

-- =====================================================
-- VERIFICAÇÕES DE PERFORMANCE
-- =====================================================

-- Verificar se todas as políticas foram criadas corretamente
DO $$
DECLARE
    policy_count INTEGER;
    missing_policies TEXT[] := ARRAY[]::TEXT[];
BEGIN
    -- Verificar eventos
    SELECT COUNT(*) INTO policy_count 
    FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'eventos' 
    AND policyname = 'Permitir CRUD para usuários autenticados';
    
    IF policy_count = 0 THEN
        missing_policies := array_append(missing_policies, 'eventos: Permitir CRUD para usuários autenticados');
    END IF;
    
    -- Verificar seasonal_themes
    SELECT COUNT(*) INTO policy_count 
    FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'seasonal_themes' 
    AND policyname = 'Permitir CRUD para usuários autenticados';
    
    IF policy_count = 0 THEN
        missing_policies := array_append(missing_policies, 'seasonal_themes: Permitir CRUD para usuários autenticados');
    END IF;
    
    -- Verificar feira_produtor
    SELECT COUNT(*) INTO policy_count 
    FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'feira_produtor' 
    AND policyname = 'Permitir todas as operações para admins na feira';
    
    IF policy_count = 0 THEN
        missing_policies := array_append(missing_policies, 'feira_produtor: Permitir todas as operações para admins na feira');
    END IF;
    
    -- Verificar produtores_feira
    SELECT COUNT(*) INTO policy_count 
    FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'produtores_feira' 
    AND policyname = 'Permitir todas as operações para admins nos produtores';
    
    IF policy_count = 0 THEN
        missing_policies := array_append(missing_policies, 'produtores_feira: Permitir todas as operações para admins nos produtores');
    END IF;
    
    -- Verificar user_profiles
    SELECT COUNT(*) INTO policy_count 
    FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'user_profiles' 
    AND policyname = 'Usuários podem atualizar próprio perfil';
    
    IF policy_count = 0 THEN
        missing_policies := array_append(missing_policies, 'user_profiles: Usuários podem atualizar próprio perfil');
    END IF;
    
    -- Reportar resultado
    IF array_length(missing_policies, 1) > 0 THEN
        RAISE NOTICE 'ATENÇÃO: As seguintes políticas não foram criadas: %', array_to_string(missing_policies, ', ');
    ELSE
        RAISE NOTICE 'SUCESSO: Todas as políticas RLS foram otimizadas com (select auth.uid())!';
    END IF;
END;
$$;

-- =====================================================
-- COMENTÁRIOS PARA DOCUMENTAÇÃO
-- =====================================================
COMMENT ON POLICY "Permitir CRUD para usuários autenticados" ON public.eventos IS 'Política otimizada - usa (select auth.uid()) para melhor performance';
COMMENT ON POLICY "Permitir CRUD para usuários autenticados" ON public.seasonal_themes IS 'Política otimizada - usa (select auth.uid()) para melhor performance';
COMMENT ON POLICY "Permitir todas as operações para admins na feira" ON public.feira_produtor IS 'Política otimizada - usa (select auth.uid()) para melhor performance';
COMMENT ON POLICY "Permitir todas as operações para admins nos produtores" ON public.produtores_feira IS 'Política otimizada - usa (select auth.uid()) para melhor performance';
COMMENT ON POLICY "Usuários podem atualizar próprio perfil" ON public.user_profiles IS 'Política otimizada - usa (select auth.uid()) para melhor performance';

-- =====================================================
-- IMPORTANTE: AÇÕES PÓS-MIGRAÇÃO
-- =====================================================
-- 1. Verificar Security Advisor para confirmar que os 6 alertas de performance foram resolvidos
-- 2. Monitorar performance das consultas RLS
-- 3. Testar funcionalidades que dependem dessas políticas
-- 4. Ajustar políticas de admin conforme estrutura real de roles
-- =====================================================
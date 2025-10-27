-- =====================================================
-- Migração 012: Quinta Rodada de Otimização RLS Performance
-- =====================================================
-- 
-- Esta migração otimiza 6 políticas RLS adicionais que foram identificadas
-- com alertas de performance, substituindo auth.uid() por (select auth.uid())
-- para melhorar a performance das consultas.
--
-- Políticas a serem otimizadas:
-- 1. banners: "Apenas admins podem gerenciar banners"
-- 2. banners: "Permitir exclusão de banners para usuários autenticados"  
-- 3. empresas: "Usuários autenticados podem gerenciar empresas"
-- 4. profiles: "Permitir inserção de perfis"
-- 5. profiles: "Usuários podem ver apenas seu próprio perfil"
-- 6. banner_analytics: "Permitir leitura para admins"
--
-- Total de alertas resolvidos com esta migração: 6
-- Total acumulado de alertas resolvidos: 30 (24 anteriores + 6 novos)
-- =====================================================

-- Otimização 1: banners - "Apenas admins podem gerenciar banners"
DROP POLICY IF EXISTS "Apenas admins podem gerenciar banners" ON public.banners;

CREATE POLICY "Apenas admins podem gerenciar banners" ON public.banners
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

-- Otimização 2: banners - "Permitir exclusão de banners para usuários autenticados"
DROP POLICY IF EXISTS "Permitir exclusão de banners para usuários autenticados" ON public.banners;

CREATE POLICY "Permitir exclusão de banners para usuários autenticados" ON public.banners
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = (select auth.uid()) 
    AND role = 'admin'
  )
);

-- Otimização 3: empresas - "Usuários autenticados podem gerenciar empresas"
DROP POLICY IF EXISTS "Usuários autenticados podem gerenciar empresas" ON public.empresas;

CREATE POLICY "Usuários autenticados podem gerenciar empresas" ON public.empresas
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

-- Otimização 4: profiles - "Permitir inserção de perfis"
DROP POLICY IF EXISTS "Permitir inserção de perfis" ON public.profiles;

CREATE POLICY "Permitir inserção de perfis" ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (id = (select auth.uid()));

-- Otimização 5: profiles - "Usuários podem ver apenas seu próprio perfil"
DROP POLICY IF EXISTS "Usuários podem ver apenas seu próprio perfil" ON public.profiles;

CREATE POLICY "Usuários podem ver apenas seu próprio perfil" ON public.profiles
FOR SELECT
TO authenticated
USING (id = (select auth.uid()));

-- Otimização 6: banner_analytics - "Permitir leitura para admins"
DROP POLICY IF EXISTS "Permitir leitura para admins" ON public.banner_analytics;

CREATE POLICY "Permitir leitura para admins" ON public.banner_analytics
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = (select auth.uid()) 
    AND role = 'admin'
  )
);

-- =====================================================
-- Verificações de Integridade Simplificadas
-- =====================================================

-- Verificar se todas as políticas foram criadas corretamente
DO $$
DECLARE
    policy_count INTEGER;
BEGIN
    -- Contar políticas otimizadas nesta migração
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename IN ('banners', 'empresas', 'profiles', 'banner_analytics')
    AND policyname IN (
        'Apenas admins podem gerenciar banners',
        'Permitir exclusão de banners para usuários autenticados',
        'Usuários autenticados podem gerenciar empresas',
        'Permitir inserção de perfis',
        'Usuários podem ver apenas seu próprio perfil',
        'Permitir leitura para admins'
    );
    
    IF policy_count = 6 THEN
        RAISE NOTICE 'Migração 012: Todas as 6 políticas RLS foram otimizadas com sucesso!';
        RAISE NOTICE 'Total de alertas RLS resolvidos: 30 (24 anteriores + 6 novos)';
    ELSE
        RAISE EXCEPTION 'Migração 012: Erro - Esperadas 6 políticas, encontradas %', policy_count;
    END IF;
END $$;